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
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) { // Exclude Edge, which uses Chrome engine
        console.log('beforeinstallprompt event fired for Chrome');
        e.preventDefault();
        deferredPrompt = e;

        // Redirect to /budget/index1.html if not there
        if (window.location.pathname !== '/budget/index1.html') {
            console.log('Redirecting to /budget/index1.html for Chrome install');
            localStorage.setItem('installPending', 'true');
            window.location.href = '/budget/index1.html';
        } else {
            console.log('Showing Chrome install banner');
            showAddToHomeScreenBanner();
        }
    }
});

// Resume install after redirect for Chrome
window.addEventListener('load', () => {
    if (localStorage.getItem('installPending') === 'true' && deferredPrompt) {
        console.log('Resuming Chrome install on /budget/index1.html');
        showAddToHomeScreenBanner();
        localStorage.removeItem('installPending');
    }
});

// Check service worker status immediately
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker active:', registration.active ? 'Yes' : 'No');
    }).catch((err) => {
        console.error('Service Worker not ready:', err);
    });

    // Register service worker
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.error('Service Worker registration failed:', err));
}

// Browser detection and custom instructions for non-Chrome
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
            installMsg.textContent = "Tap the Share icon (square with an arrow) at the top, then select 'Add to Dock'.";
        }
        installBox.style.display = "block";
    } else if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
        // Chrome gets the banner via beforeinstallprompt, not static instructions
        installBox.style.display = "none"; // Hide static banner for Chrome
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

// Chrome install banner functions
function showAddToHomeScreenBanner() {
    console.log('Showing banner for Chrome');
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
    message.textContent = 'Add INEXASLI to your desktop!';
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