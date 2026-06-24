import { callModel } from '../utils/callModel';
import type { UserInput, DesignOutput, ContentOutput, CriticPanelResult, CriticReport } from '../types';

const BATCHED_SYSTEM_PROMPT = `You are a Website Quality Critic Panel.
Your job is to evaluate generated e-commerce storefronts across 5 dimensions:
1. Design (Emil Kowalski Design: refined minimalism, micro-interactions, clean hover states; Impeccable Design: perfect grid/layout balance, strict padding/margin rhythm; Taste Skill: sophisticated visual details, luxury brand aesthetics, typography pairings, color harmonies)
2. UX (flow, formatting, page rhythm)
3. Accessibility (cues, tag targets, structure)
4. SEO (meta tags, indexable text, heading order)
5. Conversion (CTAs, trust, value presentation)

For each dimension, output:
- A score from 1.0 to 10.0
- A short critique string
- A list of weaknesses (string array)

You must return a single JSON object matching:
{
  "design": { "score": number, "critique": string, "weaknesses": string[] },
  "ux": { "score": number, "critique": string, "weaknesses": string[] },
  "accessibility": { "score": number, "critique": string, "weaknesses": string[] },
  "seo": { "score": number, "critique": string, "weaknesses": string[] },
  "conversion": { "score": number, "critique": string, "weaknesses": string[] },
  "overall_score": number
}
Ensure overall_score is the average of the five individual scores.`;

const SPECIALIST_PROMPTS: Record<string, string> = {
  design: `You are a Design Critic. Evaluate strictly based on: (1) Emil Kowalski Design (refined minimalism, micro-interactions, clean hover states, high polish); (2) Impeccable Design (perfect grid/layout balance, proper padding/margin rhythm, clean alignment); (3) Taste Skill (sophisticated visual details, luxury brand aesthetics, elegant font and color pairings, no clutter). Be extremely critical; do not award high scores (>= 8.0) unless the layout looks truly premium. Return JSON matching: { "score": number, "critique": string, "weaknesses": string[] }`,
  ux: `You are a UX Critic. Focus exclusively on navigation, text reading flow, information hierarchy, layout rhythm, and ease of shop operations. Return JSON matching: { "score": number, "critique": string, "weaknesses": string[] }`,
  accessibility: `You are a Web Accessibility Critic. Focus on screen readers, semantic tags, heading hierarchies, keyboard focus, and size of interactive click regions. Return JSON matching: { "score": number, "critique": string, "weaknesses": string[] }`,
  seo: `You are an SEO Critic. Focus on document structure, page title and meta description character length, indexable keywords, and search friendliness. Return JSON matching: { "score": number, "critique": string, "weaknesses": string[] }`,
  conversion: `You are a Conversion Rate Optimization Critic. Focus on call-to-action prominence, WhatsApp details, Razorpay trust triggers, product showcases, and value messaging. Return JSON matching: { "score": number, "critique": string, "weaknesses": string[] }`,
};

/**
 * Runs the Dual-Mode Critic Panel on the compiled HTML storefront.
 */
export async function runEvaluatorEnsemble(
  html: string,
  input: UserInput,
  design: DesignOutput,
  content: ContentOutput,
  isSpecialistMode: boolean = false
): Promise<CriticPanelResult> {
  const userMessage = `Business details:
Name: ${input.business_name}
Type: ${input.business_type}
Description: ${input.description}

Design settings:
${JSON.stringify(design)}

Page content copy:
${JSON.stringify(content)}

Generated Storefront HTML:
${html}`;

  const modelOverride = (input as any)._model_overrides?.critic;

  if (!isSpecialistMode) {
    // BATCHED MODE: Single prompt
    try {
      const response = await callModel(
        'openai/gpt-oss-120b:free',
        [
          { role: 'system', content: BATCHED_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        { max_tokens: 3000, json_mode: true, _model_override: modelOverride }
      );

      const parsed = JSON.parse(response) as CriticPanelResult;
      // Recalculate overall score for validation
      const scores = [
        parsed.design?.score || 5,
        parsed.ux?.score || 5,
        parsed.accessibility?.score || 5,
        parsed.seo?.score || 5,
        parsed.conversion?.score || 5,
      ];
      parsed.overall_score = Number((scores.reduce((a, b) => a + b, 0) / 5).toFixed(2));
      return parsed;
    } catch (err) {
      console.error('Batched Critic Panel failed, falling back to specialist mode:', err);
    }
  }

  // SPECIALIST MODE: Parallel requests
  try {
    const tasks = Object.entries(SPECIALIST_PROMPTS).map(async ([key, sysPrompt]) => {
      try {
        const response = await callModel(
          'nvidia/llama-3.3-nemotron-super-49b-v1:free',
          [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: userMessage }
          ],
          { max_tokens: 1500, json_mode: true, _model_override: modelOverride }
        );
        return { key, report: JSON.parse(response) as CriticReport };
      } catch (err) {
        console.error(`Specialist Critic "${key}" failed:`, err);
        return {
          key,
          report: {
            score: 7.0,
            critique: 'Critical execution failed, using fallback score.',
            weaknesses: ['Critic panel failed to run completely.'],
          },
        };
      }
    });

    const results = await Promise.all(tasks);
    const reports: Record<string, CriticReport> = {};
    for (const r of results) {
      reports[r.key] = r.report;
    }

    const overallScore = Number(
      (
        (reports.design.score +
          reports.ux.score +
          reports.accessibility.score +
          reports.seo.score +
          reports.conversion.score) /
        5
      ).toFixed(2)
    );

    return {
      design: reports.design,
      ux: reports.ux,
      accessibility: reports.accessibility,
      seo: reports.seo,
      conversion: reports.conversion,
      overall_score: overallScore,
    };
  } catch (err) {
    console.error('Specialist Critic Ensemble failed completely:', err);
    // Fallback failure response
    return {
      design: { score: 6.0, critique: 'Fallback', weaknesses: [] },
      ux: { score: 6.0, critique: 'Fallback', weaknesses: [] },
      accessibility: { score: 6.0, critique: 'Fallback', weaknesses: [] },
      seo: { score: 6.0, critique: 'Fallback', weaknesses: [] },
      conversion: { score: 6.0, critique: 'Fallback', weaknesses: [] },
      overall_score: 6.0,
    };
  }
}
