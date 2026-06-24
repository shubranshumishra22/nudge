const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions'

interface CallModelOptions {
  max_tokens?: number
  temperature?: number
}

function cleanResponse(content: string | null | undefined): string {
  if (!content) return '';
  let cleaned = content.trim();
  
  // Remove <think>...</think> tags if present (e.g. from DeepSeek R1)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // Match a markdown code block that wraps the entire content:
  // ```[language]
  // content
  // ```
  const codeBlockRegex = /^```[a-zA-Z]*\n([\s\S]*?)\n```$/;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1].trim();
  } else {
    // Fallback: strip leading and trailing ``` if present
    if (cleaned.startsWith('```')) {
      const firstLineBreak = cleaned.indexOf('\n');
      if (firstLineBreak !== -1 && firstLineBreak < 15) {
        cleaned = cleaned.substring(firstLineBreak + 1);
      } else {
        cleaned = cleaned.substring(3);
      }
      const lastTicks = cleaned.lastIndexOf('```');
      if (lastTicks !== -1) {
        cleaned = cleaned.substring(0, lastTicks);
      }
      cleaned = cleaned.trim();
    }
  }
  
  return cleaned;
}

const FALLBACK_MODELS: Record<string, string[]> = {
  'openai/gpt-oss-120b:free': ['deepseek/deepseek-v4-flash:free', 'openrouter/free'],
  'deepseek/deepseek-v4-flash:free': ['openai/gpt-oss-120b:free', 'openrouter/free'],
};

async function attemptCall(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: CallModelOptions = {}
): Promise<string> {
  const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const maxRetries = 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout per attempt to keep it fast

    try {
      const res = await fetch(OPENROUTER_API_BASE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nudge.store',
          'X-Title': 'Nudge Commerce',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.max_tokens ?? 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 429 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenRouter ${model} returned ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const text: string = json.choices?.[0]?.message?.content ?? '';
      if (!text) throw new Error('Empty response from model');
      return cleanResponse(text);
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Model call failed after retries');
}

export async function callModel(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: CallModelOptions = {},
): Promise<string> {
  const modelsToTry = [model, ...(FALLBACK_MODELS[model] || ['deepseek/deepseek-v4-flash:free', 'openai/gpt-oss-120b:free', 'openrouter/free'])];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (const currentModel of uniqueModels) {
    try {
      const result = await attemptCall(currentModel, messages, options);
      return result;
    } catch (err: any) {
      console.warn(`callModel fallback check: model ${currentModel} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All models failed');
}

