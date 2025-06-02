/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

/**
 * landing.js
 * Main functionality for the landing page
 * 
 * NOTE: This file works in conjunction with utility/category.js
 * - Product items and grid functionality have been moved to category.js
 * - This file provides core UI mode toggling and container visibility management
 * - It exports toggleUiMode and setLocal for use by category.js
 */

// Add initial style tag to prevent flash of content
(function() {
    const initialStyle = document.createElement('style');
    initialStyle.id = 'initial-container-hide';
    initialStyle.textContent = `
        .data-container-intro, .data-container-income, .data-container-expense,
        .data-container-asset, .data-container-liability, .data-container-summary {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    document.head.appendChild(initialStyle);
})();

import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';

// Define selectors once to avoid duplication
const SELECTORS = {
    budget: [
        '.data-container-intro',
        '.data-container-income',
        '.data-container-expense',
        '.data-container-asset',
        '.data-container-liability',
        '.data-container-summary'
    ],
    data: [
        '.data-container-left',
        '.data-container-right'
    ]
};

// UI Manager to handle all UI-related functionality
const UIManager = {
    styleSheet: null,
    
    // Initialize the style controller
    initStyles() {
        // Remove any existing controller first
        const existingController = document.getElementById('container-visibility-controller');
        if (existingController) {
            existingController.remove();
        }
        
        // Create new style element
        const styleElement = document.createElement('style');
        styleElement.id = 'container-visibility-controller';
        document.head.appendChild(styleElement);
        this.styleSheet = styleElement.sheet;
        return this.styleSheet;
    },
    
    // Clear all existing CSS rules
    clearRules() {
        if (!this.styleSheet) return;
        while (this.styleSheet.cssRules.length > 0) {
            this.styleSheet.deleteRule(0);
        }
    },
    
    // Apply CSS rules based on mode
    applyRules(isBudgetMode) {
        this.clearRules();
        
        if (isBudgetMode) {
            // Hide data containers
            SELECTORS.data.forEach(selector => {
                this.styleSheet.insertRule(`${selector} { display: none !important; }`, 0);
            });
            
            // Show budget tabs
            SELECTORS.budget.forEach(selector => {
                this.styleSheet.insertRule(`${selector} { visibility: visible; }`, 0);
            });
        } else {
            // Hide budget tabs
            SELECTORS.budget.forEach(selector => {
                this.styleSheet.insertRule(`${selector} { visibility: hidden; }`, 0);
            });
        }
    },
    
    // Apply direct DOM style changes for immediate effect
    applyDOMStyles(isBudgetMode) {
        // Use querySelectorAll to get all matching elements, not just the first one
        const dataContainers = [];
        const budgetContainers = [];
        
        // Collect all elements for both selectors
        SELECTORS.data.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => dataContainers.push(el));
        });
        
        SELECTORS.budget.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => budgetContainers.push(el));
        });
        
        if (isBudgetMode) {
            // Hide data containers (excluding data-container-left to avoid overriding datain.js)
            dataContainers.forEach(element => {
                // --- CHANGE: Skip data-container-left to prevent hiding it ---
                if (element.classList.contains('data-container-left')) return;
                if (element) {
                    element.style.setProperty('display', 'none', 'important');
                }
            });
            
            // Show budget tabs - ensure they're fully visible with opacity
            budgetContainers.forEach(element => {
                if (element) {
                    element.style.removeProperty('display');
                    element.style.setProperty('visibility', 'visible');
                    element.style.setProperty('opacity', '1');
                }
            });
        } else {
            // Hide budget tabs - use both display:none and visibility:hidden
            budgetContainers.forEach(element => {
                if (element) {
                    element.style.setProperty('display', 'none', 'important');
                    element.style.setProperty('visibility', 'hidden', 'important');
                    element.style.setProperty('opacity', '0', 'important');
                }
            });
            
            // Show data containers
            dataContainers.forEach(element => {
                if (element) {
                    // --- CHANGE: Explicitly ensure visibility for data-container-left ---
                    element.style.removeProperty('display');
                    if (element.classList.contains('data-container-left')) {
                        element.style.setProperty('visibility', 'visible');
                        element.style.setProperty('opacity', '1');
                    }
                }
            });
        }
    },
    
    // Initialize budget flow when in budget mode
    initBudgetFlow() {
        // Make sure all tabs are visible first
        SELECTORS.budget.forEach(selector => {
            const tab = document.querySelector(selector);
            if (tab) tab.style.visibility = 'visible';
        });
        
        // Call manual initialization function
        if (typeof window.manuallyInitBudgetFlow === 'function') {
            window.manuallyInitBudgetFlow();
        } else {
            console.error('Budget flow initialization function not found');
        }
    },
    
    // Hide all containers on initial load
    hideAllInitially() {
        this.clearRules();
        
        // --- CHANGE: Hide only data-container-right, not data-container-left ---
        SELECTORS.data.forEach(selector => {
            if (selector !== '.data-container-left') {
                this.styleSheet.insertRule(`${selector} { display: none !important; }`, 0);
            }
        });
        
        // Aggressively hide budget tabs
        SELECTORS.budget.forEach(selector => {
            this.styleSheet.insertRule(`${selector} { display: none !important; visibility: hidden !important; opacity: 0 !important; }`, 0);
        });
        
        // Apply direct DOM styles for budget containers
        this.applyDOMStyles(false);
        
        // Apply styles directly to budget elements to ensure they're hidden
        SELECTORS.budget.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('opacity', '0', 'important');
                }
            });
        });
    },
    
    // Master function to toggle UI mode
    setMode(isBudgetMode) {
        // Save the mode in localStorage for persistence
        setLocal('budgetModeActive', isBudgetMode ? 'true' : 'false');
        
        // Apply CSS rules
        this.applyRules(isBudgetMode);
        
        // Apply direct DOM manipulation
        this.applyDOMStyles(isBudgetMode);
        
        // Initialize budget flow if needed
        if (isBudgetMode) {
            setTimeout(() => this.initBudgetFlow(), 500);
        }
    }
};

// Main initialization function that runs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const currentTime = Date.now();
    
    // Set the prompt cookie for datain.js, dataout.js, and promptgrid.js
    document.cookie = `prompt=${currentTime}; path=/; max-age=86400`;
    
    // Initialize UI manager and set up styles
    UIManager.initStyles();
    UIManager.hideAllInitially();
    
    // Export functions for category.js to use
    window.toggleUiMode = function(isBudgetMode) {
        UIManager.setMode(isBudgetMode);
    };
    window.setLocal = setLocal;
    
    // Check if we should be in budget mode on page load
    const lastGridItemUrl = getLocal('lastGridItemUrl');
    if (lastGridItemUrl) {
        const shouldActivateBudgetMode = lastGridItemUrl === '/ai/income/intro.html';
        
        // Reduced delay for faster transition and to prevent flashing
        setTimeout(() => {
            UIManager.setMode(shouldActivateBudgetMode);
        }, 100);
    }
    
    // Remove the initial style tag once the UI manager has taken over
    const initialStyleTag = document.getElementById('initial-container-hide');
    if (initialStyleTag) {
        setTimeout(() => initialStyleTag.remove(), 200);
    }
    
    // Force initialization events for components
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('force-components-init', {
            detail: { timestamp: currentTime }
        }));
    }, 100);
});