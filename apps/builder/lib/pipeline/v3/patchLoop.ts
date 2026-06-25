import { SupabaseClient } from '@supabase/supabase-js';
import { callModel } from '../utils/callModel';
import { scoreOutput } from './scorer';
import { UserInput } from '../types';

const MAX_PATCH_ITERATIONS = 3;
const PATCH_MODEL = 'deepseek/deepseek-chat:free';

function cleanAndParseJSON(response: string): any {
  let cleaned = response;
  // Remove <think> tags if present
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // Extract JSON from markdown code blocks
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    const parts = cleaned.split('```');
    if (parts.length >= 3) {
      cleaned = parts[1].trim();
    }
  }
  return JSON.parse(cleaned);
}

export async function runPatchLoop(
  html: string,
  score: number,
  threshold: number,
  input: UserInput,
  supabase: SupabaseClient
): Promise<{ html: string; score: number; iterations: number }> {
  let current_html = html;
  let current_score = score;
  let iterations = 0;

  while (current_score < threshold && iterations < MAX_PATCH_ITERATIONS) {
    console.log(`[Patch Loop] Iteration ${iterations + 1} - Current score: ${current_score}, Target: ${threshold}`);

    // 1. Query patch history from Supabase
    let patchHistorySummary = 'No history available.';
    try {
      const { data, error } = await supabase
        .from('patch_history')
        .select('patch_type, success, score_delta')
        .eq('business_type', input.business_type)
        .order('score_delta', { ascending: false })
        .limit(5);

      if (error) {
        console.error('[Patch Loop] Failed to query patch history:', error);
      } else if (data && data.length > 0) {
        patchHistorySummary = data
          .map(p => `- Type: ${p.patch_type}, Delta: ${p.score_delta}, Success: ${p.success}`)
          .join('\n');
      }
    } catch (err) {
      console.error('[Patch Loop] Error querying patch history:', err);
    }

    // 2. Build system and user prompt
    const systemPrompt = `You are a surgical HTML patcher for e-commerce storefronts.
You make MINIMAL targeted changes to improve quality score.
You receive an HTML file, its current score, what score is needed, and a history of patches that worked before.

You MUST keep these core CSS & Design fundamentals in mind:
1. Emil Kowalski design: Refined minimalism, micro-interactions, clean hover states, high polish, and sleek animations.
2. Impeccable design: Perfect grid/layout balance, strict padding/margin rhythm, and elegant alignments.
3. Taste skill: Sophisticated visual details, luxury brand typography pairings, elegant near-blacks instead of pure black (#000000) for text, and no clutter.

Return ONLY a valid JSON object matching:
{
  "patch_description": "Short explanation of the fix applied",
  "patch_type": "type_of_fix", // e.g. "accessibility", "seo", "contrast", "layout", "spacing"
  "patched_html": "COMPLETE patched HTML document starting with <!DOCTYPE html>"
}
Do NOT return markdown wrapper around the JSON unless you structure it correctly. The patched_html must be the COMPLETE file — do not truncate or use placeholders.`;

    const userMessage = `Current score: ${current_score}/100. Target: ${threshold}/100.
Business Name: ${input.business_name}
Business Type: ${input.business_type}
Business Description: ${input.description}

Successful past patches:
${patchHistorySummary}

HTML to fix:
${current_html}`;

    let patchResult;
    try {
      // 3. Call model
      const response = await callModel(
        PATCH_MODEL,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        { max_tokens: 8000, temperature: 0.3 }
      );

      // 4. Clean and parse response
      patchResult = cleanAndParseJSON(response);
    } catch (err) {
      console.error(`[Patch Loop] LLM call or parse failed on iteration ${iterations + 1}:`, err);
      iterations++;
      continue;
    }

    const { patch_description, patch_type, patched_html } = patchResult || {};
    if (!patched_html || !patched_html.trim().startsWith('<!DOCTYPE html>')) {
      console.warn('[Patch Loop] Patched HTML is missing or invalid. Rolling back.');
      iterations++;
      continue;
    }

    // 5. Score output
    let newScore = current_score;
    try {
      // Create a mock QA output structure
      const mockQA = {
        passed: false,
        issues_found: [],
        issues_fixed: [],
        html: patched_html,
        css: '',
        js: ''
      };
      newScore = await scoreOutput(patched_html, mockQA, input);
    } catch (err) {
      console.error('[Patch Loop] Scorer failed:', err);
    }

    const oldScore = current_score;

    // 6. Accept or rollback
    if (newScore > oldScore) {
      console.log(`[Patch Loop] Patch accepted! Score improved from ${oldScore} to ${newScore}`);
      current_html = patched_html;
      current_score = newScore;

      // Log success to DB
      try {
        await supabase.from('patch_history').insert({
          business_type: input.business_type,
          patch_type,
          patch_description,
          score_before: oldScore,
          score_after: newScore,
          score_delta: newScore - oldScore,
          success: true
        });
      } catch (err) {
        console.error('[Patch Loop] Failed to log patch success to DB:', err);
      }
    } else {
      console.log(`[Patch Loop] Patch rejected. Score delta: ${newScore - oldScore}. Rolling back.`);
      
      // Log rollback to DB
      try {
        await supabase.from('patch_history').insert({
          business_type: input.business_type,
          patch_type: patch_type || 'unsuccessful_patch',
          patch_description: patch_description || 'Attempted patch did not improve score',
          score_before: oldScore,
          score_after: oldScore,
          score_delta: 0,
          success: false
        });
      } catch (err) {
        console.error('[Patch Loop] Failed to log patch failure to DB:', err);
      }
    }

    iterations++;
  }

  return { html: current_html, score: current_score, iterations };
}
