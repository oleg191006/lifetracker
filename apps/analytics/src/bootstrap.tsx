/**
 * Bootstrap file for the Analytics micro-frontend.
 *
 * This file is loaded asynchronously by index.ts (see the comment there
 * for why). It sets up:
 *   1. React 18's createRoot API for concurrent rendering
 *   2. AuthProvider from the shared package (provides auth context)
 *   3. BrowserRouter for client-side routing
 *   4. Tailwind CSS styles
 *
 * When this remote runs standalone (npm run dev), it renders the
 * AnalyticsPage inside its own router. When loaded by the host shell
 * via Module Federation, only the exposed AnalyticsPage component
 * is used — this bootstrap file is ignored.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@life-tracker/shared';
import AnalyticsPage from './pages/AnalyticsPage';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
