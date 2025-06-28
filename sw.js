const CACHE_NAME = 'inexasli-v13'; //#CHANGEVERSION with each major update
const urlsToCache = [
  '/budget/index.html'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Skip waiting to activate immediately
      .catch(err => console.error('Cache failed:', err))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Take control of clients immediately
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Bypass Service Worker for direct Cloudflare IP requests or API endpoints
  if (url.hostname === '172.67.134.54' || url.pathname.startsWith('/api/')) {
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