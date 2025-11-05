import { Chess } from 'chess.js';
import type { ParsedGame, Move } from '@/types/chess';

/**
 * Navigates through a parsed chess game, providing move-by-move position access
 *
 * @example
 * const game = parsePGN(pgnString);
 * const navigator = new MoveNavigator(game);
 *
 * navigator.next(); // Move forward
 * navigator.previous(); // Move backward
 * navigator.goToMove(10); // Jump to move 10
 * const fen = navigator.getCurrentFEN(); // Get current position
 */
export class MoveNavigator {
  private game: ParsedGame;
  private chess: Chess;
  private currentMoveIndex: number;

  /**
   * Creates a new move navigator for the given game
   * @param game - The parsed chess game to navigate
   */
  constructor(game: ParsedGame) {
    this.game = game;
    this.chess = new Chess();
    this.currentMoveIndex = 0; // 0 = starting position
  }

  /**
   * Get the parsed game
   */
  getGame(): ParsedGame {
    return this.game;
  }

  /**
   * Get current move number (0 = starting position)
   */
  getCurrentMoveNumber(): number {
    return this.currentMoveIndex;
  }

  /**
   * Get total number of moves in the game
   */
  getTotalMoves(): number {
    return this.game.moves.length;
  }

  /**
   * Get the FEN of the current position
   */
  getCurrentFEN(): string {
    return this.chess.fen();
  }

  /**
   * Get the move at the current position (null if at starting position)
   */
  getCurrentMove(): Move | null {
    if (this.currentMoveIndex === 0) {
      return null;
    }
    return this.game.moves[this.currentMoveIndex - 1];
  }

  /**
   * Move forward one move
   * @returns true if successful, false if already at end
   */
  next(): boolean {
    if (this.currentMoveIndex >= this.game.moves.length) {
      return false;
    }

    const move = this.game.moves[this.currentMoveIndex];
    try {
      this.chess.move(move.san);
      this.currentMoveIndex++;
      return true;
    } catch {
      // Should not happen with valid parsed game, but handle gracefully
      return false;
    }
  }

  /**
   * Move backward one move
   * @returns true if successful, false if already at start
   */
  previous(): boolean {
    if (this.currentMoveIndex === 0) {
      return false;
    }

    const undone = this.chess.undo();
    if (undone) {
      this.currentMoveIndex--;
      return true;
    }

    return false;
  }

  /**
   * Jump to a specific move number
   * @param moveNumber - The move to jump to (0 = starting position)
   * @returns true if successful, false if invalid move number
   */
  goToMove(moveNumber: number): boolean {
    if (moveNumber < 0 || moveNumber > this.game.moves.length) {
      return false;
    }

    // Reset to starting position and replay moves up to target
    this.chess.reset();
    this.currentMoveIndex = 0;

    for (let i = 0; i < moveNumber; i++) {
      const move = this.game.moves[i];
      try {
        this.chess.move(move.san);
        this.currentMoveIndex++;
      } catch {
        // If we fail to replay, reset and return false
        this.chess.reset();
        this.currentMoveIndex = 0;
        return false;
      }
    }

    return true;
  }

  /**
   * Jump to the starting position
   */
  goToStart(): void {
    this.chess.reset();
    this.currentMoveIndex = 0;
  }

  /**
   * Jump to the last move
   */
  goToEnd(): void {
    this.goToMove(this.game.moves.length);
  }

  /**
   * Check if at starting position
   */
  isAtStart(): boolean {
    return this.currentMoveIndex === 0;
  }

  /**
   * Check if at the last move
   */
  isAtEnd(): boolean {
    return this.currentMoveIndex === this.game.moves.length;
  }

  /**
   * Check if can move forward
   */
  canGoForward(): boolean {
    return this.currentMoveIndex < this.game.moves.length;
  }

  /**
   * Check if can move backward
   */
  canGoBackward(): boolean {
    return this.currentMoveIndex > 0;
  }
}
