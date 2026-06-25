import { createClient } from '@supabase/supabase-js';
import { runResearchAgent } from './agents/research';
import { runVisionAgent } from './agents/vision';
import { runContentAgent } from './agents/content';
import { runLayoutPlanner } from './agents/layout-planner';
import { runStyleGenerator } from './agents/style-generator';
import { renderLayoutToHTML } from './utils/renderer';
import { renderAndAnalyzeHTML } from './utils/metrics';
import { runEvaluatorEnsemble } from './agents/evaluator-ensemble';
import { runPatchAgent, recordPatchOutcome } from './agents/patch-agent';
import { getPositiveMemories, getAntiPatterns, saveGenerationMemory } from './utils/memory';
import type { UserInput, PipelineResult, LayoutPlan, CriticPanelResult, DesignOutput } from './types';

// Create a server-side Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function runOrchestrator(input: UserInput): Promise<PipelineResult> {
  const startTime = Date.now();
  const modelsUsed: string[] = ['openai/text-embedding-3-small'];
  let success = true;
  let errorMsg: string | undefined;

  try {
    // 1. Unified Generation Memory Search
    console.log('[Orchestrator] Searching memory...');
    const positiveMemories = await getPositiveMemories(input.description, supabase, input.business_type);
    const antiPatterns = await getAntiPatterns(input.business_type, supabase);

    // 2. Run Research agent
    console.log('[Orchestrator] Starting Research agent...');
    let research;
    if ((input as any)._pre_scraped_research) {
      console.log('[Orchestrator] Using pre-scraped research data');
      research = (input as any)._pre_scraped_research;
    } else {
      research = await runResearchAgent(input);
      modelsUsed.push('nvidia/llama-3.3-nemotron-super-49b-v1:free');
    }

    // 3. Run Vision agent with research URLs
    console.log('[Orchestrator] Starting Vision agent...');
    const rawDesign = await runVisionAgent(input, research);
    modelsUsed.push('nvidia/llama-3.2-nemotron-nano-vl-8b-v1:free');

    // 4. Run Style Generator
    console.log('[Orchestrator] Starting Style Generator...');
    const design = await runStyleGenerator(input, rawDesign);

    // 5. Run Content agent
    console.log('[Orchestrator] Starting Content agent...');
    const content = await runContentAgent(input, research, design);
    modelsUsed.push('openai/gpt-oss-120b:free');

    // 6. Run Layout Planner
    console.log('[Orchestrator] Starting Layout Planner...');
    const initialComponents = await runLayoutPlanner(input, design, content, positiveMemories, antiPatterns);
    modelsUsed.push('openai/gpt-oss-120b:free');

    let layoutPlan: LayoutPlan = {
      style: design,
      components: initialComponents,
    };

    // 7. Calculate Bounded Adaptive Threshold
    let threshold = 8.0;
    try {
      const { data: scores } = await supabase
        .from('generation_memory')
        .select('score')
        .order('score', { ascending: false })
        .limit(20);

      if (scores && scores.length > 0) {
        const idx = Math.min(Math.floor(scores.length * 0.2), scores.length - 1);
        const percentileScore = Number(scores[idx].score);
        threshold = Math.max(8.0, Math.min(percentileScore, 9.2));
      }
    } catch (err) {
      console.error('Failed to calculate adaptive threshold, using floor 8.0:', err);
    }
    console.log(`[Orchestrator] Adaptive Quality Threshold calculated: ${threshold.toFixed(2)}`);

    // 8. Iterative Self-Improvement Loop
    const iterationBudget = 3;
    let iteration = 0;
    let currentScore = 0.0;
    let finalHtml = '';
    let finalCss = '';
    let currentCritic: CriticPanelResult | null = null;

    while (iteration < iterationBudget) {
      iteration++;
      console.log(`[Orchestrator] --- Start Iteration ${iteration}/${iterationBudget} ---`);

      // A. Compile HTML
      const renderRes = renderLayoutToHTML(layoutPlan);
      finalHtml = renderRes.html;
      finalCss = renderRes.css;

      // B. Rule-based Visual Metrics & Contrast Checks
      console.log('[Orchestrator] Running Puppeteer visual metrics...');
      let visualAnalysis;
      if ((input as any)._skip_puppeteer) {
        console.log('[Orchestrator] Skipping Puppeteer visual metrics check.');
        visualAnalysis = {
          screenshotBase64: '',
          metrics: {
            passed: true,
            issues: [],
            contrastRatioViolations: [],
            headingHierarchyViolations: [],
            touchTargetViolations: [],
            hasViewportMeta: true
          }
        };
      } else {
        visualAnalysis = await renderAndAnalyzeHTML(finalHtml);
      }

      // C. Dual-Mode Evaluation (switch to specialist after iteration 1)
      console.log('[Orchestrator] Running Critic Panel...');
      const isSpecialist = iteration > 1;
      currentCritic = await runEvaluatorEnsemble(
        finalHtml,
        input,
        layoutPlan.style,
        content,
        isSpecialist
      );
      
      if (isSpecialist) {
        modelsUsed.push('nvidia/llama-3.3-nemotron-super-49b-v1:free');
      } else {
        modelsUsed.push('openai/gpt-oss-120b:free');
      }

      // Add visual rules check penalties (deduct 0.5 per visual bug)
      const visualViolations = visualAnalysis.metrics.issues;
      if (visualViolations.length > 0) {
        console.warn(`[Orchestrator] Visual metric issues: ${visualViolations.join(', ')}`);
        currentCritic.overall_score = Math.max(1.0, currentCritic.overall_score - (visualViolations.length * 0.5));
      }

      currentScore = currentCritic.overall_score;
      console.log(`[Orchestrator] Iteration ${iteration} score: ${currentScore}`);

      // D. Check Threshold Gate
      if (currentScore >= threshold) {
        console.log(`[Orchestrator] Quality threshold met at score: ${currentScore}`);
        break;
      }

      if (iteration < iterationBudget) {
        // E. Run Patch Agent to mutate layout
        console.log('[Orchestrator] Threshold not met. Invoking Patch Agent...');
        const patchRes = await runPatchAgent(
          layoutPlan,
          currentCritic,
          supabase,
          input.business_type,
          layoutPlan.style.template_name
        );
        modelsUsed.push('openai/gpt-oss-120b:free');

        // Test the mutated layout in the next loop
        const testRender = renderLayoutToHTML(patchRes.layout);
        let testVisual;
        if ((input as any)._skip_puppeteer) {
          testVisual = {
            metrics: {
              issues: []
            }
          };
        } else {
          testVisual = await renderAndAnalyzeHTML(testRender.html);
        }
        const testCritic = await runEvaluatorEnsemble(
          testRender.html,
          input,
          patchRes.layout.style,
          content,
          false
        );

        // Apply visual penalty
        if (testVisual.metrics.issues.length > 0) {
          testCritic.overall_score = Math.max(1.0, testCritic.overall_score - (testVisual.metrics.issues.length * 0.5));
        }

        const scoreIncreased = testCritic.overall_score > currentScore;
        console.log(`[Orchestrator] Evaluated patch candidate score: ${testCritic.overall_score} vs current: ${currentScore}`);

        // Record reinforcement feedback outcome in DB
        const primaryWeakness = currentCritic?.design?.weaknesses?.[0] || 'design improvement';
        await recordPatchOutcome(supabase, input.business_type, layoutPlan.style.template_name, primaryWeakness, patchRes.patchAction, scoreIncreased);

        if (scoreIncreased) {
          console.log('[Orchestrator] Patch accepted.');
          layoutPlan = patchRes.layout;
          currentScore = testCritic.overall_score;
          currentCritic = testCritic;
        } else {
          console.log('[Orchestrator] Patch rejected. Rolling back to previous layout.');
        }
      }
    }

    // 9. Persist successful generation to Unified Memory & Component archive
    console.log('[Orchestrator] Saving generation memory...');
    await saveGenerationMemory(supabase, {
      prompt: input.description,
      business_description: input.description,
      style_keywords: research.headline_patterns,
      industry: input.business_type,
      style: layoutPlan.style.template_name,
      design_tokens: layoutPlan.style,
      layout: layoutPlan,
      score: currentScore,
    });

    // 10. Record Model Latency and Performance cost trackers
    for (const m of [...new Set(modelsUsed)]) {
      try {
        const { data: existing } = await supabase
          .from('model_performance')
          .select('*')
          .eq('model_name', m)
          .eq('task', 'builder')
          .maybeSingle();

        if (existing) {
          const totalCalls = existing.total_calls + 1;
          const avgScore = (existing.avg_score * existing.total_calls + currentScore) / totalCalls;
          await supabase
            .from('model_performance')
            .update({
              total_calls: totalCalls,
              avg_score: Number(avgScore.toFixed(2)),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('model_performance')
            .insert({
              model_name: m,
              task: 'builder',
              total_calls: 1,
              avg_score: currentScore,
              success_rate: 1.0,
            });
        }
      } catch (err) {
        console.error('Failed to log model performance:', err);
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      success: true,
      store_id: '',
      slug: '',
      research,
      design: layoutPlan.style,
      content,
      build: { html: finalHtml, css: finalCss, js: '' },
      qa: {
        passed: currentScore >= threshold,
        issues_found: currentCritic?.design?.weaknesses || [],
        issues_fixed: [],
        html: finalHtml,
        css: finalCss,
        js: '',
      },
      duration_ms: durationMs,
      models_used: [...new Set(modelsUsed)],
      iterations: iteration,
      final_score: currentScore,
      critic_reports: currentCritic || undefined,
    };

  } catch (err) {
    console.error('[Orchestrator] ✗ Pipeline execution crashed:', err);
    success = false;
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  const durationMs = Date.now() - startTime;
  return {
    success: false,
    store_id: '',
    slug: '',
    research: {
      top_sites: [],
      common_sections: ['hero', 'products', 'about', 'contact'],
      headline_patterns: [],
      cta_patterns: [],
      tone: 'minimal',
      competitor_summary: '',
    },
    design: {
      primary_color: input.primary_color,
      accent_color: '#F59E0B',
      background_color: '#FFFFFF',
      text_color: '#1F2937',
      font_heading: 'Playfair Display',
      font_body: 'Inter',
      border_radius: '12px',
      spacing_unit: '24px',
      hero_style: 'fullbleed',
      card_style: 'shadow',
      template_name: 'warm-minimal',
    },
    content: {
      hero_headline: `Welcome to ${input.business_name}`,
      hero_subheadline: 'Quality products for everyday needs',
      hero_cta: 'Shop Now',
      about_title: 'About Us',
      about_body: `At ${input.business_name}, we are committed to providing the best products and service.`,
      products_section_title: 'Our Products',
      contact_tagline: 'Get in touch with us!',
      footer_tagline: 'Powered by Nudge Commerce AI',
      seo_title: `${input.business_name} — Shop Online`,
      seo_description: `Discover ${input.business_name} - quality products at great prices.`,
      whatsapp_message: `Hi! I saw your store on Nudge and wanted to ask about your products.`,
    },
    build: {
      html: '<!DOCTYPE html><html><body><p>Store generation failed.</p></body></html>',
      css: '',
      js: '',
    },
    qa: {
      passed: false,
      issues_found: [errorMsg || 'Pipeline crashed'],
      issues_fixed: [],
      html: '<!DOCTYPE html><html><body><p>Store generation failed.</p></body></html>',
      css: '',
      js: '',
    },
    duration_ms: durationMs,
    models_used: [...new Set(modelsUsed)],
    error: errorMsg,
  };
}
