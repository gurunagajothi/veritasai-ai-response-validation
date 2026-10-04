import { CompletenessResult, CompletenessAspect, AspectStatus } from './types';
import { tokenize, computeEmbedding, cosineSimilarity } from '../rag/vectorStore';

export function evaluateCompleteness(question: string, aiResponse: string): CompletenessResult {
  const extractedAspects = extractQuestionRequirements(question);
  const responseSentences = aiResponse.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);
  const responseEmb = computeEmbedding(aiResponse);

  const addressedAspects: CompletenessAspect[] = [];
  const missingAspects: CompletenessAspect[] = [];
  const partiallyAddressedAspects: CompletenessAspect[] = [];
  const issues: string[] = [];

  for (const req of extractedAspects) {
    const reqTokens = tokenize(req.aspect);
    const reqEmb = computeEmbedding(req.aspect + ' ' + req.requirement);

    let maxMatch = cosineSimilarity(reqEmb, responseEmb);

    // Also look for specific sentence matches in the response
    for (const sent of responseSentences) {
      const sentEmb = computeEmbedding(sent);
      const match = cosineSimilarity(reqEmb, sentEmb);
      if (match > maxMatch) {
        maxMatch = match;
      }
    }

    // Check token overlap
    const responseTokens = tokenize(aiResponse);
    const rSet = new Set(responseTokens);
    const matchedTokens = reqTokens.filter(t => rSet.has(t));
    const tokenRatio = reqTokens.length > 0 ? matchedTokens.length / reqTokens.length : 0.5;

    let status: AspectStatus = 'Addressed';
    let reasoning = '';

    if (maxMatch >= 0.40 || (tokenRatio >= 0.65 && maxMatch >= 0.28)) {
      status = 'Addressed';
      reasoning = `Requirement "${req.aspect}" is comprehensively covered in the response body.`;
      addressedAspects.push({ ...req, status, reasoning });
    } else if (maxMatch >= 0.20 || tokenRatio >= 0.35) {
      status = 'Partially Addressed';
      reasoning = `Requirement "${req.aspect}" is mentioned cursorily, but lacks detailed explanation or supporting substance.`;
      partiallyAddressedAspects.push({ ...req, status, reasoning });
      issues.push(`Partially addressed aspect: "${req.aspect}"`);
    } else {
      status = 'Missing';
      reasoning = `The response completely omits addressing the requirement "${req.aspect}".`;
      missingAspects.push({ ...req, status, reasoning });
      issues.push(`Missing mandatory requirement: "${req.aspect}"`);
    }
  }

  const total = extractedAspects.length;
  const score = Math.round(
    ((addressedAspects.length * 100) + (partiallyAddressedAspects.length * 50)) / Math.max(1, total)
  );

  let reasoning = '';
  if (missingAspects.length === 0 && partiallyAddressedAspects.length === 0) {
    reasoning = `Full completeness: All ${total} required aspects of the prompt were thoroughly addressed by the AI response.`;
  } else if (missingAspects.length > 0) {
    reasoning = `Incomplete coverage: Omitted ${missingAspects.length} required question aspect(s), including "${missingAspects[0].aspect}".`;
  } else {
    reasoning = `Substantial coverage: Core facets are covered, though ${partiallyAddressedAspects.length} aspect(s) require elaboration.`;
  }

  return {
    score,
    addressedAspects,
    missingAspects,
    partiallyAddressedAspects,
    totalRequirements: total,
    reasoning,
    evidence: addressedAspects.map(a => `${a.aspect}: Addressed`),
    issues,
    confidence: 0.93,
  };
}

function extractQuestionRequirements(question: string): { id: string; aspect: string; requirement: string }[] {
  const aspects: { id: string; aspect: string; requirement: string }[] = [];
  const cleanQ = question.trim();

  // Check for conjunctions and multi-clause questions: "what is X and how does Y work?"
  const clauses = cleanQ
    .split(/\band\b|\balso\b|\bexplain\b|\bdescribe\b|\bcompare\b/i)
    .map(c => c.replace(/[?.,]/g, '').trim())
    .filter(c => c.length > 5);

  if (clauses.length >= 2) {
    clauses.forEach((clause, idx) => {
      aspects.push({
        id: `asp-${idx + 1}`,
        aspect: clause.length > 40 ? clause.substring(0, 40) + '...' : clause,
        requirement: `Address facet: "${clause}"`,
      });
    });
    return aspects;
  }

  // Decompose based on question indicators (What, Why, How, When, Who, Contrast)
  if (/how\s+to|how\s+do|how\s+can/i.test(cleanQ)) {
    aspects.push({ id: 'asp-1', aspect: 'Actionable Mechanism / Process', requirement: 'Provide the practical procedure, steps, or mechanism.' });
  }
  if (/why|causes|reason/i.test(cleanQ)) {
    aspects.push({ id: 'asp-2', aspect: 'Underlying Causality / Rationale', requirement: 'Explain why the phenomenon occurs or justification.' });
  }
  if (/what\s+is|define|meaning/i.test(cleanQ)) {
    aspects.push({ id: 'asp-3', aspect: 'Definitional Core', requirement: 'Give an explicit definition or conceptual foundation.' });
  }
  if (/compare|difference|versus|vs/i.test(cleanQ)) {
    aspects.push({ id: 'asp-4', aspect: 'Comparative Tradeoffs', requirement: 'Highlight key distinctions and tradeoffs between the entities.' });
  }

  // Default fallback if single simple prompt
  if (aspects.length === 0) {
    aspects.push(
      { id: 'asp-1', aspect: 'Primary Objective', requirement: `Direct answer to: "${cleanQ.substring(0, 50)}"` },
      { id: 'asp-2', aspect: 'Explanatory Context', requirement: 'Sufficient context or technical rationale.' }
    );
  }

  return aspects;
}
