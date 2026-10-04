import { RelevanceResult, RelevanceCategory } from './types';
import { tokenize, computeEmbedding, cosineSimilarity } from '../rag/vectorStore';

export function evaluateRelevance(question: string, aiResponse: string): RelevanceResult {
  const qTokens = tokenize(question);
  const rTokens = tokenize(aiResponse);

  if (qTokens.length === 0 || rTokens.length === 0) {
    return {
      score: 10,
      category: 'Irrelevant',
      intentAlignment: 0.1,
      topicDriftDetected: true,
      reasoning: 'Input content is insufficient or lacks meaningful semantic tokens.',
      evidence: [],
      issues: ['Empty or unintelligible input.'],
      confidence: 0.99,
    };
  }

  // 1. Semantic vector similarity with QA scaling
  const qEmb = computeEmbedding(question);
  const rEmb = computeEmbedding(aiResponse);
  const rawSim = cosineSimilarity(qEmb, rEmb);
  // Scale semantic similarity: in QA pairs, 0.35+ is strong alignment
  const semanticSim = Math.min(1.0, rawSim * 1.55);

  // 2. Keyword & entity coverage with flexible stem matching
  let overlapCount = 0;
  const rTokenSet = new Set(rTokens);
  for (const token of qTokens) {
    const stem = token.replace(/(?:ing|es|s|ed)$/i, '');
    const matched = rTokenSet.has(token) || Array.from(rTokenSet).some(rt => rt.startsWith(stem) || stem.startsWith(rt));
    if (matched) {
      overlapCount++;
    }
  }
  const tokenCoverage = overlapCount / Math.max(1, qTokens.length);

  // 3. First sentence directness check
  const firstSentence = aiResponse.split(/[.?!]/)[0] || '';
  const firstSentenceEmb = computeEmbedding(firstSentence);
  const firstSentenceRaw = cosineSimilarity(qEmb, firstSentenceEmb);
  const firstSentenceSim = Math.min(1.0, firstSentenceRaw * 1.5);

  // 4. Topic drift detection (comparing early vs later paragraphs)
  let topicDrift = false;
  const paragraphs = aiResponse.split(/\n\s*\n/).filter(p => p.trim().length > 30);
  if (paragraphs.length >= 2) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    const lastParaEmb = computeEmbedding(lastParagraph);
    const lastSim = cosineSimilarity(qEmb, lastParaEmb);
    if (lastSim < 0.12 && semanticSim > 0.4) {
      topicDrift = true;
    }
  }

  // Combined score calculation
  const rawScore = (semanticSim * 0.45 + tokenCoverage * 0.35 + firstSentenceSim * 0.20) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let category: RelevanceCategory = 'Fully Relevant';
  const issues: string[] = [];

  if (score >= 88) {
    category = 'Fully Relevant';
  } else if (score >= 72) {
    category = 'Mostly Relevant';
  } else if (score >= 50) {
    category = 'Partially Relevant';
    issues.push('Response addresses related concepts but strays from the precise question prompt.');
  } else if (score >= 30) {
    category = 'Irrelevant';
    issues.push('Response demonstrates weak topical connection to the user inquiry.');
  } else {
    category = 'Off-topic';
    issues.push('Response is entirely disconnected from the subject matter.');
  }

  if (topicDrift) {
    issues.push('Topic drift detected: The closing sections diverge from the central inquiry.');
  }

  let reasoning = '';
  if (category === 'Fully Relevant') {
    reasoning = `The response directly and thoroughly targets the inquiry "${question.substring(0, 50)}...", demonstrating high semantic fidelity (${Math.round(semanticSim * 100)}%) and tight conceptual alignment.`;
  } else if (category === 'Mostly Relevant') {
    reasoning = `The response addresses the core intent of the question with solid keyword grounding, though minor auxiliary details could be tightened.`;
  } else if (category === 'Partially Relevant') {
    reasoning = `The response touches on aspects of the query domain but fails to prioritize the primary question directly.`;
  } else {
    reasoning = `The response is substantially tangential or fails to answer the question asked.`;
  }

  return {
    score,
    category,
    intentAlignment: Math.round(semanticSim * 100) / 100,
    topicDriftDetected: topicDrift,
    reasoning,
    evidence: [
      `Key query tokens matched: ${overlapCount}/${qTokens.length}`,
      `Semantic alignment index: ${(semanticSim * 100).toFixed(1)}%`,
      `Opening sentence directness: ${(firstSentenceSim * 100).toFixed(1)}%`,
    ],
    issues,
    confidence: 0.94,
  };
}
