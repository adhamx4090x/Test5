/**
 * Local AI Voice Operating System - Service Worker
 * Enables full offline functionality
 */

const CACHE_NAME = 'neuralvoice-os-v1';
const OFFLINE_URL = 'index.html';

// Assets to cache
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) return;
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response before caching
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // Return a simple offline response for other requests
                        return new Response('Offline', {
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

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_PROJECT') {
        const { assets } = event.data;
        caches.open(CACHE_NAME)
            .then((cache) => {
                cache.addAll(assets)
                    .then(() => {
                        console.log('Project assets cached');
                    })
                    .catch((err) => {
                        console.error('Failed to cache project assets:', err);
                    });
            });
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                console.log('Cache cleared');
            });
    }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-audio') {
        event.waitUntil(syncAudio());
    }
});

async function syncAudio() {
    // Sync any pending audio operations when back online
    console.log('Syncing audio operations...');
}

// Push notifications for AI suggestions
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: './assets/icon-192.png',
            badge: './assets/badge-72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || './index.html'
            },
            actions: [
                {
                    action: 'open',
                    title: 'Open'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Focus existing window if available
                    for (const client of clientList) {
                        if (client.url.includes('./index.html') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Open new window if no existing window
                    if (clients.openWindow) {
                        return clients.openWindow(event.notification.data.url);
                    }
                })
        );
    }
});

// Periodic background sync for AI learning updates
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'ai-learning-update') {
        event.waitUntil(updateAI());
    }
});

async function updateAI() {
    // Update AI model data in background
    console.log('Updating AI model data...');
}

console.log('NeuralVoice OS Service Worker loaded');
