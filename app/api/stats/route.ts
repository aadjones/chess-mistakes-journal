import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all mistakes
    const allMistakes = await prisma.mistake.findMany({
      select: {
        primaryTag: true,
      },
    });

    if (allMistakes.length === 0) {
      return NextResponse.json({
        topTags: [],
        totalMistakes: 0,
      });
    }

    // Group by tag and count
    const tagCounts = new Map<string, number>();

    allMistakes.forEach(mistake => {
      const count = tagCounts.get(mistake.primaryTag) || 0;
      tagCounts.set(mistake.primaryTag, count + 1);
    });

    // Convert to array and sort
    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags

    return NextResponse.json({
      topTags,
      totalMistakes: allMistakes.length,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
