/**
 * Bootstrap file — the ACTUAL entry point for the React application.
 *
 * Why separate bootstrap.tsx from index.ts?
 *
 * Module Federation requires an ASYNC boundary between the entry point
 * and the application code. This is because shared modules (React, etc.)
 * need to be negotiated between the host and remotes BEFORE any code
 * that uses them runs.
 *
 * The pattern is:
 *   index.ts → dynamic import('./bootstrap') → bootstrap.tsx → App
 *
 * Without this async boundary, you'd get errors like:
 *   "Shared module is not available for eager consumption"
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check your index.html has <div id="root">');
}

/**
 * createRoot is the React 18 way to mount a React app.
 * (The old way was ReactDOM.render())
 *
 * StrictMode enables extra development-only checks and warnings:
 * - Detects unexpected side effects
 * - Warns about deprecated API usage
 * - Double-invokes certain functions to find bugs
 */
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
