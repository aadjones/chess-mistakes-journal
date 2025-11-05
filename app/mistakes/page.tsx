'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerChessboard } from '@/components/PlayerChessboard';
import { formatTimeControl } from '@/lib/utils/format-time-control';
import type { Mistake, Game } from '@prisma/client';

type MistakeWithGame = Mistake & { game: Game };

export default function MistakesListPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeWithGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMistakes() {
      try {
        const response = await fetch('/api/mistakes');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load mistakes');
        }

        setMistakes(data.mistakes || []);

        // Extract unique tags
        const tags = Array.from(new Set(data.mistakes.map((m: Mistake) => m.primaryTag)));
        setAllTags(tags as string[]);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadMistakes();
  }, []);

  const handleDelete = async (mistakeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this mistake? This action cannot be undone.')) {
      return;
    }

    setDeletingId(mistakeId);
    try {
      const response = await fetch(`/api/mistakes/${mistakeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mistake');
      }

      // Remove from local state
      setMistakes(prev => prev.filter(m => m.id !== mistakeId));

      // Update tags if needed
      const remainingMistakes = mistakes.filter(m => m.id !== mistakeId);
      const tags = Array.from(new Set(remainingMistakes.map(m => m.primaryTag)));
      setAllTags(tags as string[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mistake');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMistakes = selectedTag
    ? mistakes.filter(m => m.primaryTag === selectedTag)
    : mistakes;

  const tagCounts = allTags.map(tag => ({
    tag,
    count: mistakes.filter(m => m.primaryTag === tag).length,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading mistakes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">All Mistakes</h1>
        <p className="text-gray-600">{mistakes.length} mistakes recorded</p>
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No mistakes recorded yet</h2>
          <p className="text-gray-600 mb-6">
            Get started by importing a game and recording your first mistake.
          </p>
          <div className="space-y-4 max-w-md mx-auto text-left">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <p className="text-sm text-gray-700">Click &quot;Import Game&quot; in the header</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <p className="text-sm text-gray-700">Paste your PGN and select your color</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <p className="text-sm text-gray-700">Navigate to a move where you made a mistake</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </span>
              <p className="text-sm text-gray-700">Record what went wrong and tag it</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tags */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold mb-3">Filter by Tag</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    selectedTag === '' ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  All ({mistakes.length})
                </button>
                {tagCounts
                  .sort((a, b) => b.count - a.count)
                  .map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        selectedTag === tag ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                      }`}
                    >
                      {tag} ({count})
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Main Content - Mistake Cards */}
          <div className="lg:col-span-3 space-y-4">
            {filteredMistakes.map(mistake => (
              <div key={mistake.id} className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Chessboard Preview */}
                  <div className="md:col-span-1">
                    <div className="max-w-xs mx-auto">
                      <PlayerChessboard
                        position={mistake.fenPosition}
                        playerColor={mistake.game.playerColor}
                      />
                    </div>
                  </div>

                  {/* Mistake Details */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{mistake.briefDescription}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {mistake.primaryTag}
                          </span>
                          <span className="text-sm text-gray-500">Move {mistake.moveNumber}</span>
                        </div>
                      </div>
                    </div>

                    {mistake.detailedReflection && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {mistake.detailedReflection}
                      </p>
                    )}

                    <div className="pt-2 border-t text-sm text-gray-600">
                      <p>
                        <strong>Game:</strong> {mistake.game.playerColor} vs{' '}
                        {mistake.game.opponentRating
                          ? `${mistake.game.opponentRating}`
                          : 'opponent'}
                        {mistake.game.timeControl &&
                          ` • ${formatTimeControl(mistake.game.timeControl)}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recorded {new Date(mistake.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() =>
                          router.push(`/games/${mistake.gameId}?move=${mistake.moveNumber}`)
                        }
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View in Game
                      </button>
                      <button
                        onClick={e => handleDelete(mistake.id, e)}
                        disabled={deletingId === mistake.id}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {deletingId === mistake.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
