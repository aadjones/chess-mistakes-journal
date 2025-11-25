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
      insights: insights.map(insight => {
        // Handle mistakeIdsMap which could be:
        // 1. null/undefined
        // 2. A JSON array string
        // 3. A timestamp string (old data)
        let mistakeIdsMap: string[] = [];
        if (insight.mistakeIdsMap) {
          try {
            const parsed = JSON.parse(insight.mistakeIdsMap);
            // If it's an array, use it; otherwise ignore (it's a timestamp)
            if (Array.isArray(parsed)) {
              mistakeIdsMap = parsed;
            }
          } catch {
            // If parse fails, it might be a plain timestamp string, ignore it
          }
        }

        return {
          id: insight.id,
          insights: JSON.parse(insight.content),
          mistakesAnalyzed: insight.mistakesAnalyzed,
          mistakeIdsMap,
          generatedAt: insight.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error('Failed to fetch insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
