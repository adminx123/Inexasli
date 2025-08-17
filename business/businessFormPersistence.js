/**
 * Business Form Persistence System
 * Saves and restores form data for business forms using setJSON/getJSON
 */

import { setJSON } from '../utility/setJSON.js';
import { getJSON } from '../utility/getJSON.js';

class BusinessFormPersistence {
    constructor(formId = 'socialAutomationForm', storageKey = 'business-social-form-data') {
        this.formId = formId;
        this.storageKey = storageKey;
        this.form = null;
        this.saveTimeout = null;
        this.initialized = false;
    }

    /**
     * Initialize the form persistence system
     */
    init() {
        try {
            this.form = document.getElementById(this.formId);
            if (!this.form) {
                console.warn(`Form with ID '${this.formId}' not found`);
                return false;
            }

            // Restore saved data on page load
            this.restoreFormData();
            
            // Set up event listeners for auto-save
            this.attachEventListeners();
            
            // Save on page unload
            this.attachUnloadListener();
            
            this.initialized = true;
            console.log('Business Form Persistence initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Business Form Persistence:', error);
            return false;
        }
    }

    /**
     * Attach event listeners to form elements
     */
    attachEventListeners() {
        if (!this.form) return;

        // Listen to all input, select, and textarea changes
        const formElements = this.form.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            ['input', 'change', 'blur'].forEach(eventType => {
                element.addEventListener(eventType, () => {
                    this.debouncedSave();
                });
            });
        });

        // Listen to grid item selections
        const gridItems = this.form.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                // Small delay to ensure selection state is updated
                setTimeout(() => {
                    this.debouncedSave();
                }, 50);
            });
        });
    }

    /**
     * Attach page unload listener to save data
     */
    attachUnloadListener() {
        window.addEventListener('beforeunload', () => {
            this.saveFormData();
        });

        // Also save when page becomes hidden (mobile/tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveFormData();
            }
        });
    }

    /**
     * Debounced save to prevent excessive saves
     */
    debouncedSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveFormData();
        }, 500); // Save 500ms after last change
    }

    /**
     * Collect all form data and save to localStorage
     */
    saveFormData() {
        if (!this.form) return;

        try {
            const formData = {
                // Regular form fields
                inputs: {},
                
                // Grid selections
                gridSelections: {},
                
                // Timestamp for debugging
                lastSaved: new Date().toISOString()
            };

            // Collect input, select, and textarea values
            const formElements = this.form.querySelectorAll('input, select, textarea');
            formElements.forEach(element => {
                if (element.id) {
                    let value = element.value;
                    
                    // Special handling for different input types
                    if (element.type === 'checkbox') {
                        value = element.checked;
                    } else if (element.type === 'radio') {
                        if (element.checked) {
                            formData.inputs[element.name] = value;
                        }
                        return; // Skip individual radio buttons
                    }
                    
                    formData.inputs[element.id] = value;
                }
            });

            // Collect grid selections by container ID
            const gridContainers = this.form.querySelectorAll('[id] .grid-container, .grid-container[id]');
            gridContainers.forEach(container => {
                const containerId = container.id || container.closest('[id]')?.id;
                if (containerId) {
                    const selectedItems = container.querySelectorAll('.grid-item.selected');
                    formData.gridSelections[containerId] = Array.from(selectedItems).map(item => item.dataset.value || item.textContent.trim());
                }
            });

            // Save to localStorage
            const saved = setJSON(this.storageKey, formData);
            if (saved) {
                console.log('Form data saved successfully');
            }
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    /**
     * Restore form data from localStorage
     */
    restoreFormData() {
        if (!this.form) return;

        try {
            const savedData = getJSON(this.storageKey, null);
            if (!savedData) {
                console.log('No saved form data found');
                return;
            }

            console.log('Restoring form data from:', savedData.lastSaved);

            // Restore regular form fields
            if (savedData.inputs) {
                Object.entries(savedData.inputs).forEach(([elementId, value]) => {
                    const element = document.getElementById(elementId);
                    if (element && value !== null && value !== undefined && value !== '') {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                        
                        // Trigger change event to update any dependent UI
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }

            // Restore grid selections
            if (savedData.gridSelections) {
                Object.entries(savedData.gridSelections).forEach(([containerId, selectedValues]) => {
                    const container = document.getElementById(containerId);
                    if (container && Array.isArray(selectedValues)) {
                        // First, clear all selections in this container
                        container.querySelectorAll('.grid-item.selected').forEach(item => {
                            item.classList.remove('selected');
                        });

                        // Then restore saved selections
                        selectedValues.forEach(value => {
                            const item = container.querySelector(`[data-value="${value}"]`);
                            if (item) {
                                item.classList.add('selected');
                            }
                        });
                    }
                });
            }

            console.log('Form data restored successfully');
        } catch (error) {
            console.error('Error restoring form data:', error);
        }
    }

    /**
     * Clear saved form data
     */
    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Saved form data cleared');
        } catch (error) {
            console.error('Error clearing saved data:', error);
        }
    }

    /**
     * Get saved form data (for debugging)
     */
    getSavedData() {
        return getJSON(this.storageKey, null);
    }

    /**
     * Check if form has unsaved changes
     */
    hasUnsavedChanges() {
        const savedData = getJSON(this.storageKey, null);
        if (!savedData) return false;

        // Compare current form state with saved data
        const currentData = this.getCurrentFormData();
        return JSON.stringify(currentData) !== JSON.stringify(savedData);
    }

    /**
     * Get current form data without saving
     */
    getCurrentFormData() {
        if (!this.form) return null;

        const formData = { inputs: {}, gridSelections: {} };

        // Collect current input values
        const formElements = this.form.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (element.id) {
                let value = element.value;
                if (element.type === 'checkbox') {
                    value = element.checked;
                }
                formData.inputs[element.id] = value;
            }
        });

        // Collect current grid selections
        const gridContainers = this.form.querySelectorAll('[id] .grid-container, .grid-container[id]');
        gridContainers.forEach(container => {
            const containerId = container.id || container.closest('[id]')?.id;
            if (containerId) {
                const selectedItems = container.querySelectorAll('.grid-item.selected');
                formData.gridSelections[containerId] = Array.from(selectedItems).map(item => item.dataset.value || item.textContent.trim());
            }
        });

        return formData;
    }
}

// Create and export a default instance
const businessFormPersistence = new BusinessFormPersistence();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        businessFormPersistence.init();
    });
} else {
    // DOM is already ready
    businessFormPersistence.init();
}

export { BusinessFormPersistence, businessFormPersistence };
