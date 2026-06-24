import { callModel } from './callModel';
import type { ParsedIntent } from './intentParser';

export interface StoreUpdateOptions {
  intent: ParsedIntent['intent'];
  targetSection: ParsedIntent['target_section'];
  storeHtml: string;
  designTokens: {
    primary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    font_heading: string;
    font_body: string;
    border_radius: string;
    spacing_unit: string;
    hero_style: string;
    card_style: string;
  };
  content: {
    hero_headline: string;
    hero_subheadline: string;
    hero_cta: string;
    about_title: string;
    about_body: string;
    products_section_title: string;
    contact_tagline: string;
    footer_tagline: string;
    seo_title: string;
    seo_description: string;
    whatsapp_message: string;
  };
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface BuilderAgentResponse {
  response: string;  // Conversational response
  updatedHtml: string;
  updatedSection: string | null;
}

export async function runBuilderAgent(options: StoreUpdateOptions): Promise<BuilderAgentResponse> {
  const { intent, targetSection, storeHtml, designTokens, content, conversationHistory } = options;

  // Common design rules applied to all changes
  const designRules = `
DESIGN RULES (Emil Kowalski philosophy — follow strictly):
- Whitespace is a feature: generous padding (64-96px section vertical, 24-32px card padding), breathing room everywhere
- Typography first: proper hierarchy, line-height 1.6 body / 1.2 headings, good letter-spacing
- Subtlety over flash: micro-interactions (0.2s ease hover transitions), subtle shadows, gentle color shifts
- Consistent rhythm: use spacing scale (4/8/12/16/24/32/48/64/96px), consistent border-radius (12px cards, 8px buttons)
- Refined colors: muted sophisticated palettes. Avoid pure black. Use opacity for depth.
- Glassmorphism: backdrop-filter: blur(12px) on sticky headers, semi-transparent backgrounds
- Smooth transitions: 0.2s-0.3s ease for hovers, 0.5s ease for page elements
- Borders are optional — use spacing to separate content instead
- Mobile-first: responsive by default, touch-friendly targets (min 44px)
- NO margin-top, padding-top, or top spacing on the hero section or any element. The hero must start directly below the header.
- If the hero uses min-h-[70vh], change it to min-h-[calc(100vh-64px)] so it fills the remaining viewport without extra whitespace.
`;

  const isCopyChange = intent === 'change_copy' || intent === 'change_products';
  
  let changeRules = '';
  if (isCopyChange) {
    changeRules = `
- Make SURGICAL changes only. If the user says 'rewrite the title', only rewrite that title text. Do not touch styling or layout.
- Only change text content - do not touch CSS, JavaScript, or HTML structure (except for adding/removing text elements).
`;
  } else if (intent === 'full_regenerate') {
    changeRules = `
- You are performing a COMPLETE cohesive redesign of the entire storefront.
- Cohesively upgrade the styling, color scheme, typography, layout structures, and visual presentation across ALL sections of the site.
- Apply high-end modern design choices: dark or sophisticated HSL color palettes, beautiful google font hierarchy, modern card layouts, and polished glassmorphism header navigation.
- Do NOT make surgical/minimal changes. Make widespread styling and design improvements to header, hero, products, about, contact, and footer sections so they look premium and aligned.
`;
  } else {
    changeRules = `
- Make SURGICAL changes only. If the user says 'change the hero color', only change the hero background color. Do not touch anything else.
`;
  }

  const systemPrompt = `
You are an expert designer + developer (Emil Kowalski style) embedded in a live website editor. The user can see their storefront in a preview pane and is asking you to make changes. You have the current HTML of their store.

Your job:
1. First, respond in natural, conversational English explaining what you are about to change and why it will look great. Be warm and encouraging. 2-3 sentences max.
2. Then make the targeted change to the HTML.

Rules for making changes:
${changeRules}
- Preserve all existing JavaScript (cart logic, Razorpay) exactly as-is.
- Preserve all section IDs (id='hero', id='products', etc.) exactly as-is.
- The nudge-updating CSS and postMessage listener must remain in the HTML.
${designRules}
- Return your conversational response followed by a special delimiter and the COMPLETE updated HTML:

[NUDGE_RESPONSE]
Your conversational text here.
[NUDGE_HTML_START]
<!DOCTYPE html>
...complete updated HTML...
[NUDGE_HTML_END]

If the intent is 'question' (no store update needed):
Return ONLY the conversational answer. Do not include the delimiters.
`;

  // Prepare the user message with context
  const userMessage = `
STORE CONTEXT:
Intent: ${intent}
Target Section: ${targetSection || 'none'}
Design Tokens: ${JSON.stringify(designTokens)}
Content: ${JSON.stringify(content)}

CURRENT STORE HTML:
${storeHtml}

CONVERSATION HISTORY:
${conversationHistory.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

User's current message: ${options.conversationHistory[options.conversationHistory.length - 1]?.content || ''}

Respond with your analysis and changes as instructed.
`;

  // Call the model with retry logic via callModel
  console.log(`Builder agent: calling model for intent=${intent} target=${targetSection}`);
  const modelResponse = await callModel(
    'deepseek/deepseek-v4-flash:free',
    [
      { role: 'system', content: systemPrompt.trim() },
      { role: 'user', content: userMessage.trim() }
    ],
    {
      max_tokens: 4000,
      temperature: 0.4
    }
  );

  // Parse the response to extract conversational part and HTML
  if (!modelResponse.includes('[NUDGE_HTML_START]')) {
    // If no HTML delimiter, treat as pure response (question or no update)
    return {
      response: modelResponse.trim(),
      updatedHtml: storeHtml,
      updatedSection: null
    };
  }

  const parts = modelResponse.split('[NUDGE_HTML_START]');
  const responsePart = parts[0].replace('[NUDGE_RESPONSE]', '').trim();
  const htmlPart = parts[1].split('[NUDGE_HTML_END]')[0].trim();

  // Clean HTML from code block wrappers if any
  let cleanHtml = htmlPart.trim();
  if (cleanHtml.startsWith('```')) {
    const firstLineBreak = cleanHtml.indexOf('\n');
    if (firstLineBreak !== -1 && firstLineBreak < 15) {
      cleanHtml = cleanHtml.substring(firstLineBreak + 1);
    } else {
      cleanHtml = cleanHtml.substring(3);
    }
    const lastTicks = cleanHtml.lastIndexOf('```');
    if (lastTicks !== -1) {
      cleanHtml = cleanHtml.substring(0, lastTicks);
    }
    cleanHtml = cleanHtml.trim();
  }

  // Validate HTML starts with DOCTYPE
  if (!cleanHtml.startsWith('<!DOCTYPE html>')) {
    console.warn('Generated HTML does not start with DOCTYPE, returning original. First 100 chars:', cleanHtml.substring(0, 100));
    return {
      response: 'I made some changes to your store, but encountered an issue with the HTML generation. Let me try again.',
      updatedHtml: storeHtml,
      updatedSection: null
    };
  }

  return {
    response: responsePart,
    updatedHtml: cleanHtml,
    updatedSection: targetSection
  };
}


// Fallback response for when the model fails
export function getFallbackResponse(options: StoreUpdateOptions): BuilderAgentResponse {
  return {
    response: `I understand you want to ${options.intent === 'change_colors' ? 'change the colors' :
               options.intent === 'change_copy' ? 'update the text' :
               options.intent === 'change_layout' ? 'modify the layout' :
               options.intent === 'change_style' ? 'adjust the style' :
               options.intent === 'change_products' ? 'update products' :
               options.intent === 'full_regenerate' ? 'start fresh' :
               options.intent === 'add_section' ? 'add a new section' :
               'help with your store'}.

    I'm having trouble processing that request right now. Could you try rephrasing or being more specific about what you'd like to change?`,
    updatedHtml: options.storeHtml,
    updatedSection: null
  };
}