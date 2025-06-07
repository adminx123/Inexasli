/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setJSON } from '/utility/setJSON.js';
import { getJSON } from '/utility/getJSON.js';

// Key for storing all frequency settings in a single JSON object
const FREQUENCIES_STORAGE_KEY = 'frequencySettings';

// Inject CSS styles for frequency buttons
function injectFrequencyStyles() {
    // Check if styles already exist
    if (document.getElementById('frequency-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'frequency-styles';
    style.textContent = `
        /* Frequency checkbox button styling */
        .checkboxrow .checkbox-button-group {
            flex: 1;
            height: 32px;
        }

        .checkbox-button-group {
            display: flex;
            gap: 2px;
            max-width: 100%;
        }

        .checkbox-button-group input[type="checkbox"] {
            display: none;
        }

        .checkbox-button {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 32px;
            background-color: #f8f8f8;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            text-align: center;
            font-size: 13px;
            font-weight: normal;
            user-select: none;
            transition: background-color 0.2s, border-color 0.2s, color 0.2s;
            color: #333;
            min-width: 0;
            box-sizing: border-box;
            font-family: "Inter", sans-serif;
        }

        .checkbox-button:hover {
            background-color: #e8e8e8;
            border-color: #999;
        }

        .checkbox-button-group input[type="checkbox"]:checked + .checkbox-button {
            background-color: #333;
            border-color: #333;
            color: white;
        }

        /* Mobile adjustments */
        @media (max-width: 700px) {
            .checkboxrow {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .checkboxrow input[type="number"] {
                width: 100%;
                max-width: none;
                height: 32px !important;
                padding: 0 8px !important;
            }

            .checkboxrow .checkbox-button-group {
                width: 100%;
                display: flex;
                gap: 4px;
            }

            .checkbox-button {
                font-size: 12px;
                height: 32px;
                padding: 0 6px;
            }
        }
    `;
    
    document.head.appendChild(style);
    console.log('Frequency styles injected');
}

// Helper functions to get/set values in the JSON object
function getFrequencySetting(frequencyId, defaultValue = 'annually') {
    const settings = getJSON(FREQUENCIES_STORAGE_KEY, {});
    return settings[frequencyId] || defaultValue;
}

function saveFrequencySetting(frequencyId, value) {
    const settings = getJSON(FREQUENCIES_STORAGE_KEY, {});
    settings[frequencyId] = value;
    setJSON(FREQUENCIES_STORAGE_KEY, settings);
    return value;
}

// Frequency options
const FREQUENCY_OPTIONS = [
    { value: 'annually', label: '1Y' },
    { value: 'quarterly', label: '3M' },
    { value: 'monthly', label: '1M' },
    { value: 'weekly', label: '1W' }
];

// Generate frequency checkbox group HTML
function createFrequencyGroup(frequencyId) {
    const group = document.createElement('div');
    group.className = 'checkbox-button-group';
    group.id = frequencyId;

    FREQUENCY_OPTIONS.forEach(option => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `${option.value}_${frequencyId}`;
        input.name = frequencyId;
        input.value = option.value;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.className = 'checkbox-button';
        label.textContent = option.label;

        group.appendChild(input);
        group.appendChild(label);
    });

    return group;
}

// Initialize a single frequency group
function initializeFrequencyGroup(frequencyId) {
    const placeholder = document.querySelector(`[data-frequency-id="${frequencyId}"]`);
    if (!placeholder) {
        console.warn(`Placeholder not found for frequency ID: ${frequencyId}`);
        return;
    }

    // Replace placeholder with frequency group
    const group = createFrequencyGroup(frequencyId);
    placeholder.replaceWith(group);

    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length === 0) {
        console.warn(`No checkboxes created for group: ${frequencyId}`);
        return;
    }

    const savedFrequency = getFrequencySetting(frequencyId);
    const defaultFrequency = 'annually';
    const frequencyToSet = savedFrequency || defaultFrequency;

    let checkedCount = 0;
    checkboxes.forEach(checkbox => {
        checkbox.checked = checkbox.value === frequencyToSet;
        if (checkbox.checked) checkedCount++;
    });

    // Ensure only one checkbox is checked
    if (checkedCount > 1) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        saveFrequencySetting(frequencyId, defaultFrequency);
        console.log(`Corrected multiple selections in ${frequencyId}, set to ${defaultFrequency}`);
    } else if (checkedCount === 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        saveFrequencySetting(frequencyId, defaultFrequency);
    }

    // Save the selected frequency
    saveFrequencySetting(frequencyId, frequencyToSet);

    // Add event listeners for checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
                saveFrequencySetting(frequencyId, this.value);
                console.log(`Set frequency for ${frequencyId} to ${this.value}`);
                // Trigger calculation if needed
                if (typeof calculateAll === 'function') {
                    calculateAll();
                }
            } else {
                // Prevent unchecking the only selected checkbox
                this.checked = true;
            }
        });
    });

    console.log(`Initialized group: ${frequencyId}, set to: ${frequencyToSet}`);
}

// Initialize all frequency groups on page load
export function initializeFrequencyGroups() {
    // First, inject the required CSS styles
    injectFrequencyStyles();
    
    const frequencyGroups = Array.from(document.querySelectorAll('[data-frequency-id]')).map(el => el.getAttribute('data-frequency-id'));
    if (frequencyGroups.length === 0) {
        console.warn('No frequency groups found to initialize.');
        return;
    }
    frequencyGroups.forEach(frequencyId => {
        initializeFrequencyGroup(frequencyId);
    });
}

// Save frequency group values
export function saveFrequencyGroups() {
    const settings = getJSON(FREQUENCIES_STORAGE_KEY, {});
    const frequencyGroups = Array.from(document.querySelectorAll('.checkbox-button-group')).map(el => el.id);
    
    frequencyGroups.forEach(frequencyId => {
        const group = document.getElementById(frequencyId);
        if (group) {
            const checkedCheckbox = group.querySelector('input[type="checkbox"]:checked');
            const value = checkedCheckbox ? checkedCheckbox.value : 'annually';
            settings[frequencyId] = value;
        }
    });
    
    // Save all frequencies at once
    setJSON(FREQUENCIES_STORAGE_KEY, settings);
}

// Make functions globally available for reliable access
window.initializeFrequencyGroups = initializeFrequencyGroups;
window.saveFrequencyGroups = saveFrequencyGroups;