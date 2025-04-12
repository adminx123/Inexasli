/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

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

function updateHideShow() {
    const region = getLocal('RegionDropdown');
    console.log('Region in hideShow.js:', region);

    // Check localStorage for dependants and debt
    const dependants = getLocal('dependants');
    const debt = getLocal('debt');
    console.log('Dependants in hideShow.js:', dependants);
    console.log('Debt in hideShow.js:', debt);

    let cssRules = '';

    // Region-based visibility
    if (region === 'CAN') {
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'show');
        cssRules += `.usa-hide { display: none !important; } .can-hide { display: block !important; }`;
    } else if (region === 'USA') {
        hideShowClass('usa-hide', 'show');
        hideShowClass('can-hide', 'hide');
        cssRules += `.usa-hide { display: block !important; } .can-hide { display: none !important; }`;
    } else {
        hideShowClass('usa-hide', 'hide');
        hideShowClass('can-hide', 'hide');
        cssRules += `.usa-hide { display: none !important; } .can-hide { display: none !important; }`;
    }

    // Strict check: only show if exactly "checked"
    if (dependants === 'checked') {
        hideShowClass('dependant-parent', 'show');
        cssRules += `.dependant-parent { display: block !important; }`;
    } else {
        hideShowClass('dependant-parent', 'hide');
        cssRules += `.dependant-parent { display: none !important; }`;
    }

    if (debt === 'checked') {
        hideShowClass('debt-parent', 'show');
        cssRules += `.debt-parent { display: block !important; }`;
    } else {
        hideShowClass('debt-parent', 'hide');
        cssRules += `.debt-parent { display: none !important; }`;
    }

    // Apply styles
    let styleSheet = document.getElementById('hide-show-styles');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'hide-show-styles';
        document.head.appendChild(styleSheet);
    }
    styleSheet.textContent = cssRules;
}

const regionDropdown = document.getElementById('RegionDropdown');

if (regionDropdown) {
    regionDropdown.addEventListener('change', () => {
        const region = regionDropdown.value;
        console.log(`Region changed to: ${region}`);
        setLocal('RegionDropdown', region);
        updateHideShow();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateHideShow();
});

export { hideShowClass, updateHideShow };