/**
 * LoginPage — the authentication page for the Life Tracker app.
 *
 * This component is EXPOSED via Module Federation, meaning:
 * - It's defined here in the auth remote
 * - The host shell loads it dynamically via import('auth/LoginPage')
 * - It calls the API directly and stores the JWT token
 *
 * The page features:
 * - A full-screen gradient background with a floating glass card
 * - Email + password form with validation
 * - Error message display
 * - Loading state during authentication
 * - Responsive design (mobile-first with Tailwind)
 */
import React, { useState, FormEvent } from 'react';
import { api, setToken } from '@life-tracker/shared';

/**
 * Default export is required for Module Federation.
 * The host imports it as: const LoginPage = lazy(() => import('auth/LoginPage'))
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission.
   *
   * We call the API directly here rather than using useAuth() because
   * AuthContext lives in the host shell and React Context cannot cross
   * Module Federation bundle boundaries (each bundle gets its own context
   * instance). Instead, we:
   * 1. POST credentials to the API ourselves
   * 2. Store the JWT in localStorage via setToken()
   * 3. Navigate to "/" — the host's AuthProvider detects the stored token
   *    on re-render and marks the user as authenticated, which shows the
   *    dashboard via ProtectedRoute.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post<{ accessToken: string }>('/auth/login', {
        email,
        password,
      });
      setToken(response.accessToken);
      window.location.href = '/';
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-5 border border-white/20">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Life Tracker</h1>
          <p className="text-white/60 mt-1.5 text-sm">
            Track your sleep, energy, and progress
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Welcome back
          </h2>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm flex items-start gap-2.5">
              <span className="text-red-400 mt-0.5 shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lifetracker.dev"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          Single-user app — use your admin credentials
        </p>
      </div>
    </div>
  );
}
