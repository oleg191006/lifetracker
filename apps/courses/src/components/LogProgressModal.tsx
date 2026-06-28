/**
 * LogProgressModal — quick form to log a study session for a course.
 *
 * Records which lessons were completed (from → to) and how long
 * the study session lasted. This is the primary way users update
 * their course progress.
 */
import React, { useState, FormEvent, useEffect } from 'react';
import { coursesApi } from '../api';
import type { Course } from '@life-tracker/shared';

interface LogProgressModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onLogged: () => void;
}

export function LogProgressModal({ isOpen, course, onClose, onLogged }: LogProgressModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [lessonsFrom, setLessonsFrom] = useState<number | ''>('');
  const [lessonsTo, setLessonsTo] = useState<number | ''>('');
  const [durationMin, setDurationMin] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(today); setLessonsFrom(''); setLessonsTo('');
      setDurationMin(''); setNote(''); setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lessonsFrom || !lessonsTo || !course) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await coursesApi.logProgress(course.id, {
        date,
        lessonsFrom: Number(lessonsFrom),
        lessonsTo: Number(lessonsTo),
        durationMin: durationMin ? Number(durationMin) : undefined,
        note: note || undefined,
      });
      onLogged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log progress');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls = "w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Log Progress</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{course.name}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From lesson
                </label>
                <input
                  type="number"
                  value={lessonsFrom}
                  onChange={(e) => setLessonsFrom(e.target.value ? parseInt(e.target.value) : '')}
                  min={1}
                  max={course.totalLessons}
                  placeholder="1"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  To lesson
                </label>
                <input
                  type="number"
                  value={lessonsTo}
                  onChange={(e) => setLessonsTo(e.target.value ? parseInt(e.target.value) : '')}
                  min={lessonsFrom || 1}
                  max={course.totalLessons}
                  placeholder={String(course.totalLessons)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration <span className="text-gray-400">(minutes, optional)</span>
              </label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value ? parseInt(e.target.value) : '')}
                min={1}
                placeholder="45"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="What did you cover?"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !lessonsFrom || !lessonsTo}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Log Progress'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
