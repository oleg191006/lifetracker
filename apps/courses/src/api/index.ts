/**
 * API functions for the Courses micro-frontend.
 * Wraps the shared API client with course-specific endpoints.
 *
 * Each function maps to a REST endpoint on the backend:
 *   GET    /courses              — list courses (optionally filter active)
 *   GET    /courses/:id          — get one course by ID
 *   POST   /courses              — create a new course
 *   PATCH  /courses/:id          — update course fields (name, deadline, isActive)
 *   DELETE /courses/:id          — permanently delete a course
 *   POST   /courses/:id/progress — log a study session for a course
 *   GET    /courses/:id/stats    — get computed stats (pace, remaining, etc.)
 *   GET    /courses/study-hours  — get total study hours across all courses
 */
import { api } from '@life-tracker/shared';
import type {
  Course,
  CreateCourseRequest,
  CourseProgress,
  CreateCourseProgressRequest,
  CourseStats,
} from '@life-tracker/shared';

/**
 * coursesApi — object containing all API calls for this micro-frontend.
 *
 * Why an object literal instead of individual exports?
 * → Grouping related calls together makes it easy to mock
 *   the whole API layer in tests and keeps imports tidy.
 */
export const coursesApi = {
  /** Fetch all courses. Pass `false` to include archived ones. */
  getAll: (activeOnly = true) =>
    api.get<Course[]>(`/courses?active=${activeOnly}`),

  /** Fetch a single course by its UUID. */
  getOne: (id: string) =>
    api.get<Course>(`/courses/${id}`),

  /** Create a new course (name, totalLessons, deadline). */
  create: (data: CreateCourseRequest) =>
    api.post<Course>('/courses', data),

  /**
   * Partially update a course.
   * Accepts any combination of CreateCourseRequest fields + isActive flag.
   * PATCH semantics: only the provided fields are changed on the server.
   */
  update: (id: string, data: Partial<CreateCourseRequest & { isActive: boolean }>) =>
    api.patch<Course>(`/courses/${id}`, data),

  /** Permanently delete a course and all its progress records. */
  remove: (id: string) =>
    api.delete<void>(`/courses/${id}`),

  /**
   * Log a study session for a specific course.
   * The request body includes: date, lessonsFrom, lessonsTo,
   * optional durationMin, and optional note.
   */
  logProgress: (courseId: string, data: CreateCourseProgressRequest) =>
    api.post<CourseProgress>(`/courses/${courseId}/progress`, data),

  /**
   * Fetch computed statistics for a course:
   * - currentLesson, remainingLessons
   * - daysToDeadline, requiredLessonsPerDay
   * - totalDurationMin (total study time)
   */
  getStats: (courseId: string) =>
    api.get<CourseStats>(`/courses/${courseId}/stats`),

  /** Get the total study hours across ALL courses (for dashboard widgets). */
  getStudyHours: () =>
    api.get<number>('/courses/study-hours'),
};
