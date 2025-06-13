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
    console.log('🔧 injectFrequencyStyles called');
    
    // Check if styles already exist
    if (document.getElementById('frequency-styles')) {
        console.log('✅ Frequency styles already exist, skipping injection');
        return;
    }

    const style = document.createElement('style');
    style.id = 'frequency-styles';
    style.textContent = `
        /* Frequency checkbox button base styling */
        .checkbox-button-group {
            display: flex;
            gap: 4px;
            width: 100%;
        }

        .checkbox-button-group input[type="checkbox"] {
            display: none;
        }

        .checkbox-button {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            background-color: #f8f8f8;
            border: 1px solid #ccc;
            cursor: pointer;
            text-align: center;
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
    `;
    
    document.head.appendChild(style);
    console.log('✅ Frequency styles injected successfully');
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
    console.log(`🔧 initializeFrequencyGroup called for: ${frequencyId}`);
    
    const placeholder = document.querySelector(`[data-frequency-id="${frequencyId}"]`);
    if (!placeholder) {
        console.warn(`❌ Placeholder not found for frequency ID: ${frequencyId}`);
        return;
    }
    
    console.log(`✅ Found placeholder for ${frequencyId}:`, placeholder);

    // Replace placeholder with frequency group
    const group = createFrequencyGroup(frequencyId);
    console.log(`🔧 Created frequency group for ${frequencyId}:`, group);
    
    placeholder.replaceWith(group);
    console.log(`🔧 Replaced placeholder with group for ${frequencyId}`);

    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    console.log(`🔧 Found ${checkboxes.length} checkboxes in group ${frequencyId}`);
    
    if (checkboxes.length === 0) {
        console.warn(`❌ No checkboxes created for group: ${frequencyId}`);
        return;
    }

    const savedFrequency = getFrequencySetting(frequencyId);
    const defaultFrequency = 'annually';
    const frequencyToSet = savedFrequency || defaultFrequency;
    
    console.log(`🔧 Setting frequency for ${frequencyId} to: ${frequencyToSet} (saved: ${savedFrequency})`);

    let checkedCount = 0;
    checkboxes.forEach(checkbox => {
        checkbox.checked = checkbox.value === frequencyToSet;
        if (checkbox.checked) {
            checkedCount++;
            console.log(`✅ Checked checkbox: ${checkbox.value} for ${frequencyId}`);
        }
    });

    // Ensure only one checkbox is checked
    if (checkedCount > 1) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        saveFrequencySetting(frequencyId, defaultFrequency);
        console.log(`🔧 Corrected multiple selections in ${frequencyId}, set to ${defaultFrequency}`);
    } else if (checkedCount === 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        saveFrequencySetting(frequencyId, defaultFrequency);
        console.log(`🔧 No selection found in ${frequencyId}, set to ${defaultFrequency}`);
    }

    // Save the selected frequency
    saveFrequencySetting(frequencyId, frequencyToSet);

    // Add event listeners for label clicks (better UX than checkbox changes)
    checkboxes.forEach(checkbox => {
        const label = group.querySelector(`label[for="${checkbox.id}"]`);
        console.log(`🔧 Setting up event listener for ${checkbox.id}, label:`, label);
        
        if (label) {
            label.addEventListener('click', function (event) {
                event.preventDefault(); // Prevent default label behavior
                console.log(`🔧 Label clicked for ${checkbox.value} in ${frequencyId}`);
                
                // Uncheck all checkboxes in this group
                checkboxes.forEach(cb => {
                    cb.checked = false;
                    console.log(`🔧 Unchecked: ${cb.value}`);
                });
                
                // Check the clicked checkbox
                checkbox.checked = true;
                console.log(`✅ Checked: ${checkbox.value}`);
                
                saveFrequencySetting(frequencyId, checkbox.value);
                console.log(`💾 Saved frequency for ${frequencyId}: ${checkbox.value}`);
                
                // Trigger calculation if needed
                if (typeof calculateAll === 'function') {
                    calculateAll();
                }
                
                // Trigger normalization when frequency changes
                if (typeof window.normalizeIncomeExpenses === 'function') {
                    console.log(`🔧 Triggering normalization after frequency change: ${checkbox.value}`);
                    const normalizationResult = window.normalizeIncomeExpenses();
                    if (normalizationResult.success) {
                        console.log(`✅ Normalization completed for frequency change`);
                    } else {
                        console.warn(`⚠️ Normalization failed for frequency change:`, normalizationResult.error);
                    }
                }
            });
        } else {
            console.warn(`❌ No label found for checkbox: ${checkbox.id}`);
        }
    });

    console.log(`✅ Initialized group: ${frequencyId}, set to: ${frequencyToSet}`);
}

// Initialize all frequency groups on page load
export function initializeFrequencyGroups() {
    console.log('🔧 initializeFrequencyGroups called');
    
    // First, inject the required CSS styles
    injectFrequencyStyles();
    
    const frequencyPlaceholders = document.querySelectorAll('[data-frequency-id]');
    console.log(`🔧 Found ${frequencyPlaceholders.length} frequency placeholders`);
    
    if (frequencyPlaceholders.length === 0) {
        console.warn('No frequency groups found to initialize.');
        return;
    }
    
    const frequencyGroups = Array.from(frequencyPlaceholders).map(el => el.getAttribute('data-frequency-id'));
    console.log('🔧 Frequency groups to initialize:', frequencyGroups);
    
    frequencyGroups.forEach(frequencyId => {
        console.log(`🔧 Initializing group: ${frequencyId}`);
        initializeFrequencyGroup(frequencyId);
    });
    
    console.log('🔧 All frequency groups initialized');
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

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 frequency.js DOMContentLoaded event fired');
        setTimeout(() => {
            if (document.querySelectorAll('[data-frequency-id]').length > 0) {
                console.log('🔧 Auto-initializing frequency groups from frequency.js');
                initializeFrequencyGroups();
            }
        }, 100);
    });
} else {
    console.log('🔧 frequency.js loaded, DOM already ready');
    setTimeout(() => {
        if (document.querySelectorAll('[data-frequency-id]').length > 0) {
            console.log('🔧 Auto-initializing frequency groups from frequency.js');
            initializeFrequencyGroups();
        }
    }, 100);
}