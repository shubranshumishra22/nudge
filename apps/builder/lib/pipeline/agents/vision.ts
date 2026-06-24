import { callModel } from '@/lib/pipeline/utils/callModel';
import { takeScreenshot } from '@/lib/pipeline/utils/screenshots';
import { VISION_SYSTEM_PROMPT } from '@/lib/pipeline/prompts';
import type { UserInput, ResearchOutput, DesignOutput } from '@/lib/pipeline/types';

export async function runVisionAgent(input: UserInput, research: ResearchOutput): Promise<DesignOutput> {
  const startTime = Date.now();

  const topSites = research.top_sites.slice(0, 3);
  if (topSites.length === 0) {
    return getDefaultDesign(input.primary_color);
  }

  const screenshots = await Promise.all(
    topSites.map(async (site) => {
      try {
        const base64 = await takeScreenshot(site.url);
        return { url: site.url, base64 };
      } catch {
        return null;
      }
    })
  );

  const validScreenshots = screenshots.filter((s): s is { url: string; base64: string } => s !== null && s.base64.length > 0);
  if (validScreenshots.length === 0) {
    return getDefaultDesign(input.primary_color);
  }

  const modelOverride = (input as any)._model_overrides?.vision;

  const modelResponses = await Promise.all(
    validScreenshots.map(async ({ base64 }) => {
      try {
        const response = await callModel(
          'nvidia/llama-3.2-nemotron-nano-vl-8b-v1:free',
          [
            { role: 'system', content: VISION_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
                { type: 'text', text: 'Analyse this website screenshot and extract the design system. Return ONLY valid JSON matching the DesignOutput interface.' }
              ]
            }
          ],
          { max_tokens: 2000, _model_override: modelOverride }
        );
        return response;
      } catch {
        return null;
      }
    })
  );

  const validResponses = modelResponses.filter((r): r is string => r !== null);
  if (validResponses.length === 0) {
    return getDefaultDesign(input.primary_color);
  }

  const merged = mergeDesignOutputs(validResponses, input.primary_color);
  console.log(`[Vision] ✓ completed in ${Date.now() - startTime}ms`);
  return merged;
}

function getDefaultDesign(primaryColor: string): DesignOutput {
  return {
    primary_color: primaryColor,
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
    font_heading: 'Playfair Display',
    font_body: 'Inter',
    border_radius: '8px',
    spacing_unit: '16px',
    hero_style: 'fullbleed',
    card_style: 'shadow',
    template_name: 'warm-minimal'
  };
}

function mergeDesignOutputs(responses: string[], userPrimaryColor: string): DesignOutput {
  const designs: DesignOutput[] = [];
  for (const response of responses) {
    try {
      const parsed: DesignOutput = JSON.parse(response);
      designs.push(parsed);
    } catch {
      // skip
    }
  }

  if (designs.length === 0) {
    return getDefaultDesign(userPrimaryColor);
  }

  const fields: (keyof DesignOutput)[] = [
    'accent_color', 'background_color', 'text_color',
    'font_heading', 'font_body', 'border_radius', 'spacing_unit',
    'hero_style', 'card_style', 'template_name'
  ];

  const merged: DesignOutput = { ...designs[0] };
  merged.primary_color = userPrimaryColor;

  for (const field of fields) {
    const values = designs.map(d => d[field]);
    const counts = new Map<string, number>();
    let maxCount = 0;
    let mostCommon = values[0];
    for (const v of values) {
      const key = String(v);
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      if (count > maxCount) {
        maxCount = count;
        mostCommon = v;
      }
    }
    (merged as any)[field] = mostCommon;
  }

  return merged;
}
