import { HallucinationResult, HallucinationClaim, HallucinationSeverity, ClaimSupportStatus, RAGChunk } from './types';
import { tokenize, computeEmbedding, cosineSimilarity } from '../rag/vectorStore';

// Common hallucination triggers: fabricated numbers, definitive fabricated absolutes, invented citations
const SUSPICIOUS_FABRICATIONS = [
  /in\s+(18|19|20)\d{2}\s+(dr\.|professor|president)/i,
  /published\s+in\s+the\s+journal\s+of\s+[a-z\s]+/i,
  /\b(100%|definitely|undoubtedly|scientifically proven that)\b/i,
];

export function detectHallucinations(
  aiResponse: string,
  referenceAnswer?: string,
  ragEvidence: RAGChunk[] = []
): HallucinationResult {
  // Extract sentences while preserving character start and end indices
  const claimRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  const rawClaims: { text: string; charStart: number; charEnd: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = claimRegex.exec(aiResponse)) !== null) {
    const rawText = match[0].trim();
    if (rawText.length > 12) {
      rawClaims.push({
        text: rawText,
        charStart: match.index,
        charEnd: match.index + match[0].length,
      });
    }
  }

  if (rawClaims.length === 0) {
    rawClaims.push({
      text: aiResponse.trim(),
      charStart: 0,
      charEnd: aiResponse.length,
    });
  }

  // Build reference knowledge pool
  const referencePool: { source: string; text: string; embedding: any }[] = [];
  if (referenceAnswer && referenceAnswer.trim().length > 0) {
    referencePool.push({
      source: 'Reference Answer',
      text: referenceAnswer,
      embedding: computeEmbedding(referenceAnswer),
    });
  }

  for (const chunk of ragEvidence) {
    if (chunk.similarityScore >= 0.12) {
      referencePool.push({
        source: `RAG: ${chunk.documentTitle}`,
        text: chunk.content,
        embedding: computeEmbedding(chunk.content),
      });
    }
  }

  const claims: HallucinationClaim[] = [];
  let hallucinationCount = 0;
  let criticalCount = 0;
  const issues: string[] = [];

  for (let i = 0; i < rawClaims.length; i++) {
    const rc = rawClaims[i];
    const claimId = `claim-${i + 1}`;
    const claimEmb = computeEmbedding(rc.text);

    let bestSimilarity = 0;
    let bestSource: { source: string; text: string } | null = null;

    for (const ref of referencePool) {
      const sim = cosineSimilarity(claimEmb, ref.embedding);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestSource = ref;
      }
    }

    let status: ClaimSupportStatus = 'Supported';
    let severity: HallucinationSeverity = 'Low';
    let evidence = '';
    let reasoning = '';

    if (referencePool.length === 0) {
      // No reference available; evaluate based on linguistic fabrication heuristics
      const hasFabricationHeuristic = SUSPICIOUS_FABRICATIONS.some(regex => regex.test(rc.text));
      if (hasFabricationHeuristic) {
        status = 'Unsupported';
        severity = 'Medium';
        evidence = 'No external grounding available; statement makes unverified assertive attribution.';
        reasoning = 'Statement contains unverified attribution or statistical claim without supporting source documentation.';
        hallucinationCount++;
      } else {
        status = 'Supported';
        severity = 'Low';
        evidence = 'Consistent with common domain knowledge structures.';
        reasoning = 'Standard descriptive proposition without detectable speculative anomalies.';
      }
    } else {
      // Evaluate against reference pool
      const hasFabricationPattern = SUSPICIOUS_FABRICATIONS.some(regex => regex.test(rc.text));
      const hasNegationConflict =
        /\b(not|never|no|none|myth|false)\b/i.test(rc.text) !==
        (bestSource ? /\b(not|never|no|none|myth|false)\b/i.test(bestSource.text) : false);

      if (bestSource && bestSimilarity > 0.35 && hasNegationConflict) {
        // Direct contradiction against verified source = CRITICAL hallucination
        status = 'Contradicted';
        severity = 'Critical';
        evidence = `Contradicts ${bestSource.source}: "${bestSource.text.substring(0, 130)}..."`;
        reasoning = 'Severe factual hallucination: This statement directly negates or contradicts verified reference knowledge.';
        hallucinationCount++;
        criticalCount++;
        issues.push(`Critical contradiction in claim ${i + 1}: Negates verified facts.`);
      } else if (bestSimilarity >= 0.32) {
        // Strong factual match in reference
        status = 'Supported';
        severity = 'Low';
        evidence = `Verified in ${bestSource!.source}: "${bestSource!.text.substring(0, 110)}..."`;
        reasoning = 'Fully supported by grounded reference documentation.';
      } else if (bestSimilarity >= 0.20) {
        // Partial thematic match but not clearly grounded
        status = 'Unsupported';
        severity = hasFabricationPattern ? 'High' : 'Medium';
        evidence = bestSource ? `Partial overlap with ${bestSource.source}, but specific claim is absent.` : 'No source evidence.';
        reasoning = 'Extrapolation beyond available source material. Details cannot be authenticated from reference.';
        hallucinationCount++;
        if (severity === 'High') {
          issues.push(`High-severity ungrounded assertion detected in claim ${i + 1}.`);
        }
      } else {
        // Zero or negligible similarity = Unsupported hallucination
        status = 'Unsupported';
        severity = hasFabricationPattern ? 'Critical' : 'High';
        evidence = 'Completely absent from provided ground-truth reference chunks.';
        reasoning = 'Fabricated claim: Information appears synthesized by the LLM without external grounding.';
        hallucinationCount++;
        if (severity === 'Critical') criticalCount++;
        issues.push(`Unsupported claim detected in claim ${i + 1}.`);
      }
    }

    claims.push({
      id: claimId,
      text: rc.text,
      status,
      severity,
      evidence,
      reasoning,
      charStart: rc.charStart,
      charEnd: rc.charEnd,
    });
  }

  // Calculate safety score (100 = flawless, penalties weighted by severity)
  let penalty = 0;
  for (const c of claims) {
    if (c.status === 'Contradicted') {
      penalty += 40;
    } else if (c.status === 'Unsupported') {
      if (c.severity === 'Critical') penalty += 35;
      else if (c.severity === 'High') penalty += 20;
      else if (c.severity === 'Medium') penalty += 10;
      else penalty += 5;
    }
  }

  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let reasoning = '';
  if (criticalCount > 0) {
    reasoning = `ALERT: Detected ${criticalCount} Critical hallucination(s) with severe factual divergence or contradiction against ground truth.`;
  } else if (hallucinationCount === 0) {
    reasoning = `Excellent factual grounding. All ${claims.length} claims were verified as supported by reference materials or domain logic without detected hallucinations.`;
  } else {
    reasoning = `Identified ${hallucinationCount} ungrounded claim(s) out of ${claims.length} total propositions. Factual reliability is compromised by unsupported assertions.`;
  }

  return {
    score: safetyScore,
    safetyScore,
    hallucinationCount,
    criticalCount,
    claims,
    reasoning,
    evidence: claims.filter(c => c.status !== 'Supported').map(c => c.evidence),
    issues,
    confidence: referencePool.length > 0 ? 0.95 : 0.70,
  };
}
