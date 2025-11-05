import { describe, it, expect, beforeEach } from 'vitest';
import { MoveNavigator } from '@/lib/chess/move-navigator';
import { parsePGN } from '@/lib/chess/pgn-parser';
import { LICHESS_EXPORT, SIMPLE_GAME } from '../../fixtures/sample-pgns';
import { STARTING_FEN } from '@/types/chess';

describe('MoveNavigator', () => {
  let navigator: MoveNavigator;

  beforeEach(() => {
    const parsed = parsePGN(LICHESS_EXPORT);
    navigator = new MoveNavigator(parsed);
  });

  describe('initialization', () => {
    it('should initialize at starting position', () => {
      expect(navigator.getCurrentMoveNumber()).toBe(0);
      expect(navigator.getCurrentFEN()).toBe(STARTING_FEN);
    });

    it('should expose the parsed game', () => {
      const game = navigator.getGame();
      expect(game.moves.length).toBeGreaterThan(0);
      expect(game.headers).toBeDefined();
    });

    it('should work with empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const emptyNav = new MoveNavigator(emptyGame);
      expect(emptyNav.getCurrentMoveNumber()).toBe(0);
      expect(emptyNav.getCurrentFEN()).toBe(STARTING_FEN);
    });
  });

  describe('forward navigation', () => {
    it('should move forward one move', () => {
      const success = navigator.next();
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(1);
      expect(navigator.getCurrentFEN()).not.toBe(STARTING_FEN);
    });

    it('should move forward multiple moves', () => {
      navigator.next();
      navigator.next();
      navigator.next();
      expect(navigator.getCurrentMoveNumber()).toBe(3);
    });

    it('should not go beyond last move', () => {
      const game = navigator.getGame();
      const totalMoves = game.moves.length;

      // Go to last move
      navigator.goToMove(totalMoves);
      expect(navigator.getCurrentMoveNumber()).toBe(totalMoves);

      // Try to go forward - should return false
      const success = navigator.next();
      expect(success).toBe(false);
      expect(navigator.getCurrentMoveNumber()).toBe(totalMoves);
    });

    it('should return false when at end of empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const emptyNav = new MoveNavigator(emptyGame);
      const success = emptyNav.next();
      expect(success).toBe(false);
      expect(emptyNav.getCurrentMoveNumber()).toBe(0);
    });
  });

  describe('backward navigation', () => {
    it('should move backward one move', () => {
      navigator.next();
      navigator.next();
      expect(navigator.getCurrentMoveNumber()).toBe(2);

      const success = navigator.previous();
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(1);
    });

    it('should move backward multiple moves', () => {
      navigator.goToMove(5);
      navigator.previous();
      navigator.previous();
      expect(navigator.getCurrentMoveNumber()).toBe(3);
    });

    it('should not go before starting position', () => {
      expect(navigator.getCurrentMoveNumber()).toBe(0);

      const success = navigator.previous();
      expect(success).toBe(false);
      expect(navigator.getCurrentMoveNumber()).toBe(0);
      expect(navigator.getCurrentFEN()).toBe(STARTING_FEN);
    });

    it('should return to starting position from move 1', () => {
      navigator.next();
      expect(navigator.getCurrentMoveNumber()).toBe(1);

      const success = navigator.previous();
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(0);
      expect(navigator.getCurrentFEN()).toBe(STARTING_FEN);
    });
  });

  describe('jump to move', () => {
    it('should jump to specific move number', () => {
      const success = navigator.goToMove(10);
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(10);
    });

    it('should jump to starting position', () => {
      navigator.goToMove(5);
      const success = navigator.goToMove(0);
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(0);
      expect(navigator.getCurrentFEN()).toBe(STARTING_FEN);
    });

    it('should jump to last move', () => {
      const game = navigator.getGame();
      const lastMove = game.moves.length;
      const success = navigator.goToMove(lastMove);
      expect(success).toBe(true);
      expect(navigator.getCurrentMoveNumber()).toBe(lastMove);
    });

    it('should reject negative move numbers', () => {
      const success = navigator.goToMove(-1);
      expect(success).toBe(false);
      expect(navigator.getCurrentMoveNumber()).toBe(0); // Should not change
    });

    it('should reject move numbers beyond total moves', () => {
      const game = navigator.getGame();
      const invalidMove = game.moves.length + 10;
      const success = navigator.goToMove(invalidMove);
      expect(success).toBe(false);
      expect(navigator.getCurrentMoveNumber()).toBe(0); // Should not change
    });

    it('should allow jumping forward and backward', () => {
      navigator.goToMove(10);
      navigator.goToMove(5);
      navigator.goToMove(15);
      expect(navigator.getCurrentMoveNumber()).toBe(15);
    });
  });

  describe('goToStart and goToEnd', () => {
    it('should go to start', () => {
      navigator.goToMove(10);
      navigator.goToStart();
      expect(navigator.getCurrentMoveNumber()).toBe(0);
      expect(navigator.getCurrentFEN()).toBe(STARTING_FEN);
    });

    it('should go to end', () => {
      const game = navigator.getGame();
      const lastMove = game.moves.length;
      navigator.goToEnd();
      expect(navigator.getCurrentMoveNumber()).toBe(lastMove);
    });

    it('should handle goToStart on already at start', () => {
      navigator.goToStart();
      expect(navigator.getCurrentMoveNumber()).toBe(0);
    });

    it('should handle goToEnd on empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const emptyNav = new MoveNavigator(emptyGame);
      emptyNav.goToEnd();
      expect(emptyNav.getCurrentMoveNumber()).toBe(0);
    });
  });

  describe('position information', () => {
    it('should return correct FEN at each move', () => {
      const fen0 = navigator.getCurrentFEN();
      navigator.next();
      const fen1 = navigator.getCurrentFEN();
      navigator.next();
      const fen2 = navigator.getCurrentFEN();

      expect(fen0).toBe(STARTING_FEN);
      expect(fen1).not.toBe(fen0);
      expect(fen2).not.toBe(fen1);
      expect(fen2).not.toBe(fen0);
    });

    it('should return correct move at current position', () => {
      navigator.next(); // Move 1
      const move = navigator.getCurrentMove();
      expect(move).toBeDefined();
      expect(move?.san).toBe('d4'); // First move of Lichess game
    });

    it('should return null for getCurrentMove at starting position', () => {
      const move = navigator.getCurrentMove();
      expect(move).toBeNull();
    });

    it('should return last move when at end', () => {
      const game = navigator.getGame();
      const lastMoveData = game.moves[game.moves.length - 1];
      navigator.goToEnd();
      const move = navigator.getCurrentMove();
      expect(move?.san).toBe(lastMoveData.san);
    });
  });

  describe('state queries', () => {
    it('should report isAtStart correctly', () => {
      expect(navigator.isAtStart()).toBe(true);
      navigator.next();
      expect(navigator.isAtStart()).toBe(false);
      navigator.previous();
      expect(navigator.isAtStart()).toBe(true);
    });

    it('should report isAtEnd correctly', () => {
      expect(navigator.isAtEnd()).toBe(false);
      navigator.goToEnd();
      expect(navigator.isAtEnd()).toBe(true);
      navigator.previous();
      expect(navigator.isAtEnd()).toBe(false);
    });

    it('should report canGoForward correctly', () => {
      expect(navigator.canGoForward()).toBe(true);
      navigator.goToEnd();
      expect(navigator.canGoForward()).toBe(false);
    });

    it('should report canGoBackward correctly', () => {
      expect(navigator.canGoBackward()).toBe(false);
      navigator.next();
      expect(navigator.canGoBackward()).toBe(true);
    });

    it('should handle state queries on empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const emptyNav = new MoveNavigator(emptyGame);
      expect(emptyNav.isAtStart()).toBe(true);
      expect(emptyNav.isAtEnd()).toBe(true);
      expect(emptyNav.canGoForward()).toBe(false);
      expect(emptyNav.canGoBackward()).toBe(false);
    });
  });

  describe('getTotalMoves', () => {
    it('should return total move count', () => {
      const game = navigator.getGame();
      expect(navigator.getTotalMoves()).toBe(game.moves.length);
    });

    it('should return 0 for empty game', () => {
      const emptyGame = { headers: {}, moves: [], result: '*' as const };
      const emptyNav = new MoveNavigator(emptyGame);
      expect(emptyNav.getTotalMoves()).toBe(0);
    });
  });

  describe('complex navigation scenarios', () => {
    it('should handle forward-backward-forward navigation', () => {
      navigator.next();
      navigator.next();
      navigator.next();
      const fen3 = navigator.getCurrentFEN();

      navigator.previous();
      navigator.previous();
      expect(navigator.getCurrentMoveNumber()).toBe(1);

      navigator.next();
      navigator.next();
      const fen3Again = navigator.getCurrentFEN();

      expect(fen3).toBe(fen3Again);
    });

    it('should maintain consistency after jump and navigation', () => {
      navigator.goToMove(10);
      navigator.next();
      expect(navigator.getCurrentMoveNumber()).toBe(11);

      navigator.goToMove(5);
      navigator.previous();
      expect(navigator.getCurrentMoveNumber()).toBe(4);
    });

    it('should work correctly with short game', () => {
      const parsed = parsePGN(SIMPLE_GAME);
      const shortNav = new MoveNavigator(parsed);

      shortNav.goToEnd();
      const totalMoves = shortNav.getTotalMoves();
      expect(shortNav.getCurrentMoveNumber()).toBe(totalMoves);

      shortNav.goToStart();
      expect(shortNav.getCurrentMoveNumber()).toBe(0);
    });
  });
});
