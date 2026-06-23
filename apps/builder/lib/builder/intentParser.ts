import { callModel } from './callModel';

export interface ParsedIntent {
  intent: 'change_colors' | 'change_copy' | 'change_layout' | 'change_style' |
          'change_products' | 'full_regenerate' | 'question' | 'add_section';
  target_section: string | null;
  confidence: number;
}

async function parseIntent(message: string): Promise<ParsedIntent> {
  const systemPrompt = `You are an intent classifier for a small business storefront builder.

Given a user's message about their storefront, classify the INTENT and TARGET_SECTION they want to change.

INTENT options:
- change_colors: user mentions colors, dark mode, theme changes
- change_copy: user wants to rewrite text, headlines, descriptions, copy
- change_layout: user mentions sections, adding/removing parts, reordering
- change_style: user mentions fonts, spacing, visual styling, presentation
- change_products: user wants to update/add/remove products
- full_regenerate: user is unsatisfied and wants to start fresh (they say things like "start over", "completely different", "make it from scratch")
- question: user is asking something, no store update needed
- add_section: user wants a new section (testimonials, FAQ, team, etc.)

TARGET_SECTION options:
- 'hero': user wants to change the hero section
- 'products': user wants to change products section
- 'about': user wants to change the about section
- 'contact': user wants to change the contact section
- null: no specific section mentioned or applies to whole store

Be precise:
- "make the background darker" → intent: change_colors, target: null
- "rewrite the hero headline" → intent: change_copy, target: 'hero'
- "add testimonials below the products" → intent: add_section, target: 'testimonials'
- "I don't like it, make it completely different" → intent: full_regenerate, target: null
- "what time are you open?" → intent: question, target: null

Return ONLY valid JSON with: {
  "intent": string,
  "target_section": string | null,
  "confidence": number (0-100)
}

Ensure intent is exactly one of the listed values.`;

  const userPrompt = `Classify this user message: "${message}"

Return only the JSON.`;

  try {
    const response = await callModel('openrouter/auto', [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { max_tokens: 500, temperature: 0.1 });

    return JSON.parse(response);
  } catch (error) {
    console.error('Intent parser failed:', error);
    return {
      intent: 'question',
      target_section: null,
      confidence: 0
    };
  }
}

export async function classifyMessage(message: string): Promise<ParsedIntent> {
  return parseIntent(message.toLowerCase());
}