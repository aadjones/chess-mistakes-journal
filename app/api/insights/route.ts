import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/insights
 * Fetch insights history (most recent first)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const insights = await prisma.insight.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      insights: insights.map(insight => ({
        id: insight.id,
        insights: JSON.parse(insight.content),
        mistakesAnalyzed: insight.mistakesAnalyzed,
        mistakeIdsMap: insight.mistakeIdsMap ? JSON.parse(insight.mistakeIdsMap) : [],
        generatedAt: insight.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
