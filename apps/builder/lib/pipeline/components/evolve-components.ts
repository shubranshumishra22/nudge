import { runEvaluatorEnsemble } from '../agents/evaluator-ensemble';
import { renderLayoutToHTML } from '../utils/renderer';
import { renderAndAnalyzeHTML } from '../utils/metrics';
import type { UserInput, LayoutPlan, ContentOutput } from '../types';

/**
 * Evolves component layouts by combining characteristics of two successful parent components.
 * Mutated layouts are accepted only if their quality score beats the average of both parents.
 */
export async function evolveComponentCharacteristics(
  parentA: { name: string; score: number },
  parentB: { name: string; score: number },
  candidateLayout: LayoutPlan,
  input: UserInput,
  content: ContentOutput
): Promise<{ success: boolean; score: number }> {
  console.log(`[Evolution Gate] Breeding parents ${parentA.name} (${parentA.score}) and ${parentB.name} (${parentB.score})...`);

  const parentAvg = (parentA.score + parentB.score) / 2;

  try {
    // 1. Compile CSS/HTML for the evolved candidate
    const renderRes = renderLayoutToHTML(candidateLayout);
    const html = renderRes.html;

    // 2. Perform visual analysis
    const visual = await renderAndAnalyzeHTML(html);

    // 3. Evaluate visual appeal using Critic Ensemble
    const critic = await runEvaluatorEnsemble(
      html,
      input,
      candidateLayout.style,
      content,
      false
    );

    // Apply rule-based visual score penalties
    let evolvedScore = critic.overall_score;
    if (visual.metrics.issues.length > 0) {
      evolvedScore = Math.max(1.0, evolvedScore - (visual.metrics.issues.length * 0.5));
    }

    console.log(`[Evolution Gate] Candidate evolved score: ${evolvedScore.toFixed(2)} vs Parents avg: ${parentAvg.toFixed(2)}`);

    const success = evolvedScore > parentAvg;
    return {
      success,
      score: evolvedScore,
    };
  } catch (err) {
    console.error('[Evolution Gate] Evolve pipeline failed:', err);
    return { success: false, score: 0 };
  }
}
