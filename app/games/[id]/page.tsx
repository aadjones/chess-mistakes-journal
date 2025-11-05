'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chess } from 'chess.js';
import { PlayerChessboard } from '@/components/PlayerChessboard';
import type { Game, Mistake } from '@prisma/client';

type GameWithMistakes = Game & { mistakes: Mistake[] };

export default function GameViewerPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameWithMistakes | null>(null);
  const [chessGame, setChessGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const goToMove = (moveIndex: number) => {
    const newGame = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      newGame.move(moves[i]);
    }
    setChessGame(newGame);
    setCurrentMoveIndex(moveIndex);
  };

  const goToStart = () => goToMove(0);
  const goToPrevious = () => currentMoveIndex > 0 && goToMove(currentMoveIndex - 1);
  const goToNext = () => currentMoveIndex < moves.length && goToMove(currentMoveIndex + 1);
  const goToEnd = () => goToMove(moves.length);

  const handleAddMistake = () => {
    // Navigate to mistake form with current position context
    const fenPosition = chessGame.fen();
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
    router.push(
      `/mistakes/new?gameId=${gameId}&moveNumber=${moveNumber}&fen=${encodeURIComponent(fenPosition)}`
    );
  };

  const getMistakeAtCurrentMove = () => {
    if (!game) return null;
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
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
  const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
  const isWhiteMove = currentMoveIndex % 2 === 0;

  // Format time control to show minutes (e.g., "180+2" -> "3+2")
  const formatTimeControl = (timeControl: string): string => {
    if (!timeControl) return timeControl;

    const parts = timeControl.split('+');
    if (parts.length === 2) {
      const minutes = Math.floor(parseInt(parts[0]) / 60);
      const increment = parts[1];
      return `${minutes}+${increment}`;
    }

    // For formats without increment (e.g., "180")
    if (!timeControl.includes('+')) {
      const minutes = Math.floor(parseInt(timeControl) / 60);
      return `${minutes}`;
    }

    return timeControl;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800 mb-2">
          ← Back to Home
        </button>
        <h1 className="text-2xl font-bold">Game Viewer</h1>
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p>
            <strong>Playing as:</strong> {game.playerColor}
          </p>
          {game.opponentRating && (
            <p>
              <strong>Opponent Rating:</strong> {game.opponentRating}
            </p>
          )}
          {game.timeControl && (
            <p>
              <strong>Time Control:</strong> {formatTimeControl(game.timeControl)}
            </p>
          )}
          {game.datePlayed && (
            <p>
              <strong>Date:</strong> {new Date(game.datePlayed).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chessboard */}
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <PlayerChessboard
              key={chessGame.fen()}
              position={chessGame.fen()}
              playerColor={game.playerColor}
            />

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
              <span className="px-4 py-2 text-sm font-medium">
                {currentMoveIndex === 0 ? 'Start' : `Move ${moveNumber}${isWhiteMove ? '' : '...'}`}
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
                  <p className="text-sm text-yellow-800 mb-2">{currentMistake.briefDescription}</p>
                  <button
                    onClick={() => router.push(`/mistakes/${currentMistake.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </button>
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

        {/* Move List */}
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Move List</h3>
            <div className="max-h-[600px] overflow-y-auto text-sm">
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
                      <tr key={moveNum} className={hasMistake ? 'border-l-4 border-red-500' : ''}>
                        <td className="px-2 py-1 text-gray-500 text-right font-mono">{moveNum}.</td>
                        <td className="px-2 py-1">
                          <button
                            onClick={() => goToMove(whiteIndex + 1)}
                            className={`px-2 py-1 rounded transition hover:bg-gray-100 ${
                              currentMoveIndex === whiteIndex + 1 ? 'bg-blue-100 font-semibold' : ''
                            }`}
                          >
                            {whiteMove}
                          </button>
                        </td>
                        <td className="px-2 py-1">
                          {blackMove && (
                            <button
                              onClick={() => goToMove(blackIndex + 1)}
                              className={`px-2 py-1 rounded transition hover:bg-gray-100 ${
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
