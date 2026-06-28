/**
 * API functions for the Dashboard micro-frontend.
 *
 * The dashboard aggregates data from multiple backend modules,
 * so we call endpoints from sleep, daily, energy, and courses.
 * Each function returns typed data for safe consumption in components.
 */
import { api } from '@life-tracker/shared';
import type {
  SleepLog,
  SleepStats,
  DailyLog,
  DailyStats,
  EnergyCheck,
  EnergyPeak,
  Course,
} from '@life-tracker/shared';

export const dashboardApi = {
  // Sleep data for the dashboard
  getLatestSleep: () => api.get<SleepLog | null>('/sleep/latest'),
  getSleepLogs: (from: string, to: string) =>
    api.get<SleepLog[]>(`/sleep?from=${from}&to=${to}`),
  getSleepStats: (weeks = 2) =>
    api.get<SleepStats & { totalEntries: number }>(`/sleep/stats?weeks=${weeks}`),

  // Daily productivity
  getTodayScore: () => api.get<DailyLog | null>('/daily/today'),
  getDailyLogs: (from: string, to: string) =>
    api.get<DailyLog[]>(`/daily?from=${from}&to=${to}`),
  getDailyStats: (weeks = 2) =>
    api.get<DailyStats & { totalEntries: number }>(`/daily/stats?weeks=${weeks}`),

  // Energy
  getLatestEnergy: () => api.get<EnergyCheck | null>('/energy/latest'),
  getEnergyPeaks: (days = 14) =>
    api.get<EnergyPeak[]>(`/energy/peak?days=${days}`),

  // Courses
  getCourses: () => api.get<Course[]>('/courses'),
  getStudyHours: () => api.get<number>('/courses/study-hours'),
};
