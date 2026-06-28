/**
 * SleepScoreChart — scatter plot showing correlation between
 * sleep duration and daily productivity score.
 *
 * Uses Recharts ScatterChart. Each dot represents one day where
 * both sleep and daily score were logged. A visual pattern
 * (dots trending upper-right) suggests more sleep = better scores.
 *
 * Recharts is a declarative charting library built on D3.js.
 * Components like <ScatterChart>, <XAxis>, <Scatter> are React
 * components that render SVG elements.
 */
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  sleepHours: number;
  score: number;
  date: string;
}

interface Props {
  data: DataPoint[];
  isLoading: boolean;
}

export function SleepScoreChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">Sleep vs Score</h3>
      <p className="text-sm text-gray-500 mb-4">
        Does more sleep lead to better days?
      </p>

      {data.length < 3 ? (
        <p className="text-sm text-gray-500 text-center py-12">
          Log at least 3 days of sleep + daily scores to see the correlation
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="sleepHours"
              name="Sleep"
              unit="h"
              type="number"
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <YAxis
              dataKey="score"
              name="Score"
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as DataPoint;
                return (
                  <div className="bg-white rounded-xl p-3 shadow-lg shadow-black/5 text-xs border border-gray-100">
                    <p className="font-semibold text-gray-900">{d.date}</p>
                    <p className="text-gray-600 mt-1">Sleep: {d.sleepHours}h</p>
                    <p className="text-gray-600">Score: {d.score}/10</p>
                  </div>
                );
              }}
            />
            <Scatter
              data={data}
              fill="#7c3aed"
              fillOpacity={0.7}
              r={5}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
