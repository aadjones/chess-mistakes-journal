'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Chess } from 'chess.js';
import { PlayerChessboard } from '@/components/PlayerChessboard';
import { formatTimeControl } from '@/lib/utils/format-time-control';
import { getMoveNumber, formatMoveDisplay } from '@/lib/utils/move-math';
import type { Game, Mistake } from '@prisma/client';

type GameWithMistakes = Game & { mistakes: Mistake[] };

export default function GameViewerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = params.id as string;
  const targetMoveNumber = searchParams.get('move');

  const [game, setGame] = useState<GameWithMistakes | null>(null);
  const [chessGame, setChessGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load game');
        }

        setGame(data.game);

        // Clean PGN by removing annotations that chess.js doesn't handle
        // This includes clock annotations { [%clk 0:03:00] }, opening names, etc.
        const cleanedPgn = data.game.pgn.replace(/\{[^}]*\}/g, '').trim();

        // Create a new Chess instance and load the game
        const newGame = new Chess();
        newGame.loadPgn(cleanedPgn);
        const history = newGame.history();
        setMoves(history);

        // Reset to starting position
        newGame.reset();
        setChessGame(newGame);
        setCurrentMoveIndex(0);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadGame();
  }, [gameId]);

  // Navigate to target move if specified in URL
  useEffect(() => {
    if (targetMoveNumber && moves.length > 0 && game) {
      const moveNum = parseInt(targetMoveNumber);
      if (!isNaN(moveNum) && moveNum > 0) {
        // Find the move index that corresponds to this move number
        // We need to find which half-move (white or black) matches the mistake
        // Since mistakes are recorded at currentMoveIndex, we need to find all indices
        // where Math.floor(index / 2) + 1 === moveNum
        // This could be either (moveNum - 1) * 2 or (moveNum - 1) * 2 + 1

        // Check which color the player is and navigate to their move
        let targetIndex;
        if (game.playerColor === 'white') {
          // White's move is at even indices: 0, 2, 4, ...
          targetIndex = (moveNum - 1) * 2;
        } else {
          // Black's move is at odd indices: 1, 3, 5, ...
          targetIndex = (moveNum - 1) * 2 + 1;
        }

        // Make sure we don't go past the end of the game
        targetIndex = Math.min(targetIndex, moves.length);
        goToMove(targetIndex);
      }
    }
  }, [targetMoveNumber, moves.length, game]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToMove = (moveIndex: number) => {
    const newGame = new Chess();
    let lastMove = null;
    for (let i = 0; i < moveIndex; i++) {
      lastMove = newGame.move(moves[i]);
    }
    setChessGame(newGame);
    setCurrentMoveIndex(moveIndex);
    setLastMove(lastMove);
  };

  const goToStart = () => goToMove(0);
  const goToPrevious = () => currentMoveIndex > 0 && goToMove(currentMoveIndex - 1);
  const goToNext = () => currentMoveIndex < moves.length && goToMove(currentMoveIndex + 1);
  const goToEnd = () => goToMove(moves.length);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, moves.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddMistake = () => {
    // Navigate to mistake form with current position context
    const fenPosition = chessGame.fen();
    const moveNumber = getMoveNumber(currentMoveIndex);
    router.push(
      `/mistakes/new?gameId=${gameId}&moveNumber=${moveNumber}&fen=${encodeURIComponent(fenPosition)}`
    );
  };

  const getMistakeAtCurrentMove = () => {
    if (!game) return null;
    const moveNumber = getMoveNumber(currentMoveIndex);
    return game.mistakes.find(m => m.moveNumber === moveNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Game not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentMistake = getMistakeAtCurrentMove();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Game Info */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-3">Game Info</h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-600">Playing as:</span>
                <p className="font-medium capitalize">{game.playerColor}</p>
              </div>
              {game.opponentRating && (
                <div>
                  <span className="text-gray-600">Opponent:</span>
                  <p className="font-medium">{game.opponentRating}</p>
                </div>
              )}
              {game.timeControl && (
                <div>
                  <span className="text-gray-600">Time Control:</span>
                  <p className="font-medium">{formatTimeControl(game.timeControl)}</p>
                </div>
              )}
              {game.datePlayed && (
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-medium">{new Date(game.datePlayed).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Chessboard */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="max-w-lg mx-auto">
              <PlayerChessboard
                position={chessGame.fen()}
                playerColor={game.playerColor}
                customSquareStyles={
                  lastMove
                    ? {
                        [lastMove.from]: {
                          backgroundColor: 'rgba(255, 255, 0, 0.4)',
                        },
                        [lastMove.to]: {
                          backgroundColor: 'rgba(255, 255, 0, 0.4)',
                        },
                      }
                    : undefined
                }
              />
            </div>

            {/* Navigation Controls */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={goToStart}
                disabled={currentMoveIndex === 0}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏮ Start
              </button>
              <button
                onClick={goToPrevious}
                disabled={currentMoveIndex === 0}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm font-medium w-28 text-center inline-block">
                {formatMoveDisplay(currentMoveIndex)}
              </span>
              <button
                onClick={goToNext}
                disabled={currentMoveIndex === moves.length}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
              <button
                onClick={goToEnd}
                disabled={currentMoveIndex === moves.length}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End ⏭
              </button>
            </div>

            {/* Add Mistake Button */}
            <div className="mt-4 text-center">
              {currentMistake ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Mistake recorded at this position
                  </p>
                  <p className="text-sm text-yellow-800">{currentMistake.briefDescription}</p>
                  {currentMistake.detailedReflection && (
                    <p className="text-xs text-yellow-700 mt-2 whitespace-pre-wrap text-left">
                      {currentMistake.detailedReflection}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleAddMistake}
                  disabled={currentMoveIndex === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Add Mistake at This Position
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Move List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-center mb-3">Move List</h3>
            <div className="max-h-[500px] overflow-y-auto text-xs">
              <table className="w-full">
                <tbody>
                  {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
                    const moveNum = i + 1;
                    const whiteIndex = i * 2;
                    const blackIndex = i * 2 + 1;
                    const whiteMove = moves[whiteIndex];
                    const blackMove = moves[blackIndex];
                    const hasMistake = game.mistakes.some(m => m.moveNumber === moveNum);

                    return (
                      <tr key={moveNum} className={hasMistake ? 'border-l-2 border-red-500' : ''}>
                        <td className="px-1 py-0.5 text-gray-500 text-right font-mono text-xs">
                          {moveNum}.
                        </td>
                        <td className="px-1 py-0.5">
                          <button
                            onClick={() => goToMove(whiteIndex + 1)}
                            className={`px-1.5 py-0.5 rounded text-xs transition hover:bg-gray-100 ${
                              currentMoveIndex === whiteIndex + 1 ? 'bg-blue-100 font-semibold' : ''
                            }`}
                          >
                            {whiteMove}
                          </button>
                        </td>
                        <td className="px-1 py-0.5">
                          {blackMove && (
                            <button
                              onClick={() => goToMove(blackIndex + 1)}
                              className={`px-1.5 py-0.5 rounded text-xs transition hover:bg-gray-100 ${
                                currentMoveIndex === blackIndex + 1
                                  ? 'bg-blue-100 font-semibold'
                                  : ''
                              }`}
                            >
                              {blackMove}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
