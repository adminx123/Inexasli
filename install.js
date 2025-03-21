console.log('Script loaded and running');

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;
    showAddToHomeScreenBanner();
});

// Fallback for iOS (Safari doesn’t support beforeinstallprompt)
if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream) {
    console.log('Detected iOS - showing manual install instructions');
    showIOSBanner();
}

function showAddToHomeScreenBanner() {
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
    const banner = document.createElement('div');
    banner.id = 'addToHomeScreenBanner';

    const message = document.createElement('span');
    message.textContent = 'To install, tap Share ⇧ then "Add to Home Screen"';

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
        banner.style.display = 'none';
    }
}