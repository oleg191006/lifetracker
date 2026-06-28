/**
 * SleepChart — visual chart showing sleep duration over the last 7 days.
 *
 * Displays horizontal bars for each night. Duration text is shown OUTSIDE
 * the bar (to the right) so it's always visible even on short bars.
 *
 * The thin vertical line marks the 8-hour recommended sleep threshold.
 */
import React from 'react';
import type { SleepLog } from '@life-tracker/shared';

interface SleepChartProps {
  logs: SleepLog[];
  isLoading: boolean;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

function qualityColor(quality: number): string {
  if (quality >= 4) return 'bg-gradient-to-r from-indigo-400 to-violet-500';
  if (quality >= 3) return 'bg-gradient-to-r from-amber-400 to-orange-400';
  return 'bg-gradient-to-r from-red-400 to-rose-400';
}

export function SleepChart({ logs, isLoading }: SleepChartProps) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const maxDuration = Math.max(600, ...sorted.map((l) => l.durationMin));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Recent Sleep</h3>
      <p className="text-xs text-gray-400 mb-5">Last 7 nights</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-3.5 bg-gray-100 rounded animate-pulse shrink-0" />
              <div className="flex-1 h-7 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-3xl block mb-2">🌙</span>
          <p className="text-sm text-gray-400">
            No sleep data yet. Log your first night!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((log) => {
            const pct = Math.min(100, (log.durationMin / maxDuration) * 100);
            const dayName = new Date(log.date + 'T00:00:00').toLocaleDateString('en', {
              weekday: 'short',
            });

            return (
              <div key={log.id} className="flex items-center gap-2">
                {/* Day label */}
                <span className="text-xs text-gray-400 w-8 text-right shrink-0 font-medium">
                  {dayName}
                </span>

                {/* Bar track */}
                <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                  {/* Filled bar */}
                  <div
                    className={`h-full rounded-lg ${qualityColor(log.quality)} transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* 8h reference line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400/30"
                    style={{ left: `${(480 / maxDuration) * 100}%` }}
                  />
                </div>

                {/* Duration text — always visible outside the bar */}
                <span className="text-xs font-semibold text-gray-700 w-12 shrink-0">
                  {formatDuration(log.durationMin)}
                </span>
              </div>
            );
          })}
          <p className="text-[10px] text-gray-300 mt-1 text-right uppercase tracking-wider">
            Line = 8h recommended
          </p>
        </div>
      )}
    </div>
  );
}
