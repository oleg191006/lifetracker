/**
 * LogPage — the daily quick-entry page.
 *
 * This is the page users interact with MOST — every day they log:
 * - Sleep (morning)
 * - Energy (multiple times)
 * - Learning (after study sessions)
 * - Daily score (evening)
 *
 * Design principles for daily-use UX:
 * 1. Tab persistence — remembers which tab was last active
 * 2. Mobile-first — large touch targets, no tiny buttons
 * 3. Instant feedback — toast notifications on save
 * 4. Smart defaults — date defaults to today, sensible presets
 * 5. Live previews — score/duration calculated in real time
 */
import React, { useState, useEffect } from 'react';
import { SleepForm } from '../components/SleepForm';
import { DailyForm } from '../components/DailyForm';
import { EnergyForm } from '../components/EnergyForm';
import { LearningForm } from '../components/LearningForm';
import { useToast } from '../components/Toast';

/**
 * Tab definitions — each tab has its own accent gradient for visual distinction.
 */
const tabs = [
  { id: 'sleep', label: 'Sleep', icon: '🌙' },
  { id: 'daily', label: 'Daily', icon: '📊' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'learning', label: 'Learning', icon: '📖' },
];

const TAB_STORAGE_KEY = 'life_tracker_active_tab';

export default function LogPage() {
  /**
   * Persist the active tab in localStorage.
   * When the user returns tomorrow, the same tab is pre-selected.
   */
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TAB_STORAGE_KEY) || 'sleep';
    }
    return 'sleep';
  });

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const { toast, showToast } = useToast();

  const handleSuccess = (message: string) => showToast(message, 'success');
  const handleError = (message: string) => showToast(message, 'error');

  return (
    <div className="space-y-5">
      {/* Toast notifications */}
      {toast}

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Entry</h1>
        <p className="text-gray-400 mt-1">Log your daily activities</p>
      </div>

      {/* Tab switcher — pill style with sliding indicator */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-base block">{tab.icon}</span>
            <span className="text-xs block mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form container */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        {activeTab === 'sleep' && (
          <SleepForm onSuccess={handleSuccess} onError={handleError} />
        )}
        {activeTab === 'daily' && (
          <DailyForm onSuccess={handleSuccess} onError={handleError} />
        )}
        {activeTab === 'energy' && (
          <EnergyForm onSuccess={handleSuccess} onError={handleError} />
        )}
        {activeTab === 'learning' && (
          <LearningForm onSuccess={handleSuccess} onError={handleError} />
        )}
      </div>
    </div>
  );
}
