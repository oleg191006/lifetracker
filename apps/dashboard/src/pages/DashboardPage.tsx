/**
 * DashboardPage — the main overview page of the Life Tracker.
 *
 * This is the first page users see after logging in. It provides
 * an at-a-glance summary of all tracked metrics:
 *
 * 1. Stat cards — today's score, last night's sleep, current energy, study hours
 * 2. Weekly score chart — bar chart of daily scores for the past week
 * 3. Recent sleep chart — horizontal bar chart of sleep durations
 *
 * Data is fetched from multiple API endpoints in parallel on mount.
 * We use Promise.allSettled (not Promise.all) so that a failure in
 * one request doesn't prevent the others from displaying.
 */
import React, { useState, useEffect } from 'react';
import type { SleepLog, DailyLog } from '@life-tracker/shared';
import { dashboardApi } from '../api';
import { StatCard } from '../components/StatCard';
import { WeeklyScoreChart } from '../components/WeeklyScoreChart';
import { SleepChart } from '../components/SleepChart';

/**
 * Helper to format minutes into a human-readable string.
 * 480 → "8h 0m", 395 → "6h 35m"
 */
function formatMinutes(min: number | null | undefined): string {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todayScore, setTodayScore] = useState<DailyLog | null>(null);
  const [latestSleep, setLatestSleep] = useState<SleepLog | null>(null);
  const [currentEnergy, setCurrentEnergy] = useState<number | null>(null);
  const [studyHours, setStudyHours] = useState<number>(0);
  const [weeklyLogs, setWeeklyLogs] = useState<DailyLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  /**
   * Load all dashboard data in parallel.
   *
   * Promise.allSettled runs all promises and returns results regardless
   * of whether individual promises succeed or fail. This is better than
   * Promise.all because we don't want a single failing endpoint to
   * break the entire dashboard.
   */
  async function loadDashboard() {
    setIsLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const results = await Promise.allSettled([
      dashboardApi.getTodayScore(),
      dashboardApi.getLatestSleep(),
      dashboardApi.getLatestEnergy(),
      dashboardApi.getStudyHours(),
      dashboardApi.getDailyLogs(twoWeeksAgo, today),
      dashboardApi.getSleepLogs(twoWeeksAgo, today),
    ]);

    if (results[0].status === 'fulfilled') setTodayScore(results[0].value);
    if (results[1].status === 'fulfilled') setLatestSleep(results[1].value);
    if (results[2].status === 'fulfilled' && results[2].value) {
      setCurrentEnergy(results[2].value.level);
    }
    if (results[3].status === 'fulfilled') setStudyHours(results[3].value);
    if (results[4].status === 'fulfilled') setWeeklyLogs(results[4].value);
    if (results[5].status === 'fulfilled') setSleepLogs(results[5].value);

    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
        <p className="text-gray-400 mt-1">Here's your daily overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Today's Score"
          value={todayScore ? `${todayScore.score}` : '—'}
          subtitle={
            todayScore ? `${todayScore.planPct}% planned done` : 'Not logged yet'
          }
          icon="🎯"
          gradient="bg-violet-50"
          isLoading={isLoading}
        />
        <StatCard
          label="Last Night"
          value={latestSleep ? formatMinutes(latestSleep.durationMin) : '—'}
          subtitle={latestSleep ? `Quality: ${latestSleep.quality}/5` : 'No data'}
          icon="🌙"
          gradient="bg-indigo-50"
          isLoading={isLoading}
        />
        <StatCard
          label="Energy Now"
          value={currentEnergy !== null ? `${currentEnergy}/10` : '—'}
          subtitle="Latest check-in"
          icon="⚡"
          gradient="bg-amber-50"
          isLoading={isLoading}
        />
        <StatCard
          label="Study Hours"
          value={`${studyHours}h`}
          subtitle="This week"
          icon="📚"
          gradient="bg-emerald-50"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyScoreChart logs={weeklyLogs} isLoading={isLoading} />
        <SleepChart logs={sleepLogs} isLoading={isLoading} />
      </div>

      {/* Prompt to log if no entry today */}
      {!isLoading && !todayScore && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-center shadow-lg shadow-violet-500/20">
          <p className="text-white font-semibold text-lg">
            You haven't logged today yet
          </p>
          <p className="text-white/70 text-sm mt-1">
            Head to the Log page to record your daily activities
          </p>
        </div>
      )}
    </div>
  );
}
