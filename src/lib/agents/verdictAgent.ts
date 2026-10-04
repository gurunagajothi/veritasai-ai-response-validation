import {
  VerdictResult,
  VerdictType,
  EvaluationWeights,
  RelevanceResult,
  AccuracyResult,
  HallucinationResult,
  CompletenessResult,
} from './types';
import { generateActionableRecommendations } from '../coach/recommendationEngine';

export interface VerdictConfig {
  weights?: EvaluationWeights;
  passThreshold?: number;
  needsImprovementThreshold?: number;
}

export const DEFAULT_WEIGHTS: EvaluationWeights = {
  relevance: 0.20,
  accuracy: 0.35,
  hallucination: 0.25,
  completeness: 0.20,
};

export function evaluateVerdict(
  relevance: RelevanceResult,
  accuracy: AccuracyResult,
  hallucination: HallucinationResult,
  completeness: CompletenessResult,
  config: VerdictConfig = {}
): VerdictResult {
  const weights = config.weights || DEFAULT_WEIGHTS;
  const passThreshold = config.passThreshold ?? 80;
  const needsImprovementThreshold = config.needsImprovementThreshold ?? 60;

  // 1. Calculate raw weighted composite score
  const weightedScore = (
    relevance.score * weights.relevance +
    accuracy.score * weights.accuracy +
    hallucination.score * weights.hallucination +
    completeness.score * weights.completeness
  );

  let finalScore = Math.max(0, Math.min(100, Math.round(weightedScore)));

  // 2. Identify Critical Issues & Override Conditions
  const criticalIssues: string[] = [];
  let overriddenByCriticalIssue = false;
  let overrideReason = '';

  // Critical Hallucination Override
  if (hallucination.criticalCount > 0) {
    criticalIssues.push(
      `CRITICAL OVERRIDE: Detected ${hallucination.criticalCount} Critical hallucinated claim(s) directly contradicting ground truth.`
    );
    overriddenByCriticalIssue = true;
    overrideReason = 'Severe factual contradiction detected against ground-truth benchmark.';
  }

  // Severe Accuracy Contradiction Override
  const directContradictions = accuracy.verifiedClaims.filter(c => c.status === 'Contradiction').length;
  if (directContradictions >= 2) {
    criticalIssues.push(
      `CRITICAL OVERRIDE: Multiple direct factual contradictions (${directContradictions}) observed in claims.`
    );
    overriddenByCriticalIssue = true;
    overrideReason = overrideReason || 'Multiple direct factual contradictions detected.';
  }

  // 3. Determine Final Verdict
  let verdict: VerdictType = 'PASS';

  if (overriddenByCriticalIssue) {
    // If critical hallucinations exist, cap score and downgrade verdict
    if (finalScore >= passThreshold) {
      finalScore = Math.min(finalScore, 58); // Cap below pass threshold
    }
    verdict = hallucination.criticalCount >= 2 ? 'FAIL' : 'NEEDS IMPROVEMENT';
  } else {
    if (finalScore >= passThreshold) {
      verdict = 'PASS';
    } else if (finalScore >= needsImprovementThreshold) {
      verdict = 'NEEDS IMPROVEMENT';
    } else {
      verdict = 'FAIL';
    }
  }

  // 4. Synthesize Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (relevance.score >= 85) strengths.push('Direct, prompt-focused topical relevance without digression.');
  else weaknesses.push('Topical relevance is diluted with tangential or indirect statements.');

  if (accuracy.score >= 85) strengths.push('High factual precision verified against reference evidence.');
  else weaknesses.push(`Sub-optimal accuracy (${accuracy.score}/100) with unverified or inaccurate assertions.`);

  if (hallucination.criticalCount === 0 && hallucination.hallucinationCount === 0) {
    strengths.push('Zero hallucinations detected; propositions are strictly grounded.');
  } else {
    weaknesses.push(`${hallucination.hallucinationCount} speculative or unsupported claim(s) identified.`);
  }

  if (completeness.score >= 85) strengths.push('All question components and constraints were satisfied.');
  else weaknesses.push(`Omitted ${completeness.missingAspects.length} required facet(s) of the user prompt.`);

  // 5. Generate Actionable Coach Recommendations
  const recommendations = generateActionableRecommendations(
    relevance,
    accuracy,
    hallucination,
    completeness
  );

  const confidence = Math.min(
    1.0,
    (relevance.confidence + accuracy.confidence + hallucination.confidence + completeness.confidence) / 4
  );

  return {
    overallScore: finalScore,
    verdict,
    weights,
    strengths,
    weaknesses,
    criticalIssues,
    recommendations,
    overriddenByCriticalIssue,
    overrideReason: overriddenByCriticalIssue ? overrideReason : undefined,
    confidence: Math.round(confidence * 100) / 100,
  };
}
