console.log('Script loaded and running');

let deferredPrompt;

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker registration failed:', err));

  navigator.serviceWorker.ready.then(reg => {
    console.log('Service Worker active:', reg.active ? 'Yes' : 'No');
  }).catch(err => console.error('Service Worker not ready:', err));
}

// Check if running as standalone (installed PWA)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// Chrome-specific PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("chrome") && !userAgent.includes("crios") && !isStandalone) {
    console.log('beforeinstallprompt event fired for Chrome');
    e.preventDefault();
    deferredPrompt = e;
    showInstallInstructions("chrome");
  }
});

// DOM content loaded handler
document.addEventListener('DOMContentLoaded', () => {
  const installBox = document.getElementById("install-instructions");
  const installMsg = document.getElementById("install-message");
  const userAgent = navigator.userAgent.toLowerCase();

  if (!installBox || !installMsg) {
    console.error('Install elements not found in DOM');
    return;
  }

  // Skip banner if running as standalone
  if (isStandalone) {
    installBox.style.display = "none";
    return;
  }

  // iOS Safari or Chrome iOS
  if ((userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("crios")) ||
      (userAgent.includes("chrome") && userAgent.includes("crios"))) {
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      installMsg.textContent = "Tap the Share icon, then 'Add to Home Screen'.";
      installBox.style.display = "block";
    }
  } 
  // Chrome (non-iOS)
  else if (userAgent.includes("chrome") && !userAgent.includes("crios")) {
    installBox.style.display = "none"; // Hidden by default, shown via beforeinstallprompt
  } 
  // Other browsers
  else {
    installMsg.textContent = "Use Chrome or iOS for installation, or bookmark this page.";
    installBox.style.display = "block";
  }
});

// Show install instructions
function showInstallInstructions(browserType) {
  const installBox = document.getElementById("install-instructions");
  const installMsg = document.getElementById("install-message");

  if (!installBox || !installMsg || isStandalone) return;

  installBox.style.display = "block";
  const baseMessage = "Install the INEXASLI web app for a better experience.";
  installMsg.textContent = browserType === 'chrome' 
    ? `${baseMessage} Click the monitor icon & 'Install'`
    : `${baseMessage} Use Chrome or Safari.`;
}

// Handle install prompt
function handleAddToHomeScreen() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome === 'accepted' ? 'User accepted A2HS' : 'User dismissed A2HS');
      deferredPrompt = null;
      hideInstallInstructions();
    });
  }
}

// Hide install instructions
function hideInstallInstructions() {
  const installBox = document.getElementById("install-instructions");
  if (installBox) installBox.style.display = "none";
}