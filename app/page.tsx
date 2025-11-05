export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Your Chess Mistake Journal</h2>
        <p className="text-gray-600 mb-4">
          Track your chess mistakes, identify patterns, and improve systematically.
        </p>
        <div className="flex gap-4">
          <a
            href="/games/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Import New Game
          </a>
          <a
            href="/mistakes"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            View All Mistakes
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Import a game by pasting PGN</li>
          <li>Navigate through the game moves</li>
          <li>Click on a move where you made a mistake</li>
          <li>Record what went wrong and tag it</li>
          <li>Review patterns in your mistakes over time</li>
        </ol>
      </div>
    </div>
  );
}
// Test pre-commit hook
