import { describe, it, expect } from 'vitest';
import { extractFEN, FENExtractionError } from '@/lib/chess/fen-extractor';
import { parsePGN } from '@/lib/chess/pgn-parser';
import { LICHESS_EXPORT } from '../../fixtures/sample-pgns';
import { STARTING_FEN } from '@/types/chess';

describe('extractFEN', () => {
  describe('error handling', () => {
    it('should throw FENExtractionError for invalid move number (negative)', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      expect(() => extractFEN(parsed, -1)).toThrow(FENExtractionError);
      expect(() => extractFEN(parsed, -1)).toThrow('Move number must be non-negative');
    });

    it('should throw FENExtractionError for invalid move number (too large)', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const totalMoves = parsed.moves.length;
      expect(() => extractFEN(parsed, totalMoves + 1)).toThrow(FENExtractionError);
      expect(() => extractFEN(parsed, totalMoves + 1)).toThrow(
        `Move number ${totalMoves + 1} exceeds total moves (${totalMoves})`
      );
    });

    it('should throw FENExtractionError for empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      expect(() => extractFEN(emptyGame, 1)).toThrow(FENExtractionError);
      expect(() => extractFEN(emptyGame, 1)).toThrow('Move number 1 exceeds total moves (0)');
    });
  });

  describe('starting position', () => {
    it('should return starting FEN for move 0', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen = extractFEN(parsed, 0);
      expect(fen).toBe(STARTING_FEN);
    });

    it('should return starting FEN for empty moves array at move 0', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const fen = extractFEN(emptyGame, 0);
      expect(fen).toBe(STARTING_FEN);
    });
  });

  describe('FEN extraction after moves', () => {
    it('should extract FEN after first move (1. d4)', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen = extractFEN(parsed, 1);

      // After 1. d4, the d-pawn should have moved from d2 to d4
      expect(fen).toContain('rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR');
    });

    it('should extract FEN after second move (1. d4 d5)', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen = extractFEN(parsed, 2);

      // After 1. d4 d5, both d-pawns should have advanced
      // The first part of FEN (before space) is the piece placement
      expect(fen).toContain('rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR');
    });

    it('should extract FEN at move 10', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen = extractFEN(parsed, 10);

      // FEN should be a valid FEN string with 6 components
      const components = fen.split(' ');
      expect(components).toHaveLength(6);

      // First component should be the piece placement (8 ranks)
      const ranks = components[0].split('/');
      expect(ranks).toHaveLength(8);
    });

    it('should extract FEN at the last move', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const lastMoveNumber = parsed.moves.length;
      const fen = extractFEN(parsed, lastMoveNumber);

      // FEN should be valid
      const components = fen.split(' ');
      expect(components).toHaveLength(6);

      // Should not be the starting position
      expect(fen).not.toBe(STARTING_FEN);
    });
  });

  describe('FEN structure validation', () => {
    it('should return valid FEN structure at any move', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const moveNumbers = [0, 1, 5, 10, 20, parsed.moves.length];

      moveNumbers.forEach(moveNum => {
        if (moveNum <= parsed.moves.length) {
          const fen = extractFEN(parsed, moveNum);

          // FEN should have 6 space-separated components:
          // 1. Piece placement (8 ranks separated by /)
          // 2. Active color (w or b)
          // 3. Castling availability
          // 4. En passant target square
          // 5. Halfmove clock
          // 6. Fullmove number
          const components = fen.split(' ');
          expect(components).toHaveLength(6);

          const [piecePlacement, activeColor, castling, enPassant, halfmove, fullmove] = components;

          // Piece placement should have 8 ranks
          expect(piecePlacement.split('/')).toHaveLength(8);

          // Active color should be 'w' or 'b'
          expect(['w', 'b']).toContain(activeColor);

          // Castling should be '-' or contain K/Q/k/q
          expect(castling).toMatch(/^(-|[KQkq]+)$/);

          // En passant should be '-' or a valid square
          expect(enPassant).toMatch(/^(-|[a-h][36])$/);

          // Halfmove clock should be a number
          expect(Number.isInteger(parseInt(halfmove, 10))).toBe(true);

          // Fullmove number should be a positive integer
          expect(parseInt(fullmove, 10)).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('sequential FEN extraction', () => {
    it('should produce different FENs as moves progress', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen0 = extractFEN(parsed, 0);
      const fen1 = extractFEN(parsed, 1);
      const fen2 = extractFEN(parsed, 2);
      const fen3 = extractFEN(parsed, 3);

      // Each FEN should be different as the position changes
      expect(fen0).not.toBe(fen1);
      expect(fen1).not.toBe(fen2);
      expect(fen2).not.toBe(fen3);
    });

    it('should correctly track active color (alternating w/b)', () => {
      const parsed = parsePGN(LICHESS_EXPORT);

      // After even moves (0, 2, 4...), it should be white's turn
      expect(extractFEN(parsed, 0).split(' ')[1]).toBe('w');
      expect(extractFEN(parsed, 2).split(' ')[1]).toBe('w');
      expect(extractFEN(parsed, 4).split(' ')[1]).toBe('w');

      // After odd moves (1, 3, 5...), it should be black's turn
      expect(extractFEN(parsed, 1).split(' ')[1]).toBe('b');
      expect(extractFEN(parsed, 3).split(' ')[1]).toBe('b');
      expect(extractFEN(parsed, 5).split(' ')[1]).toBe('b');
    });
  });

  describe('idempotency', () => {
    it('should return the same FEN when called multiple times for the same move', () => {
      const parsed = parsePGN(LICHESS_EXPORT);
      const fen1 = extractFEN(parsed, 10);
      const fen2 = extractFEN(parsed, 10);
      const fen3 = extractFEN(parsed, 10);

      expect(fen1).toBe(fen2);
      expect(fen2).toBe(fen3);
    });
  });
});
