import { describe, it, expect } from 'vitest';
import { parsePGN } from '@/lib/chess/pgn-parser';
import {
  SIMPLE_GAME,
  LICHESS_EXPORT,
  CHESS_COM_EXPORT,
  INVALID_PGN,
  MINIMAL_PGN,
  PGN_WITH_COMMENTS,
  GAME_WITH_PROMOTION,
} from '@/__tests__/fixtures/sample-pgns';

describe('parsePGN', () => {
  describe('valid PGN parsing', () => {
    it('extracts game metadata from simple PGN', () => {
      const result = parsePGN(SIMPLE_GAME);

      expect(result.headers['White']).toBe('Player1');
      expect(result.headers['Black']).toBe('Player2');
      expect(result.headers['Event']).toBe('Casual Game');
      expect(result.headers['WhiteElo']).toBe('1800');
      expect(result.result).toBe('1-0');
    });

    it('parses all moves correctly', () => {
      const result = parsePGN(SIMPLE_GAME);

      expect(result.moves.length).toBeGreaterThan(0);
      expect(result.moves[0].san).toBe('e4');
      expect(result.moves[1].san).toBe('e5');
      expect(result.moves[2].san).toBe('Nf3');
    });

    it('handles Lichess export format', () => {
      const result = parsePGN(LICHESS_EXPORT);

      expect(result.headers['Site']).toContain('lichess.org');
      expect(result.headers['Opening']).toBe('Semi-Slav Defense: Marshall Gambit');
      expect(result.headers['TimeControl']).toBe('300+3');
      expect(result.result).toBe('1/2-1/2');
      expect(result.moves.length).toBeGreaterThan(100);
    });

    it('handles Chess.com export format', () => {
      const result = parsePGN(CHESS_COM_EXPORT);

      expect(result.headers['Site']).toBe('Chess.com');
      expect(result.headers['TimeControl']).toBe('600');
      expect(result.result).toBe('1/2-1/2');
      expect(result.moves.length).toBeGreaterThan(20);
    });

    it('handles minimal PGN without headers', () => {
      const result = parsePGN(MINIMAL_PGN);

      expect(result.moves.length).toBe(3);
      expect(result.moves[0].san).toBe('e4');
      expect(result.moves[1].san).toBe('e5');
      expect(result.moves[2].san).toBe('Nf3');
      expect(result.result).toBe('*');
    });

    it('strips comments from moves', () => {
      const result = parsePGN(PGN_WITH_COMMENTS);

      expect(result.moves[0].san).toBe('e4');
      expect(result.moves[1].san).toBe('e5');
      // Should not include comment text in moves
      expect(result.moves[0].san).not.toContain('Best by test');
    });

    it('handles checkmate notation', () => {
      const result = parsePGN(GAME_WITH_PROMOTION);

      // Find the checkmate move
      const mateMove = result.moves.find(m => m.san === 'Qxf7#');
      expect(mateMove).toBeDefined();
      expect(mateMove?.san).toContain('#');
    });
  });

  describe('move data extraction', () => {
    it('extracts move colors correctly', () => {
      const result = parsePGN(SIMPLE_GAME);

      expect(result.moves[0].color).toBe('white'); // e4
      expect(result.moves[1].color).toBe('black'); // e5
      expect(result.moves[2].color).toBe('white'); // Nf3
      expect(result.moves[3].color).toBe('black'); // Nc6
    });

    it('extracts piece types correctly', () => {
      const result = parsePGN(SIMPLE_GAME);

      expect(result.moves[0].piece).toBe('p'); // e4 is pawn
      expect(result.moves[2].piece).toBe('n'); // Nf3 is knight
      expect(result.moves[4].piece).toBe('b'); // Bb5 is bishop
    });

    it('identifies captures', () => {
      const pgn = `1. e4 d5 2. exd5`;
      const result = parsePGN(pgn);

      const captureMove = result.moves.find(m => m.san === 'exd5');
      expect(captureMove).toBeDefined();
      expect(captureMove?.flags).toContain('c'); // capture flag
      expect(captureMove?.captured).toBe('p');
    });

    it('handles castling', () => {
      const result = parsePGN(SIMPLE_GAME);

      const castlingMove = result.moves.find(m => m.san === 'O-O');
      expect(castlingMove).toBeDefined();
      expect(castlingMove?.flags).toContain('k'); // kingside castle
    });
  });

  describe('error handling', () => {
    it('throws descriptive error for invalid PGN', () => {
      expect(() => parsePGN(INVALID_PGN)).toThrow('Invalid PGN');
    });

    it('throws error for empty PGN', () => {
      expect(() => parsePGN('')).toThrow('PGN cannot be empty');
    });

    it('throws error for whitespace-only PGN', () => {
      expect(() => parsePGN('   \n  \t  ')).toThrow('PGN cannot be empty');
    });
  });

  describe('edge cases', () => {
    it('handles PGN with extra whitespace', () => {
      const pgn = `

        [Event "Test"]
        [White "P1"]
        [Black "P2"]

        1. e4 e5

      `;
      const result = parsePGN(pgn);

      expect(result.moves.length).toBe(2);
      expect(result.headers['Event']).toBe('Test');
    });

    it('handles incomplete games with * result', () => {
      const result = parsePGN(PGN_WITH_COMMENTS);

      expect(result.result).toBe('*');
      expect(result.moves.length).toBeGreaterThan(0);
    });

    it('extracts date from header if present', () => {
      const result = parsePGN(LICHESS_EXPORT);

      expect(result.headers['Date']).toBe('2017.12.28');
    });
  });
});
