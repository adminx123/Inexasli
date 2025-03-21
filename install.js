console.log('Script loaded and running');

let deferredPrompt;

// Ensure service worker is ready after page load
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
            console.log('Service Worker ready after load');
        }).catch((err) => {
            console.error('Service Worker failed to be ready:', err);
        });
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;
    showAddToHomeScreenBanner();
});

// Check service worker status immediately
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker active:', registration.active ? 'Yes' : 'No');
    }).catch((err) => {
        console.error('Service Worker not ready:', err);
    });
}

// Fallback for iOS
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream) {
    console.log('Detected iOS - showing manual install instructions');
    showIOSBanner();
}

function showAddToHomeScreenBanner() {
    console.log('Showing banner for Chrome');
    const banner = document.createElement('div');
    banner.id = 'addToHomeScreenBanner';

    const message = document.createElement('span');
    message.textContent = 'Add to Home Screen';

    const addLink = document.createElement('span');
    addLink.textContent = 'Add';
    addLink.className = 'add-link';
    addLink.addEventListener('click', handleAddToHomeScreen);

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.addEventListener('click', hideBanner);

    banner.appendChild(message);
    banner.appendChild(addLink);
    banner.appendChild(closeButton);
    document.body.appendChild(banner);
}

function showIOSBanner() {
    console.log('Showing banner for iOS');
    const banner = document.createElement('div');
    banner.id = 'addToHomeScreenBanner';

    const message = document.createElement('span');
    const shareIcon = document.createElement('span');
    shareIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 12 6 20 14"></polyline>
            <rect x="2" y="14" width="20" height="8"></rect>
        </svg>
    `;
    shareIcon.style.verticalAlign = 'middle';
    shareIcon.style.marginRight = '4px';

    message.textContent = 'To install, tap ';
    message.appendChild(shareIcon);
    message.appendChild(document.createTextNode(' then "Add to Home Screen"'));

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.addEventListener('click', hideBanner);

    banner.appendChild(message);
    banner.appendChild(closeButton);
    document.body.appendChild(banner);
}

function handleAddToHomeScreen() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
            hideBanner();
        });
    }
}

function hideBanner() {
    const banner = document.getElementById('addToHomeScreenBanner');
    if (banner) {
        console.log('Hiding banner');
        banner.style.display = 'none';
    }
}