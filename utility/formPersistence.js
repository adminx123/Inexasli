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
import { getJSON } from './getJSON.js';
import { getLocal } from './getlocal.js';

/**
 * Main FormPersistence class
 */
class FormPersistence {
    static _instances = {};
    static getInstance(moduleName, options = {}) {
        if (!moduleName) throw new Error('Module name required for FormPersistence instance');
        if (!FormPersistence._instances[moduleName]) {
            FormPersistence._instances[moduleName] = new FormPersistence(moduleName, options);
        }
        return FormPersistence._instances[moduleName];
    }

    constructor(moduleName = null, options = {}) {
        this.moduleName = moduleName || options.moduleName || null;
        this.storageKeys = {
            input: this.moduleName ? `${this.moduleName}IqInput` : null,
            response: this.moduleName ? `${this.moduleName}IqResponse` : null
        };
        this.initialized = false;
        this.singleSelectionContainers = new Set();
        this.multiSelectionContainers = new Set();
        this.customFormDataCollector = null;
        this.customFormRepopulator = null;
        if (options.singleSelection) {
            options.singleSelection.forEach(id => this.singleSelectionContainers.add(id));
        }
        if (options.multiSelection) {
            options.multiSelection.forEach(id => this.multiSelectionContainers.add(id));
        }
        if (options.customFormDataCollector) this.customFormDataCollector = options.customFormDataCollector;
        if (options.customFormRepopulator) this.customFormRepopulator = options.customFormRepopulator;
        console.log('[FormPersistence] Instance created for', this.moduleName);
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
            // Always reset moduleName and storageKeys on each init
            this.moduleName = options.moduleName || this.getModuleNameFromLastGridItemUrl();
            this.storageKeys = {
                input: this.moduleName ? `${this.moduleName}IqInput` : null,
                response: this.moduleName ? `${this.moduleName}IqResponse` : null
            };

            // Always reset selection containers
            this.singleSelectionContainers = new Set();
            this.multiSelectionContainers = new Set();

            if (!this.moduleName) {
                console.error('[FormPersistence] Could not detect module name');
                return false;
            }

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

            // Set up grid item event binding
            this.bindGridItemEvents();

            // Repopulate form from saved data
            this.repopulateForm();

            // Set up input change handlers
            this.setupInputHandlers();

            this.initialized = true;
            console.log(`[FormPersistence] Initialized for module: ${this.moduleName}`);
            console.log(`[FormPersistence][DEBUG] init: moduleName=${this.moduleName}, storageKeys=`, this.storageKeys, 'options:', options);
            
            return true;
        } catch (error) {
            console.error('[FormPersistence] Initialization error:', error);
            return false;
        }
    }

    /**
     * Bind click events to all grid items for selection and persistence
     * This replaces the need for external grid-item-toggled events
     */
    bindGridItemEvents() {
        const gridItems = document.querySelectorAll('.grid-container .grid-item');
        gridItems.forEach(item => {
            if (!item.dataset.value) return;
            item.removeEventListener('click', item._fpGridClickHandler || (()=>{}));
            const handler = (e) => {
                e.preventDefault();
                const container = item.closest('.grid-container');
                if (!container) return;
                if (this.singleSelectionContainers.has(container.id) || this.isInferredSingleSelection(container)) {
                    container.querySelectorAll('.grid-item').forEach(i => {
                        if (i !== item) i.classList.remove('selected');
                    });
                    item.classList.add('selected');
                } else {
                    item.classList.toggle('selected');
                }
                this.saveFormData();
                // Dispatch event for next-stage logic (compatibility with guidedForms, etc)
                const toggleEvent = new CustomEvent('grid-item-toggled', { detail: { item } });
                document.dispatchEvent(toggleEvent);
            };
            item._fpGridClickHandler = handler;
            item.addEventListener('click', handler);
        });
        console.log(`[FormPersistence] Grid item event binding complete for ${this.moduleName}`);
    }

    /**
     * Get module name from lastGridItemUrl using getLocal.js
     * @returns {string|null} The module name
     */
    getModuleNameFromLastGridItemUrl() {
        try {
            const lastUrl = getLocal('lastGridItemUrl', null);
            if (!lastUrl) return null;
            // Example: /ai/calorie/calorieiq.html or /ai/fitness/fitnessiq.html
            const matches = lastUrl.match(/\/ai\/([^\/]+)\//);
            if (matches && matches[1]) {
                return matches[1].toLowerCase();
            }
            return null;
        } catch (error) {
            console.error('[FormPersistence] Error extracting module name from lastGridItemUrl:', error);
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

        // Listen for image upload changes to auto-save form data
        document.addEventListener('imageUploadChanged', (event) => {
            console.log(`[FormPersistence] Image upload changed, auto-saving form data for ${this.moduleName}`);
            this.saveFormData();
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
     * Get the current grid item key for localStorage (module-wide key, e.g. calorieIqInput)
     * @returns {string|null} The module-wide key for form data
     */
    getCurrentGridItemKey() {
        if (!this.moduleName) {
            this.moduleName = this.getModuleNameFromLastGridItemUrl();
        }
        if (!this.moduleName) return null;
        return `${this.moduleName}IqInput`;
    }

    /**
     * Save all form data to localStorage under the module-wide key (e.g. calorieIqInput)
     */
    saveFormData() {
        const gridKey = this.getCurrentGridItemKey();
        if (!gridKey) {
            console.warn('[FormPersistence] No module key found, not saving form data.');
            return;
        }
        // Extra guard: Only save if DOM contains at least one field for this module
        const modulePrefix = `${this.moduleName}-`;
        const hasModuleField = !!document.querySelector(
            `input[id^="${modulePrefix}"], textarea[id^="${modulePrefix}"], select[id^="${modulePrefix}"], .grid-container[id^="${modulePrefix}"]`
        );
        if (!hasModuleField) {
            console.warn('[FormPersistence] No DOM fields found for module', this.moduleName, '- skipping save to avoid overwriting.');
            return;
        }
        const formData = this.collectFormData();
        // Guard: Only save if at least one non-empty field for this module exists
        const hasRelevantData = Object.entries(formData).some(([key, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
            return value !== null && value !== undefined && value !== '';
        });
        if (!hasRelevantData) {
            console.warn('[FormPersistence] No relevant data found in DOM for module', this.moduleName, '- skipping save to avoid overwriting.');
            return;
        }
        setJSON(gridKey, formData);
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

        // Use generic collection logic
        return this.collectGenericFormData();
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
     * Repopulate form from saved data in localStorage for the current module
     */
    repopulateForm() {
        const gridKey = this.getCurrentGridItemKey();
        console.log(`[FormPersistence][DEBUG] repopulateForm: gridKey=${gridKey}`);
        if (!gridKey) {
            console.warn('[FormPersistence] No module key found, cannot repopulate form.');
            return;
        }
        const data = getJSON(gridKey, null);
        console.log('[FormPersistence][DEBUG] repopulateForm: loaded data =', data);
        if (!data) return;
        
        // Auto-detect and recreate dynamic inputs before repopulation
        this.recreateDynamicInputs(data);
        
        if (this.customFormRepopulator) {
            this.customFormRepopulator(data);
            return;
        }
        this.repopulateGenericForm(data);
        // Dispatch a custom event to signal repopulation is complete
        document.dispatchEvent(new Event('formpersistence:repopulated'));
    }

    /**
     * Auto-detect and recreate dynamic inputs based on saved data patterns
     * This method analyzes saved data to identify dynamic field patterns and 
     * automatically calls the appropriate functions to recreate those DOM elements
     * @param {Object} data - The saved form data
     */
    recreateDynamicInputs(data) {
        if (!data || typeof data !== 'object') return;
        
        console.log('[FormPersistence] Auto-detecting dynamic inputs from saved data:', data);
        
        // Detect dynamic patterns in field names
        const dynamicPatterns = this.detectDynamicPatterns(data);
        
        for (const pattern of dynamicPatterns) {
            console.log('[FormPersistence] Found dynamic pattern:', pattern);
            this.recreatePatternInputs(pattern);
        }
    }

    /**
     * Detect dynamic patterns in saved field names
     * @param {Object} data - The saved form data
     * @returns {Array} Array of detected patterns
     */
    detectDynamicPatterns(data) {
        const patterns = [];
        const fieldNames = Object.keys(data);
        
        // Look for numbered patterns like "snack4", "snack5", "meal2", etc.
        const numberedPatternRegex = /^([a-zA-Z]+)(\d+)$/;
        const numberedFields = {};
        
        fieldNames.forEach(fieldName => {
            const match = fieldName.match(numberedPatternRegex);
            if (match) {
                const basePattern = match[1]; // e.g., "snack"
                const number = parseInt(match[2], 10); // e.g., 4
                
                if (!numberedFields[basePattern]) {
                    numberedFields[basePattern] = [];
                }
                numberedFields[basePattern].push(number);
            }
        });
        
        // Convert detected numbered fields to patterns
        Object.entries(numberedFields).forEach(([basePattern, numbers]) => {
            if (numbers.length > 0) {
                const maxNumber = Math.max(...numbers);
                patterns.push({
                    type: 'numbered',
                    basePattern: basePattern,
                    maxNumber: maxNumber,
                    detectedNumbers: numbers.sort((a, b) => a - b)
                });
            }
        });
        
        return patterns;
    }

    /**
     * Recreate dynamic inputs based on detected patterns
     * @param {Object} pattern - The detected pattern object
     */
    recreatePatternInputs(pattern) {
        if (pattern.type === 'numbered') {
            this.recreateNumberedInputs(pattern);
        }
    }

    /**
     * Recreate numbered dynamic inputs (e.g., snack4, snack5)
     * @param {Object} pattern - The numbered pattern object
     */
    recreateNumberedInputs(pattern) {
        const { basePattern, maxNumber, detectedNumbers } = pattern;
        
        console.log('[FormPersistence] Recreating numbered inputs for pattern:', basePattern, 'up to number:', maxNumber);
        
        // CalorieIQ specific: handle meal inputs (snack, breakfast, lunch, dinner)
        if (this.moduleName === 'calorie' && ['snack', 'breakfast', 'lunch', 'dinner'].includes(basePattern)) {
            this.recreateCalorieMealInputs(basePattern, detectedNumbers);
            return;
        }
        
        // Generic numbered input recreation - look for add functions in the global scope
        this.recreateGenericNumberedInputs(pattern);
    }

    /**
     * Recreate CalorieIQ meal inputs by calling addMealInput function
     * @param {string} basePattern - The base pattern (e.g., "snack")
     * @param {Array} numbers - Array of numbers that need to be recreated
     */
    recreateCalorieMealInputs(basePattern, numbers) {
        // Check if addMealInput function exists in global scope or window.calorieIq
        let addMealInputFn = null;
        
        if (typeof window.addMealInput === 'function') {
            addMealInputFn = window.addMealInput;
        } else if (window.calorieIq && typeof window.calorieIq.addMealInput === 'function') {
            addMealInputFn = window.calorieIq.addMealInput;
        }
        
        if (!addMealInputFn) {
            console.warn('[FormPersistence] addMealInput function not found in global scope for CalorieIQ');
            return;
        }
        
        // For CalorieIQ, we need to call addMealInput for each missing dynamic input
        numbers.forEach(number => {
            // Check if the DOM element already exists
            const expectedElementId = `calorie-${basePattern}${number}`;
            if (!document.getElementById(expectedElementId)) {
                console.log('[FormPersistence] Recreating CalorieIQ meal input for:', basePattern, number);
                try {
                    // Call addMealInput with the specific meal type and skip repositioning during repopulation
                    addMealInputFn(`${basePattern}${number}`, '', true);
                } catch (error) {
                    console.error('[FormPersistence] Error calling addMealInput:', error);
                }
            }
        });
    }

    /**
     * Generic recreation of numbered inputs by looking for appropriate functions
     * @param {Object} pattern - The pattern object
     */
    recreateGenericNumberedInputs(pattern) {
        const { basePattern, detectedNumbers } = pattern;
        
        // Look for common function naming patterns
        const possibleFunctionNames = [
            `add${basePattern.charAt(0).toUpperCase() + basePattern.slice(1)}Input`,
            `add${basePattern.charAt(0).toUpperCase() + basePattern.slice(1)}`,
            `addInput`,
            `addField`,
            `addDynamicInput`
        ];
        
        let foundFunction = null;
        for (const functionName of possibleFunctionNames) {
            if (typeof window[functionName] === 'function') {
                foundFunction = window[functionName];
                console.log('[FormPersistence] Found recreation function:', functionName);
                break;
            }
        }
        
        if (foundFunction) {
            detectedNumbers.forEach(number => {
                // Check if the DOM element already exists
                const possibleElementIds = [
                    `${this.moduleName}-${basePattern}${number}`,
                    `${basePattern}${number}`,
                    `${basePattern}-${number}`
                ];
                
                const elementExists = possibleElementIds.some(id => document.getElementById(id));
                
                if (!elementExists) {
                    console.log('[FormPersistence] Recreating generic numbered input for:', basePattern, number);
                    try {
                        foundFunction();
                    } catch (error) {
                        console.error('[FormPersistence] Error calling recreation function:', error);
                    }
                }
            });
        } else {
            console.warn('[FormPersistence] No recreation function found for pattern:', basePattern);
        }
    }

    /**
     * Repopulate a grid container with saved values
     * @param {Element} container - The grid container element
     * @param {string|Array} value - The saved value(s)
     */
    repopulateGridContainer(container, value) {
        if (!value) return;

        const values = Array.isArray(value) ? value : [value];
        
        console.log(`[FormPersistence][DEBUG] repopulateGridContainer: container.id=${container.id}, values=`, values);
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
                console.log(`[FormPersistence][DEBUG] repopulateGridContainer: selected grid-item for value=`, val, 'element=', element);
            } else {
                console.warn(`[FormPersistence][DEBUG] repopulateGridContainer: No grid-item found for value=`, val, 'in container.id=', container.id);
            }
        });
    }

    /**
     * Set up input change handlers for automatic saving
     */
    setupInputHandlers() {
        document.querySelectorAll('input, textarea, select').forEach(element => {
            // Skip if element already has our handler
            if (element._fpHandlerAttached) return;
            
            element.addEventListener('change', () => {
                this.saveInput(element);
            });
            
            // Mark as having our handler to prevent duplicates
            element._fpHandlerAttached = true;
        });

        console.log(`[FormPersistence] Input handlers set up for ${this.moduleName}`);
    }

    /**
     * Public method to recreate dynamic inputs based on current saved data
     * This can be called by external modules if they need to manually trigger
     * dynamic input recreation
     */
    recreateDynamicInputsFromSavedData() {
        const savedData = this.getSavedFormData();
        if (savedData) {
            this.recreateDynamicInputs(savedData);
        }
    }

    /**
     * Refresh input handlers to pick up any dynamically added inputs
     * This method can be called by modules after adding new form elements
     */
    refreshInputHandlers() {
        console.log(`[FormPersistence] Refreshing input handlers for ${this.moduleName}`);
        this.setupInputHandlers();
    }

    /**
     * Clear all saved data for the current module from localStorage
     * @param {boolean} confirmFirst - Whether to show confirmation dialog
     * @returns {boolean} True if data was cleared
     */
    clearLocalStorage(confirmFirst = true) {
        if (confirmFirst && !confirm('Are you sure you want to clear all saved data for this module? This action cannot be undone.')) {
            return false;
        }
        const gridKey = this.getCurrentGridItemKey();
        if (gridKey) {
            setJSON(gridKey, undefined);
        }
        
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

        console.log(`[FormPersistence] Local storage cleared for module: ${gridKey}`);
        return true;
    }

    /**
     * Get saved form data for the current module
     * @returns {Object|null} The saved form data or null if none exists
     */
    getSavedFormData() {
        const gridKey = this.getCurrentGridItemKey();
        if (!gridKey) return null;
        return getJSON(gridKey, null);
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

    /**
     * Generic form data collection (public method for use in custom collectors)
     * @returns {Object} The collected form data using generic logic
     */
    collectGenericFormData() {
        const formData = {};
        let foundRelevantField = false;
        // Collect from text inputs, textareas, and selects
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], textarea, select').forEach(element => {
            if (element.id && element.value) {
                const fieldName = this.getFieldName(element.id);
                foundRelevantField = true;
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
                foundRelevantField = true;
                if (this.singleSelectionContainers.has(container.id) || 
                    this.isInferredSingleSelection(container)) {
                    formData[fieldName] = selectedItems[0].dataset.value || selectedItems[0].textContent.trim();
                } else {
                    formData[fieldName] = Array.from(selectedItems).map(item => 
                        item.dataset.value || item.textContent.trim()
                    );
                }
            } else {
                if (this.singleSelectionContainers.has(container.id) || 
                    this.isInferredSingleSelection(container)) {
                    formData[fieldName] = null;
                } else {
                    formData[fieldName] = [];
                }
            }
        });
        // If no relevant fields found, return empty object
        if (!foundRelevantField) return {};
        return formData;
    }

    /**
     * Generic form repopulation (public method for use in custom repopulators)
     * @param {Object} data - The data to use for repopulation
     */
    repopulateGenericForm(data) {
        if (!data) return;
        console.log('[FormPersistence][DEBUG] repopulateGenericForm: data =', data);
        // Repopulate text inputs, textareas, and selects
        Object.entries(data).forEach(([fieldName, value]) => {
            if (value === null || value === undefined) return;
            const elementId = `${this.moduleName}-${fieldName}`;
            let element = document.getElementById(elementId);
            if (!element) {
                element = document.getElementById(fieldName);
            }
            console.log(`[FormPersistence][DEBUG] repopulateGenericForm: fieldName=${fieldName}, value=`, value, 'elementId=', elementId, 'element=', element);
            if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
                element.value = value;
                console.log(`[FormPersistence][DEBUG] Set value for element id=${element.id}`);
                // If textarea, trigger autoExpandTextarea if available
                if (element.tagName === 'TEXTAREA' && typeof window.autoExpandTextarea === 'function') {
                    window.autoExpandTextarea(element);
                }
                return;
            }
            // Handle grid containers
            const containerElement = document.getElementById(elementId) || document.getElementById(fieldName);
            if (containerElement && containerElement.classList.contains('grid-container')) {
                console.log(`[FormPersistence][DEBUG] repopulateGenericForm: repopulating grid container id=${containerElement.id} with value=`, value);
                this.repopulateGridContainer(containerElement, value);
            }
        });
        
        // Refresh input handlers to pick up any newly created dynamic inputs
        this.refreshInputHandlers();
    }
}

// Remove legacy singleton/global export and window.FormPersistence
// Only export the FormPersistence class
export { FormPersistence };
