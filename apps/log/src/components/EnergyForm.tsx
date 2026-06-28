/**
 * EnergyForm — the fastest form in the app.
 *
 * Just a single slider (1-10) and optional note.
 * Designed to be logged in under 5 seconds.
 */
import React, { useState, FormEvent, useMemo } from 'react';
import { energyApi } from '../api';

interface EnergyFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const levelLabels = [
  '', 'Exhausted', 'Very low', 'Low', 'Below avg',
  'Average', 'Above avg', 'Good', 'High', 'Very high', 'Peak',
];

export function EnergyForm({ onSuccess, onError }: EnergyFormProps) {
  const [level, setLevel] = useState(5);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Dynamic styling based on energy level */
  const levelStyle = useMemo(() => {
    if (level <= 3) return { bg: 'bg-red-50 border-red-100',   text: 'text-red-500',     label: 'text-red-400' };
    if (level <= 5) return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-500', label: 'text-amber-400' };
    if (level <= 7) return { bg: 'bg-blue-50 border-blue-100',  text: 'text-blue-500',   label: 'text-blue-400' };
    return               { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-500', label: 'text-emerald-400' };
  }, [level]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await energyApi.create({ level, note: note || undefined });
      onSuccess(`Energy logged: ${level}/10`);
      setNote('');
      setLevel(5);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to log energy');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Large energy level display */}
      <div className={`rounded-2xl p-8 text-center border transition-all duration-300 ${levelStyle.bg}`}>
        <p className={`text-6xl font-bold ${levelStyle.text}`}>{level}</p>
        <p className={`text-sm font-semibold mt-2 ${levelStyle.label}`}>{levelLabels[level]}</p>
      </div>

      {/* Slider */}
      <div className="px-1">
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
          <span>Low</span>
          <span>Medium</span>
          <span>Peak</span>
        </div>
      </div>

      {/* Quick-select buttons */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 3, 5, 7, 10].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              level === l
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="After lunch dip..."
          rows={2}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Log Energy'}
      </button>
    </form>
  );
}
