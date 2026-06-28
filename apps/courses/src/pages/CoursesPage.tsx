/**
 * CoursesPage — the main courses management page.
 *
 * This is the root page of the Courses micro-frontend. It orchestrates
 * all the child components and manages the top-level state.
 *
 * Features:
 * - Lists all active courses with progress bars and stats (CourseCard)
 * - "Add Course" button opens a modal to create new courses
 * - "Log Progress" button on each card opens a modal to record study sessions
 * - "Archive" button hides completed courses from the active list
 * - Empty state with a call-to-action when no courses exist
 * - Toast notifications for success/error feedback
 *
 * Data flow:
 *   CoursesPage (state: courses[])
 *     ├── CourseCard × N (each fetches its own stats)
 *     ├── AddCourseModal (creates a course → triggers reload)
 *     └── LogProgressModal (logs a session → triggers reload)
 *
 * The `loadCourses` function is wrapped in useCallback so it can be
 * passed to useEffect without causing unnecessary re-renders.
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { Course } from '@life-tracker/shared';
import { coursesApi } from '../api';
import { CourseCard } from '../components/CourseCard';
import { AddCourseModal } from '../components/AddCourseModal';
import { LogProgressModal } from '../components/LogProgressModal';
import { useToast } from '../components/Toast';

export default function CoursesPage() {
  // ─── State ──────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  // `progressCourse` is set when the user clicks "Log Progress" on a card;
  // it doubles as the "isOpen" flag for LogProgressModal (null = closed)
  const [progressCourse, setProgressCourse] = useState<Course | null>(null);
  const { toast, showToast } = useToast();

  // ─── Data fetching ──────────────────────────────────────────────

  /**
   * Fetch all active courses from the API.
   * Wrapped in useCallback so it has a stable identity — this prevents
   * the useEffect below from running on every render.
   */
  const loadCourses = useCallback(async () => {
    try {
      const data = await coursesApi.getAll();
      setCourses(data);
    } catch {
      showToast('Failed to load courses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch courses once on mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // ─── Handlers ───────────────────────────────────────────────────

  /**
   * Archive a course by setting its `isActive` flag to false.
   * This doesn't delete the course — it just hides it from the active list.
   * The user can potentially view archived courses in a future "Archive" tab.
   */
  async function handleArchive(courseId: string) {
    try {
      await coursesApi.update(courseId, { isActive: false });
      showToast('Course archived', 'success');
      loadCourses(); // Refresh the list to remove the archived course
    } catch {
      showToast('Failed to archive course', 'error');
    }
  }

  // ─── Loading state ──────────────────────────────────────────────
  // Show skeleton loaders while the initial data fetch is in progress
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-100 rounded-lg w-32 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-lg w-48 animate-pulse mt-2" />
          </div>
          <div className="h-10 bg-gray-100 rounded-xl w-28 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-5 bg-gray-100 rounded-lg w-40 animate-pulse mb-2" />
              <div className="h-3 bg-gray-100 rounded-lg w-32 animate-pulse mb-4" />
              <div className="h-2.5 bg-gray-100 rounded-full animate-pulse mb-4" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
              <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast notifications (rendered at top of viewport via fixed positioning) */}
      {toast}

      {/* ── Page header with "Add Course" button ─────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-1">Track your learning journey</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all"
        >
          + Add Course
        </button>
      </div>

      {/* ── Course list or empty state ───────────────────────────── */}
      {courses.length === 0 ? (
        /**
         * Empty state — shown when the user has no active courses.
         * Includes a prominent call-to-action button so the user knows
         * exactly what to do next.
         */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-gray-900 font-semibold text-lg">No courses yet</p>
          <p className="text-gray-500 mt-1 mb-6">
            Start tracking your first course
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all"
          >
            Add Your First Course
          </button>
        </div>
      ) : (
        /**
         * Course grid — responsive layout:
         * - Mobile (< md): single column
         * - Desktop (≥ md): two columns
         */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onLogProgress={(c) => setProgressCourse(c)}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* ── Modals (rendered but hidden when not open) ────────────── */}

      {/* Add Course modal — controlled by `showAddModal` state */}
      <AddCourseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          showToast('Course created!', 'success');
          loadCourses(); // Refresh the list to include the new course
        }}
      />

      {/* Log Progress modal — controlled by `progressCourse` state */}
      <LogProgressModal
        isOpen={!!progressCourse}
        course={progressCourse}
        onClose={() => setProgressCourse(null)}
        onLogged={() => {
          showToast('Progress logged!', 'success');
          loadCourses(); // Refresh to update progress bars and stats
        }}
      />
    </div>
  );
}
