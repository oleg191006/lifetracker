/**
 * CourseCard — displays a single course with progress bar and stats.
 *
 * This is the main visual element on the Courses page. Each card shows:
 *
 * ┌─────────────────────────────────┐
 * │ Course Name            [Badge]  │  ← name + overdue/urgent badge
 * │ Deadline: Jan 15, 2026          │
 * │                                 │
 * │ Lesson 12 / 42           28%    │  ← progress text
 * │ ████████░░░░░░░░░░░░░░░░░░░░░░ │  ← progress bar
 * │                                 │
 * │ ┌─────────┬─────────┬─────────┐ │
 * │ │Remaining│Days left│  Pace   │ │  ← stats grid
 * │ │30 lesson│  45     │ 0.7/day │ │
 * │ └─────────┴─────────┴─────────┘ │
 * │                                 │
 * │ [  Log Progress  ] [ Archive ]  │  ← action buttons
 * └─────────────────────────────────┘
 *
 * The card fetches its own stats via `coursesApi.getStats()` on mount.
 * This keeps the parent component simple — it only passes the Course object.
 */
import React, { useEffect, useState } from 'react';
import { coursesApi } from '../api';
import type { Course, CourseStats } from '@life-tracker/shared';

// ─── Props ──────────────────────────────────────────────────────────
interface CourseCardProps {
  /** The course data to display */
  course: Course;
  /** Called when user clicks "Log Progress" — parent opens the modal */
  onLogProgress: (course: Course) => void;
  /** Called when user clicks "Archive" — parent sends the update */
  onArchive: (courseId: string) => void;
}

export function CourseCard({ course, onLogProgress, onArchive }: CourseCardProps) {
  /**
   * Stats are fetched per-card because they're computed on the server
   * (current lesson, days remaining, required pace, etc.)
   * The `& { totalDurationMin: number }` extends CourseStats with
   * an additional field the API may return.
   */
  const [stats, setStats] = useState<CourseStats | null>(null);

  // Fetch stats when the card mounts or the course ID changes
  useEffect(() => {
    coursesApi.getStats(course.id).then(setStats).catch(() => {});
  }, [course.id]);

  // ─── Derived values ─────────────────────────────────────────────

  // Calculate percentage complete (capped at 100%)
  const progressPct = stats
    ? Math.min(100, Math.round((stats.currentLesson / course.totalLessons) * 100))
    : 0;

  // Determine urgency flags for visual indicators
  const isOverdue = stats ? stats.daysToDeadline <= 0 && stats.remainingLessons > 0 : false;
  const isUrgent = stats ? stats.daysToDeadline <= 7 && stats.daysToDeadline > 0 : false;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* ── Header: course name, deadline, and urgency badge ─────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Deadline: {new Date(course.deadline).toLocaleDateString()}
          </p>
        </div>
        {/* Show a red "Overdue" badge if past deadline with remaining lessons */}
        {isOverdue && (
          <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
            Overdue
          </span>
        )}
        {/* Show an amber badge if deadline is within 7 days */}
        {isUrgent && !isOverdue && (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold">
            {stats?.daysToDeadline}d left
          </span>
        )}
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div className="mb-4">
        {/* Text above the bar: "Lesson 12 / 42" on left, "28%" on right */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            Lesson {stats?.currentLesson ?? 0} / {course.totalLessons}
          </span>
          <span className="font-semibold text-gray-900">{progressPct}%</span>
        </div>
        {/* The bar itself: a gray track with a gradient fill */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 100
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : isOverdue
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : 'bg-gradient-to-r from-violet-500 to-purple-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Stats grid: three key metrics in a row ───────────────── */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="text-center p-2.5 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
            <p className="text-sm font-bold text-gray-900">
              {stats.remainingLessons} lessons
            </p>
          </div>
          <div className="text-center p-2.5 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 mb-0.5">Days left</p>
            <p className="text-sm font-bold text-gray-900">
              {stats.daysToDeadline}
            </p>
          </div>
          <div className="text-center p-2.5 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 mb-0.5">Pace needed</p>
            <p className="text-sm font-bold text-gray-900">
              {stats.requiredLessonsPerDay}/day
            </p>
          </div>
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────────────── */}
      <div className="flex gap-2">
        {/* Primary action: log a study session */}
        <button
          onClick={() => onLogProgress(course)}
          className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all"
        >
          Log Progress
        </button>
        {/* Secondary action: archive (hide from active list) */}
        <button
          onClick={() => onArchive(course.id)}
          className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-100 transition-colors"
        >
          Archive
        </button>
      </div>
    </div>
  );
}
