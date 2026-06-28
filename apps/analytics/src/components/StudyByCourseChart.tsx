/**
 * StudyByCourseChart — horizontal bar chart showing study hours per course.
 *
 * Uses Recharts BarChart with horizontal layout.
 * Provides a clear visual breakdown of where study time is being spent.
 */
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CourseStudy {
  courseName: string;
  totalMin: number;
}

interface Props {
  data: CourseStudy[];
  isLoading: boolean;
}

const COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#6d28d9', '#c084fc', '#9333ea'];

export function StudyByCourseChart({ data, isLoading }: Props) {
  // Convert minutes to hours for display
  const chartData = data.map((d) => ({
    name: d.courseName,
    hours: parseFloat((d.totalMin / 60).toFixed(1)),
  }));

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">Study Hours by Course</h3>
      <p className="text-sm text-gray-500 mb-4">Last 30 days</p>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-12">
          No study sessions logged yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(150, chartData.length * 50)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" unit="h" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 12, fill: '#374151' }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}h`, 'Study time']}
              contentStyle={{ borderRadius: 12, border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
            />
            <Bar dataKey="hours" radius={[0, 8, 8, 0]} barSize={28}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
