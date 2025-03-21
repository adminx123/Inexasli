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

// Chrome-specific PWA install banner
window.addEventListener('beforeinstallprompt', (e) => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
        console.log('beforeinstallprompt event fired for Chrome');
        e.preventDefault();
        deferredPrompt = e;
        console.log('Showing Chrome install banner');
        showAddToHomeScreenBanner();
    }
});

// Check service worker status immediately
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker active:', registration.active ? 'Yes' : 'No');
    }).catch((err) => {
        console.error('Service Worker not ready:', err);
    });

    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.error('Service Worker registration failed:', err));
}

// Function to detect device type
function getDeviceType(userAgent) {
    if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS Device';
    if (/android/.test(userAgent)) return 'Android Device';
    if (/tablet|ipad/.test(userAgent)) return 'Tablet';
    if (/mobile/.test(userAgent)) return 'Mobile';
    return 'Desktop'; // Default to desktop if no mobile/tablet indicators
}

// Function to detect browser
function getBrowser(userAgent) {
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) return 'Chrome';
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) return 'Safari';
    if (userAgent.includes("firefox")) return 'Firefox';
    if (userAgent.includes("edg")) return 'Edge';
    return 'Unknown Browser';
}

// Browser detection and custom instructions
document.addEventListener('DOMContentLoaded', () => {
    const installBox = document.getElementById("install-instructions");
    const installMsg = document.getElementById("install-message");
    const userAgent = navigator.userAgent.toLowerCase();
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);

    if (!installBox || !installMsg) {
        console.error('Install elements not found in DOM');
        return;
    }

    // Base message with device and browser info
    const deviceBrowserInfo = `You're on a ${deviceType} using ${browser}. `;

    if (browser === 'Safari') {
        if (deviceType === 'iOS Device' || deviceType === 'Tablet') {
            installMsg.textContent = `${deviceBrowserInfo}Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.`;
        } else {
            installMsg.textContent = `${deviceBrowserInfo}Tap the Share icon (square with an arrow) at the top, then select 'Add to Dock'.`;
        }
        installBox.style.display = "block";
    } else if (browser === 'Chrome') {
        installBox.style.display = "none"; // Chrome uses the dynamic banner
    } else if (browser === 'Firefox') {
        installMsg.textContent = `${deviceBrowserInfo}Firefox doesn’t support app installation yet. Bookmark this page (Ctrl + D) for easy access.`;
        installBox.style.display = "block";
    } else if (browser === 'Edge') {
        installMsg.textContent = `${deviceBrowserInfo}Click the … menu in the top-right corner, then select 'Apps' > 'Install this site as an app'.`;
        installBox.style.display = "block";
    } else {
        installMsg.textContent = `${deviceBrowserInfo}To save this site, add it to your bookmarks or home screen using your browser’s options.`;
        installBox.style.display = "block";
    }
});

// Chrome install banner functions
function showAddToHomeScreenBanner() {
    console.log('Showing banner for Chrome');
    const userAgent = navigator.userAgent.toLowerCase();
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);

    const banner = document.createElement('div');
    banner.id = 'addToHomeScreenBanner';
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.padding = '10px 20px';
    banner.style.background = 'rgba(255, 255, 255, 0.9)';
    banner.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.3)';
    banner.style.textAlign = 'center';
    banner.style.zIndex = '1000';

    const message = document.createElement('span');
    message.textContent = `You're on a ${deviceType} using ${browser}. Add INEXASLI to your desktop!`;
    message.style.fontSize = '14px';
    message.style.color = '#000';

    const addLink = document.createElement('span');
    addLink.textContent = 'Install';
    addLink.style.color = '#007bff';
    addLink.style.cursor = 'pointer';
    addLink.style.marginLeft = '15px';
    addLink.style.fontSize = '14px';
    addLink.addEventListener('click', handleAddToHomeScreen);

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#000';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '14px';
    closeButton.style.marginLeft = '15px';
    closeButton.addEventListener('click', hideBanner);

    banner.appendChild(message);
    banner.appendChild(addLink);
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