import { callModel } from '../utils/callModel';
import type { UserInput, DesignOutput } from '../types';

/**
 * Generates custom, luxury style design tokens using LLM constraints, incorporating competitor screenshot metrics.
 */
export async function runStyleGenerator(
  input: UserInput,
  visionDesign: DesignOutput
): Promise<DesignOutput> {
  console.log('[Style Generator] Designing visual tokens...');

  const systemPrompt = `You are a Luxury Brand Style Director.
Your task is to design a premium, stunning design system for a business.

You MUST apply these Core design principles:
1. Emil Kowalski Design: Focus on refined minimalism, high attention to visual detail, sleek layouts, and dynamic micro-animations. The design must feel alive, clean, and interactive.
2. Impeccable Design: Ensure perfect layout balance, professional-grade visual aesthetics, and strict padding/spacing rhythm. Every element must align beautifully with consistent spacing.
3. Taste Skill: Demonstrate sophisticated taste. Avoid cluttered, cheap-looking, or generic layouts. Use elegant near-blacks instead of pure black, subtle glassmorphic elements, and cohesive styling.

Color Palette Rules:
- Avoid generic pure colors (e.g. plain red, blue, green). Use curated, sophisticated, and harmonious palettes (e.g. deep forest green, warm terracotta, soft sand, sleek charcoal, cream white).
- Avoid pure black (#000000) for text. Use elegant near-blacks (e.g., #1A1A1A, #121212).
- Ensure background_color contrasts beautifully with the text_color.

Typography Rules:
- Pair an elegant, high-contrast serif font for headings (e.g. 'Playfair Display', 'Cormorant Garamond', 'Cinzel') with a clean, readable sans-serif font for body text (e.g. 'Inter', 'Outfit', 'Plus Jakarta Sans').

Return ONLY a valid JSON matching:
{
  "primary_color": "Hex color code",
  "accent_color": "Hex color code matching primary",
  "background_color": "Hex color code (light or dark mode)",
  "text_color": "Hex color code contrasting background",
  "font_heading": "Serif font name",
  "font_body": "Sans-serif font name",
  "border_radius": "12px" | "16px" | "24px",
  "spacing_unit": "20px" | "24px" | "32px",
  "hero_style": "fullbleed" | "split",
  "card_style": "shadow" | "border" | "flat",
  "template_name": "modern-luxury" | "sophisticated-minimal"
}

Return ONLY valid JSON. No markdown wrappers.`;

  const userMessage = `Business details:
Name: ${input.business_name}
Type: ${input.business_type}
Description: ${input.description}
Suggested Primary Color: ${input.primary_color}

Extracted from competitor sites:
${JSON.stringify(visionDesign)}`;

  const modelOverride = (input as any)._model_overrides?.builder;

  try {
    const response = await callModel(
      'openai/gpt-oss-120b:free',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 1500, json_mode: true, _model_override: modelOverride }
    );

    const parsed = JSON.parse(response) as DesignOutput;
    // Keep user's requested primary color if provided
    if (input.primary_color && input.primary_color.startsWith('#')) {
      parsed.primary_color = input.primary_color;
    }
    // Propagate overrides downstream
    (parsed as any)._model_overrides = (input as any)._model_overrides;
    return parsed;
  } catch (err) {
    console.error('Style Generator LLM call failed, returning formatted input:', err);
  }

  // Fallback
  const refined: DesignOutput = { ...visionDesign };
  if (refined.text_color === '#000000' || refined.text_color === '#000' || !refined.text_color) {
    refined.text_color = '#1A1A1A';
  }
  refined.border_radius = refined.border_radius || '16px';
  refined.spacing_unit = refined.spacing_unit || '24px';
  refined.primary_color = input.primary_color || '#4F46E5';
  
  // Propagate overrides downstream for fallback
  (refined as any)._model_overrides = (input as any)._model_overrides;
  return refined;
}
