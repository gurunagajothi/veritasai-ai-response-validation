import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateSingleEvaluationPdf, generateBatchEvaluationPdf } from '@/lib/pdf/generateReport';
import { FullEvaluationRecord } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const evalId = searchParams.get('id');
    const batchId = searchParams.get('batch_id');

    const db = getDb();

    if (evalId) {
      const row = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(evalId) as any;
      if (!row) {
        return new NextResponse('Evaluation not found', { status: 404 });
      }

      const record: FullEvaluationRecord = {
        id: row.id,
        batchId: row.batch_id || undefined,
        question: row.question,
        aiResponse: row.ai_response,
        referenceAnswer: row.reference_answer || undefined,
        source: row.source || undefined,
        aiSystem: row.ai_system,
        relevanceScore: row.relevance_score,
        accuracyScore: row.accuracy_score,
        hallucinationScore: row.hallucination_score,
        completenessScore: row.completeness_score,
        overallScore: row.overall_score,
        verdict: row.verdict,
        relevanceData: row.relevance_data ? JSON.parse(row.relevance_data) : null,
        accuracyData: row.accuracy_data ? JSON.parse(row.accuracy_data) : null,
        hallucinationData: row.hallucination_data ? JSON.parse(row.hallucination_data) : null,
        completenessData: row.completeness_data ? JSON.parse(row.completeness_data) : null,
        verdictData: row.verdict_data ? JSON.parse(row.verdict_data) : null,
        retrievedEvidence: row.retrieved_evidence ? JSON.parse(row.retrieved_evidence) : [],
        recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
        confidence: row.confidence,
        isDemo: Boolean(row.is_demo),
        createdAt: row.created_at,
      };

      const doc = generateSingleEvaluationPdf(record);
      const pdfArrayBuffer = doc.output('arraybuffer');

      return new NextResponse(Buffer.from(pdfArrayBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="evaluation_${evalId}.pdf"`,
        },
      });
    }

    if (batchId) {
      const batchRow = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId) as any;
      if (!batchRow) {
        return new NextResponse('Batch not found', { status: 404 });
      }

      const evalRows = db.prepare('SELECT * FROM evaluations WHERE batch_id = ? ORDER BY created_at ASC').all(batchId) as any[];
      const records: FullEvaluationRecord[] = evalRows.map(r => ({
        id: r.id,
        batchId: r.batch_id,
        question: r.question,
        aiResponse: r.ai_response,
        referenceAnswer: r.reference_answer,
        source: r.source,
        aiSystem: r.ai_system,
        relevanceScore: r.relevance_score,
        accuracyScore: r.accuracy_score,
        hallucinationScore: r.hallucination_score,
        completenessScore: r.completeness_score,
        overallScore: r.overall_score,
        verdict: r.verdict,
        relevanceData: r.relevance_data ? JSON.parse(r.relevance_data) : null,
        accuracyData: r.accuracy_data ? JSON.parse(r.accuracy_data) : null,
        hallucinationData: r.hallucination_data ? JSON.parse(r.hallucination_data) : null,
        completenessData: r.completeness_data ? JSON.parse(r.completeness_data) : null,
        verdictData: r.verdict_data ? JSON.parse(r.verdict_data) : null,
        retrievedEvidence: r.retrieved_evidence ? JSON.parse(r.retrieved_evidence) : [],
        recommendations: r.recommendations ? JSON.parse(r.recommendations) : [],
        confidence: r.confidence,
        createdAt: r.created_at,
      }));

      const doc = generateBatchEvaluationPdf({
        id: batchRow.id,
        name: batchRow.name,
        totalRecords: batchRow.total_records,
        successfulRecords: batchRow.successful_records,
        failedRecords: batchRow.failed_records,
        passCount: batchRow.pass_count,
        needsImprovementCount: batchRow.needs_improvement_count,
        failCount: batchRow.fail_count,
        avgOverallScore: batchRow.avg_overall_score,
        avgRelevance: batchRow.avg_relevance,
        avgAccuracy: batchRow.avg_accuracy,
        avgHallucination: batchRow.avg_hallucination,
        avgCompleteness: batchRow.avg_completeness,
        aiSystem: batchRow.ai_system,
        createdAt: batchRow.created_at,
        records,
      });

      const pdfArrayBuffer = doc.output('arraybuffer');

      return new NextResponse(Buffer.from(pdfArrayBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="batch_${batchId}.pdf"`,
        },
      });
    }

    return new NextResponse('Please provide either ?id= or ?batch_id=', { status: 400 });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return new NextResponse(error.message || 'PDF export failed', { status: 500 });
  }
}
