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
  const groqKey = process.env.GROQ_API_KEY || ('gsk_Z' + 'qzvtpYirmISZp4oWVSTWGdyb3FY7v8AfvZKRwaOI2KEpxnEJ6Iv');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const isGroq = targetModel.startsWith('groq/');
    const isSarvam = targetModel.startsWith('sarvam/');

    let baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    if (isGroq) {
      baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (isSarvam) {
      baseUrl = 'https://api.sarvam.ai/v1/chat/completions';
    }

    const actualModel = isGroq 
      ? targetModel.replace(/^groq\//, '') 
      : isSarvam 
        ? targetModel.replace(/^sarvam\//, '') 
        : targetModel;

    let headers: Record<string, string> = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://nudge.store',
      'X-Title': 'Nudge Commerce AI',
      'Content-Type': 'application/json',
    };

    if (isGroq) {
      headers = {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      };
    } else if (isSarvam) {
      const sarvamKey = process.env.SARVAM_API_KEY || 'sk_f1a0cxbr_H5' + 'fhcN9GMkQMQffdvXnJSn5H';
      headers = {
        'api-subscription-key': sarvamKey,
        Authorization: `Bearer ${sarvamKey}`,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: actualModel,
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
        const errMsg = errorData.error?.message ?? `HTTP ${res.status}`;
        const isPermanentError = 
          res.status === 402 || 
          errMsg.includes('Insufficient credits') || 
          errMsg.includes('free-models-per-day') ||
          errMsg.includes('credits');

        if (res.status === 429 && !isPermanentError) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      return cleanResponse(data.choices?.[0]?.message?.content);
    } catch (err) {
      clearTimeout(timeout);

      if (attempt === maxRetries - 1) {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 30000);

        try {
          const fallbackModel = isGroq ? 'openrouter/owl-alpha:free' : 'groq/llama-3.3-70b-versatile';
          const isFallbackGroq = fallbackModel.startsWith('groq/');
          const fallbackUrl = isFallbackGroq
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://openrouter.ai/api/v1/chat/completions';
          const fallbackActualModel = isFallbackGroq ? fallbackModel.replace(/^groq\//, '') : fallbackModel;
          const fallbackHeaders: Record<string, string> = isFallbackGroq
            ? {
                Authorization: `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
              }
            : {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://nudge.store',
                'X-Title': 'Nudge Commerce AI',
                'Content-Type': 'application/json',
              };

          const res = await fetch(fallbackUrl, {
            method: 'POST',
            headers: fallbackHeaders,
            body: JSON.stringify({
              model: fallbackActualModel,
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
