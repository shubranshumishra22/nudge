type MessageContent = string | Array<{
  type: string;
  text?: string;
  image_url?: { url: string };
}>;

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
};

interface CallModelOptions {
  temperature?: number;
  max_tokens?: number;
  json_mode?: boolean;
  _model_override?: string;
}

function cleanResponse(content: string | null | undefined): string {
  if (!content) return '{}';
  let cleaned = content.trim();
  // Remove <think>...</think> tags if present (e.g. from DeepSeek R1)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // Remove markdown code block markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
    const lastIndex = cleaned.lastIndexOf('```');
    if (lastIndex !== -1) {
      cleaned = cleaned.substring(0, lastIndex);
    }
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
    const lastIndex = cleaned.lastIndexOf('```');
    if (lastIndex !== -1) {
      cleaned = cleaned.substring(0, lastIndex);
    }
  }
  cleaned = cleaned.trim();
  if (!cleaned || cleaned === 'null') {
    return '{}';
  }
  return cleaned;
}

export async function callModel(
  model: string,
  messages: Message[],
  options: CallModelOptions = {},
): Promise<string> {
  const { temperature = 0.3, max_tokens = 4000, json_mode = false, _model_override } = options;
  const targetModel = _model_override || model;

  const maxRetries = 3;
  const baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://nudge.store',
          'X-Title': 'Nudge Commerce AI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens,
          response_format: json_mode ? { type: 'json_object' } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(errorData.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      return cleanResponse(data.choices?.[0]?.message?.content);
    } catch (err) {
      clearTimeout(timeout);

      if (attempt === maxRetries - 1) {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 30000);

        try {
          const res = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://nudge.store',
              'X-Title': 'Nudge Commerce AI',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'openrouter/free',
              messages,
              temperature,
              max_tokens,
              response_format: json_mode ? { type: 'json_object' } : undefined,
            }),
            signal: fallbackController.signal,
          });

          clearTimeout(fallbackTimeout);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error?.message ?? 'Fallback model also failed');
          }

          const data = await res.json();
          return cleanResponse(data.choices?.[0]?.message?.content);
        } catch (fallbackErr) {
          clearTimeout(fallbackTimeout);
          throw fallbackErr;
        }
      }

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('All retries exhausted');
}
