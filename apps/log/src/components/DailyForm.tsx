/**
 * DailyForm — daily productivity assessment.
 *
 * Three quick inputs that produce a composite score (max 10):
 *   score = (planPct / 100) * 5 + focus + energy
 *
 * The form shows a LIVE score preview that updates as you adjust
 * the sliders, giving instant feedback.
 *
 * Uses an upsert API — submitting for the same date updates
 * the existing entry rather than creating a duplicate.
 */
import React, { useState, useMemo, FormEvent } from 'react';
import { dailyApi } from '../api';

interface DailyFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const focusLevels = [
  { value: 1, label: 'Low', emoji: '😔' },
  { value: 2, label: 'Medium', emoji: '😐' },
  { value: 3, label: 'High', emoji: '🎯' },
];

const energyLevels = [
  { value: 1, label: 'Drained', emoji: '🔋' },
  { value: 2, label: 'Still going', emoji: '⚡' },
];

export function DailyForm({ onSuccess, onError }: DailyFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [planPct, setPlanPct] = useState(70);
  const [focus, setFocus] = useState(2);
  const [energy, setEnergy] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Live score calculation — matches server-side formula in daily-log.entity.ts.
   */
  const score = useMemo(
    () => parseFloat(((planPct / 100) * 5 + focus + energy).toFixed(2)),
    [planPct, focus, energy],
  );

  const scoreColor = useMemo(() => {
    if (score >= 7) return 'text-emerald-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-500';
  }, [score]);

  const scoreBg = useMemo(() => {
    if (score >= 7) return 'bg-emerald-50 border-emerald-100';
    if (score >= 4) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  }, [score]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dailyApi.upsert({ date, planPct, focus, energy, note: note || undefined });
      onSuccess(`Day scored: ${score}/10`);
      setNote('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to log daily');
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
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
        />
      </div>

      {/* Plan completion slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Plan completed</label>
          <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-lg">
            {planPct}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={planPct}
          onChange={(e) => setPlanPct(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Focus level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2.5">Focus level</label>
        <div className="grid grid-cols-3 gap-2">
          {focusLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFocus(level.value)}
              className={`py-3 px-2 rounded-xl text-center transition-all duration-200 ${
                focus === level.value
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl block">{level.emoji}</span>
              <span className="text-xs font-medium block mt-1">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* End-of-day energy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2.5">
          End-of-day energy
        </label>
        <div className="grid grid-cols-2 gap-3">
          {energyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setEnergy(level.value)}
              className={`py-3 px-4 rounded-xl text-center transition-all duration-200 ${
                energy === level.value
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl block">{level.emoji}</span>
              <span className="text-xs font-medium block mt-1">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live score preview */}
      <div className={`rounded-2xl p-5 text-center border transition-all duration-300 ${scoreBg}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Today's score
        </p>
        <p className={`text-4xl font-bold mt-1 ${scoreColor}`}>{score}</p>
        <p className="text-xs text-gray-400 mt-1">out of 10</p>
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What went well? What could improve?"
          rows={2}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Log Day'}
      </button>
    </form>
  );
}
