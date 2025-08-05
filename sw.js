const CACHE_NAME = 'inexasli-v16'; //#CHANGEVERSION with each major update
const urlsToCache = [
  '/budget/index.html'
];

console.log('[ServiceWorker] Service worker script loaded with cache version:', CACHE_NAME);

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing with cache version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting to activate immediately');
        return self.skipWaiting(); // Skip waiting to activate immediately
      })
      .catch(err => console.error('[ServiceWorker] Cache failed:', err))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating with cache version:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[ServiceWorker] Found existing caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('[ServiceWorker] Taking control of all clients');
      return self.clients.claim(); // Take control of clients immediately
    })
    .then(() => {
      console.log('[ServiceWorker] New version activated, notifying clients to reload');
      // Notify all clients to reload for fresh content
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        console.log('[ServiceWorker] Found', clients.length, 'clients to notify');
        clients.forEach(client => {
          console.log('[ServiceWorker] Sending reload message to client');
          client.postMessage({ action: 'reload', reason: 'new-version' });
        });
      });
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Bypass Service Worker for API endpoints only (not for any IP addresses)
  if (url.pathname.startsWith('/api/')) {
    // Let the request go directly to the network without Service Worker intervention
    return;
  }
  
  // Bypass cache for local development
  if (self.location.hostname === '127.0.0.1' || self.location.hostname === 'localhost') {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      fetch(event.request) // Always try the network first
        .then((networkResponse) => {
          // Cache the new response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match(event.request)) // Fallback to cache if network fails
    );
  }
});

// Handle messages from clients (e.g., skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting(); // Force the new service worker to activate
  }
});

// ...existing code...

// Log the protocol (http or https)
console.log('Service Worker running on protocol:', self.location.protocol);

// ...existing code...