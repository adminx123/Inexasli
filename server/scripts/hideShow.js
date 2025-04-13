/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getLocal } from '/server/scripts/getlocal.js';

function updateVisibility() {
    const fillingStatus = getLocal('fillingStatus');
    const dependants = getLocal('dependants');
    const styleElement = document.getElementById('hide-show-styles') || document.createElement('style');

    styleElement.id = 'hide-show-styles';
    let styles = '';

    // Partner visibility for partnered filing statuses
    if (/married|common_law|coupled|mfj|mfs/.test(fillingStatus)) {
        styles += `
            .partner-clone {
                display: flex !important;
            }
            .rowa-l input[id$="_partner"],
            .rowa-l input[id$="_shared"],
            .rowa-l input[id$="_shared_p1_percent"],
            .rowa-l input[id$="_shared_p2_percent"] {
                display: inline-block !important;
            }
        `;
    } else {
        styles += `
            .partner-clone {
                display: none !important;
            }
            .rowa-l input[id$="_partner"],
            .rowa-l input[id$="_shared"],
            .rowa-l input[id$="_shared_p1_percent"],
            .rowa-l input[id$="_shared_p2_percent"] {
                display: none !important;
            }
        `;
    }

    // Dependants container visibility
    styles += `
        .dependant-parent {
            display: ${dependants === 'checked' ? 'block !important' : 'none !important'};
        }
    `;

    styleElement.textContent = styles;
    if (!document.getElementById('hide-show-styles')) {
        document.head.appendChild(styleElement);
    }

    // Debug visibility
    try {
        console.log(`[hideShow.js] Debugging on ${window.location.pathname}, fillingStatus: ${fillingStatus}, dependants: ${dependants}`);

        // Partner-clone rows (expense.html)
        const partnerRows = document.querySelectorAll('.partner-clone');
        partnerRows.forEach(row => {
            const display = getComputedStyle(row).display;
            const parent = row.closest('.checkboxrow-container') || row.parentElement;
            const parentDisplay = parent ? getComputedStyle(parent).display : 'N/A';
            console.log(`Partner-clone row: ${row.id || row.className}, display: ${display}, parent display: ${parentDisplay}`);
            const inputs = row.querySelectorAll('input[type="number"], .checkbox-button-group');
            inputs.forEach(input => {
                const inputDisplay = getComputedStyle(input).display;
                console.log(`  Partner-clone input: ${input.id || input.className}, display: ${inputDisplay}`);
            });
        });

        // rowa-l inputs (asset.html, liability.html)
        const rowaLRows = document.querySelectorAll('.rowa-l');
        rowaLRows.forEach(row => {
            const display = getComputedStyle(row).display;
            console.log(`rowa-l row: ${row.id || row.className}, display: ${display}`);
            const inputs = row.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                const inputDisplay = getComputedStyle(input).display;
                console.log(`  rowa-l input: ${input.id}, display: ${inputDisplay}`);
            });
        });

        // Dependants container
        const dependantParent = document.querySelector('.dependant-parent');
        if (dependantParent) {
            console.log(`dependant-parent display: ${getComputedStyle(dependantParent).display}`);
        }
    } catch (error) {
        console.error(`[hideShow.js] Debugging error: ${error.message}`);
    }
}

// Run visibility update on DOM load
document.addEventListener('DOMContentLoaded', updateVisibility);

// Re-run if fillingStatus, dependants, or debt changes
window.addEventListener('storage', (event) => {
    if (event.key === 'fillingStatus' || event.key === 'dependants' || event.key === 'debt') {
        updateVisibility();
    }
});