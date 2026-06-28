/**
 * Toast — a small notification that appears at the top of the screen.
 *
 * Two parts live in this file:
 * 1. `Toast` component  — the visual element (success = green, error = red)
 * 2. `useToast` hook     — manages show/hide state so the parent
 *    doesn't have to track toast visibility manually.
 *
 * The toast auto-dismisses after `duration` ms. It animates out with
 * a fade + slide-up before actually unmounting (300 ms transition).
 */
import React, { useEffect, useState } from 'react';

// ─── Toast component props ──────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  /** How long the toast stays visible (default: 3 seconds) */
  duration?: number;
}

/**
 * Toast renders a fixed-position notification bar.
 *
 * Lifecycle:
 * 1. Mount → fully visible (opacity-100, translate-y-0)
 * 2. After `duration` ms → begin fade-out (opacity-0, -translate-y-2)
 * 3. 300 ms later → call `onClose` so parent can unmount us
 */
export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  // `isVisible` controls the CSS transition classes
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start the hide sequence after `duration` milliseconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for the CSS transition (300 ms) before unmounting
      setTimeout(onClose, 300);
    }, duration);

    // Cleanup: if the component unmounts early, cancel the timer
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 ${
        type === 'success'
          ? 'bg-white text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-white text-red-600 ring-1 ring-red-100'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      {type === 'success' ? (
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── useToast hook ──────────────────────────────────────────────────

/**
 * useToast — a convenience hook for adding toast notifications.
 *
 * Usage in a component:
 *   const { toast, showToast } = useToast();
 *
 *   // Render `{toast}` somewhere in your JSX (it's null when hidden).
 *   // Call `showToast('Saved!', 'success')` to display a message.
 *
 * Returns:
 * - `toast`      — a React element (or null) to render in JSX
 * - `showToast`  — function to trigger a new toast
 */
export function useToast() {
  const [toastData, setToastData] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  /** Show a toast notification. Defaults to 'success' type. */
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastData({ message, type });
  };

  // Build the toast element (or null if nothing to show)
  const toast = toastData ? (
    <Toast
      message={toastData.message}
      type={toastData.type}
      onClose={() => setToastData(null)}
    />
  ) : null;

  return { toast, showToast };
}
