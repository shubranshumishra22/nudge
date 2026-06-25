import { runOrchestrator } from './orchestrator';
import { runFastPipeline } from './v1-fast';
import type { UserInput, PipelineResult } from './types';

export async function runPipeline(input: UserInput): Promise<PipelineResult> {
  return runOrchestrator(input);
}

export { runFastPipeline };
export type { UserInput, PipelineResult } from './types';

