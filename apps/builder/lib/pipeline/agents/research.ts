import { callModel } from '@/lib/pipeline/utils/callModel';
import { scrapeWebsite } from '@/lib/pipeline/utils/scraper';
import { RESEARCH_SYSTEM_PROMPT } from '@/lib/pipeline/prompts';
import type { UserInput, ResearchOutput } from '@/lib/pipeline/types';

export async function runResearchAgent(input: UserInput): Promise<ResearchOutput> {
  const startTime = Date.now();

  // Step 1: Ask the model to generate relevant competitor URLs
  const urlGenerationPrompt = `List 8 well-known, real competitor websites for a ${input.business_type} business called "${input.business_name}". Return ONLY a JSON array of strings with full URLs (e.g. "https://example.com"). Do not include any other text. Example for cafe: ["https://bluebottlecoffee.com", "https://stumptowncoffee.com"]`;

  let urls: string[] = [];
  try {
    const urlResponse = await callModel(
      'nvidia/llama-3.3-nemotron-super-49b-v1:free',
      [{ role: 'user', content: urlGenerationPrompt }],
      { max_tokens: 1000, temperature: 0.3 }
    );
    const parsed = JSON.parse(urlResponse);
    if (Array.isArray(parsed)) {
      urls = parsed.slice(0, 8);
    }
  } catch (err) {
    console.error('[Research] URL generation failed, using fallback:', err);
    urls = getFallbackUrls(input.business_type);
  }

  if (urls.length === 0) {
    urls = getFallbackUrls(input.business_type);
  }

  // Step 2: Scrape each URL
  const scrapedSummaries = await Promise.all(
    urls.map(async (url) => {
      try {
        const summary = await scrapeWebsite(url);
        return { url, summary, success: true };
      } catch {
        return { url, success: false };
      }
    })
  );

  const validScrapes = scrapedSummaries.filter((s) => s.success && s.summary);
  if (validScrapes.length === 0) {
    return getDefaultResearch(input.business_type);
  }

  // Step 3: Send scraped summaries to research model for analysis
  const userMessage = `Extract patterns from these competitor summaries:
${validScrapes
  .map((s) => `URL: ${s.url}\nContent: ${s.summary}\n---`)
  .join('\n')}

Return ONLY valid JSON matching:
{
  "top_sites": [{ "url": string, "title": string }],
  "common_sections": ["section1", "section2", ...],
  "headline_patterns": ["pattern1", "pattern2", ...],
  "cta_patterns": ["pattern1", "pattern2", ...],
  "tone": "warm" | "professional" | "playful" | "minimal" | "bold",
  "competitor_summary": string
}`;

  try {
    const modelResponse = await callModel(
      'nvidia/llama-3.3-nemotron-super-49b-v1:free',
      [
        { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 2000, json_mode: true }
    );

    const parsed: ResearchOutput = JSON.parse(modelResponse);
    console.log(`[Research] ✓ completed in ${Date.now() - startTime}ms`);
    return parsed;
  } catch (err) {
    console.error('[Research] ✗ analysis failed:', err);
    return getDefaultResearch(input.business_type);
  }
}

function getFallbackUrls(type: string): string[] {
  const map: Record<string, string[]> = {
    cafe: ['https://bluebottlecoffee.com', 'https://stumptowncoffee.com'],
    bakery: ['https://laboursashley.com', 'https://cleohandler.com'],
    clothing: ['https://zara.com', 'https://uniqlo.com'],
    fitness: ['https://planetfitness.com', 'https://equinox.com'],
    handmade: ['https://etsy.com', 'https://dannamal.com'],
    restaurant: ['https://dominos.com', 'https://kfc.com'],
    beauty: ['https://glossier.com', 'https://theordinary.com'],
    generic: ['https://amazon.com', 'https://target.com'],
  };
  return map[type] || map.generic;
}

function getDefaultResearch(type: string): ResearchOutput {
  const defaults: Record<string, Partial<ResearchOutput>> = {
    cafe: {
      top_sites: [{ url: 'https://bluebottlecoffee.com', title: 'Blue Bottle Coffee' }],
      common_sections: ['hero', 'menu', 'about', 'contact'],
      headline_patterns: ['Discover your perfect brew', 'Crafted for you'],
      cta_patterns: ['Order Now', 'Visit Us'],
      tone: 'warm',
      competitor_summary: 'Coffee shop competitors focus on quality and atmosphere.',
    },
    bakery: {
      top_sites: [{ url: 'https://laboursashley.com', title: 'Labour & Ashley' }],
      competitor_summary: 'Bakeries focus on artisan quality and fresh ingredients.',
      tone: 'warm',
      common_sections: ['hero', 'products', 'about', 'contact'],
      headline_patterns: ['Freshly baked daily', 'Made with love'],
      cta_patterns: ['Order Now', 'Shop Baked Goods'],
    },
  };
  const fallback = defaults[type] || {
    top_sites: [],
    common_sections: ['hero', 'products', 'about', 'contact'],
    headline_patterns: ['Welcome', 'Discover', 'Shop Now'],
    cta_patterns: ['Shop Now', 'Learn More', 'Get Started'],
    tone: 'minimal' as const,
    competitor_summary: 'Default competitor analysis.',
  };
  return {
    top_sites: fallback.top_sites || [],
    common_sections: fallback.common_sections || ['hero', 'products', 'about', 'contact'],
    headline_patterns: fallback.headline_patterns || ['Welcome', 'Discover'],
    cta_patterns: fallback.cta_patterns || ['Shop Now', 'Learn More'],
    tone: (fallback.tone as ResearchOutput['tone']) || 'minimal',
    competitor_summary: fallback.competitor_summary || '',
  };
}
