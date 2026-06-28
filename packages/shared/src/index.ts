/**
 * Barrel export file — re-exports everything from the shared package.
 *
 * Instead of importing from deep paths like:
 *   import { User } from '@life-tracker/shared/src/types'
 *
 * Consumers can import from the package root:
 *   import { User, useAuth, api } from '@life-tracker/shared'
 */
export * from './types';
export { api, getToken, setToken, removeToken, ApiError, TOKEN_KEY } from './api/client';
export { AuthProvider, useAuth } from './auth/AuthContext';
