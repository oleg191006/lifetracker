/**
 * App component — the root of the host shell.
 *
 * This is where we set up:
 * 1. AuthProvider — wraps everything with authentication context
 * 2. React Router — defines which URLs load which micro-frontends
 * 3. Lazy loading — remote modules are loaded on-demand via React.lazy()
 *
 * The routing structure:
 *   /login          → Auth remote (no layout wrapper)
 *   /               → Dashboard remote (inside Layout)
 *   /log            → Log remote (inside Layout)
 *   /courses        → Courses remote (inside Layout)
 *   /analytics      → Analytics remote (inside Layout)
 */
import React, { lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@life-tracker/shared';
import { Layout } from './components/Layout';
import { RemoteLoader } from './components/RemoteLoader';

/**
 * React.lazy() + Module Federation dynamic imports.
 *
 * Each import('remoteName/Component') fetches the remote's entry file
 * at runtime. The first time a user visits /courses, for example,
 * the courses remote is downloaded and rendered.
 *
 * This means users only download the code they actually need!
 */
const LoginPage = lazy(() => import('auth/LoginPage'));
const DashboardPage = lazy(() => import('dashboard/DashboardPage'));
const LogPage = lazy(() => import('log/LogPage'));
const CoursesPage = lazy(() => import('courses/CoursesPage'));
const AnalyticsPage = lazy(() => import('analytics/AnalyticsPage'));

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Shows a loading spinner while auth state is being determined.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute — redirects authenticated users away from login.
 * If you're already logged in, no need to see the login page.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route: Login page (from auth remote) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <RemoteLoader>
                  <LoginPage />
                </RemoteLoader>
              </PublicRoute>
            }
          />

          {/* Protected routes: wrapped in Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <RemoteLoader>
                  <DashboardPage />
                </RemoteLoader>
              }
            />
            <Route
              path="/log"
              element={
                <RemoteLoader>
                  <LogPage />
                </RemoteLoader>
              }
            />
            <Route
              path="/courses"
              element={
                <RemoteLoader>
                  <CoursesPage />
                </RemoteLoader>
              }
            />
            <Route
              path="/analytics"
              element={
                <RemoteLoader>
                  <AnalyticsPage />
                </RemoteLoader>
              }
            />
          </Route>

          {/* Catch-all: redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
