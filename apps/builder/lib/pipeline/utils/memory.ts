import { SupabaseClient } from '@supabase/supabase-js';

// OpenRouter embeddings endpoint
const EMBEDDINGS_API_URL = 'https://openrouter.ai/api/v1/embeddings';

/**
 * Generate a 1536-dimensional vector embedding for a given text using text-embedding-3-small.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not defined.');
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(EMBEDDINGS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nudge.store',
          'X-Title': 'Nudge Commerce',
        },
        body: JSON.stringify({
          model: 'openai/text-embedding-3-small',
          input: text.replace(/\n/g, ' '),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenRouter Embeddings API returned ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const embedding = json.data?.[0]?.embedding;
      if (Array.isArray(embedding)) {
        return embedding;
      }
      throw new Error('Embeddings response was missing data.');
    } catch (err) {
      console.error(`Embedding attempt ${attempt + 1} failed:`, err);
      if (attempt === maxRetries - 1) throw err;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('All embedding retries exhausted');
}

/**
 * Query positive memories (score >= 8.5) that are semantically similar to the prompt.
 */
export async function getPositiveMemories(
  prompt: string,
  supabase: SupabaseClient,
  industry: string,
  limit: number = 3
): Promise<any[]> {
  try {
    const vector = await getEmbedding(prompt);
    
    // Call the match_generation_memory postgres function
    const { data, error } = await supabase.rpc('match_generation_memory', {
      query_embedding: vector,
      match_threshold: 0.7,
      match_count: limit * 2, // oversample to filter
    });

    if (error) {
      console.error('Error calling match_generation_memory:', error);
      return [];
    }

    // Filter for positive memories (score >= 8.5) and matching industry if possible
    const positive = (data || [])
      .filter((m: any) => Number(m.score) >= 8.5)
      .slice(0, limit);

    return positive;
  } catch (err) {
    console.error('getPositiveMemories failed:', err);
    return [];
  }
}

/**
 * Get component failure counts (score < 6.5) to identify anti-patterns (failures >= 5).
 */
export async function getAntiPatterns(
  industry: string,
  supabase: SupabaseClient
): Promise<string[]> {
  try {
    // Query patch learning or score tables to identify components with low scores
    const { data: scores, error } = await supabase
      .from('component_score')
      .select('component_name, avg_score, usage_count')
      .eq('industry', industry)
      .lt('avg_score', 6.5);

    if (error || !scores) {
      return [];
    }

    // Filter components with usage count >= 5 where score is low
    return scores
      .filter((s: any) => s.usage_count >= 5)
      .map((s: any) => s.component_name);
  } catch (err) {
    console.error('getAntiPatterns failed:', err);
    return [];
  }
}

/**
 * Save a successful or failed generation layout to the memory system.
 */
export async function saveGenerationMemory(
  supabase: SupabaseClient,
  generation: {
    prompt: string;
    business_description: string;
    style_keywords: string[];
    industry: string;
    style: string;
    design_tokens: any;
    layout: any;
    score: number;
    screenshot_url?: string;
  }
) {
  try {
    // 1. Insert generation metadata
    const { data: gm, error: gmError } = await supabase
      .from('generation_memory')
      .insert({
        prompt: generation.prompt,
        business_description: generation.business_description,
        style_keywords: generation.style_keywords,
        industry: generation.industry,
        style: generation.style,
        design_tokens: generation.design_tokens,
        layout: generation.layout,
        score: generation.score,
        screenshot_url: generation.screenshot_url || null,
      })
      .select('id')
      .single();

    if (gmError || !gm) {
      throw new Error(`Failed to save generation memory: ${gmError?.message}`);
    }

    // 2. Generate embedding vector
    const embedding = await getEmbedding(generation.prompt);

    // 3. Save embedding vector referencing generation memory
    const { error: embError } = await supabase
      .from('generation_embeddings_1536')
      .insert({
        generation_id: gm.id,
        provider: 'openai',
        model_name: 'text-embedding-3-small',
        embedding: embedding,
      });

    if (embError) {
      console.error('Failed to save embedding vector:', embError);
    }

    // 4. Update component scores based on the generated layout
    const layout = generation.layout;
    if (layout && Array.isArray(layout.components)) {
      for (const comp of layout.components) {
        // Upsert component usage and average score
        const componentName = comp.name;
        
        // Fetch current score
        const { data: existing } = await supabase
          .from('component_score')
          .select('*')
          .eq('component_name', componentName)
          .eq('industry', generation.industry)
          .eq('style', generation.style)
          .maybeSingle();

        if (existing) {
          const newUsage = existing.usage_count + 1;
          const newAvgScore = (existing.avg_score * existing.usage_count + generation.score) / newUsage;

          await supabase
            .from('component_score')
            .update({
              usage_count: newUsage,
              avg_score: Number(newAvgScore.toFixed(2)),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('component_score')
            .insert({
              component_name: componentName,
              industry: generation.industry,
              style: generation.style,
              usage_count: 1,
              avg_score: generation.score,
            });
        }
      }
    }

    console.log(`Saved generation memory (ID: ${gm.id}) with score ${generation.score}`);
    return gm.id;
  } catch (err) {
    console.error('saveGenerationMemory failed:', err);
    return null;
  }
}
