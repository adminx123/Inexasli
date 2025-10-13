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
import { validateText, validateNumber } from './inputValidation.js';

/**
 * Main FormPersistence class
 */
class FormPersistence {
    // Image-enabled modules whitelist - only these modules can handle images
    static IMAGE_ENABLED_MODULES = ['fashion'];
    
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

    }

    /**
     * Check if the current module supports images
     * @returns {boolean} True if module supports images
     */
    supportsImages() {
        return FormPersistence.IMAGE_ENABLED_MODULES.includes(this.moduleName);
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
            // [FormPersistence] Could not detect module name
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

            
            return true;
        } catch (error) {
            // [FormPersistence] Initialization error
            return false;
        }
    }

    /**
     * Bind click events to all grid items for selection and persistence
     * This replaces the need for external grid-item-toggled events
     */
    bindGridItemEvents() {
        // Universal approach: Only bind events for grid items in the current module's container
        const moduleName = this.getModuleNameFromLastGridItemUrl();
        const wrapperId = moduleName ? `${moduleName}iq-device-container` : null;
        const wrapper = wrapperId ? document.getElementById(wrapperId) : document.querySelector('.device-container');
        
        if (!wrapper) {
            // [FormPersistence] No container found for grid event binding
            return;
        }
        
        const gridItems = wrapper.querySelectorAll('[class*="grid-items"] .grid-item, .grid-container .grid-item');
        let lastSelectionTime = 0;
        const SELECTION_DEBOUNCE = 150; // ms debounce for rapid selections
        
        gridItems.forEach(item => {
            if (!item.dataset.value) return;
            item.removeEventListener('click', item._fpGridClickHandler || (()=>{}));
            const handler = (e) => {
                // Enhanced debouncing to prevent rapid-fire selections
                const now = Date.now();
                if (now - lastSelectionTime < SELECTION_DEBOUNCE) {
                    // [FormPersistence] Grid selection debounced
                    return;
                }
                lastSelectionTime = now;
                
                // Check if this touch was monitored by swipe functionality
                if (e._swipeMonitoring) {
                    // [FormPersistence] Touch was monitored by swipe, adding small delay
                    setTimeout(() => {
                        this.processGridSelection(e, item);
                    }, 50);
                } else {
                    this.processGridSelection(e, item);
                }
            };
            item._fpGridClickHandler = handler;
            item.addEventListener('click', handler);
        });

    }
    
    /**
     * Process grid item selection with enhanced safety checks
     */
    processGridSelection(e, item) {
        e.preventDefault();
        const container = item.closest('.grid-container, [class*="grid-items"]');
        if (!container) return;
        
        // Verify the item is still the intended target
        const rect = item.getBoundingClientRect();
        const clickX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clickY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        // Check if click/touch coordinates are within the item bounds
        if (clickX < rect.left || clickX > rect.right || clickY < rect.top || clickY > rect.bottom) {
            // [FormPersistence] Click coordinates outside target item, ignoring
            return;
        }
        
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
    }

    /**
     * Get module name from lastGridItemUrl using getLocal.js
     * @returns {string|null} The module name
     */
    getModuleNameFromLastGridItemUrl() {
        try {
            const lastUrl = getLocal('lastGridItemUrl', null);
            if (!lastUrl) return null;
            // Example: /app/calorie/calorieiq.html or /app/fitness/fitnessiq.html
            const matches = lastUrl.match(/\/app\/([^\/]+)\//);
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
            this.saveFormData();
        });

        // Listen for entry deletion to auto-save form data

        document.addEventListener('entry:deleted', (event) => {
            this.saveFormData();
        });


    }

    /**
     * Handle grid item toggle events
     * @param {Event} event - The grid item toggle event
     */
    handleGridItemToggled(event) {

        const item = event.detail.item;
        const container = item.closest('.grid-container, [class*="grid-items"]');
        
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
        // Block saving when on categories page to prevent interference with other modules
        const lastUrl = getLocal('lastGridItemUrl', null);
        if (lastUrl && lastUrl.includes('/categories.html')) {
            return;
        }
        
        const gridKey = this.getCurrentGridItemKey();
        if (!gridKey) {
            // [FormPersistence] No module key found, not saving form data.
            return;
        }
        
        // Universal approach: Check if wrapper container exists instead of module-specific fields
        const moduleName = this.getModuleNameFromLastGridItemUrl();
        const wrapperId = moduleName ? `${moduleName}iq-device-container` : null;
        const wrapper = wrapperId ? document.getElementById(wrapperId) : document.querySelector('.device-container');
        
        if (!wrapper) {
            // [FormPersistence] No device container found for module
            return;
        }
        
        const formData = this.collectFormData();
        // Guard: Only save if at least one non-empty field exists
        const hasRelevantData = Object.entries(formData).some(([key, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
            return value !== null && value !== undefined && value !== '';
        });
        if (!hasRelevantData) {
            // [FormPersistence] No relevant data found in DOM for module
            return;
        }
        
        // [FormPersistence] Saving form data
        setJSON(gridKey, formData);
        // [FormPersistence] Form data saved
    }

    /**
     * Save input value (convenience method that saves all form data)
     * @param {Element} input - The input element that changed
     */
    saveInput(input) {
        if (!input || !input.id) return;
        // [FormPersistence] Input changed, saving all form data
        this.saveFormData();
    }

    /**
     * Save grid item state (convenience method that saves all form data)
     * @param {Element} item - The grid item that was toggled
     */
    saveGridItem(item) {
        // [FormPersistence] Grid item changed, saving all form data
        this.saveFormData();
    }

    /**
     * Save images (now handled directly in saveFormData)
     */
    saveImages() {
        // [FormPersistence] saveImages() called but now using unified storage
        // Images are now saved as part of the main form data, no separate storage needed
        this.saveFormData();
    }

    /**
     * Get saved images from unified storage
     * @returns {Array} Array of image data URLs
     */
    getSavedImages() {
        // Only return images for modules that support them
        if (!this.supportsImages()) {
            // [FormPersistence] Module does not support images, returning empty array
            return [];
        }
        
        // Get images directly from unified form data storage
        const gridKey = this.getCurrentGridItemKey();
        if (!gridKey) return [];
        const formData = getJSON(gridKey, null);
        return formData && formData.images ? formData.images : [];
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
        // [FormPersistence][DEBUG] repopulateForm: gridKey
        if (!gridKey) {
            // [FormPersistence] No module key found, cannot repopulate form.
            return;
        }
        const data = getJSON(gridKey, null);
        // [FormPersistence][DEBUG] repopulateForm: loaded data
        if (!data) return;
        
        // Use imageUpload.js auto-restoration instead of local restoration
        if (this.supportsImages() && typeof window.autoRestoreImages === 'function') {
            const containerId = 'image-upload-container'; // Standard container ID
            window.autoRestoreImages(containerId, this.moduleName);
        }
        
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
        
        // [FormPersistence] Auto-detecting dynamic inputs from saved data
        
        // Detect dynamic patterns in field names for other modules
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
        
        // Look for numbered patterns like "snack4", "snack5", "entry1-when", "entry1-what", etc.
        const numberedPatternRegex = /^([a-zA-Z-]+?)(\d+)(-\w+)?$/;
        const numberedFields = {};
        
        fieldNames.forEach(fieldName => {
            const match = fieldName.match(numberedPatternRegex);
            if (match) {
                const basePattern = match[1].replace(/-$/, ''); // e.g., "snack", "entry"
                const number = parseInt(match[2], 10); // e.g., 4, 1
                
                if (!numberedFields[basePattern]) {
                    numberedFields[basePattern] = [];
                }
                numberedFields[basePattern].push(number);
            }
        });
        
        // Convert detected numbered fields to patterns
        Object.entries(numberedFields).forEach(([basePattern, numbers]) => {
            if (numbers.length > 0) {
                // Remove duplicates and sort
                const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
                patterns.push({
                    type: 'numbered',
                    basePattern: basePattern,
                    detectedNumbers: uniqueNumbers
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
     * Recreate numbered dynamic inputs (e.g., snack4, snack5, entry1, entry2)
     * @param {Object} pattern - The numbered pattern object
     */
    recreateNumberedInputs(pattern) {
        const { basePattern, detectedNumbers } = pattern;
        
        // [FormPersistence] Recreating numbered inputs for pattern
        
        // Look for module-specific recreation function
        const functionName = this.getRecreationFunctionName(basePattern);
        let recreationFunction = this.findRecreationFunction(functionName);
        
        if (!recreationFunction) {
            // [FormPersistence] No recreation function found for pattern
            return;
        }
        
        // For each detected number, check if DOM element exists and recreate if missing
        detectedNumbers.forEach(number => {
            const expectedElementId = this.getExpectedElementId(basePattern, number);
            
            if (!document.getElementById(expectedElementId)) {
                // [FormPersistence] Recreating input for
                
                try {
                    // Get saved values for recreation
                    const savedData = this.getSavedFormData();
                    const fieldName = this.getFieldName(expectedElementId);
                    const savedValue = savedData && savedData[fieldName] ? savedData[fieldName] : '';
                    
                    // Call recreation function with appropriate parameters
                    if (this.moduleName === 'calorie') {
                        // CalorieIQ expects (fieldName, value, skipRepositioning)
                        recreationFunction(`${basePattern}${number}`, savedValue, true);
                    } else {
                        // Other modules expect (value1, value2) or just ()
                        recreationFunction();
                    }
                } catch (error) {
                    // [FormPersistence] Error calling recreation function
                }
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
        
        // [FormPersistence][DEBUG] repopulateGridContainer: container.id, values
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
                // [FormPersistence][DEBUG] repopulateGridContainer: selected grid-item for value
            } else {
                // [FormPersistence][DEBUG] repopulateGridContainer: No grid-item found for value
            }
        });
    }

    /**
     * Set up input change handlers for automatic saving
     */
    setupInputHandlers() {
        // Universal approach: Set up handlers for ALL form elements in the container
        const moduleName = this.getModuleNameFromLastGridItemUrl();
        const wrapperId = moduleName ? `${moduleName}iq-device-container` : null;
        const wrapper = wrapperId ? document.getElementById(wrapperId) : document.querySelector('.device-container');
        
        if (!wrapper) {
            // [FormPersistence] No container found for input handlers setup
            return;
        }
        
        wrapper.querySelectorAll('input, textarea, select').forEach(element => {
            // Skip buttons and already handled elements
            if (element.type === 'button' || element.type === 'submit' || element._fpHandlerAttached) return;
            
            // Add change event for all elements
            element.addEventListener('change', () => {
                this.saveInput(element);
            });
            
            // Add input event for textareas and text inputs for real-time saving
            if (element.tagName === 'TEXTAREA' || element.type === 'text') {
                element.addEventListener('input', () => {
                    this.saveInput(element);
                });
            }
            
            // Mark as having our handler to prevent duplicates
            element._fpHandlerAttached = true;
        });

        // [FormPersistence] Input handlers set up
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
        // [FormPersistence] Refreshing input handlers
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
        
        // Images are now part of unified storage, no separate clearing needed
        
        // Clear UI elements
        document.querySelectorAll('[class*="grid-items"] .grid-item, .grid-container .grid-item').forEach(item => {
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

        // [FormPersistence] Local storage cleared for module
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
        // Remove saving under calorieIqData, only save under calorieIqResponse for calorie module
        // (No extra key for new standard)
        // [FormPersistence] Response data saved
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
     * Generic form data collection (scoped to main device-container wrapper)
     * @returns {Object} The collected form data using generic logic
     */
    collectGenericFormData() {
        const formData = {};
        // Get module name from lastGridItemUrl for scoping
        const moduleName = this.getModuleNameFromLastGridItemUrl();
        const wrapperId = moduleName ? `${moduleName}iq-device-container` : null;
        const wrapper = wrapperId ? document.getElementById(wrapperId) : document.querySelector('.device-container');
        if (!wrapper) {
            console.warn(`[FormPersistence] No main wrapper found for module: ${moduleName}`);
            return formData;
        }

        // [FormPersistence] Collecting data from container

        // Collect ALL form elements inside wrapper - no field ID restrictions
        wrapper.querySelectorAll('input, textarea, select').forEach(element => {
            // Skip buttons and hidden inputs
            if (element.type === 'button' || element.type === 'submit' || element.type === 'hidden') return;
            if (!element.id) return;
            if (element.value !== null && element.value !== undefined && element.value !== '') {
                let sanitizedValue = element.value;
                try {
                    if (element.tagName === 'TEXTAREA' || element.type === 'text') {
                        sanitizedValue = validateText(element.value, element.id);
                    } else if (element.type === 'number') {
                        sanitizedValue = validateNumber(element.value, element.id);
                    } // For selects and other types, keep as is
                } catch (e) {
                    // If validation fails, store empty string and log error
                    sanitizedValue = '';
                    console.warn(`[FormPersistence] Validation failed for ${element.id}:`, e.message);
                }
                formData[element.id] = sanitizedValue;
                // [FormPersistence] Collected field
            }
        });

        // Collect from ALL grid containers inside wrapper
        wrapper.querySelectorAll('[class*="grid-items"], .grid-container').forEach(container => {
            if (!container.id) return;
            const selected = Array.from(container.querySelectorAll('.grid-item.selected')).map(item => item.dataset.value || item.textContent.trim());
            if (selected.length > 0) {
                formData[container.id] = selected.length === 1 ? selected[0] : selected;
                // [FormPersistence] Collected grid
            }
        });

        // Collect images from ImageUploadUtility if available
        const images = this.collectImages();
        if (images && Array.isArray(images) && images.length > 0) {
            formData.images = images;
        }

        // [FormPersistence] Total collected data
        return formData;
    }

    /**
     * Generic form repopulation (public method for use in custom repopulators)
     * @param {Object} data - The data to use for repopulation
     */
    repopulateGenericForm(data) {
        if (!data) return;
        // [FormPersistence][DEBUG] repopulateGenericForm: data
        
        // Images are now restored directly from the same data object
        
        // Repopulate text inputs, textareas, and selects
        Object.entries(data).forEach(([fieldName, value]) => {
            if (value === null || value === undefined) return;
            
            // Skip images field as it's handled separately
            if (fieldName === 'images') return;
            
            const elementId = `${this.moduleName}-${fieldName}`;
            let element = document.getElementById(elementId);
            if (!element) {
                element = document.getElementById(fieldName);
            }
            // [FormPersistence][DEBUG] repopulateGenericForm: fieldName, value, elementId, element
            if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
                element.value = value;
                // [FormPersistence][DEBUG] Set value for element id
                // If textarea, trigger autoExpandTextarea if available
                if (element.tagName === 'TEXTAREA' && typeof window.autoExpandTextarea === 'function') {
                    window.autoExpandTextarea(element);
                }
                return;
            }
            // Handle grid containers (both .grid-container and grid-items classes)
            const containerElement = document.getElementById(elementId) || document.getElementById(fieldName);
            if (containerElement && (containerElement.classList.contains('grid-container') || 
                Array.from(containerElement.classList).some(cls => cls.includes('grid-items')))) {
                // [FormPersistence][DEBUG] repopulateGenericForm: repopulating grid container id with value
                this.repopulateGridContainer(containerElement, value);
            }
        });
        
        // Refresh input handlers to pick up any newly created dynamic inputs
        this.refreshInputHandlers();
    }

    /**
     * Collect images from ImageUploadUtility instances
     * @returns {Array} Array of image data URLs
     */
    collectImages() {
        // Only collect images for modules that support them
        if (!this.supportsImages()) {
            // [FormPersistence] Module does not support images, returning empty array
            return [];
        }
        
        try {
            // Try to get images from global helper function first
            if (typeof window.getImagesForBackend === 'function') {
                const images = window.getImagesForBackend();
                // [FormPersistence] Collected images via global function
                return images;
            }
            
            // Fallback: Look for ImageUploadUtility instances directly
            if (window.ImageUploadUtility && window.ImageUploadUtility.instances) {
                const instances = Object.values(window.ImageUploadUtility.instances);
                if (instances.length > 0) {
                    const images = instances[0].getImagesForBackend();
                    // [FormPersistence] Collected images from first instance
                    return images;
                }
            }
            
            // [FormPersistence] No ImageUploadUtility instances found, no images collected
            return [];
        } catch (error) {
            // [FormPersistence] Error collecting images
            return [];
        }
    }

    /**
     * Save response data to localStorage
     * @param {Object} responseData - The response data to save    /**
     * Get the expected recreation function name for a base pattern
     * @param {string} basePattern - The base pattern (e.g., "snack", "entry")
     * @returns {string} The expected function name
     */
    getRecreationFunctionName(basePattern) {
        // For other patterns, generate function name from pattern
        // "entry" -> "addEntry", "period-entry" -> "addPeriodEntry"
        if (basePattern.includes('-')) {
            // Handle hyphenated patterns like "period-entry"
            return `add${basePattern.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join('')}`;
        } else {
            // Handle simple patterns like "entry"
            return `add${basePattern.charAt(0).toUpperCase() + basePattern.slice(1)}`;
        }
    }

    /**
     * Find the recreation function in global scope
     * @param {string} functionName - The function name to look for
     * @returns {Function|null} The recreation function or null if not found
     */
    findRecreationFunction(functionName) {
        // Check window scope
        if (typeof window[functionName] === 'function') {
            return window[functionName];
        }
        
        // Check module-specific namespaces
        const moduleNamespace = window[`${this.moduleName}Iq`];
        if (moduleNamespace && typeof moduleNamespace[functionName] === 'function') {
            return moduleNamespace[functionName];
        }
        
        return null;
    }

    /**
     * Get the expected element ID for a base pattern and number
     * @param {string} basePattern - The base pattern
     * @param {number} number - The number
     * @returns {string} The expected element ID
     */
    getExpectedElementId(basePattern, number) {
        if (this.moduleName === 'calorie') {
            return `calorie-${basePattern}${number}`;
        } else {
            // For other modules, check for dual inputs first
            const dualInputId = `${basePattern}${number}-when`;
            if (document.getElementById(dualInputId)) {
                return dualInputId;
            }
            
            // Otherwise check for single input patterns
            return `${this.moduleName}-${basePattern}${number}`;
        }
    }
}

// Remove legacy singleton/global export and window.FormPersistence
// Only export the FormPersistence class
export { FormPersistence };