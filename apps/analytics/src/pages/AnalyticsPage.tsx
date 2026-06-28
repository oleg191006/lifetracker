/**
 * AnalyticsPage — aggregated analytics with charts and pattern insights.
 *
 * This page fetches data from the /analytics endpoints and renders:
 * 1. Weekly summary table (last 4 weeks)
 * 2. Weekday vs weekend score comparison
 * 3. Sleep vs score scatter plot (Recharts)
 * 4. Study hours per course bar chart (Recharts)
 *
 * All data loads in parallel using Promise.allSettled.
 */
import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api';
import type { WeeklySummaryResponse, PatternsResponse } from '../api';
import { WeeklySummaryTable } from '../components/WeeklySummaryTable';
import { PatternInsights } from '../components/PatternInsights';
import { SleepScoreChart } from '../components/SleepScoreChart';
import { StudyByCourseChart } from '../components/StudyByCourseChart';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummaryResponse[]>([]);
  const [patterns, setPatterns] = useState<PatternsResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);

    const results = await Promise.allSettled([
      analyticsApi.getWeeklySummaries(4),
      analyticsApi.getPatterns(),
    ]);

    if (results[0].status === 'fulfilled') {
      setWeeklySummaries(results[0].value);
    }
    if (results[1].status === 'fulfilled') {
      setPatterns(results[1].value);
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Patterns and insights from your data</p>
      </div>

      {/* Weekly summary table */}
      <WeeklySummaryTable data={weeklySummaries} isLoading={isLoading} />

      {/* Pattern insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PatternInsights
          weekdayAvg={patterns?.weekdayAvgScore ?? 0}
          weekendAvg={patterns?.weekendAvgScore ?? 0}
          isLoading={isLoading}
        />
        <SleepScoreChart
          data={patterns?.sleepScoreCorrelation ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Study hours by course */}
      <StudyByCourseChart
        data={patterns?.studyByCourse ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
