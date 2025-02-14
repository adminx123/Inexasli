self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    // Perform install steps
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    // Perform activate steps
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  });