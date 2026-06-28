/**
 * Centralized HTTP API client.
 *
 * The base URL is resolved at BUILD TIME by webpack's DefinePlugin,
 * which replaces the string `process.env.API_URL` with the actual value
 * from the environment variable. This means:
 *
 *   Development (npm run dev):
 *     API_URL is not set → falls back to 'http://localhost:3000'
 *
 *   Production (Netlify build with API_URL=https://your-api.railway.app):
 *     DefinePlugin replaces the literal with the production URL.
 *
 * We keep the runtime `window.__API_URL__` fallback for cases where
 * DefinePlugin is not available (e.g. jest tests or direct Node usage).
 */

// DefinePlugin replaces `process.env.API_URL` with a string literal at build time.
// If it's not replaced (no DefinePlugin), fall back to the runtime window var,
// then to localhost for local development.
export const TOKEN_KEY = "access_token";

const API_BASE_URL: string = process.env.API_URL || "http://localhost:3000";

/** Generic HTTP response error with status code */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Core fetch wrapper.
 *
 * Automatically:
 * - Prepends API_BASE_URL to every path
 * - Attaches Bearer token from localStorage
 * - Parses JSON responses
 * - Throws ApiError on non-2xx responses
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {}
    throw new ApiError(message, response.status);
  }

  // 204 No Content — return undefined without trying to parse JSON
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/** Convenience methods */
export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/** Store / remove the JWT token in localStorage */
export const setToken = (token: string) =>
  localStorage.setItem("access_token", token);

export const removeToken = () => localStorage.removeItem("access_token");

export const getToken = () => localStorage.getItem("access_token");
