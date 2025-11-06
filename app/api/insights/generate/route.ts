import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/insights/generate
 * Generate insights from recent mistakes using Claude API
 */
export async function POST() {
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-api-key-here') {
      return NextResponse.json(
        {
          error:
            'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file.',
        },
        { status: 400 }
      );
    }

    // Fetch recent mistakes (last 50, with game data)
    const mistakes = await prisma.mistake.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { game: true },
    });

    if (mistakes.length === 0) {
      return NextResponse.json(
        { error: 'No mistakes found. Record some mistakes first!' },
        { status: 400 }
      );
    }

    // Format mistakes for Claude
    const mistakesSummary = mistakes
      .map((m, idx) => {
        const gameContext = `${m.game.playerColor} vs ${m.game.opponentRating || 'opponent'}, ${m.game.timeControl || 'unknown time control'}`;
        return `${idx + 1}. [${m.primaryTag}] ${m.briefDescription}
   Game: ${gameContext}
   Reflection: ${m.detailedReflection || 'No detailed reflection'}`;
      })
      .join('\n\n');

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are analyzing chess mistakes to help a player improve. Below are ${mistakes.length} recent mistakes they've recorded:

${mistakesSummary}

Identify 3-5 recurring patterns or themes based ONLY on what the player explicitly wrote. Rules:
1. Only synthesize what they explicitly mentioned - do not invent problems
2. Quote their own words when relevant
3. Look for emotional patterns, thought process issues, or subtle themes they might not see
4. Be specific but concise
5. Focus on actionable insights

Return your analysis as a JSON array of insight objects with this structure:
[
  {
    "title": "Brief pattern name (5-8 words)",
    "description": "Detailed explanation with quotes (2-3 sentences)",
    "mistakeCount": number of mistakes showing this pattern
  }
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse insights from AI response' },
        { status: 500 }
      );
    }

    const insights = JSON.parse(jsonMatch[0]);

    // Save insights to database
    const savedInsight = await prisma.insight.create({
      data: {
        content: JSON.stringify(insights),
        mistakesAnalyzed: mistakes.length,
      },
    });

    return NextResponse.json({
      id: savedInsight.id,
      insights,
      mistakesAnalyzed: mistakes.length,
      generatedAt: savedInsight.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to generate insights:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
