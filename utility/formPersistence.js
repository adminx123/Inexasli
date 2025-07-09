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
            response: this.moduleName ? `${this.moduleName}IqResponse` : null,
            images: this.moduleName ? `${this.moduleName}IqInputPhoto` : null
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
                response: this.moduleName ? `${this.moduleName}IqResponse` : null,
                images: this.moduleName ? `${this.moduleName}IqInputPhoto` : null
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
        let lastSelectionTime = 0;
        const SELECTION_DEBOUNCE = 150; // ms debounce for rapid selections
        
        gridItems.forEach(item => {
            if (!item.dataset.value) return;
            item.removeEventListener('click', item._fpGridClickHandler || (()=>{}));
            const handler = (e) => {
                // Enhanced debouncing to prevent rapid-fire selections
                const now = Date.now();
                if (now - lastSelectionTime < SELECTION_DEBOUNCE) {
                    console.log('[FormPersistence] Grid selection debounced');
                    return;
                }
                lastSelectionTime = now;
                
                // Check if this touch was monitored by swipe functionality
                if (e._swipeMonitoring) {
                    console.log('[FormPersistence] Touch was monitored by swipe, adding small delay');
                    // Small delay to ensure swipe processing is complete
                    setTimeout(() => {
                        this.processGridSelection(e, item);
                    }, 50);
                } else {
                    // Process immediately if no swipe monitoring
                    this.processGridSelection(e, item);
                }
            };
            item._fpGridClickHandler = handler;
            item.addEventListener('click', handler);
        });
        console.log(`[FormPersistence] Grid item event binding complete for ${this.moduleName}`);
    }
    
    /**
     * Process grid item selection with enhanced safety checks
     */
    processGridSelection(e, item) {
        e.preventDefault();
        const container = item.closest('.grid-container');
        if (!container) return;
        
        // Verify the item is still the intended target
        const rect = item.getBoundingClientRect();
        const clickX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clickY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        // Check if click/touch coordinates are within the item bounds
        if (clickX < rect.left || clickX > rect.right || clickY < rect.top || clickY > rect.bottom) {
            console.log('[FormPersistence] Click coordinates outside target item, ignoring');
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
            console.log(`[FormPersistence] Image upload changed, saving images separately for ${this.moduleName}`);
            this.saveImages();
        });

        // Listen for entry deletion to auto-save form data
        document.addEventListener('entry:deleted', (event) => {
            console.log(`[FormPersistence] Entry deleted, auto-saving form data for ${this.moduleName}`);
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
     * Save images to separate KV storage
     */
    saveImages() {
        if (!this.storageKeys.images) {
            console.warn('[FormPersistence] No image storage key available');
            return;
        }
        
        // Only save images for modules that support them
        if (!this.supportsImages()) {
            console.log(`[FormPersistence] Module ${this.moduleName} does not support images, skipping image save`);
            return;
        }
        
        const images = this.collectImages();
        setJSON(this.storageKeys.images, images);
        console.log(`[FormPersistence] Saved ${images.length} images to separate storage: ${this.storageKeys.images}`);
    }

    /**
     * Get saved images from separate storage
     * @returns {Array} Array of image data URLs
     */
    getSavedImages() {
        if (!this.storageKeys.images) return [];
        
        // Only return images for modules that support them
        if (!this.supportsImages()) {
            console.log(`[FormPersistence] Module ${this.moduleName} does not support images, returning empty array`);
            return [];
        }
        
        return getJSON(this.storageKeys.images, []);
    }

    /**
     * Restore images from separate storage
     */
    restoreImagesFromSeparateStorage() {
        // Only restore images for modules that support them
        if (!this.supportsImages()) {
            console.log(`[FormPersistence] Module ${this.moduleName} does not support images, skipping image restore`);
            return;
        }
        
        const images = this.getSavedImages();
        if (images && images.length > 0) {
            this.restoreImages(images);
            console.log(`[FormPersistence] Restored ${images.length} images from separate storage`);
        }
    }

    /**
     * Clear images from separate storage
     */
    clearSavedImages() {
        if (this.storageKeys.images) {
            setJSON(this.storageKeys.images, undefined);
            console.log(`[FormPersistence] Cleared images from separate storage: ${this.storageKeys.images}`);
        }
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
        
        // Load images from separate storage and restore them
        this.restoreImagesFromSeparateStorage();
        
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
        
        console.log('[FormPersistence] Recreating numbered inputs for pattern:', basePattern, 'numbers:', detectedNumbers);
        
        // Look for module-specific recreation function
        const functionName = this.getRecreationFunctionName(basePattern);
        let recreationFunction = this.findRecreationFunction(functionName);
        
        if (!recreationFunction) {
            console.warn('[FormPersistence] No recreation function found for pattern:', basePattern, 'expected function:', functionName);
            return;
        }
        
        // For each detected number, check if DOM element exists and recreate if missing
        detectedNumbers.forEach(number => {
            const expectedElementId = this.getExpectedElementId(basePattern, number);
            
            if (!document.getElementById(expectedElementId)) {
                console.log('[FormPersistence] Recreating input for:', basePattern, 'number:', number);
                
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
                    console.error('[FormPersistence] Error calling recreation function:', error);
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
        
        // Also clear separate image storage
        this.clearSavedImages();
        
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
        const formData = getJSON(gridKey, null);
        
        // Only merge images for modules that support them
        if (formData && this.supportsImages()) {
            const images = this.getSavedImages();
            if (images && images.length > 0) {
                formData.images = images;
            }
        }
        
        return formData;
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
     * @returns {Object} Object containing input, response, and image storage keys
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
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="date"], textarea, select').forEach(element => {
            if (element.id) {
                // Only collect fields that belong to this module (have the module prefix) or are in the device-container
                const modulePrefix = `${this.moduleName}-`;
                const isModuleField = element.id.startsWith(modulePrefix);
                const isInDeviceContainer = element.closest('.device-container');
                
                if (isModuleField || isInDeviceContainer) {
                    const fieldName = this.getFieldName(element.id);
                    foundRelevantField = true;
                    // Save all values, including empty ones for textareas (to preserve user's intention to clear)
                    if (element.type === 'number') {
                        formData[fieldName] = element.value ? (parseInt(element.value, 10) || parseFloat(element.value)) : '';
                    } else {
                        formData[fieldName] = element.value || '';
                    }
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
        
        // Collect images from ImageUploadUtility if available
        // NOTE: Images are now stored separately, but we still collect them here 
        // for backward compatibility with getSavedFormData()
        const images = this.collectImages();
        if (images && images.length > 0) {
            formData.images = images;
            foundRelevantField = true;
            console.log(`[FormPersistence] Collected ${images.length} images from ImageUploadUtility (for compatibility)`);
        }
        
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
        
        // NOTE: Images are now restored separately in repopulateForm()
        // No need to handle them here anymore
        
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

    /**
     * Collect images from ImageUploadUtility instances
     * @returns {Array} Array of image data URLs
     */
    collectImages() {
        // Only collect images for modules that support them
        if (!this.supportsImages()) {
            console.log(`[FormPersistence] Module ${this.moduleName} does not support images, returning empty array`);
            return [];
        }
        
        try {
            // Try to get images from global helper function first
            if (typeof window.getImagesForBackend === 'function') {
                const images = window.getImagesForBackend();
                console.log(`[FormPersistence] Collected ${images.length} images via global function`);
                return images;
            }
            
            // Fallback: Look for ImageUploadUtility instances directly
            if (window.ImageUploadUtility && window.ImageUploadUtility.instances) {
                const instances = Object.values(window.ImageUploadUtility.instances);
                if (instances.length > 0) {
                    const images = instances[0].getImagesForBackend();
                    console.log(`[FormPersistence] Collected ${images.length} images from first instance`);
                    return images;
                }
            }
            
            console.log('[FormPersistence] No ImageUploadUtility instances found, no images collected');
            return [];
        } catch (error) {
            console.error('[FormPersistence] Error collecting images:', error);
            return [];
        }
    }

    /**
     * Restore images to ImageUploadUtility
     * @param {Array} images - Array of image data URLs to restore
     */
    restoreImages(images) {
        if (!images || !Array.isArray(images) || images.length === 0) {
            console.log('[FormPersistence] No images to restore');
            return;
        }

        try {
            // Try to restore via global helper function first
            if (typeof window.restoreImagesFromData === 'function') {
                window.restoreImagesFromData(images);
                console.log(`[FormPersistence] Restored ${images.length} images via global function`);
                return;
            }
            
            // Fallback: Look for ImageUploadUtility instances directly
            if (window.ImageUploadUtility && window.ImageUploadUtility.instances) {
                const instances = Object.values(window.ImageUploadUtility.instances);
                if (instances.length > 0) {
                    instances[0].restoreFromDataUrls(images);
                    console.log(`[FormPersistence] Restored ${images.length} images to first instance`);
                    return;
                }
            }
            
            console.warn('[FormPersistence] No ImageUploadUtility instances found, could not restore images');
        } catch (error) {
            console.error('[FormPersistence] Error restoring images:', error);
        }
    }

    /**
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
