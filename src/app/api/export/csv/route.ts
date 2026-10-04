import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batch_id');
    const db = getDb();

    let rows: any[];
    if (batchId) {
      rows = db.prepare('SELECT * FROM evaluations WHERE batch_id = ? ORDER BY created_at DESC').all(batchId);
    } else {
      rows = db.prepare('SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 500').all();
    }

    const flatRows = rows.map(r => ({
      'Evaluation ID': r.id,
      'Batch ID': r.batch_id || '',
      'AI System': r.ai_system,
      'Question': r.question,
      'AI Response': r.ai_response,
      'Reference Answer': r.reference_answer || '',
      'Overall Score': r.overall_score,
      'Verdict': r.verdict,
      'Relevance Score': r.relevance_score,
      'Accuracy Score': r.accuracy_score,
      'Hallucination Score': r.hallucination_score,
      'Completeness Score': r.completeness_score,
      'Confidence': r.confidence,
      'Created At': r.created_at,
    }));

    const csvContent = Papa.unparse(flatRows);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="evaluations_${batchId || 'export'}.csv"`,
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message || 'CSV export failed', { status: 500 });
  }
}
