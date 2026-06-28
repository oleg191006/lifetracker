/**
 * LearningForm — capture learning insights and confusions.
 *
 * Follows the Feynman technique:
 * 1. Select the course you studied
 * 2. Write what you learned (forces understanding)
 * 3. Note what's still confusing (targets future study)
 * 4. Log how long you studied
 */
import React, { useState, useEffect, FormEvent } from 'react';
import { learningApi, coursesApi } from '../api';
import type { Course } from '@life-tracker/shared';

interface LearningFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/** Shared class for text/number inputs */
const inputCls =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all';

const textareaCls =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all resize-none';

export function LearningForm({ onSuccess, onError }: LearningFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [insight, setInsight] = useState('');
  const [confusion, setConfusion] = useState('');
  const [durationMin, setDurationMin] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch active courses on mount for the dropdown */
  useEffect(() => {
    coursesApi
      .getAll()
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setCourseId(data[0].id);
      })
      .catch(() => onError('Failed to load courses'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setIsSubmitting(true);
    try {
      await learningApi.create({
        courseId,
        insight,
        confusion: confusion || undefined,
        durationMin: durationMin || undefined,
      });
      onSuccess('Learning insight saved!');
      setInsight('');
      setConfusion('');
      setDurationMin('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-3">📚</span>
        <p className="text-gray-900 font-semibold">No courses yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Add a course first from the Courses page
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Course selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all appearance-none cursor-pointer"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* What did you learn? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What did you learn?
        </label>
        <textarea
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          placeholder="Explain it in your own words..."
          rows={3}
          required
          minLength={10}
          className={textareaCls}
        />
      </div>

      {/* Still confusing? */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What's still confusing?{' '}
          <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={confusion}
          onChange={(e) => setConfusion(e.target.value)}
          placeholder="Topics to revisit later..."
          rows={2}
          className={textareaCls}
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Study duration <span className="text-gray-400">(minutes)</span>
        </label>
        <input
          type="number"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value ? parseInt(e.target.value) : '')}
          placeholder="45"
          min={1}
          className={inputCls}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !insight.trim()}
        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Learning'}
      </button>
    </form>
  );
}
