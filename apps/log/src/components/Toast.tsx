/**
 * Toast — lightweight notification component.
 *
 * Shows a brief message at the top of the screen that auto-dismisses.
 * Used to confirm successful submissions or show errors.
 *
 * Features a backdrop-blur glass effect with subtle icons.
 */
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles =
    type === 'success'
      ? 'bg-emerald-500 shadow-emerald-500/25'
      : 'bg-red-500 shadow-red-500/25';

  const icon =
    type === 'success' ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-xl flex items-center gap-2.5 transition-all duration-300 ${styles} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      {icon}
      {message}
    </div>
  );
}

/**
 * useToast hook — manages toast state.
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   {toast}  // Render this in JSX
 */
export function useToast() {
  const [toastData, setToastData] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToastData({ message, type });
  };

  const toast = toastData ? (
    <Toast
      message={toastData.message}
      type={toastData.type}
      onClose={() => setToastData(null)}
    />
  ) : null;

  return { toast, showToast };
}
