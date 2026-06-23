import { runOrchestrator } from './orchestrator';
import type { UserInput, PipelineResult } from './types';

export async function runPipeline(input: UserInput): Promise<PipelineResult> {
  return runOrchestrator(input);
}

export type { UserInput, PipelineResult } from './types';
