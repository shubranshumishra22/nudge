function dotProduct(a: number[], b: number[]): number {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

function magnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

export async function getOutputEmbedding(html: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[Embeddings] OPENROUTER_API_KEY is not defined. Returning mock vector.');
    return new Array(1536).fill(0);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://nudge.store',
        'X-Title': 'Nudge Commerce AI'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: html.slice(0, 1000)
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Embeddings] OpenRouter API returned ${res.status}: ${errText}. Returning mock vector.`);
      return new Array(1536).fill(0);
    }

    const data = (await res.json()) as any;
    if (data.data && Array.isArray(data.data) && data.data[0]?.embedding) {
      return data.data[0].embedding;
    }
    if (Array.isArray(data) && data[0]?.embedding) {
      return data[0].embedding;
    }
    if (data.embeddings && Array.isArray(data.embeddings)) {
      return data.embeddings[0];
    }
    console.warn('[Embeddings] Unexpected response structure, returning mock vector.');
    return new Array(1536).fill(0);
  } catch (err) {
    console.warn('[Embeddings] Failed to fetch embeddings from OpenRouter, returning mock vector:', err);
    return new Array(1536).fill(0);
  }
}

export async function computeNovelty(
  outputEmbedding: number[],
  archiveEmbeddings: number[][]
): Promise<number> {
  if (archiveEmbeddings.length === 0) {
    return 1.0;
  }

  let maxSimilarity = -1;
  for (const archiveEmb of archiveEmbeddings) {
    const similarity = cosineSimilarity(outputEmbedding, archiveEmb);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }

  return 1 - maxSimilarity;
}

export function isNovel(novelty_score: number): boolean {
  return novelty_score > 0.08;
}
