/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

// Import required modules
import { getLocal } from '/utility/getlocal.js';
import { setLocal } from '/utility/setlocal.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initFrequencyButtons();
    observeDOMChanges();
});

// Initialize frequency buttons
function initFrequencyButtons() {
    const placeholder = document.querySelector('[data-summary-frequency-id]');
    if (!placeholder) {
        console.warn('Summary frequency placeholder not found');
        return;
    }
    
    console.log('Found summary frequency placeholder:', placeholder);
    
    // Clear any existing content in the placeholder
    placeholder.innerHTML = '';
    
    // Create container for the frequency select with a specific ID that matches what summary.html expects
    const hiddenSelect = document.createElement('select');
    hiddenSelect.id = 'frequency';
    hiddenSelect.style.display = 'none';
    
    // Define the frequency options
    const frequencies = [
        { value: 'annual', label: 'Annual' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'weekly', label: 'Weekly' }
    ];
    
    // Create the select options
    frequencies.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        optionElement.selected = option.value === 'annual';
        hiddenSelect.appendChild(optionElement);
    });
    
    // Add the hidden select to the placeholder
    placeholder.appendChild(hiddenSelect);
    
    // Create the wrapper for the buttons
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.display = 'inline-flex';
    buttonWrapper.style.justifyContent = 'center';
    buttonWrapper.style.alignItems = 'center';
    buttonWrapper.style.gap = '15px';
    buttonWrapper.style.margin = '10px 0';
    
    // Create buttons for each frequency option
    frequencies.forEach(option => {
        // Create the button with the exact styling from dataOverwrite.js
        const button = document.createElement('button');
        button.textContent = option.label;
        button.dataset.value = option.value;
        
        // Apply the styling to match dataOverwrite.js garbage can button
        button.style.backgroundColor = option.value === 'annual' ? '#333' : '#f5f5f5';
        button.style.color = option.value === 'annual' ? '#fff' : '#000';
        button.style.border = '2px solid #000';
        button.style.borderRadius = '8px';
        button.style.boxShadow = '4px 4px 0 #000';
        button.style.padding = '10px';
        button.style.width = '80px';
        button.style.height = '40px';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.cursor = 'pointer';
        button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
        button.style.fontFamily = '"Inter", sans-serif';
        button.style.fontSize = '14px';
        
        // Add hover effects
        button.addEventListener('mouseover', function() {
            if (hiddenSelect.value !== button.dataset.value) {
                button.style.backgroundColor = '#FFFFFF';
            }
        });
        
        button.addEventListener('mouseout', function() {
            if (hiddenSelect.value !== button.dataset.value) {
                button.style.backgroundColor = '#f5f5f5';
            }
        });
        
        // Add active/click effects
        button.addEventListener('mousedown', function() {
            button.style.transform = 'translate(2px, 2px)';
            button.style.boxShadow = '2px 2px 0 #000';
        });
        
        button.addEventListener('mouseup', function() {
            button.style.transform = 'translate(0, 0)';
            button.style.boxShadow = '4px 4px 0 #000';
        });
        
        // Add click handler to update the frequency
        button.addEventListener('click', function() {
            // If already selected, do nothing
            if (hiddenSelect.value === button.dataset.value) {
                return;
            }
            
            // Update all button styles
            buttonWrapper.querySelectorAll('button').forEach(btn => {
                btn.style.backgroundColor = '#f5f5f5';
                btn.style.color = '#000';
            });
            
            // Update this button style
            button.style.backgroundColor = '#333';
            button.style.color = '#fff';
            
            // Update the hidden select value
            hiddenSelect.value = button.dataset.value;
            
            // DIRECT UPDATE METHOD - Update elements directly
            // This is a backup approach in case the event doesn't propagate
            directlyUpdateElements(button.dataset.value);
            
            // Dispatch a change event to trigger the updateFreeContent function
            const changeEvent = new Event('change', { bubbles: true });
            hiddenSelect.dispatchEvent(changeEvent);
            
            console.log('Frequency changed to:', button.dataset.value);
            
            // Try standard technique for calling global functions
            if (typeof window.updateFreeContent === 'function') {
                console.log('Calling global updateFreeContent()');
                window.updateFreeContent();
                
                // If premium, update that too
                if (typeof window.updatePremiumContent === 'function' && getLocal('authenticated') === 'paid') {
                    console.log('Calling global updatePremiumContent()');
                    window.updatePremiumContent();
                }
            } else {
                console.warn('updateFreeContent not found as a global function');
            }
        });
        
        buttonWrapper.appendChild(button);
    });
    
    // Add the button wrapper to the placeholder
    placeholder.appendChild(buttonWrapper);
    console.log('Frequency buttons injected successfully');
    
    // Execute direct update once immediately to make sure initial values are correct
    directlyUpdateElements('annual');
}

// Function to directly update elements based on frequency - fallback method
function directlyUpdateElements(frequency) {
    console.log('Directly updating elements for frequency:', frequency);
    
    const multiplier = getFrequencyMultiplier(frequency);
    
    // List of elements to update and their corresponding localStorage keys
    // Only update income and expense related items, not static values like assets/liabilities
    const elementsToUpdate = [
        { id: 'annual_income_sum', key: 'ANNUALINCOME' },
        { id: 'ANNUALEXPENSESUM', key: 'ANNUALEXPENSESUM' },
        { id: 'ESSENTIAL', key: 'ESSENTIAL' },
        { id: 'DISCRETIONARY', key: 'DISCRETIONARY' },
        { id: 'HOUSING', key: 'HOUSING' },
        { id: 'TRANSPORTATION', key: 'TRANSPORTATION' },
        { id: 'DEPENDANT', key: 'DEPENDANT' },
        { id: 'DEBT', key: 'DEBT' }
    ];
    
    // Update each element
    elementsToUpdate.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const value = parseFloat(getLocal(item.key)) || 0;
            element.textContent = '$' + (value * multiplier).toFixed(2);
            console.log(`Updated ${item.id} to $${(value * multiplier).toFixed(2)}`);
        }
    });
    
    // Static values that shouldn't change with frequency
    const staticElements = [
        { id: 'ASSETS', key: 'ASSETS' },
        { id: 'LIABILITIES', key: 'LIABILITIES' },
        { id: 'NETWORTH', key: null, calcFunc: () => 
            (parseFloat(getLocal('ASSETS')) || 0) - (parseFloat(getLocal('LIABILITIES')) || 0) 
        }
    ];
    
    // Update static elements without applying frequency multiplier
    staticElements.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const value = item.calcFunc ? item.calcFunc() : (parseFloat(getLocal(item.key)) || 0);
            element.textContent = '$' + value.toFixed(2);
            console.log(`Updated static element ${item.id} to $${value.toFixed(2)}`);
        }
    });
    
    // If premium, update DISPOSABLEINCOME too
    if (getLocal('authenticated') === 'paid') {
        const disposableElement = document.getElementById('DISPOSABLEINCOME');
        if (disposableElement) {
            const income = parseFloat(getLocal('ANNUALINCOME')) || 0;
            const expenses = parseFloat(getLocal('ANNUALEXPENSESUM')) || 0;
            const regionalTax = parseFloat(getLocal('REGIONALTAXANNUAL')) || 0;
            const subregionalTax = parseFloat(getLocal('SUBREGIONTAXANNUAL')) || 0;
            const obligations = parseFloat(getLocal('OTHEROBLIGATIONANNUAL')) || 0;
            
            const disposableIncome = income - expenses - regionalTax - subregionalTax - obligations;
            disposableElement.textContent = '$' + (disposableIncome * multiplier).toFixed(2);
            console.log(`Updated DISPOSABLEINCOME to $${(disposableIncome * multiplier).toFixed(2)}`);
        }
    }
}

// Helper function to get frequency multiplier
function getFrequencyMultiplier(frequency) {
    switch (frequency) {
        case 'monthly': return 1 / 12;
        case 'weekly': return 1 / 52;
        default: return 1; // annual
    }
}

// Observer to handle dynamic DOM changes - similar to frequency.js approach
function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // Check if any of the added nodes contain our element of interest
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector && node.querySelector('[data-summary-frequency-id]')) {
                            console.log('Found dynamic summary frequency placeholder');
                            initFrequencyButtons();
                            return;
                        } else if (node.hasAttribute && node.hasAttribute('data-summary-frequency-id')) {
                            console.log('Found dynamic summary frequency placeholder (direct)');
                            initFrequencyButtons();
                            return;
                        }
                    }
                });
            }
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('DOM observer initialized for frequency buttons');
}