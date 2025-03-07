if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/sw.js') // Path to your service worker file
    .then((registration) => {
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newServiceWorker = registration.installing;
        newServiceWorker.addEventListener('statechange', () => {
          if (newServiceWorker.state === 'installed') {
            console.log('New service worker installed.');
            // Send a message to the new service worker to skip waiting
            newServiceWorker.postMessage({ action: 'skipWaiting' });
          }
        });
      });
    });

  // Listen for the "controllerchange" event
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New service worker is controlling the page.');
    // Force a reload to ensure the updated app is loaded
    window.location.reload();
  });
}