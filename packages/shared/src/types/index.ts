/**
 * Shared TypeScript types used across all micro-frontends and the API.
 *
 * Centralizing types in a shared package ensures consistency:
 * - If the API changes a response shape, we update it in ONE place
 * - All micro-frontends get type-safety against the same contract
 * - No risk of type definitions drifting out of sync
 */

// ── User ────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// ── Auth ────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// ── Sleep ───────────────────────────────────────────────────────
export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  durationMin: number;
  quality: number; // 1-5
  note: string | null;
  createdAt: string;
}

export interface CreateSleepLogRequest {
  date: string;
  bedTime: string;
  wakeTime: string;
  quality: number;
  note?: string;
}

export interface SleepStats {
  avgDuration: number;
  avgQuality: number;
}

// ── Daily ───────────────────────────────────────────────────────
export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  planPct: number;   // 0-100
  focus: number;     // 1-3
  energy: number;    // 1-2
  score: number;     // Calculated: max 10
  note: string | null;
  createdAt: string;
}

export interface CreateDailyLogRequest {
  date: string;
  planPct: number;
  focus: number;
  energy: number;
  note?: string;
}

export interface DailyStats {
  avgScore: number;
  avgPlanPct: number;
  weekdayAvg: number;
  weekendAvg: number;
}

// ── Energy ──────────────────────────────────────────────────────
export interface EnergyCheck {
  id: string;
  userId: string;
  checkedAt: string;
  level: number; // 1-10
  note: string | null;
}

export interface CreateEnergyCheckRequest {
  level: number;
  note?: string;
}

export interface EnergyPeak {
  hour: number;
  avgLevel: number;
}

// ── Courses ─────────────────────────────────────────────────────
export interface Course {
  id: string;
  userId: string;
  name: string;
  totalLessons: number;
  deadline: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCourseRequest {
  name: string;
  totalLessons: number;
  deadline: string;
}

export interface CourseProgress {
  id: string;
  courseId: string;
  date: string;
  lessonsFrom: number;
  lessonsTo: number;
  durationMin: number | null;
  note: string | null;
  createdAt: string;
}

export interface CreateCourseProgressRequest {
  date: string;
  lessonsFrom: number;
  lessonsTo: number;
  durationMin?: number;
  note?: string;
}

export interface CourseStats {
  currentLesson: number;
  remainingLessons: number;
  daysToDeadline: number;
  requiredLessonsPerDay: number;
  totalDurationMin: number;
}

// ── Learning ────────────────────────────────────────────────────
export interface LearningLog {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  insight: string;
  confusion: string | null;
  durationMin: number | null;
  createdAt: string;
}

export interface CreateLearningLogRequest {
  courseId: string;
  insight: string;
  confusion?: string;
  durationMin?: number;
}

// ── Analytics ───────────────────────────────────────────────────
export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  avgScore: number;
  avgSleepDuration: number;
  avgSleepQuality: number;
  avgEnergyLevel: number;
  totalStudyHours: number;
  entriesCount: number;
}

export interface PatternInsights {
  weekdayAvgScore: number;
  weekendAvgScore: number;
  sleepScoreCorrelation: number;
}
