/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

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

    const isPartnerGroup = frequencyId.includes('_partner');
    const savedFrequency = getLocal(`frequency_${frequencyId}`);
    const defaultFrequency = 'annually';
    const frequencyToSet = isPartnerGroup ? (savedFrequency || defaultFrequency) : (savedFrequency || defaultFrequency);

    let checkedCount = 0;
    checkboxes.forEach(checkbox => {
        checkbox.checked = checkbox.value === frequencyToSet;
        if (checkbox.checked) checkedCount++;
    });

    if (checkedCount > 1) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === defaultFrequency;
        });
        setLocal(`frequency_${frequencyId}`, defaultFrequency, 365);
        console.log(`Corrected multiple selections in ${frequencyId}, set to ${defaultFrequency}`);
    } else if (checkedCount === 0) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === frequencyToSet;
        });
        setLocal(`frequency_${frequencyId}`, frequencyToSet, 365);
    }

    setLocal(`frequency_${frequencyId}`, frequencyToSet, 365);

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
                setLocal(`frequency_${frequencyId}`, this.value, 365);
                console.log(`Set frequency for ${frequencyId} to ${this.value}`);
            } else {
                this.checked = true;
                setLocal(`frequency_${frequencyId}`, this.value, 365);
            }
        });
    });

    console.log(`Initialized group: ${frequencyId}, set to: ${frequencyToSet}`);
}

// Initialize all frequency groups
export function initializeFrequencyGroups(frequencyGroups) {
    frequencyGroups.forEach(frequencyId => {
        initializeFrequencyGroup(frequencyId);
    });
}

// Save frequency group values
export function saveFrequencyGroups(frequencyGroups) {
    frequencyGroups.forEach(frequencyId => {
        const group = document.getElementById(frequencyId);
        if (group) {
            const checkedCheckbox = group.querySelector('input[type="checkbox"]:checked');
            const value = checkedCheckbox ? checkedCheckbox.value : '';
            setLocal(`frequency_${frequencyId}`, value, 365);
        }
    });
}