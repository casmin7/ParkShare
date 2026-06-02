const CACHE_NAME = 'parkshare-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/app.js',
  '/firebase.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    // Basic network-first strategy for a dynamic app
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// Handling background push events if supported
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Notificare Nouă', body: 'Ai o activitate nouă în ParkShare.' };
    
    const options = {
        body: data.body,
        icon: 'icon.png', // Assuming we will have an icon
        badge: 'icon.png',
        vibrate: data.vibrate || [200, 100, 200, 100, 200],
        requireInteraction: true,
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(event.notification.data);
        })
    );
});
