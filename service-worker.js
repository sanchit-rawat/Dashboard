/**
 * AESTHETIC DASHBOARD — service-worker.js
 * Caches all core files so the dashboard works offline
 * and loads instantly every time.
 */

// ─── CACHE CONFIG ─────────────────────────────────────────
// Change the version string whenever you update your files
// so the old cache gets replaced automatically
const CACHE_NAME    = 'aesthetic-dashboard-v1';
const CACHE_VERSION = 'v1';

// All files to cache on install
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './pwa-manifest.json',
    './icon-192.png',
    './icon-512.png',

    // External fonts & icons (cached on first load)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Raleway:wght@200;300;400;500;600&family=Space+Grotesk:wght@300;400;500;600&family=DM+Sans:wght@200;300;400;500;600&family=Outfit:wght@200;300;400;500;600&display=swap',
];

// ─── INSTALL ──────────────────────────────────────────────
// Runs once when the service worker is first installed.
// Pre-caches all the core files.
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching core files');
            // Use individual adds so one failure doesn't break everything
            return Promise.allSettled(
                FILES_TO_CACHE.map(url =>
                    cache.add(url).catch(err =>
                        console.warn(`[SW] Failed to cache: ${url}`, err)
                    )
                )
            );
        })
    );

    // Activate immediately without waiting for old SW to die
    self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────
// Runs after install. Cleans up any old caches from
// previous versions so stale files don't stick around.
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log(`[SW] Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        })
    );

    // Take control of all open tabs immediately
    self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────
// Intercepts every network request.
// Strategy: Cache First → fall back to Network
// (perfect for a dashboard that rarely changes)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests (POST, etc.)
    if (request.method !== 'GET') return;

    // Skip weather API calls — always fetch live from network
    if (url.hostname === 'api.openweathermap.org') return;

    // Skip Spotify embed — always load fresh
    if (url.hostname === 'open.spotify.com') return;

    // Skip Unsplash API calls — always load fresh
    if (url.hostname === 'api.unsplash.com') return;

    // For everything else: Cache First strategy
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Serve from cache instantly ⚡
                return cachedResponse;
            }

            // Not in cache — fetch from network and cache it for next time
            return fetch(request)
                .then((networkResponse) => {
                    // Only cache valid responses
                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        networkResponse.type === 'opaque'
                    ) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    // Network failed and not in cache
                    // Return the offline fallback page
                    if (request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
        })
    );
});
