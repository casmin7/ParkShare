const CACHE_NAME = 'parkshare-v16';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './s4_points.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Use try-catch or map for resilient caching in case some external URLs fail
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => cache.add(url))
                );
            })
    );
});

self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Don't cache API/KVDB requests or huge data files
    if (event.request.url.includes('kvdb.io') || event.request.url.includes('nominatim') || event.request.url.includes('.json')) {
        return;
    }

    // Network-first strategy for index.html and assets
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Update cache with the new version
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If offline, fallback to cache
                return caches.match(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
