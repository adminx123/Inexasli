// Import getCookie from getcookie.js
import { getCookie } from '/server/scripts/getcookie.js'; // Matches your absolute path

// Inject CSS styles into the page
function injectStyles() {
    const styles = `
        #gotosummary {
            position: fixed; /* Stays in viewport */
            bottom: 10px; /* 50px from bottom */
            left: 10px; /* 10px from left */
            z-index: 1000;
            background: #fff;
            padding: 10px;
            border: 2px solid #000;
            box-shadow: 4px 4px 0 #000;
            width: auto;
            display: inline-block;
        }

        #summary-btn {
            padding: 8px 15px;
            background: #000;
            color: #fff;
            border: 2px solid #000;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.1s ease;
        }

        #summary-btn:hover {
            background: #333;
            transform: translateY(-2px);
        }

        #summary-btn:active {
            transform: translateY(0);
        }

        @media (max-width: 768px) {
            #gotosummary {
                padding: 5px;
            }
            #summary-btn {
                padding: 6px 12px;
                font-size: 11px;
            }
        }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

// Create the floating button HTML
function createFloatingButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'gotosummary';
    buttonContainer.style.display = 'none'; // Hidden by default

    const innerContainer = document.createElement('div');
    innerContainer.style.display = 'flex';
    innerContainer.style.alignItems = 'center';
    innerContainer.style.gap = '15px';

    const button = document.createElement('button');
    button.id = 'summary-btn';
    button.textContent = 'SUMMARY';

    innerContainer.appendChild(button);
    buttonContainer.appendChild(innerContainer);
    document.body.appendChild(buttonContainer);
    console.log('Button created at:', buttonContainer.getBoundingClientRect()); // Debug position
}

// Check cookie and toggle button visibility
function checkCookieAndToggleButton() {
    const summaryCookie = getCookie('summary_reached');
    console.log('summary_reached value:', summaryCookie);
    const summaryButtonContainer = document.getElementById('gotosummary');
    if (summaryCookie === 'true') {
        summaryButtonContainer.style.display = 'inline-block';
        console.log('Button shown at:', summaryButtonContainer.getBoundingClientRect());
    } else {
        summaryButtonContainer.style.display = 'none';
    }
}

// Add click listener for redirect
function addButtonClickListener() {
    document.getElementById('summary-btn').addEventListener('click', () => {
        window.location.href = '/budget/summary.html';
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    createFloatingButton();
    checkCookieAndToggleButton();
    addButtonClickListener();
});