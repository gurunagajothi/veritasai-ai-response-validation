import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { runEvaluationPipeline } from '@/lib/agents/orchestrator';
import { FullEvaluationRecord } from '@/lib/agents/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchName, rows, aiSystem: batchAiSystem } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Validation Error: "rows" array is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const effectiveBatchName = (batchName && typeof batchName === 'string' && batchName.trim().length > 0)
      ? batchName.trim()
      : `Batch Evaluation ${new Date().toLocaleDateString()}`;

    const successfulEvaluations: FullEvaluationRecord[] = [];
    const failedRows: { index: number; reason: string; row: any }[] = [];
    const seenQueries = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      // Normalize keys
      const q = rawRow.question || rawRow.Question || rawRow.prompt || rawRow.Prompt;
      const resp = rawRow.ai_response || rawRow.aiResponse || rawRow['AI Response'] || rawRow.response || rawRow.answer;
      const ref = rawRow.reference_answer || rawRow.referenceAnswer || rawRow['Reference Answer'] || rawRow.reference;
      const src = rawRow.source_information || rawRow.sourceInformation || rawRow.source || rawRow.context;
      const system = rawRow.ai_system || rawRow.aiSystem || batchAiSystem || 'AI System A';

      // Validation
      if (!q || typeof q !== 'string' || q.trim().length < 3) {
        failedRows.push({ index: i, reason: 'Missing or too short question (min 3 chars)', row: rawRow });
        continue;
      }
      if (!resp || typeof resp !== 'string' || resp.trim().length < 3) {
        failedRows.push({ index: i, reason: 'Missing or too short AI response (min 3 chars)', row: rawRow });
        continue;
      }

      // Check duplicates within batch
      const dedupKey = `${q.trim().toLowerCase()}:::${resp.trim().toLowerCase()}`;
      if (seenQueries.has(dedupKey)) {
        failedRows.push({ index: i, reason: 'Duplicate prompt/response pair within batch', row: rawRow });
        continue;
      }
      seenQueries.add(dedupKey);

      try {
        const evalRecord = await runEvaluationPipeline({
          question: q.trim(),
          aiResponse: resp.trim(),
          referenceAnswer: ref ? ref.trim() : undefined,
          sourceContext: src ? src.trim() : undefined,
          aiSystem: system.trim(),
          batchId,
        });
        successfulEvaluations.push(evalRecord);
      } catch (err: any) {
        failedRows.push({ index: i, reason: err.message || 'Execution error during evaluation', row: rawRow });
      }
    }

    // Compute aggregate metrics
    const totalRecords = rows.length;
    const successfulRecords = successfulEvaluations.length;
    const failedRecords = failedRows.length;

    let passCount = 0;
    let needsImprovementCount = 0;
    let failCount = 0;
    let sumOverall = 0;
    let sumRel = 0;
    let sumAcc = 0;
    let sumHal = 0;
    let sumCmp = 0;

    for (const record of successfulEvaluations) {
      if (record.verdict === 'PASS') passCount++;
      else if (record.verdict === 'NEEDS IMPROVEMENT') needsImprovementCount++;
      else failCount++;

      sumOverall += record.overallScore;
      sumRel += record.relevanceScore;
      sumAcc += record.accuracyScore;
      sumHal += record.hallucinationScore;
      sumCmp += record.completenessScore;
    }

    const divisor = Math.max(1, successfulRecords);
    const avgOverallScore = Math.round((sumOverall / divisor) * 10) / 10;
    const avgRelevance = Math.round((sumRel / divisor) * 10) / 10;
    const avgAccuracy = Math.round((sumAcc / divisor) * 10) / 10;
    const avgHallucination = Math.round((sumHal / divisor) * 10) / 10;
    const avgCompleteness = Math.round((sumCmp / divisor) * 10) / 10;

    // Save batch summary to SQLite
    const db = getDb();
    const now = new Date().toISOString();
    const insertBatch = db.prepare(`
      INSERT INTO batches (
        id, name, total_records, successful_records, failed_records,
        pass_count, needs_improvement_count, fail_count,
        avg_overall_score, avg_relevance, avg_accuracy, avg_hallucination, avg_completeness,
        ai_system, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBatch.run(
      batchId,
      effectiveBatchName,
      totalRecords,
      successfulRecords,
      failedRecords,
      passCount,
      needsImprovementCount,
      failCount,
      avgOverallScore,
      avgRelevance,
      avgAccuracy,
      avgHallucination,
      avgCompleteness,
      batchAiSystem || 'AI System A',
      now
    );

    return NextResponse.json({
      success: true,
      batchId,
      batchName: effectiveBatchName,
      summary: {
        totalRecords,
        successfulRecords,
        failedRecords,
        passCount,
        needsImprovementCount,
        failCount,
        avgOverallScore,
        avgRelevance,
        avgAccuracy,
        avgHallucination,
        avgCompleteness,
      },
      evaluations: successfulEvaluations,
      failures: failedRows,
    });
  } catch (error: any) {
    console.error('API /api/batch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process batch evaluation.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();
    const batches = db.prepare('SELECT * FROM batches ORDER BY created_at DESC LIMIT 50').all();
    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
