import { PipelineResult, UserInput } from '../types';

export interface BanditScore {
  model: string;
  task: 'research' | 'vision' | 'content' | 'builder' | 'critic';
  score: number;        // running EMA score 0-1
  calls: number;        // total calls made
  wins: number;         // times this model produced winning branch
  last_updated: string; // ISO timestamp
}

export interface WorkerResult {
  worker_id: 1 | 2 | 3;
  pipeline_result: PipelineResult;
  score: number;        // 0-100 from scorer
  models_used: Record<string, string>; // {task: model_id}
  duration_ms: number;
  novelty_score: number; // 0-1, higher = more novel
  disqualified: boolean; // true if novelty < 0.08
}

export interface ArchiveEntry {
  id: string;
  store_id: string;
  business_type: string;
  score: number;
  embedding: number[];     // 1536-dim
  html_preview: string;    // first 500 chars of HTML
  design_tokens: any;
  models_used: Record<string, string>;
  created_at: string;
  is_stepping_stone: boolean; // score > 70 but < threshold
}

export interface RAGContext {
  positive_memories: ArchiveEntry[];  // score >= 8.5 (normalized: 85/100)
  negative_memories: ArchiveEntry[];  // score < 6.5 (normalized: 65/100), count >= 5
  positive_prompt_injection: string;  // formatted for agent prompts
  negative_prompt_injection: string;
}

export interface V3PipelineResult {
  success: boolean;
  store_id: string;
  slug: string;
  winning_worker: WorkerResult;
  all_workers: WorkerResult[];
  rag_context: RAGContext;
  patch_iterations: number;
  final_score: number;
  threshold_used: number;
  bandit_updated: boolean;
  archive_entry_id: string;
  total_duration_ms: number;
  models_selected: Record<string, string>;
}
