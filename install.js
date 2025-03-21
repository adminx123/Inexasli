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
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) return 'Chrome';
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) return 'Safari';
    if (userAgent.includes("firefox")) return 'Firefox';
    if (userAgent.includes("edg")) return 'Edge';
    return 'Unknown Browser';
}

document.addEventListener('DOMContentLoaded', () => {
    const installBox = document.getElementById("install-instructions");
    const installMsg = document.getElementById("install-message");
    const userAgent = navigator.userAgent.toLowerCase();

    if (!installBox || !installMsg) {
        console.error('Install elements not found in DOM');
        return;
    }

    // Safari (iOS and other platforms)
    if (userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("crios")) {
        if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            installMsg.textContent = "Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.";
        } else {
            installMsg.textContent = "Tap the Share icon (square with an arrow) at the top, then select 'Add to Dock'.";
        }
        installBox.style.display = "block";
    } 
    // Chrome on iOS (detecting "crios" which is part of the Chrome iOS user agent)
    else if (userAgent.includes("chrome") && userAgent.includes("crios")) {
        installMsg.textContent = "Tap the Share icon (square with an arrow) at the bottom, then select 'Add to Home Screen'.";
        installBox.style.display = "block";
    } 
    // Chrome (excluding Edge and Chrome on iOS)
    else if (userAgent.includes("chrome") && !userAgent.includes("edg") && !userAgent.includes("crios")) {
        installBox.style.display = "none"; // Hide static banner for Chrome
    } 
    // Firefox
    else if (userAgent.includes("firefox")) {
        installMsg.textContent = "Firefox doesn’t support app installation yet. Bookmark this page (Ctrl + D) for easy access.";
        installBox.style.display = "block";
    } 
    // Edge
    else if (userAgent.includes("edg")) {
        installMsg.textContent = "Click the … menu in the top-right corner, then select 'Apps' > 'Install this site as an app'.";
        installBox.style.display = "block";
    } 
    // Other browsers
    else {
        installMsg.textContent = "To save this site, add it to your bookmarks or home screen using your browser’s options.";
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
        case 'safari':
            installMsg.textContent = `${baseMessage}Tap the Share icon (square with an arrow), then select 'Add to Home Screen'.`;
            break;
        case 'firefox':
            installMsg.textContent = `${baseMessage}Firefox doesn’t support app installation yet. Please use Chrome or Safari.`;
            break;
        case 'edge':
            installMsg.textContent = `${baseMessage}Click the … menu in the top-right corner, then select 'Apps' > 'Install this site as an app'.`;
            break;
        default:
            installMsg.textContent = `${baseMessage}Check your browser’s menu for installation options, or use Chrome/Safari for the best experience.`;
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
