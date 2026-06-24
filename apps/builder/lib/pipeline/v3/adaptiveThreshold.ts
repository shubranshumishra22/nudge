import { SupabaseClient } from '@supabase/supabase-js';

export async function getThreshold(
  business_type: string,
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from('generation_archive')
    .select('score')
    .eq('business_type', business_type)
    .not('score', 'is', null)
    .order('score', { ascending: false });

  if (error) {
    console.error('[Threshold] Failed to fetch archive scores, using default 72:', error);
    return 72;
  }

  if (!data || data.length < 10) {
    return 72;
  }

  const scores = data.map(d => Number(d.score));
  
  // Sort ascending for correct percentile indexing
  scores.sort((a, b) => a - b);
  
  const idx = Math.floor(scores.length * 0.8);
  const pct80 = scores[idx];

  // Clamp between 72 and 92
  return Math.min(Math.max(pct80, 72), 92);
}
