import { callModel } from '../utils/callModel';
import type { UserInput, DesignOutput, ContentOutput, LayoutPlan, CriticPanelResult, PatchAction } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Analyzes visual/critic weaknesses, queries history, and decides a corrective patch action to apply.
 */
export async function runPatchAgent(
  layout: LayoutPlan,
  criticResults: CriticPanelResult,
  supabase: SupabaseClient,
  industry: string,
  style: string
): Promise<{ layout: LayoutPlan; patchAction: PatchAction }> {
  // Query successful historical patches
  let historicalPatches: any[] = [];
  try {
    const { data } = await supabase
      .from('patch_learning')
      .select('*')
      .eq('industry', industry)
      .eq('style', style)
      .gt('confidence_score', 0.4)
      .order('confidence_score', { ascending: false })
      .limit(5);
    
    if (data) {
      historicalPatches = data;
    }
  } catch (err) {
    console.error('Failed to query patch history:', err);
  }

  const systemPrompt = `You are a Website Layout Patch Agent.
Your job is to read a layout plan, review the critic panel's weaknesses, and select a single corrective action to improve the quality.

Available components:
- "HeroV1" (Full-bleed background hero)
- "HeroV2" (Split-column hero text + image)
- "ProductsV1" (Product grid layout)
- "AboutV1" (About text section)
- "ContactV1" (Contact WhatsApp layout)
- "FooterV1" (Standard footer)

You can perform one of these actions:
1. Replace: swap one component for another version (e.g. replace HeroV1 with HeroV2).
2. Style Tweak: adjust style tokens (e.g., change accent_color, primary_color, border_radius, spacing_unit).
3. Content Tweak: modify content props of a component to fix copy, conversion or accessibility warnings.

Success history for similar style/industry:
${JSON.stringify(historicalPatches)}

You must return a JSON object containing the patch action and the full mutated layout plan matching:
{
  "action": {
    "component": string, // "hero", "products", "about", "contact", "footer", "style"
    "action": "replace" | "style_tweak" | "content_tweak",
    "target": string, // e.g. "HeroV1"
    "value": any, // new component name (string) OR object containing style/content edits
    "reasoning": string
  },
  "mutated_layout": {
    "style": {
      "primary_color": string,
      "accent_color": string,
      "background_color": string,
      "text_color": string,
      "font_heading": string,
      "font_body": string,
      "border_radius": string,
      "spacing_unit": string,
      "hero_style": string,
      "card_style": string,
      "template_name": string
    },
    "components": [
      { "name": string, "props": {} }
    ]
  }
}

Return ONLY valid JSON. No markdown backticks.`;

  const userMessage = `Current Layout Plan:
${JSON.stringify(layout)}

Critic Weaknesses:
Design: ${JSON.stringify(criticResults?.design?.weaknesses || [])}
UX: ${JSON.stringify(criticResults?.ux?.weaknesses || [])}
Accessibility: ${JSON.stringify(criticResults?.accessibility?.weaknesses || [])}
SEO: ${JSON.stringify(criticResults?.seo?.weaknesses || [])}
Conversion: ${JSON.stringify(criticResults?.conversion?.weaknesses || [])}

Select a corrective patch and output the modified JSON package.`;

  const modelOverride = (layout.style as any)._model_overrides?.builder;

  try {
    const response = await callModel(
      'openai/gpt-oss-120b:free',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      { max_tokens: 3000, json_mode: true, _model_override: modelOverride }
    );

    const parsed = JSON.parse(response);
    if (parsed.action && parsed.mutated_layout) {
      return {
        layout: parsed.mutated_layout as LayoutPlan,
        patchAction: parsed.action as PatchAction,
      };
    }
  } catch (err) {
    console.error('Failed to execute patch agent, returning original layout:', err);
  }

  // Fallback unchanged
  return {
    layout,
    patchAction: {
      component: 'none',
      action: 'style_tweak',
      target: 'none',
      value: {},
      reasoning: 'Fallback due to patch execution failure.',
    },
  };
}

/**
 * Logs success or failure of applied patch actions to db for reinforcement.
 */
export async function recordPatchOutcome(
  supabase: SupabaseClient,
  industry: string,
  style: string,
  weakness: string,
  patch: PatchAction,
  success: boolean
) {
  try {
    // Check if patch pattern exists
    const { data: existing } = await supabase
      .from('patch_learning')
      .select('*')
      .eq('industry', industry)
      .eq('style', style)
      .eq('weakness', weakness)
      .eq('patch_action->target', patch.target)
      .eq('patch_action->action', patch.action)
      .maybeSingle();

    if (existing) {
      const successes = existing.success_count + (success ? 1 : 0);
      const failures = existing.failure_count + (success ? 0 : 1);
      const confidence = successes / (successes + failures);

      await supabase
        .from('patch_learning')
        .update({
          success_count: successes,
          failure_count: failures,
          confidence_score: Number(confidence.toFixed(2)),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('patch_learning')
        .insert({
          industry,
          style,
          weakness,
          patch_action: patch as any,
          reasoning: patch.reasoning,
          success_count: success ? 1 : 0,
          failure_count: success ? 0 : 1,
          confidence_score: success ? 1.0 : 0.0,
        });
    }
  } catch (err) {
    console.error('recordPatchOutcome failed:', err);
  }
}
