/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';

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

    // Try to get the frequency from incomeInput first
    const getJSON = window.getJSON || function(name, defaultValue) {
        try {
            const item = localStorage.getItem(name);
            if (!item) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            return defaultValue;
        }
    };
    
    // Get incomeInput value if it exists
    const incomeInput = getJSON('incomeInput', {});
    
    // Extract the base field ID from the frequency ID (remove "_frequency" suffix)
    const baseFieldId = frequencyId.replace('_frequency', '');
    
    // Try to get the frequency from incomeInput only
    const savedFrequency = incomeInput && incomeInput[baseFieldId];
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
        // DO NOT save to local storage here - removed
        console.log(`Corrected multiple selections in ${frequencyId}, set to ${defaultFrequency}`);
    } else if (checkedCount === 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        // DO NOT save to local storage here - removed
    }

    // DO NOT save to local storage here - removed

    // Add event listeners for checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
                
                // DO NOT save to localStorage - removed
                
                // Get current incomeInput and update it
                const getJSON = window.getJSON || function(name, defaultValue) {
                    try {
                        const item = localStorage.getItem(name);
                        if (!item) return defaultValue;
                        return JSON.parse(item);
                    } catch (error) {
                        return defaultValue;
                    }
                };
                
                const setJSON = window.setJSON || function(name, value) {
                    try {
                        if (!name) return false;
                        const jsonString = JSON.stringify(value);
                        localStorage.setItem(name, jsonString);
                        return true;
                    } catch (error) {
                        return false;
                    }
                };
                
                // Get the current incomeInput object
                const incomeInput = getJSON('incomeInput', {});
                const baseFieldId = frequencyId.replace('_frequency', '');
                
                // Update the frequency in incomeInput
                incomeInput[baseFieldId] = this.value;
                setJSON('incomeInput', incomeInput);
                
                console.log(`Set frequency for ${frequencyId} to ${this.value} in incomeInput`);
                
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
    const frequencyGroups = Array.from(document.querySelectorAll('.checkbox-button-group')).map(el => el.id);
    
    // Get incomeInput to update frequencies
    const getJSON = window.getJSON || function(name, defaultValue) {
        try {
            const item = localStorage.getItem(name);
            if (!item) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            return defaultValue;
        }
    };
    
    const setJSON = window.setJSON || function(name, value) {
        try {
            if (!name) return false;
            const jsonString = JSON.stringify(value);
            localStorage.setItem(name, jsonString);
            return true;
        } catch (error) {
            return false;
        }
    };
    
    const incomeInput = getJSON('incomeInput', {});
    let updated = false;
    
    frequencyGroups.forEach(frequencyId => {
        const group = document.getElementById(frequencyId);
        if (group) {
            const checkedCheckbox = group.querySelector('input[type="checkbox"]:checked');
            const value = checkedCheckbox ? checkedCheckbox.value : 'annually';
            
            // DO NOT save to localStorage - removed
            
            // Save to incomeInput
            const baseFieldId = frequencyId.replace('_frequency', '');
            incomeInput[baseFieldId] = value;
            updated = true;
        }
    });
    
    // Save updated incomeInput if changes were made
    if (updated) {
        setJSON('incomeInput', incomeInput);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFrequencyGroups();
    observeDOMChanges();
});

function observeDOMChanges() {
    const observer = new MutationObserver(() => {
        initializeFrequencyGroups();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}