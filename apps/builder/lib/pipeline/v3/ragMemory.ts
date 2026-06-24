import { SupabaseClient } from '@supabase/supabase-js';
import { RAGContext, ArchiveEntry } from './types';

export async function retrieveRAGContext(
  embedding: number[],
  business_type: string,
  supabase: SupabaseClient
): Promise<RAGContext> {
  const { data, error } = await supabase.rpc('match_archive_entries', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 20,
    filter: { business_type }
  });

  if (error) {
    console.error('[RAG] Failed to call match_archive_entries RPC:', error);
  }

  const results = (data || []) as Array<{
    id: string;
    business_type: string;
    score: number;
    design_tokens: any;
    html_preview: string;
    models_used: Record<string, string>;
    call_count: number;
    similarity: number;
  }>;

  // Split memories based on scores
  const positiveResults = results.filter(r => Number(r.score) >= 85);
  const negativeResults = results.filter(r => Number(r.score) < 65 && Number(r.call_count || 1) >= 5);

  const positiveMemories: ArchiveEntry[] = positiveResults.map(r => ({
    id: r.id,
    store_id: '',
    business_type: r.business_type,
    score: Number(r.score),
    embedding: [], // not needed for context
    html_preview: r.html_preview || '',
    design_tokens: r.design_tokens || {},
    models_used: r.models_used || {},
    created_at: new Date().toISOString(),
    is_stepping_stone: false
  }));

  const negativeMemories: ArchiveEntry[] = negativeResults.map(r => ({
    id: r.id,
    store_id: '',
    business_type: r.business_type,
    score: Number(r.score),
    embedding: [],
    html_preview: r.html_preview || '',
    design_tokens: r.design_tokens || {},
    models_used: r.models_used || {},
    created_at: new Date().toISOString(),
    is_stepping_stone: false
  }));

  // Build prompt injections
  let positivePrompt = '';
  if (positiveMemories.length > 0) {
    positivePrompt = 'REFERENCE THESE HIGH-QUALITY PATTERNS:\n' +
      positiveMemories.slice(0, 3).map(m =>
        `- ${m.business_type} store: used ${JSON.stringify(m.design_tokens)}, scored ${m.score}/100`
      ).join('\n');
  }

  let negativePrompt = '';
  if (negativeMemories.length > 0) {
    negativePrompt = 'AVOID THESE KNOWN BAD PATTERNS:\n' +
      negativeMemories.slice(0, 3).map(m =>
        `- BAD PATTERN (scored ${m.score}/100): ${m.html_preview.slice(0, 100)}...`
      ).join('\n');
  }

  return {
    positive_memories: positiveMemories,
    negative_memories: negativeMemories,
    positive_prompt_injection: positivePrompt,
    negative_prompt_injection: negativePrompt
  };
}
