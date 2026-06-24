import { callModel } from './callModel';

export interface ParsedIntent {
  intent: 'change_colors' | 'change_copy' | 'change_layout' | 'change_style' |
          'change_products' | 'full_regenerate' | 'question' | 'add_section';
  target_section: string | null;
  confidence: number;
}

const colorTerms = ['color', 'colors', 'palette', 'theme', 'background', 'dark mode', 'light mode'];
const fontTerms = ['font', 'fonts', 'typography', 'text style', 'sans', 'serif'];
const headerTerms = ['header', 'navbar', 'navigation', 'menu'];
const heroTerms = ['hero', 'banner', 'headline', 'cta'];
const productTerms = ['product', 'products', 'card', 'cards', 'pricing'];
const layoutTerms = ['layout', 'spacing', 'structure', 'section', 'sections'];

const designGroups = [colorTerms, fontTerms, headerTerms, heroTerms, productTerms, layoutTerms];

function matchesMultiple(message: string, termsGroups: string[][]): boolean {
  let matchedCount = 0;
  for (const group of termsGroups) {
    if (group.some(term => message.includes(term))) {
      matchedCount++;
    }
  }
  return matchedCount >= 2;
}

function extractJSON(text: string): ParsedIntent | null {
  try {
    return JSON.parse(text);
  } catch {}

  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && firstBrace < lastBrace) {
      const jsonContent = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonContent);
    }
  } catch {}

  // Regex-based robust parser
  const intentMatch = text.match(/"intent"\s*:\s*"([^"]+)"/i) || text.match(/'intent'\s*:\s*'([^']+)'/i);
  if (intentMatch) {
    const intentVal = intentMatch[1] as ParsedIntent['intent'];
    const targetMatch = text.match(/"target_section"\s*:\s*(?:"([^"]+)"|'([^']+)'|(null))/i);
    let targetSectionVal: ParsedIntent['target_section'] = null;
    if (targetMatch) {
      if (targetMatch[1]) targetSectionVal = targetMatch[1] as any;
      else if (targetMatch[2]) targetSectionVal = targetMatch[2] as any;
    }
    const confidenceMatch = text.match(/"confidence"\s*:\s*(?:(\d+)|"([^"]+)")/i);
    let confidenceVal = 80;
    if (confidenceMatch) {
      if (confidenceMatch[1]) {
        confidenceVal = parseInt(confidenceMatch[1], 10);
      } else if (confidenceMatch[2]) {
        const parsedNum = parseInt(confidenceMatch[2], 10);
        if (!isNaN(parsedNum)) confidenceVal = parsedNum;
      }
    }
    return {
      intent: intentVal,
      target_section: targetSectionVal,
      confidence: confidenceVal
    };
  }

  return null;
}

async function parseIntent(message: string): Promise<ParsedIntent> {
  const messageClean = message.toLowerCase().trim();
  const bypassKeywords = [
    'everything', 'all', 'completely redesign', 'redesign everything', 'all of it',
    'reset', 'start over', 'start fresh', 'completely different', 'make it look premium',
    'redesign it', 'redesign'
  ];

  // Eager pre-parsing for broad commands or multiple targets to prevent loop
  if (
    bypassKeywords.some(kw => messageClean === kw || messageClean.startsWith(kw)) ||
    messageClean.includes('everything') ||
    messageClean.includes('redesign it') ||
    matchesMultiple(messageClean, designGroups)
  ) {
    console.log('Intent pre-parser: matched full_regenerate bypass for:', message);
    return {
      intent: 'full_regenerate',
      target_section: null,
      confidence: 100
    };
  }

  const systemPrompt = `You are an intent classifier for a small business storefront builder.
Your primary objective is to be action-oriented. If the user requests ANY changes to their store—even if broad, vague, or combining multiple areas (e.g., "everything", "make it look premium", "redesign it", "change the colors and fonts", or listing multiple sections/tokens)—you MUST classify it as one of the modification intents (e.g. 'full_regenerate', 'change_style', 'change_colors') to trigger an actual update.
NEVER classify as 'question' unless the user is asking a purely informational question with absolutely no intent to modify the storefront (e.g., "how do I use this?", "where are you located?").

INTENT options:
- change_colors: user mentions colors, dark mode, theme changes
- change_copy: user wants to rewrite text, headlines, descriptions, copy
- change_layout: user mentions sections, adding/removing parts, reordering
- change_style: user mentions fonts, spacing, visual styling, presentation
- change_products: user wants to update/add/remove products
- full_regenerate: user wants a sweeping redesign, wants to start fresh, or lists multiple change categories at once (e.g. "everything", "redesign colors and fonts", "start over", "completely different")
- question: user is asking something purely informational, no store update needed
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
- "everything" or "change everything" → intent: full_regenerate, target: null
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
    const response = await callModel('deepseek/deepseek-v4-flash:free', [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { max_tokens: 250, temperature: 0.1 });

    const parsed = extractJSON(response);
    const allowedIntents = [
      'change_colors', 'change_copy', 'change_layout', 'change_style',
      'change_products', 'full_regenerate', 'question', 'add_section'
    ];
    if (parsed && allowedIntents.includes(parsed.intent)) {
      return parsed;
    }
    throw new Error(`Invalid intent values: ${JSON.stringify(parsed)}`);
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