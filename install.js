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
    if (userAgent.includes("chrome") && !userAgent.includes("crios")) {
        console.log('beforeinstallprompt event fired for Chrome');
        e.preventDefault();
        deferredPrompt = e;
        console.log('Showing Chrome install banner');
        showInstallInstructions("chrome"); // Show instructions for Chrome
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
    if (userAgent.includes("chrome") && !userAgent.includes("crios")) return 'Chrome';
    if (userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("crios")) return 'Safari';
    if (userAgent.includes("chrome") && userAgent.includes("crios")) return 'Chrome iOS';
    return 'Other Browser';
}

document.addEventListener('DOMContentLoaded', () => {
    const installBox = document.getElementById("install-instructions");
    const installMsg = document.getElementById("install-message");
    const userAgent = navigator.userAgent.toLowerCase();

    if (!installBox || !installMsg) {
        console.error('Install elements not found in DOM');
        return;
    }

    // iOS Safari
    if (userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("crios")) {
        if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            installMsg.textContent = "Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.";
            installBox.style.display = "block";
        }
    } 
    // Chrome on iOS
    else if (userAgent.includes("chrome") && userAgent.includes("crios")) {
        installMsg.textContent = "Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.";
        installBox.style.display = "block";
    } 
    // Chrome (non-iOS)
    else if (userAgent.includes("chrome") && !userAgent.includes("crios")) {
        installBox.style.display = "none"; // Hide static banner for Chrome
    } 
    // All other browsers
    else {
        installMsg.textContent = "To install this app, please use Chrome or an iOS device. Alternatively, bookmark this page for easy access.";
        installBox.style.display = "block";
    }
});

// Function to show install instructions based on browser
function showInstallInstructions(browserType) {
    const installBox = document.getElementById("install-instructions");
    const installMsg = document.getElementById("install-message");

    if (!installBox || !installMsg) {
        console.error('Install elements not found in DOM');
        return;
    }

    installBox.style.display = "block"; // Ensure the instructions box is visible

    const baseMessage = "Access INEXASLI via installing the web app. ";

    switch (browserType) {
        case 'chrome':
            installMsg.textContent = `${baseMessage}Click the + icon in the address bar, then select 'Install', or use the banner below.`;
            break;
        default:
            installMsg.textContent = `${baseMessage}Please use Chrome or an iOS device for installation options.`;
    }
}

// Handle install event for deferredPrompt
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
            hideInstallInstructions();
        });
    }
}

// Hide install instructions
function hideInstallInstructions() {
    const installBox = document.getElementById("install-instructions");
    if (installBox) {
        installBox.style.display = "none";
    }
}