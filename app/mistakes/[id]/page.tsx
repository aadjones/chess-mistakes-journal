'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayerChessboard } from '@/components/PlayerChessboard';
import type { Mistake, Game } from '@prisma/client';

type MistakeWithGame = Mistake & { game: Game };

export default function MistakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mistakeId = params.id as string;

  const [mistake, setMistake] = useState<MistakeWithGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadMistake() {
      try {
        const response = await fetch(`/api/mistakes/${mistakeId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load mistake');
        }

        setMistake(data.mistake);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadMistake();
  }, [mistakeId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this mistake? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/mistakes/${mistakeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mistake');
      }

      router.push('/mistakes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mistake');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading mistake...</div>
      </div>
    );
  }

  if (error || !mistake) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Mistake not found'}</p>
          <button
            onClick={() => router.push('/mistakes')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Back to Mistakes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/mistakes')}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          ← Back to All Mistakes
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{mistake.briefDescription}</h1>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                {mistake.primaryTag}
              </span>
              <span className="text-gray-500">Move {mistake.moveNumber}</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Position</h3>
          <div className="max-w-md mx-auto">
            <PlayerChessboard
              position={mistake.fenPosition}
              playerColor={mistake.game.playerColor}
            />
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push(`/games/${mistake.gameId}?move=${mistake.moveNumber}`)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View in Game Context
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Game Context</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Playing as:</strong> {mistake.game.playerColor}
              </p>
              {mistake.game.opponentRating && (
                <p>
                  <strong>Opponent Rating:</strong> {mistake.game.opponentRating}
                </p>
              )}
              {mistake.game.timeControl && (
                <p>
                  <strong>Time Control:</strong> {mistake.game.timeControl}
                </p>
              )}
              {mistake.game.datePlayed && (
                <p>
                  <strong>Game Date:</strong>{' '}
                  {new Date(mistake.game.datePlayed).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-gray-500 pt-2">
                Recorded {new Date(mistake.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {mistake.detailedReflection && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Detailed Reflection</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {mistake.detailedReflection}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
