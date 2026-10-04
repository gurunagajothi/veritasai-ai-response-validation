import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDemoDatabase } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    await seedDemoDatabase();

    // 1. Basic aggregates
    const totals = db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(overall_score) as avg_overall,
        AVG(relevance_score) as avg_relevance,
        AVG(accuracy_score) as avg_accuracy,
        AVG(hallucination_score) as avg_hallucination,
        AVG(completeness_score) as avg_completeness
      FROM evaluations
    `).get() as any;

    const total = totals.total || 0;

    // 2. Verdict counts
    const verdictRows = db.prepare(`
      SELECT verdict, COUNT(*) as count 
      FROM evaluations 
      GROUP BY verdict
    `).all() as { verdict: string; count: number }[];

    let passCount = 0;
    let needsImprovementCount = 0;
    let failCount = 0;

    for (const row of verdictRows) {
      if (row.verdict === 'PASS') passCount = row.count;
      else if (row.verdict === 'NEEDS IMPROVEMENT') needsImprovementCount = row.count;
      else if (row.verdict === 'FAIL') failCount = row.count;
    }

    const passRate = total > 0 ? Math.round((passCount / total) * 1000) / 10 : 0;
    const needsImprovementRate = total > 0 ? Math.round((needsImprovementCount / total) * 1000) / 10 : 0;
    const failRate = total > 0 ? Math.round((failCount / total) * 1000) / 10 : 0;

    // 3. Hallucination frequency
    const hallucinatedRows = db.prepare(`
      SELECT COUNT(*) as count FROM evaluations WHERE hallucination_score < 80
    `).get() as { count: number };
    const hallucinationFrequency = total > 0 ? Math.round((hallucinatedRows.count / total) * 1000) / 10 : 0;

    // 4. Score distribution breakdown (buckets: 0-40, 41-60, 61-80, 81-100)
    const buckets = [
      { range: '0 - 40', count: 0 },
      { range: '41 - 60', count: 0 },
      { range: '61 - 80', count: 0 },
      { range: '81 - 100', count: 0 },
    ];

    const allScores = db.prepare('SELECT overall_score FROM evaluations').all() as { overall_score: number }[];
    for (const item of allScores) {
      const s = item.overall_score;
      if (s <= 40) buckets[0].count++;
      else if (s <= 60) buckets[1].count++;
      else if (s <= 80) buckets[2].count++;
      else buckets[3].count++;
    }

    // 5. Evaluation trends over time
    const trends = db.prepare(`
      SELECT 
        substr(created_at, 1, 10) as date,
        COUNT(*) as evaluations_count,
        ROUND(AVG(overall_score), 1) as avg_score,
        ROUND(AVG(accuracy_score), 1) as avg_accuracy
      FROM evaluations
      GROUP BY substr(created_at, 1, 10)
      ORDER BY date ASC
      LIMIT 14
    `).all();

    // 6. Dimension Averages for Radar / Bar Chart
    const dimensionAverages = [
      { dimension: 'Relevance', score: Math.round((totals.avg_relevance || 0) * 10) / 10, fullMark: 100 },
      { dimension: 'Accuracy', score: Math.round((totals.avg_accuracy || 0) * 10) / 10, fullMark: 100 },
      { dimension: 'Hal. Safety', score: Math.round((totals.avg_hallucination || 0) * 10) / 10, fullMark: 100 },
      { dimension: 'Completeness', score: Math.round((totals.avg_completeness || 0) * 10) / 10, fullMark: 100 },
    ];

    // 7. Recent evaluations sample
    const recent = db.prepare(`
      SELECT id, question, overall_score, verdict, relevance_score, accuracy_score,
             hallucination_score, completeness_score, ai_system, created_at
      FROM evaluations
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    // 8. Batches summary
    const batches = db.prepare(`
      SELECT * FROM batches ORDER BY created_at DESC LIMIT 5
    `).all();

    return NextResponse.json({
      success: true,
      summary: {
        totalEvaluations: total,
        passRate,
        needsImprovementRate,
        failRate,
        passCount,
        needsImprovementCount,
        failCount,
        avgOverallScore: Math.round((totals.avg_overall || 0) * 10) / 10,
        avgRelevance: Math.round((totals.avg_relevance || 0) * 10) / 10,
        avgAccuracy: Math.round((totals.avg_accuracy || 0) * 10) / 10,
        avgHallucination: Math.round((totals.avg_hallucination || 0) * 10) / 10,
        avgCompleteness: Math.round((totals.avg_completeness || 0) * 10) / 10,
        hallucinationFrequency,
      },
      verdictDistribution: [
        { name: 'PASS', value: passCount, color: '#16a34a' },
        { name: 'NEEDS IMPROVEMENT', value: needsImprovementCount, color: '#d97706' },
        { name: 'FAIL', value: failCount, color: '#dc2626' },
      ],
      dimensionAverages,
      scoreBuckets: buckets,
      trends,
      recentEvaluations: recent,
      batches,
    });
  } catch (error: any) {
    console.error('API /api/analytics error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
