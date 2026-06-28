/**
 * API functions for the Log micro-frontend.
 *
 * These functions wrap the shared API client with the correct
 * TypeScript types. Each function corresponds to one API endpoint.
 *
 * Using a centralized API layer (instead of inline fetch calls)
 * makes it easy to:
 * 1. See all API calls this micro-frontend makes
 * 2. Refactor endpoints in one place
 * 3. Add type safety to request/response shapes
 */
import { api } from '@life-tracker/shared';
import type {
  SleepLog,
  CreateSleepLogRequest,
  DailyLog,
  CreateDailyLogRequest,
  EnergyCheck,
  CreateEnergyCheckRequest,
  LearningLog,
  CreateLearningLogRequest,
  Course,
} from '@life-tracker/shared';

// ── Sleep API ─────────────────────────────────────────────────
export const sleepApi = {
  create: (data: CreateSleepLogRequest) =>
    api.post<SleepLog>('/sleep', data),
};

// ── Daily API ─────────────────────────────────────────────────
export const dailyApi = {
  upsert: (data: CreateDailyLogRequest) =>
    api.post<DailyLog>('/daily', data),

  getToday: () =>
    api.get<DailyLog | null>('/daily/today'),
};

// ── Energy API ────────────────────────────────────────────────
export const energyApi = {
  create: (data: CreateEnergyCheckRequest) =>
    api.post<EnergyCheck>('/energy', data),
};

// ── Learning API ──────────────────────────────────────────────
export const learningApi = {
  create: (data: CreateLearningLogRequest) =>
    api.post<LearningLog>('/learning', data),
};

// ── Courses API (read-only — for the course selector) ─────────
export const coursesApi = {
  getAll: () => api.get<Course[]>('/courses'),
};
