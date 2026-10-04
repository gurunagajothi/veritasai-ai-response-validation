import { getDb } from '../db';
import {
  EvaluationPipelineInput,
  EvaluationPipelineStageUpdate,
  FullEvaluationRecord,
  RAGChunk,
} from './types';
import { retrieveRelevantChunks } from '../rag/retriever';
import { evaluateRelevance } from './relevanceJudge';
import { evaluateAccuracy } from './accuracyJudge';
import { detectHallucinations } from './hallucinationAgent';
import { evaluateCompleteness } from './completenessJudge';
import { evaluateVerdict, DEFAULT_WEIGHTS } from './verdictAgent';

export async function runEvaluationPipeline(
  input: EvaluationPipelineInput,
  onStageUpdate?: (update: EvaluationPipelineStageUpdate) => void
): Promise<FullEvaluationRecord> {
  const emit = (update: EvaluationPipelineStageUpdate) => {
    if (onStageUpdate) onStageUpdate(update);
  };

  // Stage 1: Input Validation
  emit({
    stage: 'input_validation',
    status: 'in_progress',
    message: 'Validating prompt and AI response payload...',
    progressPercent: 10,
  });

  const question = input.question?.trim();
  const aiResponse = input.aiResponse?.trim();

  if (!question || question.length < 3) {
    throw new Error('Question is required and must contain at least 3 characters.');
  }
  if (!aiResponse || aiResponse.length < 5) {
    throw new Error('AI response is required and must contain at least 5 characters.');
  }

  emit({
    stage: 'input_validation',
    status: 'completed',
    message: 'Input validated successfully.',
    progressPercent: 20,
  });

  // Stage 2: Reference & Knowledge Retrieval (RAG)
  emit({
    stage: 'knowledge_retrieval',
    status: 'in_progress',
    message: 'Querying vector index and retrieving grounded evidence...',
    progressPercent: 30,
  });

  const retrievedChunks: RAGChunk[] = retrieveRelevantChunks(
    question + ' ' + aiResponse.substring(0, 150),
    4,
    input.sourceContext
  );

  emit({
    stage: 'knowledge_retrieval',
    status: 'completed',
    message: `Retrieved ${retrievedChunks.length} reference chunks from knowledge base.`,
    progressPercent: 40,
  });

  // Stage 3: Relevance Judge Agent
  emit({
    stage: 'relevance_analysis',
    status: 'in_progress',
    message: 'Relevance Judge evaluating question intent alignment & topic drift...',
    progressPercent: 50,
  });

  const relevanceResult = evaluateRelevance(question, aiResponse);

  emit({
    stage: 'relevance_analysis',
    status: 'completed',
    message: `Relevance scored: ${relevanceResult.score}/100 (${relevanceResult.category}).`,
    progressPercent: 60,
  });

  // Stage 4: Accuracy Judge Agent
  emit({
    stage: 'accuracy_verification',
    status: 'in_progress',
    message: 'Accuracy Judge cross-referencing claims against reference truth & RAG evidence...',
    progressPercent: 70,
  });

  const accuracyResult = evaluateAccuracy(aiResponse, input.referenceAnswer, retrievedChunks);

  emit({
    stage: 'accuracy_verification',
    status: 'completed',
    message: `Accuracy scored: ${accuracyResult.score}/100 with ${accuracyResult.verifiedClaims.length} propositions evaluated.`,
    progressPercent: 80,
  });

  // Stage 5: Hallucination Detection Agent
  emit({
    stage: 'hallucination_scan',
    status: 'in_progress',
    message: 'Hallucination Detection Agent scanning atomic claims for unsupported fabrications...',
    progressPercent: 85,
  });

  const hallucinationResult = detectHallucinations(aiResponse, input.referenceAnswer, retrievedChunks);

  emit({
    stage: 'hallucination_scan',
    status: 'completed',
    message: `Hallucination scan complete: ${hallucinationResult.hallucinationCount} ungrounded claim(s) detected.`,
    progressPercent: 90,
  });

  // Stage 6: Completeness Judge Agent
  emit({
    stage: 'completeness_analysis',
    status: 'in_progress',
    message: 'Completeness Judge decomposing sub-questions and checking requirement coverage...',
    progressPercent: 94,
  });

  const completenessResult = evaluateCompleteness(question, aiResponse);

  emit({
    stage: 'completeness_analysis',
    status: 'completed',
    message: `Completeness scored: ${completenessResult.score}/100 (${completenessResult.addressedAspects.length}/${completenessResult.totalRequirements} facets addressed).`,
    progressPercent: 96,
  });

  // Stage 7: Verdict Agent & Coach
  emit({
    stage: 'verdict_generation',
    status: 'in_progress',
    message: 'Verdict Agent computing weighted composite score and applying critical overrides...',
    progressPercent: 98,
  });

  // Load configured weights from DB settings if present
  let weights = DEFAULT_WEIGHTS;
  let passThreshold = 80;
  let needsImprovementThreshold = 60;

  try {
    const db = getDb();
    const settingsRows = db.prepare('SELECT key, value FROM platform_settings').all() as { key: string; value: string }[];
    for (const row of settingsRows) {
      if (row.key === 'weights') weights = JSON.parse(row.value);
      if (row.key === 'threshold_pass') passThreshold = Number(row.value);
      if (row.key === 'threshold_needs_improvement') needsImprovementThreshold = Number(row.value);
    }
  } catch {
    // Use defaults
  }

  const verdictResult = evaluateVerdict(
    relevanceResult,
    accuracyResult,
    hallucinationResult,
    completenessResult,
    {
      weights,
      passThreshold,
      needsImprovementThreshold,
    }
  );

  const evalId = `eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: FullEvaluationRecord = {
    id: evalId,
    batchId: input.batchId,
    question,
    aiResponse,
    referenceAnswer: input.referenceAnswer,
    source: input.sourceContext,
    aiSystem: input.aiSystem || 'AI System A',
    relevanceScore: relevanceResult.score,
    accuracyScore: accuracyResult.score,
    hallucinationScore: hallucinationResult.score,
    completenessScore: completenessResult.score,
    overallScore: verdictResult.overallScore,
    verdict: verdictResult.verdict,
    relevanceData: relevanceResult,
    accuracyData: accuracyResult,
    hallucinationData: hallucinationResult,
    completenessData: completenessResult,
    verdictData: verdictResult,
    retrievedEvidence: retrievedChunks,
    recommendations: verdictResult.recommendations,
    confidence: verdictResult.confidence,
    isDemo: input.isDemo ? 1 : 0 as any,
    createdAt: now,
  };

  // Persist record to SQLite
  try {
    const db = getDb();
    const insertStmt = db.prepare(`
      INSERT INTO evaluations (
        id, batch_id, question, ai_response, reference_answer, source, ai_system,
        relevance_score, accuracy_score, hallucination_score, completeness_score,
        overall_score, verdict, relevance_data, accuracy_data, hallucination_data,
        completeness_data, verdict_data, retrieved_evidence, recommendations,
        confidence, is_demo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      record.id,
      record.batchId || null,
      record.question,
      record.aiResponse,
      record.referenceAnswer || null,
      record.source || null,
      record.aiSystem,
      record.relevanceScore,
      record.accuracyScore,
      record.hallucinationScore,
      record.completenessScore,
      record.overallScore,
      record.verdict,
      JSON.stringify(record.relevanceData),
      JSON.stringify(record.accuracyData),
      JSON.stringify(record.hallucinationData),
      JSON.stringify(record.completenessData),
      JSON.stringify(record.verdictData),
      JSON.stringify(record.retrievedEvidence),
      JSON.stringify(record.recommendations),
      record.confidence,
      input.isDemo ? 1 : 0,
      record.createdAt
    );
  } catch (err) {
    console.error('Failed to persist evaluation record in SQLite:', err);
  }

  emit({
    stage: 'completed',
    status: 'completed',
    message: `Evaluation completed successfully. Verdict: ${verdictResult.verdict} (${verdictResult.overallScore}/100)`,
    progressPercent: 100,
  });

  return record;
}
