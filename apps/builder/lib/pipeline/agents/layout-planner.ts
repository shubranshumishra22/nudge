import { callModel } from '../utils/callModel';
import type { UserInput, ContentOutput, DesignOutput, ComponentBlock } from '../types';

/**
 * Plans the layout components sequence and maps textual copy fields onto component block attributes.
 * Enforces HeaderV1 at the top, followed by a Hero section.
 */
export async function runLayoutPlanner(
  input: UserInput,
  design: DesignOutput,
  content: ContentOutput,
  positiveMemories: any[],
  antiPatterns: string[]
): Promise<ComponentBlock[]> {
  const systemPrompt = `You are a Senior Website Layout Architect.
Your task is to plan the optimal sequence of UI component blocks for an e-commerce website.
You must select components from the following registry:
1. "HeaderV1" (Header navigation bar, accepts: "businessName")
2. "HeroV1" (Full-width hero section, accepts: "headline", "subheadline", "ctaText", "backgroundImage")
3. "HeroV2" (Split-column hero section with text on left and image on right, accepts: "headline", "subheadline", "ctaText", "backgroundImage")
4. "ProductsV1" (Product grid layout, accepts: "title", "products" array containing objects with: "name", "price", "description", "image_url")
5. "AboutV1" (About text section, accepts: "title", "body")
6. "ContactV1" (Contact section with WhatsApp buttons, accepts: "tagline", "whatsappMessage")
7. "FooterV1" (Footer section, accepts: "tagline", "businessName")

Rules:
- Layout must start with HeaderV1, followed by a Hero component (HeroV1 or HeroV2).
- Layout must end with FooterV1.
- You must incorporate ProductsV1, AboutV1, and ContactV1 in the middle.
- Do NOT use components in the Anti-Patterns list: [${antiPatterns.join(', ')}].
- Make design decisions based on successful templates seen in Positive Memories: ${JSON.stringify(positiveMemories)}.

Return ONLY valid JSON array containing selected component blocks in order. Do not return markdown wrappers.
Example output format:
[
  {
    "name": "HeaderV1",
    "props": { "businessName": "..." }
  },
  {
    "name": "HeroV1",
    "props": { "headline": "...", "subheadline": "...", "ctaText": "...", "backgroundImage": "..." }
  },
  ...
]`;

  const userMessage = `Business details:
Name: ${input.business_name}
Type: ${input.business_type}
Description: ${input.description}
Products: ${JSON.stringify(input.products)}

Page Copy Content:
${JSON.stringify(content)}

Design tokens:
${JSON.stringify(design)}`;

  try {
    const response = await callModel(
      'openai/gpt-oss-120b:free',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 3000, json_mode: true }
    );

    const layout = JSON.parse(response);
    if (Array.isArray(layout)) {
      return layout as ComponentBlock[];
    }
  } catch (e) {
    console.error('Failed to parse layout planner output, falling back:', e);
  }

  // Fallback layout plan
  const imageByType: Record<string, string> = {
    restaurant: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
    cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80',
    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80',
    clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80',
    handmade: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80',
    fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
  };
  const heroBg = imageByType[input.business_type] || 'https://images.unsplash.com/photo-1556740772-1a741367c93e?w=1600&q=80';

  const preferredHero = antiPatterns.includes('HeroV1') ? 'HeroV2' : 'HeroV1';

  return [
    {
      name: 'HeaderV1',
      props: {
        businessName: input.business_name,
      }
    },
    {
      name: preferredHero,
      props: {
        headline: content.hero_headline,
        subheadline: content.hero_subheadline,
        ctaText: content.hero_cta,
        backgroundImage: heroBg,
      }
    },
    {
      name: 'ProductsV1',
      props: {
        title: content.products_section_title || 'Our Products',
        products: input.products
      }
    },
    {
      name: 'AboutV1',
      props: {
        title: content.about_title || 'About Us',
        body: content.about_body
      }
    },
    {
      name: 'ContactV1',
      props: {
        tagline: content.contact_tagline || 'Get in touch with us!',
        whatsappMessage: content.whatsapp_message
      }
    },
    {
      name: 'FooterV1',
      props: {
        tagline: content.footer_tagline,
        businessName: input.business_name
      }
    }
  ];
}
