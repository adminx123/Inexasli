// Import getCookie from getCookie.js
import { getCookie } from '/server/scripts/getCookie.js';

// Inject CSS styles into the page
function injectStyles() {
    const styles = `
        #gotosummary {
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background-color: #f5f5f5;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 8px;
            box-shadow: 4px 4px 0 #000;
            display: inline-block;
            transition: background-color 0.3s ease;
        }

        #gotosummary:hover {
            background-color: #d3bc0f;
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
    console.log('Button created at:', buttonContainer.getBoundingClientRect());
}

// Check if cookie exists and toggle button visibility
function checkLocalAndToggleButton() {
    const summaryLocal = getCookie('summary_reached');
    console.log('summary_reached cookie:', summaryLocal);
    const summaryButtonContainer = document.getElementById('gotosummary');
    if (summaryLocal) { // Check if cookie exists (non-null, non-undefined)
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
    checkLocalAndToggleButton();
    addButtonClickListener();
});