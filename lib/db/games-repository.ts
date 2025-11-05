import { PrismaClient } from '@prisma/client';
import type { Game, CreateGameInput, GameWithMistakes } from '@/types/game';
import type { Mistake } from '@/types/mistake';

/**
 * Convert Prisma Game model to domain Game type
 */
function toDomainGame(prismaGame: {
  id: string;
  pgn: string;
  playerColor: string;
  opponentRating: number | null;
  timeControl: string | null;
  datePlayed: Date | null;
  createdAt: Date;
}): Game {
  return {
    id: prismaGame.id,
    pgn: prismaGame.pgn,
    playerColor: prismaGame.playerColor as 'white' | 'black',
    opponentRating: prismaGame.opponentRating ?? undefined,
    timeControl: prismaGame.timeControl ?? undefined,
    datePlayed: prismaGame.datePlayed ?? undefined,
    createdAt: prismaGame.createdAt,
  };
}

/**
 * Convert Prisma Mistake model to domain Mistake type
 */
function toDomainMistake(prismaMistake: {
  id: string;
  gameId: string;
  moveNumber: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Mistake {
  return {
    id: prismaMistake.id,
    gameId: prismaMistake.gameId,
    moveNumber: prismaMistake.moveNumber,
    fenPosition: prismaMistake.fenPosition,
    briefDescription: prismaMistake.briefDescription,
    primaryTag: prismaMistake.primaryTag,
    detailedReflection: prismaMistake.detailedReflection ?? undefined,
    createdAt: prismaMistake.createdAt,
    updatedAt: prismaMistake.updatedAt,
  };
}

/**
 * Create a new game
 */
export async function createGame(prisma: PrismaClient, input: CreateGameInput): Promise<Game> {
  const game = await prisma.game.create({
    data: {
      pgn: input.pgn,
      playerColor: input.playerColor,
      opponentRating: input.opponentRating,
      timeControl: input.timeControl,
      datePlayed: input.datePlayed,
    },
  });

  return toDomainGame(game);
}

/**
 * Get a game by ID
 */
export async function getGameById(prisma: PrismaClient, id: string): Promise<Game | null> {
  const game = await prisma.game.findUnique({
    where: { id },
  });

  return game ? toDomainGame(game) : null;
}

/**
 * Get a game with its mistakes
 */
export async function getGameWithMistakes(
  prisma: PrismaClient,
  id: string
): Promise<GameWithMistakes | null> {
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      mistakes: {
        orderBy: { moveNumber: 'asc' },
      },
    },
  });

  if (!game) {
    return null;
  }

  return {
    ...toDomainGame(game),
    mistakes: game.mistakes.map(toDomainMistake),
  };
}

/**
 * Get all games (ordered by most recent first)
 */
export async function getAllGames(prisma: PrismaClient): Promise<Game[]> {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return games.map(toDomainGame);
}

/**
 * Delete a game (cascades to mistakes)
 */
export async function deleteGame(prisma: PrismaClient, id: string): Promise<void> {
  await prisma.game
    .delete({
      where: { id },
    })
    .catch(() => {
      // Ignore error if game doesn't exist
    });
}

/**
 * Get total count of games
 */
export async function getGamesCount(prisma: PrismaClient): Promise<number> {
  return prisma.game.count();
}
