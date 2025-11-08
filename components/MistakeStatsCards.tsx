'use client';

import Link from 'next/link';

interface TagStat {
  tag: string;
  count: number;
}

interface MistakeStatsCardsProps {
  stats: TagStat[];
}

export function MistakeStatsCards({ stats }: MistakeStatsCardsProps) {
  if (stats.length === 0) {
    return null;
  }

  const topThree = stats.slice(0, 3);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Your Top Patterns</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((stat, idx) => (
          <Link
            key={stat.tag}
            href={`/mistakes?tag=${encodeURIComponent(stat.tag)}`}
            className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
              <div className="text-2xl">{['🥇', '🥈', '🥉'][idx]}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">{stat.tag}</div>
            <div className="text-xs text-gray-500 mt-2">
              {stat.count} {stat.count === 1 ? 'mistake' : 'mistakes'} total
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
