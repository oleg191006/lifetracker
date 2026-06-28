/**
 * Entry point for the Log micro-frontend.
 *
 * Why a dynamic import?
 * Module Federation needs all shared dependencies (React, React-DOM, etc.)
 * to be resolved before any component code runs. By using a dynamic
 * import() here, webpack can negotiate shared modules first, then load
 * bootstrap.tsx only after everything is ready. Without this indirection,
 * you would get "Shared module is not available for eager consumption"
 * errors at runtime.
 */
import('./bootstrap');
