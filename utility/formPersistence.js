/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

/**
 * Centralized Form Persistence System for AI Modules
 * 
 * This module provides unified form data persistence functionality for all AI modules.
 * It automatically detects the module context and handles data collection, storage, 
 * and repopulation across all IQ-based modules.
 * 
 * Features:
 * - Auto-detection of module name from URL or context
 * - Unified form data collection and storage
 * - Automatic form repopulation on page load
 * - Grid item state management
 * - Input change tracking and persistence
 * - Clear storage functionality
 * - Integration with existing datain.js grid system
 * 
 * Usage:
 * Import this module and call FormPersistence.init() in your AI module
 */

import { setJSON } from './setJSON.js';
import { getLocalJSON as getJSON } from './getJSON.js';

/**
 * Main FormPersistence class
 */
class FormPersistence {
    constructor() {
        this.moduleName = null;
        this.storageKeys = {
            input: null,
            response: null
        };
        this.initialized = false;
        this.singleSelectionContainers = new Set();
        this.multiSelectionContainers = new Set();
        
        console.log('[FormPersistence] Instance created');
    }

    /**
     * Initialize the form persistence system
     * @param {Object} options - Configuration options
     * @param {string} options.moduleName - Override module name detection
     * @param {Array} options.singleSelection - Array of container IDs that should have single selection
     * @param {Array} options.multiSelection - Array of container IDs that should have multi selection
     * @param {Function} options.customFormDataCollector - Custom function to collect form data
     * @param {Function} options.customFormRepopulator - Custom function to repopulate form
     */
    init(options = {}) {
        try {
            // Auto-detect module name if not provided
            this.moduleName = options.moduleName || this.detectModuleName();
            
            if (!this.moduleName) {
                console.error('[FormPersistence] Could not detect module name');
                return false;
            }

            // Set up storage keys
            this.storageKeys.input = `${this.moduleName}IqInput`;
            this.storageKeys.response = `${this.moduleName}IqResponse`;

            // Configure selection behavior
            if (options.singleSelection) {
                options.singleSelection.forEach(id => this.singleSelectionContainers.add(id));
            }
            if (options.multiSelection) {
                options.multiSelection.forEach(id => this.multiSelectionContainers.add(id));
            }

            // Store custom collectors if provided
            this.customFormDataCollector = options.customFormDataCollector;
            this.customFormRepopulator = options.customFormRepopulator;

            // Set up event listeners
            this.setupEventListeners();

            // Repopulate form from saved data
            this.repopulateForm();

            // Set up input change handlers
            this.setupInputHandlers();

            this.initialized = true;
            console.log(`[FormPersistence] Initialized for module: ${this.moduleName}`);
            
            return true;
        } catch (error) {
            console.error('[FormPersistence] Initialization error:', error);
            return false;
        }
    }

    /**
     * Auto-detect module name from URL or context
     * @returns {string|null} The detected module name
     */
    detectModuleName() {
        try {
            // First try to detect from URL path
            const path = window.location.pathname;
            const matches = path.match(/\/ai\/([^\/]+)\//);
            if (matches && matches[1]) {
                return matches[1].toLowerCase();
            }

            // Try to detect from page title or other indicators
            const title = document.title.toLowerCase();
            const modules = ['calorie', 'fitness', 'decision', 'enneagram', 'event', 'quiz', 'research', 'social', 'philosophy'];
            
            for (const module of modules) {
                if (title.includes(module) || path.includes(module)) {
                    return module;
                }
            }

            // Last resort: try to find elements with module-specific IDs
            for (const module of modules) {
                if (document.querySelector(`[id*="${module}"]`)) {
                    return module;
                }
            }

            return null;
        } catch (error) {
            console.error('[FormPersistence] Module detection error:', error);
            return null;
        }
    }

    /**
     * Set up event listeners for grid item toggles and form changes
     */
    setupEventListeners() {
        // Listen for grid-item-toggled event from datain.js
        document.addEventListener('grid-item-toggled', (event) => {
            this.handleGridItemToggled(event);
        });

        console.log(`[FormPersistence] Event listeners set up for ${this.moduleName}`);
    }

    /**
     * Handle grid item toggle events
     * @param {Event} event - The grid item toggle event
     */
    handleGridItemToggled(event) {
        console.log(`[FormPersistence] Grid item toggled event received for ${this.moduleName}`);
        const item = event.detail.item;
        const container = item.closest('.grid-container');
        
        if (!container) return;

        // Handle single-selection logic for configured containers
        if (this.singleSelectionContainers.has(container.id) || 
            this.isInferredSingleSelection(container)) {
            container.querySelectorAll('.grid-item').forEach(i => {
                if (i !== item) i.classList.remove('selected');
            });
        }
        
        this.saveFormData();
    }

    /**
     * Infer if a container should have single selection based on common patterns
     * @param {Element} container - The container element
     * @returns {boolean} True if it should be single selection
     */
    isInferredSingleSelection(container) {
        const singleSelectionPatterns = [
            'level', 'home-exercises', 'budget', 'timeline', 'priority',
            'difficulty', 'category', 'type', 'format', 'style'
        ];
        
        return singleSelectionPatterns.some(pattern => 
            container.id.toLowerCase().includes(pattern)
        );
    }

    /**
     * Save all form data to localStorage
     */
    saveFormData() {
        console.log(`[FormPersistence] Saving all form data to JSON for ${this.moduleName}`);
        const formData = this.collectFormData();
        setJSON(this.storageKeys.input, formData);
    }

    /**
     * Save input value (convenience method that saves all form data)
     * @param {Element} input - The input element that changed
     */
    saveInput(input) {
        if (!input || !input.id) return;
        console.log(`[FormPersistence] Input changed, saving all form data for ${this.moduleName}`);
        this.saveFormData();
    }

    /**
     * Save grid item state (convenience method that saves all form data)
     * @param {Element} item - The grid item that was toggled
     */
    saveGridItem(item) {
        console.log(`[FormPersistence] Grid item changed, saving all form data for ${this.moduleName}`);
        this.saveFormData();
    }

    /**
     * Collect form data from all inputs and grid items
     * @returns {Object} The collected form data
     */
    collectFormData() {
        // Use custom collector if provided
        if (this.customFormDataCollector) {
            return this.customFormDataCollector();
        }

        // Generic form data collection
        const formData = {};

        // Collect from text inputs, textareas, and selects
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], textarea, select').forEach(element => {
            if (element.id && element.value) {
                const fieldName = this.getFieldName(element.id);
                
                if (element.type === 'number') {
                    formData[fieldName] = parseInt(element.value, 10) || parseFloat(element.value);
                } else {
                    formData[fieldName] = element.value;
                }
            }
        });

        // Collect from grid containers
        document.querySelectorAll('.grid-container').forEach(container => {
            const fieldName = this.getFieldName(container.id);
            const selectedItems = container.querySelectorAll('.grid-item.selected');
            
            if (selectedItems.length > 0) {
                if (this.singleSelectionContainers.has(container.id) || 
                    this.isInferredSingleSelection(container)) {
                    // Single selection - store the first selected value
                    formData[fieldName] = selectedItems[0].dataset.value || selectedItems[0].textContent.trim();
                } else {
                    // Multi selection - store array of values
                    formData[fieldName] = Array.from(selectedItems).map(item => 
                        item.dataset.value || item.textContent.trim()
                    );
                }
            } else {
                // No items selected
                if (this.singleSelectionContainers.has(container.id) || 
                    this.isInferredSingleSelection(container)) {
                    formData[fieldName] = null;
                } else {
                    formData[fieldName] = [];
                }
            }
        });

        return formData;
    }

    /**
     * Extract field name from element ID by removing module prefix
     * @param {string} elementId - The element ID
     * @returns {string} The clean field name
     */
    getFieldName(elementId) {
        // Remove module prefix (e.g., "fitness-goal" -> "goal")
        const prefix = `${this.moduleName}-`;
        if (elementId.startsWith(prefix)) {
            return elementId.substring(prefix.length);
        }
        return elementId;
    }

    /**
     * Repopulate form from saved data in localStorage
     */
    repopulateForm() {
        console.log(`[FormPersistence] Repopulating form from JSON storage for ${this.moduleName}`);
        
        // Use custom repopulator if provided
        if (this.customFormRepopulator) {
            const data = getJSON(this.storageKeys.input, null);
            if (data) {
                this.customFormRepopulator(data);
            }
            return;
        }

        // Generic form repopulation
        const data = getJSON(this.storageKeys.input, null);
        if (!data) return;

        // Repopulate text inputs, textareas, and selects
        Object.entries(data).forEach(([fieldName, value]) => {
            if (value === null || value === undefined) return;

            // Try to find direct element by ID with module prefix
            const elementId = `${this.moduleName}-${fieldName}`;
            let element = document.getElementById(elementId);
            
            // If not found, try without prefix
            if (!element) {
                element = document.getElementById(fieldName);
            }

            if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
                element.value = value;
                return;
            }

            // Handle grid containers
            const containerElement = document.getElementById(elementId) || document.getElementById(fieldName);
            if (containerElement && containerElement.classList.contains('grid-container')) {
                this.repopulateGridContainer(containerElement, value);
            }
        });
    }

    /**
     * Repopulate a grid container with saved values
     * @param {Element} container - The grid container element
     * @param {string|Array} value - The saved value(s)
     */
    repopulateGridContainer(container, value) {
        if (!value) return;

        const values = Array.isArray(value) ? value : [value];
        
        values.forEach(val => {
            // Try to find by data-value first
            let element = container.querySelector(`.grid-item[data-value="${val}"]`);
            
            // If not found, try by text content
            if (!element) {
                const items = container.querySelectorAll('.grid-item');
                element = Array.from(items).find(item => 
                    item.textContent.trim() === val
                );
            }
            
            if (element) {
                element.classList.add('selected');
            }
        });
    }

    /**
     * Set up input change handlers for automatic saving
     */
    setupInputHandlers() {
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('change', () => {
                this.saveInput(element);
            });
        });

        console.log(`[FormPersistence] Input handlers set up for ${this.moduleName}`);
    }

    /**
     * Clear all saved data from localStorage
     * @param {boolean} confirmFirst - Whether to show confirmation dialog
     * @returns {boolean} True if data was cleared
     */
    clearLocalStorage(confirmFirst = true) {
        if (confirmFirst && !confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
            return false;
        }
        
        // Clear stored data
        setJSON(this.storageKeys.input, undefined);
        setJSON(this.storageKeys.response, undefined);
        
        // Clear UI elements
        document.querySelectorAll('.grid-container .grid-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelectorAll('input:not([type="button"]):not([type="submit"])').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });
        
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        console.log(`[FormPersistence] Local storage cleared for ${this.moduleName}`);
        return true;
    }

    /**
     * Get saved form data
     * @returns {Object|null} The saved form data or null if none exists
     */
    getSavedFormData() {
        return getJSON(this.storageKeys.input, null);
    }

    /**
     * Get saved response data
     * @returns {Object|null} The saved response data or null if none exists
     */
    getSavedResponseData() {
        return getJSON(this.storageKeys.response, null);
    }

    /**
     * Save response data
     * @param {Object} responseData - The response data to save
     */
    saveResponseData(responseData) {
        setJSON(this.storageKeys.response, responseData);
        console.log(`[FormPersistence] Response data saved for ${this.moduleName}`);
    }

    /**
     * Get the module name
     * @returns {string} The current module name
     */
    getModuleName() {
        return this.moduleName;
    }

    /**
     * Get the storage keys for this module
     * @returns {Object} Object containing input and response storage keys
     */
    getStorageKeys() {
        return { ...this.storageKeys };
    }
}

// Create and export a singleton instance
const formPersistence = new FormPersistence();

// Export both the instance and the class for flexibility
export default formPersistence;
export { FormPersistence };

// Also make it available globally for backwards compatibility
if (typeof window !== 'undefined') {
    window.FormPersistence = formPersistence;
    
    // Legacy compatibility - expose common methods globally
    window.saveGridItem = function(item) {
        return formPersistence.saveGridItem(item);
    };
    
    window.saveInput = function(input) {
        return formPersistence.saveInput(input);
    };
    
    window.collectFormData = function() {
        return formPersistence.collectFormData();
    };
    
    window.clearLocalStorage = function() {
        return formPersistence.clearLocalStorage();
    };
}
