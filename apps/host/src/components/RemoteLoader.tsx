/**
 * RemoteLoader — a wrapper component that handles the loading and error
 * states when fetching a remote micro-frontend module.
 *
 * React.lazy() + Suspense is the standard pattern for code splitting,
 * but with Module Federation we also need to handle:
 * - Network errors (remote server is down)
 * - Module loading failures
 * - Graceful fallback UI
 *
 * This component wraps React.lazy() with an ErrorBoundary for robustness.
 */
import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';

/**
 * Loading spinner shown while a remote module is being fetched.
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 border-[3px] border-gray-200 rounded-full" />
          <div className="w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Error boundary — catches JavaScript errors in child components.
 *
 * React class components can implement componentDidCatch() to catch
 * errors during rendering. Function components can't do this yet
 * (as of React 18), so we use a class component here.
 */
interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Remote module failed to load:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-sm">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-gray-900 font-semibold mb-1">
                Failed to load module
              </p>
              <p className="text-sm text-gray-500 mb-5">
                {this.state.error?.message || 'Something went wrong'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * RemoteLoader — combines Suspense (for loading) with ErrorBoundary (for errors).
 *
 * Usage:
 *   const RemoteDashboard = React.lazy(() => import('dashboard/DashboardPage'));
 *   <RemoteLoader><RemoteDashboard /></RemoteLoader>
 */
export function RemoteLoader({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
