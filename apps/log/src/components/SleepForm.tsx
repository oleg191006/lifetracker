/**
 * SleepForm — quick entry form for logging sleep data.
 *
 * Designed for speed:
 * - Date defaults to today
 * - Time inputs use native time pickers (great on mobile)
 * - Quality uses a visual 1-5 selector with emojis
 * - Auto-calculates and shows estimated duration
 */
import React, { useState, useMemo, FormEvent } from 'react';
import { sleepApi } from '../api';

interface SleepFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const qualityLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
const qualityEmojis = ['', '😫', '😕', '😐', '🙂', '😴'];

/** Shared class for every text/date/time input in this form */
const inputCls =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all';

export function SleepForm({ onSuccess, onError }: SleepFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [bedTime, setBedTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Calculate estimated sleep duration from bed/wake times.
   * useMemo prevents recalculation on every render — only recalculates
   * when bedTime or wakeTime actually change.
   */
  const estimatedDuration = useMemo(() => {
    if (!bedTime || !wakeTime) return null;
    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let bedMin = bedH * 60 + bedM;
    let wakeMin = wakeH * 60 + wakeM;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    const total = wakeMin - bedMin;
    return { hours: Math.floor(total / 60), minutes: total % 60, totalMinutes: total };
  }, [bedTime, wakeTime]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bedDateTime = new Date(`${date}T${bedTime}:00`);
      const wakeDateTime = new Date(`${date}T${wakeTime}:00`);
      if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
      }
      await sleepApi.create({
        date,
        bedTime: bedDateTime.toISOString(),
        wakeTime: wakeDateTime.toISOString(),
        quality,
        note: note || undefined,
      });
      onSuccess(`Sleep logged: ${estimatedDuration?.hours}h ${estimatedDuration?.minutes}m`);
      setDate(today);
      setNote('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to log sleep');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      {/* Bed / Wake time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bed time</label>
          <input
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Wake time</label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      {/* Duration preview */}
      {estimatedDuration && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Estimated sleep
          </p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">
            {estimatedDuration.hours}h {estimatedDuration.minutes}m
          </p>
        </div>
      )}

      {/* Quality selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2.5">Sleep quality</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(q)}
              className={`flex-1 py-3 rounded-xl text-center transition-all duration-200 ${
                quality === q
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg block">{qualityEmojis[q]}</span>
              <span className="text-[10px] block mt-0.5 font-medium">{qualityLabels[q]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Woke up once during the night..."
          rows={2}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Log Sleep'}
      </button>
    </form>
  );
}
