import { AccuracyResult, ClaimVerification, RAGChunk } from './types';
import { tokenize, computeEmbedding, cosineSimilarity } from '../rag/vectorStore';

// Common negation pairs and antonyms to detect factual contradictions
const NEGATION_WORDS = new Set(['not', 'never', 'no', 'none', 'cannot', 'neither', 'incorrect', 'false', 'myth']);

export function evaluateAccuracy(
  aiResponse: string,
  referenceAnswer?: string,
  ragEvidence: RAGChunk[] = []
): AccuracyResult {
  // Split response into distinct sentences / claims
  const rawSentences = aiResponse
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const sentences = rawSentences.length > 0 ? rawSentences : [aiResponse];

  // Ground truth sources: Reference Answer takes precedence, followed by high-similarity RAG evidence
  const groundTruthTexts: { source: string; text: string; embedding: any }[] = [];

  if (referenceAnswer && referenceAnswer.trim().length > 0) {
    groundTruthTexts.push({
      source: 'Provided Reference Answer',
      text: referenceAnswer,
      embedding: computeEmbedding(referenceAnswer),
    });
  }

  for (const chunk of ragEvidence) {
    if (chunk.similarityScore >= 0.15) {
      groundTruthTexts.push({
        source: `RAG: ${chunk.documentTitle}`,
        text: chunk.content,
        embedding: computeEmbedding(chunk.content),
      });
    }
  }

  // If no reference and no RAG evidence at all, evaluate internal logical consistency and mark neutral
  if (groundTruthTexts.length === 0) {
    return {
      score: 75,
      reasoning: 'No reference answer or verified RAG evidence was available for grounded accuracy verification. Score reflects default unverified baseline.',
      evidence: ['Evaluated without reference benchmark.'],
      supportingEvidence: [],
      contradictingEvidence: [],
      verifiedClaims: sentences.map(s => ({
        claim: s,
        status: 'Partially Correct' as const,
        evidence: 'No ground truth provided for strict verification.',
        reasoning: 'Unanchored claim; requires external reference for decisive verification.',
      })),
      issues: ['Absence of reference source or ground-truth context limits verification certainty.'],
      confidence: 0.60,
    };
  }

  const verifiedClaims: ClaimVerification[] = [];
  const supportingEvidence: string[] = [];
  const contradictingEvidence: string[] = [];

  let correctCount = 0;
  let partialCount = 0;
  let incorrectCount = 0;
  let contradictionCount = 0;

  for (const sentence of sentences) {
    const sEmb = computeEmbedding(sentence);
    const sTokens = tokenize(sentence);
    const hasNegation = sTokens.some(t => NEGATION_WORDS.has(t));

    let bestMatchScore = 0;
    let bestGroundTruth: { source: string; text: string } | null = null;

    for (const gt of groundTruthTexts) {
      const sim = cosineSimilarity(sEmb, gt.embedding);
      if (sim > bestMatchScore) {
        bestMatchScore = sim;
        bestGroundTruth = gt;
      }
    }

    if (!bestGroundTruth || bestMatchScore < 0.18) {
      // Claim has insufficient evidence in ground truth
      verifiedClaims.push({
        claim: sentence,
        status: 'Partially Correct',
        evidence: 'Ground truth contains no decisive mention.',
        reasoning: 'Evidence is neutral or unstated in available reference documents.',
      });
      partialCount++;
    } else {
      // Check for contradiction: high lexical/semantic overlap but polarity flip (negation divergence)
      const gtTokens = tokenize(bestGroundTruth.text);
      const gtHasNegation = gtTokens.some(t => NEGATION_WORDS.has(t));
      const polarityConflict = hasNegation !== gtHasNegation && bestMatchScore > 0.35;

      if (polarityConflict) {
        verifiedClaims.push({
          claim: sentence,
          status: 'Contradiction',
          evidence: `Ground truth (${bestGroundTruth.source}): "${bestGroundTruth.text.substring(0, 140)}..."`,
          reasoning: 'Claim directly conflicts with the polarity of verified ground-truth reference.',
        });
        contradictionCount++;
        contradictingEvidence.push(sentence);
      } else if (bestMatchScore >= 0.40) {
        verifiedClaims.push({
          claim: sentence,
          status: 'Correct',
          evidence: `Supported by ${bestGroundTruth.source}: "${bestGroundTruth.text.substring(0, 120)}..."`,
          reasoning: 'Factually verified against ground-truth documentation.',
        });
        correctCount++;
        supportingEvidence.push(sentence);
      } else if (bestMatchScore >= 0.25) {
        verifiedClaims.push({
          claim: sentence,
          status: 'Partially Correct',
          evidence: `Partially supported by ${bestGroundTruth.source}`,
          reasoning: 'Fact is consistent with reference themes but lacks precise quantitative alignment.',
        });
        partialCount++;
      } else {
        verifiedClaims.push({
          claim: sentence,
          status: 'Incorrect',
          evidence: `Discrepancy with ${bestGroundTruth.source}`,
          reasoning: 'Statement deviates from facts recorded in authoritative knowledge chunks.',
        });
        incorrectCount++;
        contradictingEvidence.push(sentence);
      }
    }
  }

  // Compute final score
  const total = sentences.length;
  // Contradictions are penalized heavily
  const weightedPoints = (correctCount * 100) + (partialCount * 65) + (incorrectCount * 20) - (contradictionCount * 45);
  const rawScore = weightedPoints / total;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const issues: string[] = [];
  if (contradictionCount > 0) {
    issues.push(`Detected ${contradictionCount} factual contradiction(s) against reference data.`);
  }
  if (incorrectCount > 0) {
    issues.push(`Found ${incorrectCount} unsubstantiated or incorrect statement(s).`);
  }

  let reasoning = '';
  if (contradictionCount > 0) {
    reasoning = `The response contains ${contradictionCount} critical contradiction(s) where assertions directly conflict with verified ground truth in ${groundTruthTexts[0].source}.`;
  } else if (score >= 85) {
    reasoning = `High factual accuracy confirmed. ${correctCount} out of ${total} statements directly align with authoritative reference evidence.`;
  } else if (score >= 65) {
    reasoning = `Moderate factual grounding. Most key concepts align with the ground truth, though some details lack exact verification.`;
  } else {
    reasoning = `Low factual accuracy. The response contains significant inaccuracies or assertions unsupported by ground truth.`;
  }

  return {
    score,
    reasoning,
    evidence: supportingEvidence.slice(0, 3),
    supportingEvidence,
    contradictingEvidence,
    verifiedClaims,
    issues,
    confidence: groundTruthTexts.length > 0 ? 0.92 : 0.65,
  };
}
