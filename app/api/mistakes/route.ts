import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as mistakesRepo from '@/lib/db/mistakes-repository';
import type { CreateMistakeInput } from '@/types/mistake';

const prisma = new PrismaClient();

/**
 * POST /api/mistakes
 * Create a new mistake
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, moveNumber, fenPosition, briefDescription, primaryTag, detailedReflection } =
      body;

    // Validate required fields
    if (!gameId || !moveNumber || !fenPosition || !briefDescription || !primaryTag) {
      return NextResponse.json(
        { error: 'gameId, moveNumber, fenPosition, briefDescription, and primaryTag are required' },
        { status: 400 }
      );
    }

    const input: CreateMistakeInput = {
      gameId,
      moveNumber: parseInt(moveNumber, 10),
      fenPosition,
      briefDescription,
      primaryTag,
      detailedReflection,
    };

    const mistake = await mistakesRepo.createMistake(prisma, input);

    return NextResponse.json({ mistake }, { status: 201 });
  } catch (error) {
    console.error('Failed to create mistake:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/mistakes
 * List all mistakes with game data (optionally filtered by gameId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    const mistakes = await prisma.mistake.findMany({
      where: gameId ? { gameId } : undefined,
      include: { game: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ mistakes });
  } catch (error) {
    console.error('Failed to fetch mistakes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
