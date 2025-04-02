// Import the getCookie function from getcookie.js (assumed already present in your project)
import { getCookie } from './getcookie.js';

// Function to inject the CSS styles directly into the page
function injectStyles() {
    const styles = `
        #gotosummary {
            position: sticky;
            top: 10px;
            z-index: 1000;
            background: #fff;
            padding: 10px;
            border: 2px solid #000;
            box-shadow: 4px 4px 0 #000;
            width: auto;
            display: inline-block;
            margin: 0 auto;
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
                font-size: 12px;
            }
        }
    `;

    // Create a new <style> element
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;

    // Append the style element to the <head> of the document
    document.head.appendChild(styleSheet);
}

// Function to create the HTML for the floating button
function createFloatingButton() {
    // Create the button container and button elements
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'gotosummary';
    buttonContainer.style.display = 'none'; // Hide by default

    const innerContainer = document.createElement('div');
    innerContainer.style.display = 'flex';
    innerContainer.style.alignItems = 'center';
    innerContainer.style.gap = '15px';

    const button = document.createElement('button');
    button.id = 'summary-btn';
    button.style.padding = '8px 15px';
    button.style.background = '#000';
    button.style.color = '#fff';
    button.style.border = '2px solid #000';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.textContent = 'SUMMARY';

    innerContainer.appendChild(button);
    buttonContainer.appendChild(innerContainer);

    // Append the button container to the body
    document.body.appendChild(buttonContainer);
}

// Function to check the cookie and show/hide the floating button
function checkCookieAndToggleButton() {
    const summaryCookie = getCookie('showSummaryButton'); // Assume the cookie is named 'showSummaryButton'

    // Get the button container
    const summaryButtonContainer = document.getElementById('gotosummary');

    // If cookie exists and equals 'true', show the button
    if (summaryCookie === 'true') {
        summaryButtonContainer.style.display = 'block';
    } else {
        summaryButtonContainer.style.display = 'none';
    }
}

// Add an event listener to the button to navigate when clicked
function addButtonClickListener() {
    const summaryButton = document.getElementById('summary-btn');

    if (summaryButton) {
        summaryButton.addEventListener('click', () => {
            // Redirect to the summary page
            window.location.href = '/budget/summary.html';
        });
    }
}

// Call the function to check the cookie and toggle visibility
window.addEventListener('DOMContentLoaded', () => {
    injectStyles(); // Inject the styles into the page
    createFloatingButton(); // Create the floating button HTML
    checkCookieAndToggleButton(); // Check cookie and show the button if needed
    addButtonClickListener(); // Add click listener to the button
});
