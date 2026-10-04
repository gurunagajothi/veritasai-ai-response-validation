import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FullEvaluationRecord } from '@/lib/agents/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    const row = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id) as any;
    if (!row) {
      return NextResponse.json({ success: false, error: 'Evaluation record not found.' }, { status: 404 });
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

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();
    const result = db.prepare('DELETE FROM evaluations WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Evaluation record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Evaluation deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
