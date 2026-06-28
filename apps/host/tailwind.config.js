/**
 * Tailwind CSS configuration for the host shell.
 *
 * IMPORTANT: The host's CSS is the ONLY stylesheet loaded in production
 * (remote micro-frontends don't load their own CSS when consumed by the host).
 * Therefore, the `content` array must include ALL micro-frontend source files
 * so that every Tailwind class used anywhere in the app gets included.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    '../auth/src/**/*.{ts,tsx,js,jsx}',
    '../dashboard/src/**/*.{ts,tsx,js,jsx}',
    '../log/src/**/*.{ts,tsx,js,jsx}',
    '../courses/src/**/*.{ts,tsx,js,jsx}',
    '../analytics/src/**/*.{ts,tsx,js,jsx}',
    '../../packages/shared/src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
