import { Chess } from 'chess.js';
import { ParsedGame, Move, Color, PieceSymbol, Square } from '@/types/chess';

export class PGNParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PGNParseError';
  }
}

/**
 * Parse a PGN string into a structured game object
 * @param pgn - PGN string to parse
 * @returns ParsedGame object with headers, moves, and result
 * @throws PGNParseError if PGN is invalid or cannot be parsed
 */
export function parsePGN(pgn: string): ParsedGame {
  // Validate input
  if (!pgn || !pgn.trim()) {
    throw new PGNParseError('PGN cannot be empty');
  }

  try {
    const chess = new Chess();

    // Load PGN into chess.js (throws on error)
    chess.loadPgn(pgn);

    // Extract headers
    const headers: Record<string, string> = {};
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;

    while ((match = headerRegex.exec(pgn)) !== null) {
      headers[match[1]] = match[2];
    }

    // Extract result
    let result: '1-0' | '0-1' | '1/2-1/2' | '*' = '*';
    if (headers.Result) {
      result = headers.Result as typeof result;
    }

    // Extract moves with full metadata
    const moves: Move[] = [];
    const history = chess.history({ verbose: true });

    for (const move of history) {
      moves.push({
        from: move.from as Square,
        to: move.to as Square,
        piece: move.piece as PieceSymbol,
        color: move.color === 'w' ? 'white' : 'black',
        san: move.san,
        captured: move.captured as PieceSymbol | undefined,
        promotion: move.promotion as PieceSymbol | undefined,
        flags: move.flags,
      });
    }

    return {
      headers,
      moves,
      result,
    };
  } catch (error) {
    if (error instanceof PGNParseError) {
      throw error;
    }

    // chess.js throws generic errors, wrap them
    throw new PGNParseError(
      `Invalid PGN format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract player color from game metadata
 * Determines which color the journaling player was based on names
 * @param parsedGame - Parsed game object
 * @param playerName - Name of the player journaling (optional)
 * @returns 'white' or 'black'
 */
export function getPlayerColor(parsedGame: ParsedGame, playerName?: string): Color {
  if (!playerName) {
    // Default to white if no player name specified
    return 'white';
  }

  const whiteName = parsedGame.headers['White']?.toLowerCase() || '';
  const blackName = parsedGame.headers['Black']?.toLowerCase() || '';
  const searchName = playerName.toLowerCase();

  if (whiteName.includes(searchName)) {
    return 'white';
  }
  if (blackName.includes(searchName)) {
    return 'black';
  }

  // Default to white if name not found
  return 'white';
}

/**
 * Extract time control from PGN headers
 * @param parsedGame - Parsed game object
 * @returns Time control string or undefined
 */
export function getTimeControl(parsedGame: ParsedGame): string | undefined {
  return parsedGame.headers['TimeControl'];
}

/**
 * Extract opponent rating from PGN headers based on player color
 * @param parsedGame - Parsed game object
 * @param playerColor - Color the journaling player was playing
 * @returns Opponent rating as number or undefined
 */
export function getOpponentRating(parsedGame: ParsedGame, playerColor: Color): number | undefined {
  const opponentElo =
    playerColor === 'white' ? parsedGame.headers['BlackElo'] : parsedGame.headers['WhiteElo'];

  if (!opponentElo) return undefined;

  const rating = parseInt(opponentElo, 10);
  return isNaN(rating) ? undefined : rating;
}

/**
 * Extract date played from PGN headers
 * @param parsedGame - Parsed game object
 * @returns Date object or undefined if date invalid
 */
export function getDatePlayed(parsedGame: ParsedGame): Date | undefined {
  const dateStr = parsedGame.headers['Date'] || parsedGame.headers['UTCDate'];

  if (!dateStr) return undefined;

  // PGN dates are in format "YYYY.MM.DD"
  const parts = dateStr.split('.');
  if (parts.length !== 3) return undefined;

  const [year, month, day] = parts.map(p => parseInt(p, 10));

  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  return new Date(year, month - 1, day);
}
