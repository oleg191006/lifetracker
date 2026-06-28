/**
 * Layout component — the persistent shell that wraps every page.
 *
 * In a micro-frontend architecture, the Layout belongs to the HOST because:
 * 1. Navigation is consistent across all pages
 * 2. Auth state (user info, logout button) is displayed here
 * 3. Remote apps render INSIDE this layout, not alongside it
 *
 * The <Outlet /> component from React Router renders the matched
 * child route's component — which is the dynamically loaded remote.
 */
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@life-tracker/shared';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/log', label: 'Log', icon: '✏️' },
  { to: '/courses', label: 'Courses', icon: '📚' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    /*
     * Outer container: full viewport height, row on desktop / column on mobile.
     * We use `h-screen overflow-hidden` so the sidebar and content scroll
     * independently without the whole page scrolling.
     */
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Life Tracker
              </h1>
              <p className="text-xs text-gray-400">Personal productivity</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100 mt-4">
          <div className="flex items-center gap-2.5 mb-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 truncate min-w-0">
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile + Content wrapper ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="md:hidden bg-white border-b border-gray-100 shrink-0 z-30">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <span className="text-sm font-bold text-gray-900">Life Tracker</span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-4 rounded-xl transition-all duration-150 min-w-0 ${
                  isActive ? 'text-violet-600' : 'text-gray-400'
                }`
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
