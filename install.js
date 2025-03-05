// Select the body or a container where the banner will be appended
const body = document.body;

// Create a deferred prompt variable to store the install event
let deferredPrompt;

// Listen for the beforeinstallprompt event (fires when the browser thinks the site can be installed)
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar prompt
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;

    // Create and show the custom banner
    showAddToHomeScreenBanner();
});

// Function to display the banner
function showAddToHomeScreenBanner() {
    // Create banner elements
    const banner = document.createElement('div');
    banner.id = 'add-to-home-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #333;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const message = document.createElement('span');
    message.textContent = 'Add this website to your home screen for a better experience!';
    message.style.padding = '0 10px';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add to Home Screen';
    addButton.style.cssText = `
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 8px 16px;
        cursor: pointer;
        border-radius: 4px;
    `;
    addButton.addEventListener('click', handleAddToHomeScreen);

    const closeButton = document.createElement('button');
    closeButton.textContent = '✖';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0 10px;
    `;
    closeButton.addEventListener('click', hideBanner);

    // Append elements to banner
    banner.appendChild(message);
    banner.appendChild(addButton);
    banner.appendChild(closeButton);

    // Append banner to the body
    body.appendChild(banner);
}

// Function to handle the "Add to Home Screen" action
function handleAddToHomeScreen() {
    if (deferredPrompt) {
        // Show the native prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            // Clear the deferredPrompt variable
            deferredPrompt = null;
            // Hide the banner after decision
            hideBanner();
        });
    }
}

// Function to hide the banner
function hideBanner() {
    const banner = document.getElementById('add-to-home-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}