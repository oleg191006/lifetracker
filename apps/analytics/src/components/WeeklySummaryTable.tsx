/**
 * WeeklySummaryTable — displays weekly stats in a clean table format.
 *
 * Shows aggregated metrics for each of the last 4 weeks:
 * - Average score, sleep duration/quality, energy, study hours
 * - Color-coded cells for quick visual scanning
 */
import React from 'react';
import type { WeeklySummaryResponse } from '../api';

interface Props {
  data: WeeklySummaryResponse[];
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

function scoreColor(score: number): string {
  if (score >= 7) return 'text-emerald-700 bg-emerald-50';
  if (score >= 4) return 'text-amber-700 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export function WeeklySummaryTable({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="h-6 w-40 bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Weekly Summary</h3>
        <p className="text-sm text-gray-500 mt-0.5">Last 4 weeks comparison</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-5 py-3.5 text-left font-medium text-gray-400 text-xs uppercase tracking-wider">Week</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Score</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Sleep</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Quality</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Energy</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Study</th>
              <th className="px-5 py-3.5 text-center font-medium text-gray-400 text-xs uppercase tracking-wider">Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((week, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 text-gray-900 font-medium whitespace-nowrap">
                  {formatDate(week.weekStart)} – {formatDate(week.weekEnd)}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${scoreColor(week.avgScore)}`}>
                    {week.avgScore}
                  </span>
                </td>
                <td className="px-5 py-4 text-center text-gray-600">
                  {week.avgSleepDuration ? `${Math.round(week.avgSleepDuration / 60)}h ${Math.round(week.avgSleepDuration % 60)}m` : '—'}
                </td>
                <td className="px-5 py-4 text-center text-gray-600">
                  {week.avgSleepQuality || '—'}/5
                </td>
                <td className="px-5 py-4 text-center text-gray-600">
                  {week.avgEnergyLevel || '—'}/10
                </td>
                <td className="px-5 py-4 text-center text-gray-600">
                  {week.totalStudyMin ? `${Math.round(week.totalStudyMin / 60)}h` : '—'}
                </td>
                <td className="px-5 py-4 text-center text-gray-400">
                  {week.daysLogged}/7
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          No data yet. Start logging to see weekly summaries!
        </p>
      )}
    </div>
  );
}
