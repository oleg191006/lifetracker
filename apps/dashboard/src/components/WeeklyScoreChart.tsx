/**
 * WeeklyScoreChart — bar chart showing daily scores for the past week.
 *
 * A simple CSS-only chart. Each bar's height represents the score (0-10).
 * Extra top padding is reserved so the score label above each bar is not clipped.
 */
import React from 'react';
import type { DailyLog } from '@life-tracker/shared';

interface WeeklyScoreChartProps {
  logs: DailyLog[];
  isLoading: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getBarColor(score: number): string {
  if (score >= 7) return 'bg-gradient-to-t from-emerald-500 to-emerald-400';
  if (score >= 4) return 'bg-gradient-to-t from-amber-500 to-amber-400';
  return 'bg-gradient-to-t from-red-500 to-red-400';
}

export function WeeklyScoreChart({ logs, isLoading }: WeeklyScoreChartProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === dateStr);
    return {
      dayName: dayNames[date.getDay()],
      date: dateStr,
      score: log ? Number(log.score) : null,
      isToday: i === 6,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Weekly Score</h3>
      <p className="text-xs text-gray-400 mb-5">Last 7 days</p>

      {isLoading ? (
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100 rounded-lg animate-pulse"
              style={{ height: `${40 + (i % 3) * 20}%` }}
            />
          ))}
        </div>
      ) : (
        /* pt-6 reserves space for the score labels that sit above each bar */
        <div className="flex items-end gap-2 pt-6" style={{ height: '160px' }}>
          {days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center h-full">
              <div className="flex-1 w-full flex flex-col items-center justify-end relative">
                {day.score !== null ? (
                  <>
                    {/* Score label above the bar */}
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs font-bold text-gray-700 mb-1">
                      {day.score}
                    </span>
                    {/* The bar */}
                    <div
                      className={`w-full rounded-t-lg ${getBarColor(day.score)} transition-all duration-700 ease-out ${
                        day.isToday ? 'ring-2 ring-violet-300 ring-offset-1' : ''
                      }`}
                      style={{ height: `${Math.max(8, (day.score / 10) * 100)}%` }}
                    />
                  </>
                ) : (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full self-end" />
                )}
              </div>
              {/* Day label */}
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  day.isToday ? 'text-violet-600' : 'text-gray-400'
                }`}
              >
                {day.dayName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
