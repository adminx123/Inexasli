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

// Check timestamp and checkbox states to toggle button visibility
function checkLocalAndToggleButton() {
    const summaryTimestamp = getCookie('summary_reached');
    const summaryButtonContainer = document.getElementById('gotosummary');
    console.log('summary_reached timestamp:', summaryTimestamp);

    const termsCheckbox = document.getElementById('termscheckbox');
    const notIntendedCheckbox = document.getElementById('notintended');
    const regionDropdown = document.getElementById('RegionDropdown');

    if (summaryTimestamp && termsCheckbox && notIntendedCheckbox && regionDropdown) {
        const timestamp = parseInt(summaryTimestamp, 10);
        const currentTime = Date.now();
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
        const timeDifference = currentTime - timestamp;

        const isTimestampValid = timeDifference < fifteenMinutes;
        const areCheckboxesChecked = termsCheckbox.checked && notIntendedCheckbox.checked;
        const isRegionValid = regionDropdown.value !== "" && regionDropdown.value !== "NONE";

        if (isTimestampValid && areCheckboxesChecked && isRegionValid) {
            summaryButtonContainer.style.display = 'inline-block';
            console.log('Button shown - timestamp < 15 min and conditions met:', timeDifference / 1000, 'seconds');
        } else {
            summaryButtonContainer.style.display = 'none';
            console.log('Button hidden - conditions not met:', {
                timestampValid: isTimestampValid,
                checkboxesChecked: areCheckboxesChecked,
                regionValid: isRegionValid
            });
        }
    } else {
        summaryButtonContainer.style.display = 'none';
        console.log('Button hidden - missing timestamp or DOM elements');
    }
}

// Add click listener for redirect
function addButtonClickListener() {
    document.getElementById('summary-btn').addEventListener('click', () => {
        window.location.href = '/budget/summary.html';
    });
}

// Initialize on page load and monitor checkbox/region changes
window.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    createFloatingButton();
    checkLocalAndToggleButton();
    addButtonClickListener();

    // Add event listeners to update button visibility dynamically
    const termsCheckbox = document.getElementById('termscheckbox');
    const notIntendedCheckbox = document.getElementById('notintended');
    const regionDropdown = document.getElementById('RegionDropdown');

    if (termsCheckbox) termsCheckbox.addEventListener('change', checkLocalAndToggleButton);
    if (notIntendedCheckbox) notIntendedCheckbox.addEventListener('change', checkLocalAndToggleButton);
    if (regionDropdown) regionDropdown.addEventListener('change', checkLocalAndToggleButton);
});