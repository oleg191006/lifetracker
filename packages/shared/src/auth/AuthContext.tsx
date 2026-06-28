/**
 * AuthContext — React Context for authentication state management.
 *
 * React Context provides a way to pass data through the component tree
 * without having to pass props down manually at every level (prop drilling).
 *
 * In a micro-frontend architecture, authentication is especially important
 * because EVERY micro-frontend needs to know:
 * 1. Is the user logged in?
 * 2. Who is the current user?
 * 3. How to log in / log out?
 *
 * This context is provided by the HOST app (shell) and consumed by
 * every remote micro-frontend.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { api, setToken, removeToken, getToken } from '../api/client';
import type { LoginRequest, LoginResponse, User } from '../types';

/**
 * Shape of the authentication context value.
 * Every consumer of useAuth() gets access to these properties and methods.
 */
interface AuthContextValue {
  /** The currently authenticated user, or null if not logged in */
  user: User | null;
  /** Whether we're currently checking the auth state (loading token, etc.) */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Log in with email and password */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Log out and clear the token */
  logout: () => void;
}

/**
 * Create the context with undefined as default.
 * We'll throw an error if someone tries to use it outside the provider.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component — wraps the app and provides auth state.
 *
 * Place this at the top of your component tree:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * On mount, check if there's a stored token and validate it.
   * This keeps the user logged in across page refreshes.
   */
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Validate the token by fetching the current user profile
      api
        .get<User>('/auth/me')
        .then(setUser)
        .catch(() => {
          // Token is invalid or expired — clean up
          removeToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login function — sends credentials to the API and stores the token.
   * useCallback prevents unnecessary re-renders of consuming components.
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    setToken(response.accessToken);

    // After login, fetch the user profile
    const currentUser = await api.get<User>('/auth/me');
    setUser(currentUser);
  }, []);

  /**
   * Logout function — clears the token and resets user state.
   */
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  // useMemo prevents the context value object from being recreated on
  // every render (which would cause all consumers to re-render too)
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook — convenient way to access auth context in any component.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *
 * Throws an error if used outside of AuthProvider to catch bugs early.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
