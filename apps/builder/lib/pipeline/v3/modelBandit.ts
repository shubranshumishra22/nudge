import { Redis } from '@upstash/redis';
import { AsyncLocalStorage } from 'node:async_hooks';
import { BanditScore, WorkerResult } from './types';

// AsyncLocalStorage to isolate concurrent BFTS runs and prevent selection race conditions
export const bftsStorage = new AsyncLocalStorage<{ runId: string }>();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useMock = !redisUrl || !redisToken;

if (useMock) {
  console.warn('[Bandit] Redis environment variables missing. Falling back to in-memory mock bandit storage.');
}

const redis = useMock ? null : new Redis({ url: redisUrl!, token: redisToken! });

// In-memory mock storage for local testing fallback
const memoryBandit: Record<string, BanditScore> = {};

export const MODEL_POOL: Record<string, string[]> = {
  research: [
    'nvidia/nemotron-3-ultra:free',
    'nvidia/nemotron-3-ultra:free',
    'nvidia/nemotron-3-ultra:free'
  ],
  vision: [
    'nvidia/nemotron-3-nano-omni:free',
    'nvidia/nemotron-3-nano-omni:free',
    'nvidia/nemotron-3-nano-omni:free'
  ],
  content: [
    'google/gemma-4-31b:free',
    'google/gemma-4-31b:free',
    'google/gemma-4-31b:free'
  ],
  builder: [
    'openrouter/owl-alpha:free',     // W1
    'poolside/laguna-m.1:free',      // W2
    'poolside/laguna-xs.2:free'      // W3
  ],
  critic: [
    'nvidia/nemotron-3-super:free',
    'nvidia/nemotron-3-super:free',
    'nvidia/nemotron-3-super:free'
  ],
  orchestrator: [
    'nvidia/nemotron-3-ultra:free'
  ],
  patch: [
    'poolside/laguna-xs.2:free'
  ]
};

const EPSILON = 0.15;
const lastChoices: Record<string, string[]> = {};

async function getBanditScore(task: string, model: string): Promise<BanditScore> {
  const key = `bandit:${task}:${model}`;
  if (useMock) {
    if (!memoryBandit[key]) {
      memoryBandit[key] = {
        model,
        task: task as any,
        score: 0.5,
        calls: 0,
        wins: 0,
        last_updated: new Date().toISOString()
      };
    }
    return memoryBandit[key];
  } else {
    try {
      const val = await redis!.get<BanditScore>(key);
      if (val) return val;
    } catch (err) {
      console.error(`[Bandit] Failed to fetch key ${key} from Redis:`, err);
    }
    return {
      model,
      task: task as any,
      score: 0.5,
      calls: 0,
      wins: 0,
      last_updated: new Date().toISOString()
    };
  }
}

async function setBanditScore(task: string, model: string, scoreObj: BanditScore): Promise<void> {
  const key = `bandit:${task}:${model}`;
  scoreObj.last_updated = new Date().toISOString();
  if (useMock) {
    memoryBandit[key] = scoreObj;
  } else {
    try {
      await redis!.set(key, scoreObj);
    } catch (err) {
      console.error(`[Bandit] Failed to save key ${key} to Redis:`, err);
    }
  }
}

export async function selectModel(
  task: keyof typeof MODEL_POOL,
  worker_id: number
): Promise<string> {
  const pool = MODEL_POOL[task];
  if (!pool || pool.length === 0) {
    throw new Error(`Empty model pool for task: ${task}`);
  }

  const uniqueModels = Array.from(new Set(pool));
  if (uniqueModels.length < 3) {
    // If pool is small or identical (e.g. vision, orchestrator, patch), return the corresponding index
    return pool[Math.min(worker_id - 1, pool.length - 1)];
  }

  // Get run context to prevent race conditions
  const runStore = bftsStorage.getStore();
  const runId = runStore?.runId || 'default';
  const choiceCacheKey = `${runId}:${task}`;

  // Fetch current scores for all models in the pool
  const scorePromises = pool.map(model => getBanditScore(task, model));
  const scores = await Promise.all(scorePromises);

  // Sort pool models by score descending
  const sorted = [...pool].sort((a, b) => {
    const scoreA = scores.find(s => s.model === a)?.score ?? 0.5;
    const scoreB = scores.find(s => s.model === b)?.score ?? 0.5;
    return scoreB - scoreA;
  });

  if (worker_id === 1) {
    lastChoices[choiceCacheKey] = [sorted[0]];
    return sorted[0];
  } else if (worker_id === 2) {
    const explore = Math.random() < EPSILON;
    const chosen = explore ? sorted[2] : sorted[1];
    if (!lastChoices[choiceCacheKey]) {
      lastChoices[choiceCacheKey] = [sorted[0]];
    }
    lastChoices[choiceCacheKey].push(chosen);
    return chosen;
  } else {
    // worker_id === 3: forced explore of remaining model
    const chosenW1 = lastChoices[choiceCacheKey]?.[0] || sorted[0];
    const chosenW2 = lastChoices[choiceCacheKey]?.[1] || sorted[1];
    const remaining = sorted.filter(m => m !== chosenW1 && m !== chosenW2);
    const chosen = remaining[0] || sorted[2];
    
    // Clear choices cache for this task/run
    delete lastChoices[choiceCacheKey];
    return chosen;
  }
}

export async function updateBandit(
  results: WorkerResult[]
): Promise<void> {
  if (results.length === 0) return;

  // Sort to find the winner
  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const winner = sortedResults[0];

  for (const result of results) {
    const isWinner = result.worker_id === winner.worker_id;
    const scoreDelta = isWinner ? 1.0 : 0.0;
    const emaWeight = 0.15; // 15% new score, 85% old score

    for (const [task, model] of Object.entries(result.models_used)) {
      const stats = await getBanditScore(task, model);
      stats.calls += 1;
      if (isWinner) {
        stats.wins += 1;
      }
      stats.score = (1 - emaWeight) * stats.score + emaWeight * scoreDelta;
      await setBanditScore(task, model, stats);
    }
  }
}

export async function getBanditStats(): Promise<BanditScore[]> {
  const stats: BanditScore[] = [];
  if (useMock) {
    stats.push(...Object.values(memoryBandit));
  } else {
    try {
      const keys = await redis!.keys('bandit:*');
      if (keys && keys.length > 0) {
        for (const key of keys) {
          const val = await redis!.get<BanditScore>(key);
          if (val) stats.push(val);
        }
      }
    } catch (err) {
      console.error('[Bandit] Failed to scan stats from Redis:', err);
    }
  }
  return stats.sort((a, b) => b.score - a.score);
}
