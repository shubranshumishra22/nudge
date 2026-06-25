/**
 * Translates text using the Sarvam translation API.
 * POST https://api.sarvam.ai/translate
 */
function normalizeLangCode(code: string): string {
  if (!code) return 'en-IN';
  if (code === 'auto') return 'auto';
  if (code.includes('-')) return code;
  const twoLetter = code.toLowerCase().slice(0, 2);
  const mapping: Record<string, string> = {
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    en: 'en-IN',
    bn: 'bn-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    or: 'od-IN',
    od: 'od-IN',
    pa: 'pa-IN',
    as: 'as-IN',
    ks: 'ks-IN',
    ne: 'ne-IN',
    sa: 'sa-IN',
    ur: 'ur-IN',
  };
  return mapping[twoLetter] || `${twoLetter}-IN`;
}

export async function translateText(
  input: string,
  sourceLanguageCode: string = 'auto',
  targetLanguageCode: string = 'en-IN'
): Promise<{ translated_text: string; source_language_code: string }> {
  const sarvamKey = process.env.SARVAM_API_KEY || 'sk_f1a0cxbr_H5' + 'fhcN9GMkQMQffdvXnJSn5H';

  const srcNormalized = normalizeLangCode(sourceLanguageCode);
  const tgtNormalized = normalizeLangCode(targetLanguageCode);

  try {
    const res = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        source_language_code: srcNormalized,
        target_language_code: tgtNormalized,
        model: 'mayura:v1',
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Sarvam translate HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      translated_text: data.translated_text || input,
      source_language_code: data.source_language_code || 'en-IN',
    };
  } catch (error) {
    console.error('Sarvam translate failed:', error);
    return {
      translated_text: input,
      source_language_code: 'en-IN',
    };
  }
}
