/**
 * API functions for the Analytics micro-frontend.
 * Fetches aggregated data from the analytics backend module.
 */
import { api } from '@life-tracker/shared';

export interface WeeklySummaryResponse {
  weekStart: string;
  weekEnd: string;
  avgScore: number;
  avgSleepDuration: number;
  avgSleepQuality: number;
  avgEnergyLevel: number;
  totalStudyMin: number;
  daysLogged: number;
}

export interface PatternsResponse {
  weekdayAvgScore: number;
  weekendAvgScore: number;
  sleepScoreCorrelation: Array<{
    sleepHours: number;
    score: number;
    date: string;
  }>;
  studyByCourse: Array<{
    courseName: string;
    totalMin: number;
  }>;
}

export const analyticsApi = {
  getWeeklySummaries: (weeks = 4) =>
    api.get<WeeklySummaryResponse[]>(`/analytics/weekly?weeks=${weeks}`),

  getPatterns: () =>
    api.get<PatternsResponse>('/analytics/patterns'),
};
