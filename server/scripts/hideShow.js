import { getCookie } from '/server/scripts/getcookie.js';

function hideShowClass(className, task) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        if (element) {
            if (task === 'hide') {
                element.style.display = 'none';
            } else if (task === 'show') {
                element.style.display = 'block';
            }
        } else {
            alert(`No element with class '${className}' found.`);
            console.error(`No element with class '${className}' found.`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const region = getCookie('RegionDropdown');

    if (region === 'CAN') {
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'show');
    } else if (region === 'USA') {
        hideShowClass('usa-hide', 'show');
        hideShowClass('can-hide', 'hide');
    } else {
        // Default case: no region picked (null, undefined, empty string, or anything else)
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'hide');
    }
});