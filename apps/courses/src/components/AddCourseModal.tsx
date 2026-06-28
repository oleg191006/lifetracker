/**
 * AddCourseModal — modal dialog for creating a new course.
 *
 * Uses a common modal pattern:
 * - A dark semi-transparent overlay covers the background
 * - The modal card is centered with `flex items-center justify-center`
 * - Clicking the overlay (outside the card) closes the modal
 * - Pressing Escape also closes it (keyboard accessibility)
 * - The name input is auto-focused when the modal opens
 */
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { coursesApi } from '../api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddCourseModal({ isOpen, onClose, onCreated }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [totalLessons, setTotalLessons] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(''); setTotalLessons(''); setDeadline(''); setError(null);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!totalLessons) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await coursesApi.create({ name, totalLessons: Number(totalLessons), deadline });
      setName(''); setTotalLessons(''); setDeadline('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    /* Fixed overlay — covers the full viewport */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card — centered, scrollable if content overflows */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Course</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Fill in the details to start tracking
            </p>
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

        {/* Form body */}
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
                Course name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React Mastery"
                required
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Total lessons
              </label>
              <input
                type="number"
                value={totalLessons}
                onChange={(e) => setTotalLessons(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="42"
                required
                min={1}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400 transition-all"
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
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
