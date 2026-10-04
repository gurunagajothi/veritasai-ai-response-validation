import {
  RelevanceResult,
  AccuracyResult,
  HallucinationResult,
  CompletenessResult,
} from '../agents/types';

export function generateActionableRecommendations(
  relevance: RelevanceResult,
  accuracy: AccuracyResult,
  hallucination: HallucinationResult,
  completeness: CompletenessResult
): string[] {
  const recommendations: string[] = [];

  // Relevance-driven coaching
  if (relevance.score < 70) {
    recommendations.push(
      'Direct Question Alignment: Restructure the opening sentence to address the core question immediately without introductory fluff or topical drift.'
    );
  }
  if (relevance.topicDriftDetected) {
    recommendations.push(
      'Eliminate Tangential Discourse: Prune off-topic side explanations that divert attention from the specific subject requested by the user.'
    );
  }

  // Accuracy-driven coaching
  if (accuracy.score < 80) {
    if (accuracy.contradictingEvidence.length > 0) {
      recommendations.push(
        `Resolve Factual Inconsistencies: Rectify contradictory assertions against established source facts (specifically regarding: "${accuracy.contradictingEvidence[0].substring(0, 80)}...").`
      );
    } else {
      recommendations.push(
        'Cross-Verification: Validate numeric figures, dates, and quantitative claims against verified benchmark ground truth before asserting them.'
      );
    }
  }

  // Hallucination-driven coaching
  if (hallucination.criticalCount > 0) {
    recommendations.push(
      'CRITICAL Hallucination Removal: Immediately excise claims identified with Critical severity that directly conflict with verified ground-truth reference material.'
    );
  } else if (hallucination.hallucinationCount > 0) {
    recommendations.push(
      `Factual Grounding: Eliminate ${hallucination.hallucinationCount} unsupported speculative claim(s) or provide explicit citation anchors to authoritative reference documentation.`
    );
  }

  // Completeness-driven coaching
  if (completeness.missingAspects.length > 0) {
    const missingNames = completeness.missingAspects.map(a => a.aspect).slice(0, 2).join(' and ');
    recommendations.push(
      `Address Omitted Dimensions: Explicitly cover the missing requirement(s): ${missingNames}.`
    );
  }
  if (completeness.partiallyAddressedAspects.length > 0) {
    recommendations.push(
      'Deepen Incomplete Sections: Expand on partially treated aspects with concrete explanations, mechanisms, or contextual examples.'
    );
  }

  // Default positive reinforcement if quality is exceptional
  if (recommendations.length === 0) {
    recommendations.push(
      'Maintain High Rigor: The response exhibits strong grounding, high factual fidelity, direct relevance, and comprehensive topic coverage.'
    );
  }

  return recommendations;
}
