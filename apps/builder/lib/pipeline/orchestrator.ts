import { runResearchAgent } from './agents/research';
import { runVisionAgent } from './agents/vision';
import { runContentAgent } from './agents/content';
import { runBuilderAgent } from './agents/builder';
import { runQAAgent } from './agents/qa';
import type { UserInput, PipelineResult, ResearchOutput, DesignOutput, ContentOutput, BuildOutput } from './types';

function getDefaultResearch(): ResearchOutput {
  return {
    top_sites: [],
    common_sections: ['hero', 'products', 'about', 'contact'],
    headline_patterns: ['Welcome', 'Discover', 'Shop Now'],
    cta_patterns: ['Shop Now', 'Learn More', 'Get Started'],
    tone: 'minimal',
    competitor_summary: '',
  };
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
    template_name: 'warm-minimal',
  };
}

function getDefaultContent(businessName: string): ContentOutput {
  return {
    hero_headline: `Welcome to ${businessName}`,
    hero_subheadline: 'Quality products for everyday needs',
    hero_cta: 'Shop Now',
    about_title: 'About Us',
    about_body: `At ${businessName}, we are committed to providing the best products and service.`,
    products_section_title: 'Our Products',
    contact_tagline: 'Get in touch with us!',
    footer_tagline: 'Powered by Nudge Commerce AI',
    seo_title: `${businessName} — Shop Online`,
    seo_description: `Discover ${businessName} - quality products at great prices. Shop online with confidence.`,
    whatsapp_message: `Hi! I saw your store on Nudge and wanted to ask about your products.`,
  };
}

function getDefaultBuild(): BuildOutput {
  return {
    html: '<!DOCTYPE html><html><body><p>Store generation failed.</p></body></html>',
    css: '',
    js: '',
  };
}

export async function runOrchestrator(input: UserInput): Promise<PipelineResult> {
  const startTime = Date.now();
  const modelsUsed: string[] = [];
  let success = true;
  let errorMsg: string | undefined;

  // Step 1: Run Research agent first (Vision depends on its output)
  console.log('[Orchestrator] Starting Research agent...');
  let research: ResearchOutput;
  let design: DesignOutput;

  try {
    research = await runResearchAgent(input);
    modelsUsed.push('nvidia/llama-3.3-nemotron-super-49b-v1:free');
  } catch (err) {
    console.error('[Orchestrator] ✗ Research agent failed:', err);
    research = getDefaultResearch();
    success = false;
    errorMsg = 'Research agent failed';
  }

  // Step 2: Run Vision agent with research output
  console.log('[Orchestrator] Starting Vision agent...');
  try {
    design = await runVisionAgent(input, research);
    modelsUsed.push('nvidia/llama-3.2-nemotron-nano-vl-8b-v1:free');
  } catch (err) {
    console.error('[Orchestrator] ✗ Vision agent failed:', err);
    design = getDefaultDesign(input.primary_color);
    success = false;
    errorMsg = 'Vision agent failed';
  }

  // Step 3: Run Content agent
  console.log('[Orchestrator] Starting Content agent...');
  let content: ContentOutput;
  try {
    content = await runContentAgent(input, research, design);
    modelsUsed.push('openai/gpt-oss-120b:free');
  } catch (err) {
    console.error('[Orchestrator] ✗ Content agent failed:', err);
    content = getDefaultContent(input.business_name);
    success = false;
    errorMsg = 'Content agent failed';
  }

  // Step 4: Run Builder agent
  console.log('[Orchestrator] Starting Builder agent...');
  let build: BuildOutput;
  try {
    build = await runBuilderAgent(input, design, content, input.products);
    modelsUsed.push('poolside/laguna-xs.2:free');
  } catch (err) {
    console.error('[Orchestrator] ✗ Builder agent failed:', err);
    build = getDefaultBuild();
    success = false;
    errorMsg = 'Builder agent failed';
  }

  // Step 5: Run QA agent
  console.log('[Orchestrator] Starting QA agent...');
  let qa;
  try {
    qa = await runQAAgent(build);
    modelsUsed.push('moonshotai/kimi-k2.6:free');
  } catch (err) {
    console.error('[Orchestrator] ✗ QA agent failed:', err);
    qa = {
      passed: false,
      issues_found: ['QA agent failed'],
      issues_fixed: [],
      html: build.html,
      css: build.css,
      js: build.js,
    };
    success = false;
    errorMsg = 'QA agent failed';
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Orchestrator] Pipeline completed in ${durationMs}ms`);

  return {
    success,
    store_id: '',
    slug: '',
    research,
    design,
    content,
    build: { html: qa.html, css: qa.css, js: qa.js },
    qa,
    duration_ms: durationMs,
    models_used: [...new Set(modelsUsed)],
    error: errorMsg,
  };
}
