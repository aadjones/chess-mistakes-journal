import { Chess } from 'chess.js';
import type { ParsedGame } from '@/types/chess';
import { STARTING_FEN } from '@/types/chess';

/**
 * Error thrown when FEN extraction fails
 */
export class FENExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FENExtractionError';
  }
}

/**
 * Extracts the FEN position after a specific move in a parsed game
 *
 * @param game - The parsed chess game
 * @param moveNumber - The move number (0 = starting position, 1 = after first move, etc.)
 * @returns The FEN string representing the position after the specified move
 * @throws {FENExtractionError} If move number is invalid
 *
 * @example
 * const game = parsePGN(pgnString);
 * const startFEN = extractFEN(game, 0); // Starting position
 * const afterMove1 = extractFEN(game, 1); // After first move
 */
export function extractFEN(game: ParsedGame, moveNumber: number): string {
  // Validate move number
  if (moveNumber < 0) {
    throw new FENExtractionError('Move number must be non-negative');
  }

  if (moveNumber > game.moves.length) {
    throw new FENExtractionError(
      `Move number ${moveNumber} exceeds total moves (${game.moves.length})`
    );
  }

  // Return starting position if moveNumber is 0
  if (moveNumber === 0) {
    return STARTING_FEN;
  }

  // Create a new chess instance and replay moves up to the specified move number
  const chess = new Chess();

  for (let i = 0; i < moveNumber; i++) {
    const move = game.moves[i];
    try {
      // Use the SAN (Standard Algebraic Notation) to make the move
      chess.move(move.san);
    } catch (error) {
      throw new FENExtractionError(
        `Failed to replay move ${i + 1} (${move.san}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return chess.fen();
}
