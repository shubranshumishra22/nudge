import { callModel } from './callModel';

/**
 * Checks if the store name or business description violates content safety policies.
 * Uses `nvidia/nemotron-3.5-content-safety:free` via OpenRouter.
 * Returns { safe: boolean, reason?: string }
 */
export async function checkContentSafety(
  name: string,
  description: string
): Promise<{ safe: boolean; reason?: string }> {
  const prompt = `You are a content safety guard. Analyze the following store name and business description for any policy violations (including but not limited to: illegal activities, extreme violence, explicit adult content, hate speech, severe harassment, self-harm promotion, or dangerous products).

Store Name: ${name}
Business Description: ${description}

Respond strictly in JSON format with the following fields:
{
  "safe": true or false,
  "reason": "Brief reason if unsafe, otherwise empty"
}`;

  try {
    const responseText = await callModel(
      'nvidia/nemotron-3.5-content-safety:free',
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.0,
        json_mode: true,
      }
    );

    const result = JSON.parse(responseText);
    return {
      safe: typeof result.safe === 'boolean' ? result.safe : true,
      reason: result.reason || undefined,
    };
  } catch (error) {
    console.error('Content safety check failed, defaulting to safe:', error);
    // If safety check fails, default to safe to avoid blocking the user due to API issues
    return { safe: true };
  }
}
