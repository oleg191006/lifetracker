/**
 * Service Worker — enables PWA features like offline caching and
 * "Add to Home Screen" on mobile devices.
 *
 * This is a minimal service worker that caches the app shell
 * (HTML, CSS, JS) for offline access. API calls still require
 * network connectivity.
 *
 * Service worker lifecycle:
 * 1. install  — downloads and caches the app shell
 * 2. activate — cleans up old caches from previous versions
 * 3. fetch    — intercepts network requests, serves from cache if available
 */

const CACHE_NAME = 'life-tracker-v1';

// Files to cache for offline use (the "app shell")
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install event: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch event: network-first strategy
// Try the network first; if it fails (offline), serve from cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/') || event.request.url.includes(':3000')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache the response for future offline use
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Network failed — try serving from cache
        return caches.match(event.request);
      })
  );
});
