'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGamePage() {
  const router = useRouter();
  const [pgn, setPgn] = useState('');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn, playerColor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import game');
      }

      // Redirect to the game viewer
      router.push(`/games/${data.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Import New Game</h1>
        <p className="text-gray-600">
          Paste PGN from Lichess, Chess.com, or any standard PGN format.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="playerColor" className="block text-sm font-medium text-gray-700 mb-2">
            You played as
          </label>
          <select
            id="playerColor"
            value={playerColor}
            onChange={e => setPlayerColor(e.target.value as 'white' | 'black')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="pgn" className="block text-sm font-medium text-gray-700 mb-2">
            PGN
          </label>
          <textarea
            id="pgn"
            value={pgn}
            onChange={e => setPgn(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='[Event "Rated Blitz game"]
[Site "https://lichess.org/ABC123"]
[White "Player1"]
[Black "Player2"]
...

1. e4 e5 2. Nf3 Nc6 ...'
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !pgn.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Importing...' : 'Import Game'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/mistakes')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to get PGN:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <strong>Lichess:</strong> Open your game → Click the three dots → &quot;Export
            game&quot; → Copy PGN
          </li>
          <li>
            <strong>Chess.com:</strong> Open your game → Click &quot;Share&quot; → &quot;PGN&quot; →
            Copy
          </li>
        </ul>
      </div>
    </div>
  );
}
