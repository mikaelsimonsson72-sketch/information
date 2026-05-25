// Service Worker for PWA Offline Support
const CACHE_NAME = 'veckoinfo-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './data/current-week.json',
    './data/upcoming-weeks.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    // Update cache in background for JSON files
                    if (event.request.url.includes('.json')) {
                        fetch(event.request).then((fetchResponse) => {
                            if (fetchResponse && fetchResponse.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, fetchResponse.clone());
                                });
                            }
                        }).catch(() => {
                            // Network failed, use cached version
                        });
                    }
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then((fetchResponse) => {
                    // Check if valid response
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }

                    // Clone the response
                    const responseToCache = fetchResponse.clone();

                    // Add to cache
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return fetchResponse;
                }).catch(() => {
                    // Network failed and not in cache
                    // Return offline page or error
                    return new Response('Offline - ingen anslutning', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/plain'
                        })
                    });
                });
            })
    );
});

// Background sync for analytics (optional)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // Sync analytics data when back online
    console.log('Service Worker: Syncing analytics...');
    // Implementation would send stored analytics to server
}

// Push notifications (optional for future)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Ny information tillgänglig',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Veckovis Information', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});

// Made with Bob
