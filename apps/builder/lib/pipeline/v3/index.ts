import { SupabaseClient } from '@supabase/supabase-js';
import { getOutputEmbedding } from './noveltyFilter';
import { retrieveRAGContext } from './ragMemory';
import { getArchiveEmbeddings, getSteppingStones, saveToArchive } from './stepArchive';
import { getThreshold } from './adaptiveThreshold';
import { runBFTS } from './bftsOrchestrator';
import { runPatchLoop } from './patchLoop';
import { updateBandit } from './modelBandit';
import { UserInput } from '../types';
import { V3PipelineResult } from './types';

export async function runPipelineV3(
  input: UserInput,
  supabase: SupabaseClient
): Promise<V3PipelineResult> {
  const totalStart = Date.now();
  const storeId = (input as any)._store_id;
  const slug = (input as any)._slug;

  if (!storeId || !slug) {
    throw new Error('Missing _store_id or _slug in UserInput context');
  }

  // STEP 1 — Embed user input
  console.log('[V3 Entry] STEP 1 - Generating user input embedding...');
  const inputEmbedding = await getOutputEmbedding(
    `${input.business_name} ${input.business_type} ${input.description}`
  );

  // STEP 2 — Retrieve RAG context
  console.log('[V3 Entry] STEP 2 - Querying RAG context...');
  const ragContext = await retrieveRAGContext(
    inputEmbedding,
    input.business_type,
    supabase
  );
  console.log(`[RAG] Found ${ragContext.positive_memories.length} positive and ${ragContext.negative_memories.length} negative memories`);

  // STEP 3 — Get archive data
  console.log('[V3 Entry] STEP 3 - Querying archive logs and adaptive threshold...');
  const [archiveEmbeddings, steppingStones, threshold] = await Promise.all([
    getArchiveEmbeddings(input.business_type, 50, supabase),
    getSteppingStones(input.business_type, 3, supabase),
    getThreshold(input.business_type, supabase)
  ]);
  console.log(`[Threshold] Dynamic Quality Gate: ${threshold} (Archive size: ${archiveEmbeddings.length})`);

  // STEP 4 — Run BFTS 3 workers in parallel
  console.log('[V3 Entry] STEP 4 - Executing BFTS 3 parallel workers...');
  const workerResults = await runBFTS(
    input,
    ragContext,
    archiveEmbeddings,
    steppingStones,
    threshold
  );

  const winner = workerResults[0]; // Sort order guaranteed highest score first
  console.log(`[BFTS] Selected Winner: Worker ${winner.worker_id} with score ${winner.score}`);

  // STEP 5 — Run patch loop on winner if below threshold
  let finalHtml = winner.pipeline_result.qa.html;
  let finalScore = winner.score;
  let patchIterations = 0;

  if (finalScore < threshold) {
    console.log(`[Patch] Score ${finalScore} < Threshold ${threshold}. Starting surgical patch loop...`);
    const patched = await runPatchLoop(finalHtml, finalScore, threshold, input, supabase);
    finalHtml = patched.html;
    finalScore = patched.score;
    patchIterations = patched.iterations;
    console.log(`[Patch] Patch loop finished after ${patchIterations} iterations. Final score: ${finalScore}`);
  } else {
    console.log(`[V3 Entry] Winner score ${finalScore} satisfies threshold ${threshold}. Skipping patch loop.`);
  }

  // STEP 6 — Update bandit scores
  console.log('[V3 Entry] STEP 6 - Reinforcing Bandit model router...');
  await updateBandit(workerResults);
  console.log(`[Bandit] Scores successfully updated for all active workers.`);

  // STEP 7 — Save ALL workers to archive
  console.log('[V3 Entry] STEP 7 - Archiving all worker results...');
  const archiveIds = await Promise.all(
    workerResults.map(w => saveToArchive(w, input, inputEmbedding, supabase, threshold))
  );
  const winnerArchiveId = archiveIds[0];

  // STEP 8 — Save final HTML to Supabase Storage
  console.log('[V3 Entry] STEP 8 - Uploading final compiled HTML storefront to Supabase storage...');
  
  // Use a string or Buffer for Node/Next-safe upload
  const { error } = await supabase.storage
    .from('storefronts')
    .upload(`${storeId}/index.html`, finalHtml, {
      contentType: 'text/html',
      upsert: true
    });

  if (error) {
    console.error('[V3 Entry] Supabase storage upload failed:', error);
  } else {
    console.log('[V3 Entry] Storefront HTML successfully uploaded.');
  }

  return {
    success: true,
    store_id: storeId,
    slug: slug,
    winning_worker: {
      ...winner,
      pipeline_result: {
        ...winner.pipeline_result,
        qa: {
          ...winner.pipeline_result.qa,
          html: finalHtml
        }
      }
    },
    all_workers: workerResults,
    rag_context: ragContext,
    patch_iterations: patchIterations,
    final_score: finalScore,
    threshold_used: threshold,
    bandit_updated: true,
    archive_entry_id: winnerArchiveId,
    total_duration_ms: Date.now() - totalStart,
    models_selected: winner.models_used
  };
}
export type { V3PipelineResult } from './types';
export type { UserInput, PipelineResult } from '../types';
