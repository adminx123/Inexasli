/* hideShow.js */
import { getLocal } from '/server/scripts/getlocal.js';
import { setLocal } from '/server/scripts/setlocal.js';

function hideShowClass(className, task) {
    const elements = document.getElementsByClassName(className);
    if (elements.length === 0) {
        console.warn(`No elements with class '${className}' found.`);
        return;
    }
    Array.from(elements).forEach((element) => {
        element.style.display = task === 'hide' ? 'none' : 'block';
    });
}

// Define the visibility logic as a reusable function
function updateHideShow() {
    const region = getLocal('RegionDropdown');
    console.log('Region in hideShow.js:', region); // Debug

    // Inject CSS to enforce hiding (optional, but ensures precedence)
    let styleSheet = document.getElementById('hide-show-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'hide-show-styles';
        document.head.appendChild(styleSheet);
    }

    if (region === 'CAN') {
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'show');
        styleSheet.textContent = `.usa-hide { display: none !important; } .can-hide { display: block !important; }`;
    } else if (region === 'USA') {
        hideShowClass('usa-hide', 'show');
        hideShowClass('can-hide', 'hide');
        styleSheet.textContent = `.usa-hide { display: block !important; } .can-hide { display: none !important; }`;
    } else {
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'hide');
        styleSheet.textContent = `.usa-hide { display: none !important; } .can-hide { display: none !important; }`;
    }
}

const regionDropdown = document.getElementById('RegionDropdown');

regionDropdown.addEventListener('change', () => {
    const region = regionDropdown.value;
    console.log(`Region changed to: ${region}`); // Debug log

    // Update localStorage with the new region value
    setLocal('RegionDropdown', region);

    // Call updateHideShow to handle all visibility updates
    updateHideShow();
});

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    updateHideShow();
});

export { hideShowClass, updateHideShow }; // Export both functions