'use client';

import { useState, useEffect } from 'react';
import { InsightLoadingSpinner } from '@/components/InsightLoadingSpinner';

interface Insight {
  title: string;
  description: string;
  mistakeCount: number;
}

interface InsightRecord {
  id: string;
  insights: Insight[];
  mistakesAnalyzed: number;
  generatedAt: string;
}

export default function InsightsPage() {
  const [currentInsights, setCurrentInsights] = useState<Insight[] | null>(null);
  const [history, setHistory] = useState<InsightRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    mistakesAnalyzed: number;
    generatedAt: string;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/insights');
      const data = await response.json();

      if (data.insights && data.insights.length > 0) {
        const latest = data.insights[0];
        setCurrentInsights(latest.insights);
        setMetadata({
          mistakesAnalyzed: latest.mistakesAnalyzed,
          generatedAt: latest.generatedAt,
        });
        setHistory(data.insights);
      }
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      setCurrentInsights(data.insights);
      setMetadata({
        mistakesAnalyzed: data.mistakesAnalyzed,
        generatedAt: data.generatedAt,
      });

      // Reload all insights to update history
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
        <p className="text-gray-600">
          Discover patterns and themes in your chess mistakes using AI analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-900 font-semibold mb-1">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <InsightLoadingSpinner />
      ) : !currentInsights ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Generate Your First Insights</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to analyze your recent mistakes and discover patterns in your
            play. The AI will look for themes in your own words and reflections.
          </p>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            Generate Insights
          </button>
          <p className="text-sm text-gray-500 mt-4">
            This analyzes your last 50 mistakes and may take 10-30 seconds
          </p>
        </div>
      ) : (
        <div>
          {/* Metadata */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Analyzed {metadata?.mistakesAnalyzed} mistakes •{' '}
              {metadata?.generatedAt &&
                new Date(metadata.generatedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
            </div>
            <button
              onClick={generateInsights}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>

          {/* Current Insights */}
          <div className="space-y-4">
            {currentInsights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {insight.mistakeCount} {insight.mistakeCount === 1 ? 'mistake' : 'mistakes'}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> These insights are generated by AI based on your own words and
              reflections. They are meant to help you notice patterns, not to prescribe solutions.
              Use your judgment when applying these observations to your training.
            </p>
          </div>

          {/* History Section */}
          {history.length > 1 && (
            <div className="mt-8">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">
                  View History ({history.length - 1} older{' '}
                  {history.length === 2 ? 'generation' : 'generations'})
                </span>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showHistory && (
                <div className="mt-4 space-y-4">
                  {history.slice(1).map(record => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="mb-3 text-sm text-gray-600">
                        {new Date(record.generatedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        • {record.mistakesAnalyzed} mistakes analyzed
                      </div>
                      <div className="space-y-3">
                        {record.insights.map((insight, idx) => (
                          <div key={idx} className="border-l-2 border-gray-300 pl-4">
                            <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-700">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
