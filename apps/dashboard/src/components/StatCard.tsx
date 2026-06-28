/**
 * StatCard — a reusable card component for displaying a single metric.
 *
 * Used on the dashboard to show at-a-glance stats like:
 * - Today's score
 * - Last night's sleep duration
 * - Current energy level
 * - Study hours this week
 *
 * Each card features a gradient icon badge and clean typography.
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
  /** Gradient colors for the icon badge */
  gradient: string;
  /** Whether data is still loading */
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  gradient,
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`text-lg w-10 h-10 rounded-xl flex items-center justify-center ${gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded-lg w-20 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}
