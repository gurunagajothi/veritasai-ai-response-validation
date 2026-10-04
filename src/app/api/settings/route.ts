import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DEFAULT_WEIGHTS } from '@/lib/agents/verdictAgent';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM platform_settings').all() as { key: string; value: string }[];

    const settings: Record<string, any> = {
      weights: DEFAULT_WEIGHTS,
      thresholdPass: 80,
      thresholdNeedsImprovement: 60,
      enableDemoMode: true,
      geminiModel: 'gemini-1.5-flash',
      openaiModel: 'gpt-4o-mini',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasOpenaiKey: Boolean(process.env.OPENAI_API_KEY),
    };

    for (const r of rows) {
      if (r.key === 'weights') settings.weights = JSON.parse(r.value);
      if (r.key === 'threshold_pass') settings.thresholdPass = Number(r.value);
      if (r.key === 'threshold_needs_improvement') settings.thresholdNeedsImprovement = Number(r.value);
      if (r.key === 'demo_mode') settings.enableDemoMode = r.value === 'true';
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    const upsert = db.prepare(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
    `);

    if (body.weights) {
      const { relevance, accuracy, hallucination, completeness } = body.weights;
      const total = (Number(relevance) || 0) + (Number(accuracy) || 0) + (Number(hallucination) || 0) + (Number(completeness) || 0);
      if (Math.abs(total - 1.0) > 0.05 && Math.abs(total - 100) > 2) {
        return NextResponse.json({ success: false, error: 'Weights must sum to 100% (or 1.0).' }, { status: 400 });
      }

      // Normalize to decimals
      const normWeights = {
        relevance: total > 10 ? Number(relevance) / 100 : Number(relevance),
        accuracy: total > 10 ? Number(accuracy) / 100 : Number(accuracy),
        hallucination: total > 10 ? Number(hallucination) / 100 : Number(hallucination),
        completeness: total > 10 ? Number(completeness) / 100 : Number(completeness),
      };

      upsert.run('weights', JSON.stringify(normWeights), now);
    }

    if (body.thresholdPass !== undefined) {
      upsert.run('threshold_pass', String(Math.max(1, Math.min(99, Number(body.thresholdPass)))), now);
    }

    if (body.thresholdNeedsImprovement !== undefined) {
      upsert.run('threshold_needs_improvement', String(Math.max(1, Math.min(99, Number(body.thresholdNeedsImprovement)))), now);
    }

    if (body.enableDemoMode !== undefined) {
      upsert.run('demo_mode', String(Boolean(body.enableDemoMode)), now);
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
