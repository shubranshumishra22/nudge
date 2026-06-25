import { callModel } from '@/lib/pipeline/utils/callModel';
import { CONTENT_SYSTEM_PROMPT } from '@/lib/pipeline/prompts';
import { translateText } from '@/lib/pipeline/utils/translate';
import type { UserInput, ResearchOutput, DesignOutput, ContentOutput } from '@/lib/pipeline/types';

export async function runContentAgent(
  input: UserInput,
  research: ResearchOutput,
  design: DesignOutput
): Promise<ContentOutput> {
  const startTime = Date.now();
  const isRegional = !!(input.language && !input.language.startsWith('en'));
  let parsed: ContentOutput | null = null;
  let contentGenerated = false;

  if (isRegional) {
    console.log(`[Content Agent V3] Regional language active: ${input.language}. Attempting direct generation via sarvam/sarvam-2b...`);
    try {
      const regionalPrompt = `You are a copywriter. Write compelling brand copy for a storefront in the language matching code "${input.language}".
Business Name: ${input.original_business_name || input.business_name}
Business Type: ${input.business_type}
Description: ${input.original_description || input.description}
Tone: ${research.tone}

Respond strictly in JSON format matching this TypeScript interface (values MUST be in the language matching code "${input.language}"):
{
  "hero_headline": string,
  "hero_subheadline": string,
  "hero_cta": string,
  "about_title": string,
  "about_body": string,
  "products_section_title": string,
  "contact_tagline": string,
  "footer_tagline": string,
  "seo_title": string,
  "seo_description": string,
  "whatsapp_message": string
}`;

      const modelResponse = await callModel(
        'sarvam/sarvam-2b',
        [
          { role: 'user', content: regionalPrompt }
        ],
        { max_tokens: 2000 }
      );
      parsed = JSON.parse(modelResponse);
      contentGenerated = true;
      console.log('[Content Agent V3] Direct regional content generation succeeded!');
    } catch (regionalErr) {
      console.warn('[Content Agent V3] Direct regional content generation failed, falling back to English generation + translation:', regionalErr);
    }
  }

  if (!contentGenerated) {
    try {
      const systemMessage = CONTENT_SYSTEM_PROMPT;
      const userMessage = `Business Name: ${input.business_name}
Business Type: ${input.business_type}
Description: ${input.description}

Tone extracted from research: ${research.tone}

3 Headline Patterns for inspiration:
${research.headline_patterns.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

3 CTA Patterns for inspiration:
${research.cta_patterns.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

Write copy for:
- Hero headline
- Hero subheadline
- Hero CTA button text
- About section title
- About section body text
- Products section title
- Contact section tagline
- Footer tagline
- SEO title (max 60 chars)
- SEO description (max 160 chars)

WhatsApp message: Pre-filled message a customer would send to the business (e.g. "Hi! I saw your store on Nudge and wanted to ask about...")

Return ONLY valid JSON matching the ContentOutput interface.`;

      const modelOverride = (input as any)._model_overrides?.content;

      const modelResponse = await callModel(
        'openai/gpt-oss-120b:free',
        [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        { max_tokens: 2000, _model_override: modelOverride }
      );

      parsed = JSON.parse(modelResponse);

      if (isRegional && parsed) {
        console.log(`[Content Agent V3] Translating English storefront content to target language: ${input.language}`);
        for (const key of Object.keys(parsed) as Array<keyof ContentOutput>) {
          if (typeof parsed[key] === 'string') {
            try {
              const translation = await translateText(parsed[key], 'en-IN', input.language);
              parsed[key] = translation.translated_text;
            } catch (transErr) {
              console.warn(`[Content Agent V3] Translation of field ${key} failed:`, transErr);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Content] ✗ failed:', error);
      parsed = getFallbackContent(input.business_name, input.business_type);

      if (isRegional && parsed) {
        console.log(`[Content Agent V3] Translating default storefront content to target language: ${input.language}`);
        for (const key of Object.keys(parsed) as Array<keyof ContentOutput>) {
          if (typeof parsed[key] === 'string') {
            try {
              const translation = await translateText(parsed[key], 'en-IN', input.language);
              parsed[key] = translation.translated_text;
            } catch (transErr) {
              console.warn(`[Content Agent V3] Translation of default fallback field ${key} failed:`, transErr);
            }
          }
        }
      }
    }
  }

  console.log(`[Content] ✓ completed in ${Date.now() - startTime}ms`);
  return parsed!;
}

function getFallbackContent(businessName: string, businessType: string): ContentOutput {
  const defaults: Record<string, Partial<ContentOutput>> = {
    cafe: {
      hero_headline: `Welcome to ${businessName}`,
      hero_subheadline: 'Your neighborhood coffee destination serving quality brews',
      hero_cta: 'Order Now',
      about_title: 'Our Story',
      about_body: `At ${businessName}, we believe coffee should be more than just a drink - it should be an experience. We source the finest beans and craft each cup with care, creating the perfect space for you to relax and enjoy.`,
      products_section_title: 'Our Menu',
      contact_tagline: 'We would love to hear from you!'
    },
    bakery: {
      hero_headline: `Freshly Baked at ${businessName}`,
      hero_subheadline: 'Handcrafted pastries and breads made with love',
      hero_cta: 'Shop Breads & Pastries',
      about_title: 'Artisan Baking',
      about_body: `At ${businessName}, we combine traditional baking techniques with modern flavors. Each product is handcrafted using premium ingredients to deliver authentic taste and quality.`,
      products_section_title: 'Our Selection',
      contact_tagline: 'Inquire about our custom orders!'
    }
  };

  const businessDefaults = defaults[businessType as keyof typeof defaults] || {
    hero_headline: `Shop at ${businessName}`,
    hero_subheadline: 'Quality products for everyday needs',
    hero_cta: 'Start Shopping',
    about_title: 'About Us',
    about_body: `Welcome to ${businessName}, your one-stop shop for quality products at great prices. We carefully curate every item we sell to ensure the best shopping experience.`,
    products_section_title: 'Our Products',
    contact_tagline: 'Contact us for special inquiries!'
  };

  return {
    ...businessDefaults as ContentOutput,
    footer_tagline: 'Powered by Nudge Commerce AI',
    seo_title: `${businessName} — Quality Products`,
    seo_description: `Discover ${businessName} - ${businessDefaults.about_body || ''}. Shop online with confidence.`,
    whatsapp_message: `Hi! I saw your store on Nudge and wanted to ask about your products.`
  };
}