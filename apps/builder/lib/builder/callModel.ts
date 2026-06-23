const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions'

interface CallModelOptions {
  max_tokens?: number
  temperature?: number
}

export async function callModel(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: CallModelOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const maxRetries = 2

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)

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
          temperature: options.temperature ?? 0.5,
          max_tokens: options.max_tokens ?? 2000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (res.status === 429 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
        continue
      }

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`OpenRouter ${model} returned ${res.status}: ${errBody}`)
      }

      const json = await res.json()
      const text: string = json.choices?.[0]?.message?.content ?? ''
      if (!text) throw new Error('Empty response from model')
      return text
    } catch (err) {
      clearTimeout(timeout)
      if (attempt === maxRetries) throw err
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    }
  }

  throw new Error('Model call failed after retries')
}
