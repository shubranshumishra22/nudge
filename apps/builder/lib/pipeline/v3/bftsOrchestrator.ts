import { runOrchestrator } from '../orchestrator';
import { selectModel, bftsStorage } from './modelBandit';
import { scoreOutput } from './scorer';
import { computeNovelty, getOutputEmbedding, isNovel } from './noveltyFilter';
import { UserInput, ResearchOutput } from '../types';
import { RAGContext, ArchiveEntry, WorkerResult } from './types';

export async function runBFTS(
  input: UserInput,
  ragContext: RAGContext,
  archiveEmbeddings: number[][],
  steppingStones: ArchiveEntry[],
  threshold: number,
  preScrapedResearch?: ResearchOutput
): Promise<WorkerResult[]> {
  // Generate a unique run ID for isolating concurrent model selections in AsyncLocalStorage
  const runId = Math.random().toString(36).substring(2, 15);

  // 1. Select models for each worker via bandit
  const workerModels = await bftsStorage.run({ runId }, async () => {
    return Promise.all([1, 2, 3].map(async (id) => {
      return {
        worker_id: id,
        research: await selectModel('research', id),
        vision: await selectModel('vision', id),
        content: await selectModel('content', id),
        builder: await selectModel('builder', id),
        critic: await selectModel('critic', id),
        orchestrator: await selectModel('orchestrator', id),
        patch: await selectModel('patch', id)
      };
    }));
  });

  // 2. Augment input with RAG context and stepping stones
  const augmentedInputs = [1, 2, 3].map((worker_id) => {
    let descriptionAugmented = input.description;

    if (ragContext.positive_prompt_injection) {
      descriptionAugmented += '\n\n' + ragContext.positive_prompt_injection;
    }
    if (ragContext.negative_prompt_injection) {
      descriptionAugmented += '\n\n' + ragContext.negative_prompt_injection;
    }

    // Worker 2 and 3 inject stepping stone patterns
    const stone = worker_id === 2 ? steppingStones[0] : (worker_id === 3 ? steppingStones[1] : undefined);
    if (stone) {
      descriptionAugmented += `\n\nREFERENCE PATTERN: Previously a ${
        stone.business_type
      } store with design: ${
        JSON.stringify(stone.design_tokens)
      } scored ${stone.score}/100. Build on this.`;
    }

    return {
      ...input,
      description: descriptionAugmented
    };
  });

  // 3. Run all 3 workers in parallel
  console.log('[BFTS] Starting execution of 3 parallel workers...');
  const workerPromises = [1, 2, 3].map(async (worker_id) => {
    const start = Date.now();
    try {
      const models = workerModels[worker_id - 1];
      
      // Call existing runOrchestrator with model overrides in context
      const result = await runOrchestrator({
        ...augmentedInputs[worker_id - 1],
        _model_overrides: models,
        _skip_puppeteer: true,
        _pre_scraped_research: preScrapedResearch
      } as any);

      // Score output
      const score = await scoreOutput(result.qa.html, result.qa, input);

      // Fetch embedding of output HTML
      const outputEmbed = await getOutputEmbedding(result.qa.html);

      // Compute novelty score
      const novelty = await computeNovelty(outputEmbed, archiveEmbeddings);

      const disqualified = !isNovel(novelty);
      const { worker_id: _, ...modelsUsed } = models;

      return {
        worker_id: worker_id as (1 | 2 | 3),
        pipeline_result: result,
        score,
        models_used: modelsUsed as Record<string, string>,
        duration_ms: Date.now() - start,
        novelty_score: novelty,
        disqualified
      } as WorkerResult;
    } catch (e) {
      console.error(`[BFTS] Worker ${worker_id} failed:`, e);
      return null;
    }
  });

  const rawResults = (await Promise.all(workerPromises)).filter((r): r is WorkerResult => r !== null);

  if (rawResults.length === 0) {
    throw new Error('All BFTS workers failed to generate a result.');
  }

  // 4. Filter disqualified results. If all disqualified, keep the most novel one
  let activeResults = rawResults.filter(r => !r.disqualified);
  if (activeResults.length === 0) {
    console.warn('[BFTS] All workers disqualified by novelty filter. Keeping the most novel result.');
    const sortedByNovelty = [...rawResults].sort((a, b) => b.novelty_score - a.novelty_score);
    activeResults = [sortedByNovelty[0]];
  }

  // 5. Sort by score descending
  activeResults.sort((a, b) => b.score - a.score);

  return activeResults;
}
