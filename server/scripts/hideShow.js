import { getCookie } from '/server/scripts/getcookie.js';

function hideShowClass(className, task) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        if (element) {
            element.style.display = task === 'hide' ? 'none' : 'block';
        } else {
            console.error(`No element with class '${className}' found.`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const region = getCookie('RegionDropdown');
    console.log('Region in hideShow.js:', region); // Debug

    // Inject CSS to enforce hiding
    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);

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
});