import { SupabaseClient } from '@supabase/supabase-js';
import { UserInput } from '../types';
import { ArchiveEntry, WorkerResult } from './types';

export async function saveToArchive(
  result: WorkerResult,
  input: UserInput,
  embedding: number[],
  supabase: SupabaseClient,
  threshold: number = 72
): Promise<string> {
  const storeId = (input as any)._store_id || result.pipeline_result.store_id || null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validStoreId = typeof storeId === 'string' && uuidRegex.test(storeId) ? storeId : null;
  const isSteppingStone = result.score > 70 && result.score < threshold;

  // Format vector as string if needed, but supabase-js handles number arrays directly
  const { data, error } = await supabase
    .from('generation_archive')
    .insert({
      store_id: validStoreId,
      business_type: input.business_type,
      score: result.score,
      embedding: embedding,
      html_preview: result.pipeline_result.qa.html.slice(0, 500),
      design_tokens: result.pipeline_result.design,
      models_used: result.models_used,
      is_stepping_stone: isSteppingStone,
      worker_id: result.worker_id,
      novelty_score: result.novelty_score,
      duration_ms: result.duration_ms
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save to generation archive: ${error.message}`);
  }

  return data.id;
}

export async function getSteppingStones(
  business_type: string,
  limit: number = 3,
  supabase: SupabaseClient
): Promise<ArchiveEntry[]> {
  const { data, error } = await supabase
    .from('generation_archive')
    .select('*')
    .eq('is_stepping_stone', true)
    .eq('business_type', business_type)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Archive] Failed to fetch stepping stones:', error);
    return [];
  }

  return (data || []).map(item => {
    let emb = item.embedding;
    if (typeof emb === 'string') {
      try {
        emb = JSON.parse(emb.replace('{', '[').replace('}', ']'));
      } catch {
        emb = [];
      }
    }
    return {
      id: item.id,
      store_id: item.store_id,
      business_type: item.business_type,
      score: Number(item.score),
      embedding: emb,
      html_preview: item.html_preview || '',
      design_tokens: item.design_tokens || {},
      models_used: item.models_used || {},
      created_at: item.created_at,
      is_stepping_stone: item.is_stepping_stone
    };
  });
}

export async function getArchiveEmbeddings(
  business_type: string,
  limit: number = 50,
  supabase: SupabaseClient
): Promise<number[][]> {
  const { data, error } = await supabase
    .from('generation_archive')
    .select('embedding')
    .eq('business_type', business_type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Archive] Failed to fetch archive embeddings:', error);
    return [];
  }

  return (data || [])
    .map(item => {
      let emb = item.embedding;
      if (typeof emb === 'string') {
        try {
          emb = JSON.parse(emb.replace('{', '[').replace('}', ']'));
        } catch {
          return null;
        }
      }
      return emb;
    })
    .filter((emb): emb is number[] => Array.isArray(emb) && emb.length > 0);
}
