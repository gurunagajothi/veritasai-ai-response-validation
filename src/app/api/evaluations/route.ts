import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDemoDatabase } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    // Auto-seed if empty
    await seedDemoDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const verdict = searchParams.get('verdict') || '';
    const aiSystem = searchParams.get('ai_system') || '';
    const batchId = searchParams.get('batch_id') || '';
    const minScore = searchParams.get('min_score') ? Number(searchParams.get('min_score')) : null;
    const maxScore = searchParams.get('max_score') ? Number(searchParams.get('max_score')) : null;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (search.trim()) {
      conditions.push('(question LIKE ? OR id LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (verdict.trim()) {
      conditions.push('verdict = ?');
      params.push(verdict.trim());
    }

    if (aiSystem.trim()) {
      conditions.push('ai_system = ?');
      params.push(aiSystem.trim());
    }

    if (batchId.trim()) {
      conditions.push('batch_id = ?');
      params.push(batchId.trim());
    }

    if (minScore !== null && !isNaN(minScore)) {
      conditions.push('overall_score >= ?');
      params.push(minScore);
    }

    if (maxScore !== null && !isNaN(maxScore)) {
      conditions.push('overall_score <= ?');
      params.push(maxScore);
    }

    const whereClause = conditions.join(' AND ');

    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM evaluations WHERE ${whereClause}`).get(...params) as { total: number };
    const query = `
      SELECT id, batch_id, question, ai_response, reference_answer, source, ai_system,
             relevance_score, accuracy_score, hallucination_score, completeness_score,
             overall_score, verdict, confidence, is_demo, created_at
      FROM evaluations
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(query).all(...params, limit, offset);

    return NextResponse.json({
      success: true,
      total: totalRow.total,
      limit,
      offset,
      data: rows,
    });
  } catch (error: any) {
    console.error('API /api/evaluations error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
