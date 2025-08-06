if ('serviceWorker' in navigator) {
  console.log('[ServiceWorker] Browser supports service workers');
  
  // Register the service worker
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
          console.log('[ServiceWorker] Registration successful:', registration);
          console.log('[ServiceWorker] Scope:', registration.scope);
          console.log('[ServiceWorker] Active:', registration.active);
          console.log('[ServiceWorker] Installing:', registration.installing);
          console.log('[ServiceWorker] Waiting:', registration.waiting);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('[ServiceWorker] Update found, new worker installing');
            const newServiceWorker = registration.installing;
            newServiceWorker.addEventListener('statechange', () => {
              console.log('[ServiceWorker] State changed to:', newServiceWorker.state);
              if (newServiceWorker.state === 'installed') {
                console.log('[ServiceWorker] New service worker installed, sending skipWaiting message');
                // Send a message to the new service worker to skip waiting
                newServiceWorker.postMessage({ action: 'skipWaiting' });
              }
            });
          });
        })
        .catch((error) => {
          console.error('[ServiceWorker] Registration failed:', error);
        });

  // Listen for the "controllerchange" event
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[ServiceWorker] New service worker is controlling the page - page will reload');
    // Force a reload to ensure the updated app is loaded
    window.location.reload();
  });
} else {
  console.log('[ServiceWorker] Service workers not supported in this browser');
}