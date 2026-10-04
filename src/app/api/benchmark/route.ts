import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDemoDatabase } from '@/lib/db/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    await seedDemoDatabase();

    const { searchParams } = new URL(req.url);
    const systemA = searchParams.get('system_a') || 'AI System A';
    const systemB = searchParams.get('system_b') || 'AI System B';

    // Aggregate stats for System A
    const statsA = db.prepare(`
      SELECT 
        COUNT(*) as count,
        AVG(overall_score) as avg_overall,
        AVG(relevance_score) as avg_relevance,
        AVG(accuracy_score) as avg_accuracy,
        AVG(hallucination_score) as avg_hallucination,
        AVG(completeness_score) as avg_completeness,
        SUM(CASE WHEN verdict = 'PASS' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN hallucination_score < 80 THEN 1 ELSE 0 END) as hallucination_count
      FROM evaluations
      WHERE ai_system = ?
    `).get(systemA) as any;

    // Aggregate stats for System B
    const statsB = db.prepare(`
      SELECT 
        COUNT(*) as count,
        AVG(overall_score) as avg_overall,
        AVG(relevance_score) as avg_relevance,
        AVG(accuracy_score) as avg_accuracy,
        AVG(hallucination_score) as avg_hallucination,
        AVG(completeness_score) as avg_completeness,
        SUM(CASE WHEN verdict = 'PASS' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN hallucination_score < 80 THEN 1 ELSE 0 END) as hallucination_count
      FROM evaluations
      WHERE ai_system = ?
    `).get(systemB) as any;

    const countA = statsA.count || 0;
    const countB = statsB.count || 0;

    const summaryA = {
      system: systemA,
      count: countA,
      overallScore: Math.round((statsA.avg_overall || 0) * 10) / 10,
      relevance: Math.round((statsA.avg_relevance || 0) * 10) / 10,
      accuracy: Math.round((statsA.avg_accuracy || 0) * 10) / 10,
      hallucinationSafety: Math.round((statsA.avg_hallucination || 0) * 10) / 10,
      completeness: Math.round((statsA.avg_completeness || 0) * 10) / 10,
      passRate: countA > 0 ? Math.round((statsA.pass_count / countA) * 1000) / 10 : 0,
      hallucinationRate: countA > 0 ? Math.round((statsA.hallucination_count / countA) * 1000) / 10 : 0,
    };

    const summaryB = {
      system: systemB,
      count: countB,
      overallScore: Math.round((statsB.avg_overall || 0) * 10) / 10,
      relevance: Math.round((statsB.avg_relevance || 0) * 10) / 10,
      accuracy: Math.round((statsB.avg_accuracy || 0) * 10) / 10,
      hallucinationSafety: Math.round((statsB.avg_hallucination || 0) * 10) / 10,
      completeness: Math.round((statsB.avg_completeness || 0) * 10) / 10,
      passRate: countB > 0 ? Math.round((statsB.pass_count / countB) * 1000) / 10 : 0,
      hallucinationRate: countB > 0 ? Math.round((statsB.hallucination_count / countB) * 1000) / 10 : 0,
    };

    // Calculate objective winners based on numbers
    const getWinner = (valA: number, valB: number) => {
      if (Math.abs(valA - valB) < 0.5) return 'Tie / Parity';
      return valA > valB ? systemA : systemB;
    };

    const winners = {
      overallQuality: getWinner(summaryA.overallScore, summaryB.overallScore),
      accuracy: getWinner(summaryA.accuracy, summaryB.accuracy),
      hallucinationSafety: getWinner(summaryA.hallucinationSafety, summaryB.hallucinationSafety),
      completeness: getWinner(summaryA.completeness, summaryB.completeness),
      relevance: getWinner(summaryA.relevance, summaryB.relevance),
    };

    // Comparison Radar / Bar chart structure
    const chartComparison = [
      { metric: 'Overall Score', [systemA]: summaryA.overallScore, [systemB]: summaryB.overallScore },
      { metric: 'Relevance', [systemA]: summaryA.relevance, [systemB]: summaryB.relevance },
      { metric: 'Accuracy', [systemA]: summaryA.accuracy, [systemB]: summaryB.accuracy },
      { metric: 'Hal. Safety', [systemA]: summaryA.hallucinationSafety, [systemB]: summaryB.hallucinationSafety },
      { metric: 'Completeness', [systemA]: summaryA.completeness, [systemB]: summaryB.completeness },
      { metric: 'Pass Rate (%)', [systemA]: summaryA.passRate, [systemB]: summaryB.passRate },
    ];

    return NextResponse.json({
      success: true,
      systemA: summaryA,
      systemB: summaryB,
      winners,
      chartComparison,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
