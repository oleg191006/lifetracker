/**
 * PatternInsights — visual comparison of weekday vs weekend scores.
 *
 * Displays a side-by-side bar comparison and a percentage difference,
 * highlighting whether the user is more productive on weekdays or weekends.
 */
import React from 'react';

interface Props {
  weekdayAvg: number;
  weekendAvg: number;
  isLoading: boolean;
}

export function PatternInsights({ weekdayAvg, weekendAvg, isLoading }: Props) {
  const diff = weekdayAvg - weekendAvg;
  const diffPct = weekendAvg > 0 ? Math.round((diff / weekendAvg) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="h-6 w-40 bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">Weekday vs Weekend</h3>
      <p className="text-sm text-gray-500 mb-5">Score comparison (last 30 days)</p>

      <div className="flex items-end gap-8 justify-center mb-5">
        {/* Weekday bar */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-violet-600 mb-2">
            {weekdayAvg || '—'}
          </span>
          <div
            className="w-20 rounded-t-xl bg-gradient-to-t from-violet-600 to-purple-500"
            style={{ height: `${(weekdayAvg / 10) * 120}px`, minHeight: 4 }}
          />
          <span className="text-xs font-medium text-gray-500 mt-2">Weekday</span>
        </div>

        {/* Weekend bar */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-purple-400 mb-2">
            {weekendAvg || '—'}
          </span>
          <div
            className="w-20 rounded-t-xl bg-gradient-to-t from-purple-300 to-violet-300"
            style={{ height: `${(weekendAvg / 10) * 120}px`, minHeight: 4 }}
          />
          <span className="text-xs font-medium text-gray-500 mt-2">Weekend</span>
        </div>
      </div>

      {/* Insight text */}
      {(weekdayAvg > 0 || weekendAvg > 0) && (
        <div className={`text-center text-sm p-3 rounded-xl font-medium ${
          diff > 0 ? 'bg-violet-50 text-violet-700' : diff < 0 ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'
        }`}>
          {diff > 0
            ? `Weekdays are ${diffPct}% more productive`
            : diff < 0
              ? `Weekends are ${Math.abs(diffPct)}% more productive`
              : 'Weekday and weekend scores are equal'}
        </div>
      )}
    </div>
  );
}
