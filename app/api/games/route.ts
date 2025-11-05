import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parsePGN, getPlayerColor, getOpponentRating, getDatePlayed } from '@/lib/chess/pgn-parser';
import * as gamesRepo from '@/lib/db/games-repository';
import type { CreateGameInput } from '@/types/game';

const prisma = new PrismaClient();

/**
 * POST /api/games
 * Create a new game from PGN
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pgn } = body;

    if (!pgn || typeof pgn !== 'string') {
      return NextResponse.json({ error: 'PGN is required and must be a string' }, { status: 400 });
    }

    // Parse PGN to validate and extract metadata
    const parsed = parsePGN(pgn);

    // Extract metadata from parsed game
    const playerColor = getPlayerColor(parsed);
    const opponentRating = getOpponentRating(parsed, playerColor);
    const datePlayed = getDatePlayed(parsed);
    const timeControl = parsed.headers.TimeControl;

    // Create game input
    const input: CreateGameInput = {
      pgn,
      playerColor,
      opponentRating,
      timeControl,
      datePlayed,
    };

    // Save to database
    const game = await gamesRepo.createGame(prisma, input);

    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    console.error('Failed to create game:', error);

    if (error instanceof Error && error.name === 'PGNParseError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle duplicate PGN (unique constraint violation)
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'This game has already been imported' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/games
 * List all games
 */
export async function GET() {
  try {
    const games = await gamesRepo.getAllGames(prisma);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
