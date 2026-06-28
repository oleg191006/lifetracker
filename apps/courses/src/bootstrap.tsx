/**
 * Bootstrap file for the Courses micro-frontend.
 *
 * This file is loaded asynchronously by index.ts (see the comment there
 * for why). It sets up:
 *   1. React 18's createRoot API for concurrent rendering
 *   2. AuthProvider from the shared package (provides auth context)
 *   3. BrowserRouter for client-side routing
 *   4. Tailwind CSS styles
 *
 * When this remote runs standalone (npm run dev), it renders the
 * CoursesPage inside its own router. When loaded by the host shell
 * via Module Federation, only the exposed CoursesPage component
 * is used — this bootstrap file is ignored.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@life-tracker/shared';
import CoursesPage from './pages/CoursesPage';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<CoursesPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
