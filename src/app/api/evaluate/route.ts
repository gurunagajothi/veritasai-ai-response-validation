import { NextRequest, NextResponse } from 'next/server';
import { runEvaluationPipeline } from '@/lib/agents/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, aiResponse, referenceAnswer, sourceContext, aiSystem, isDemo } = body;

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Validation Error: "question" is required (min 3 characters).' },
        { status: 400 }
      );
    }

    if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Validation Error: "aiResponse" is required (min 5 characters).' },
        { status: 400 }
      );
    }

    const record = await runEvaluationPipeline({
      question: question.trim(),
      aiResponse: aiResponse.trim(),
      referenceAnswer: referenceAnswer ? referenceAnswer.trim() : undefined,
      sourceContext: sourceContext ? sourceContext.trim() : undefined,
      aiSystem: aiSystem ? aiSystem.trim() : 'AI System A',
      isDemo: Boolean(isDemo),
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    console.error('API /api/evaluate error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during evaluation pipeline execution.',
      },
      { status: 500 }
    );
  }
}
