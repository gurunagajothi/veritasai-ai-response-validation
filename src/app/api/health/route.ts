import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    // Quick probe to ensure SQLite connection is healthy
    const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result?.healthy === 1 ? 'connected' : 'degraded',
      version: '1.0.0',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Database probe failed',
      },
      { status: 503 }
    );
  }
}
