/**
 * Bootstrap for the auth remote — used for standalone development.
 *
 * When developing the auth remote independently (not loaded by the host),
 * this file mounts the LoginPage directly with its own AuthProvider.
 *
 * In production (or when loaded by the host via Module Federation),
 * this file is NOT used — the host imports LoginPage directly.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@life-tracker/shared';
import LoginPage from './pages/LoginPage';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
