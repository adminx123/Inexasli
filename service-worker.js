// Service Worker Logic
self.addEventListener('install', function(event) {
    // Perform install steps, like caching assets
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    // Perform activation steps, like cleaning up old caches
    console.log('Service Worker activated');
});

self.addEventListener('fetch', function(event) {
    // Handle fetch events, like serving cached responses
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            // Fetch from network
            return fetch(event.request);
        })
    );
});
