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

// Commenting out old PWA banner logic for now
/*
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;
    showAddToHomeScreenBanner();
});
*/

// Check service worker status immediately
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker active:', registration.active ? 'Yes' : 'No');
    }).catch((err) => {
        console.error('Service Worker not ready:', err);
    });
}

// Browser detection and custom instructions
document.addEventListener('DOMContentLoaded', () => {
    const installBox = document.getElementById("install-instructions");
    const installMsg = document.getElementById("install-message");
    const userAgent = navigator.userAgent.toLowerCase();

    if (!installBox || !installMsg) {
        console.error('Install elements not found in DOM');
        return;
    }

    if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
        if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            installMsg.textContent = "Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.";
        } else {
            installMsg.textContent = "Safari on desktop doesn’t support app installation. Bookmark this page (Cmd + D) for quick access.";
        }
        installBox.style.display = "block";
    } else if (userAgent.includes("chrome")) {
        installMsg.textContent = "Click the + or ⬇️ icon in the address bar, then choose 'Install' to add this site as an app.";
        installBox.style.display = "block";
    } else if (userAgent.includes("firefox")) {
        installMsg.textContent = "Firefox doesn’t support app installation yet. Bookmark this page (Ctrl + D) for easy access.";
        installBox.style.display = "block";
    } else if (userAgent.includes("edg")) {
        installMsg.textContent = "Click the … menu in the top-right corner, then select 'Apps' > 'Install this site as an app'.";
        installBox.style.display = "block";
    } else {
        installMsg.textContent = "To save this site, add it to your bookmarks or home screen using your browser’s options.";
        installBox.style.display = "block";
    }
});

// Commenting out old banner functions for now
/*
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
*/