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
 * Guided Form Completion System
 * Provides progressive disclosure, auto-advance, and smooth transitions for form completion
 */

class GuidedFormSystem {
    constructor(options = {}) {
        this.config = {
            autoAdvance: true,
            showProgressIndicator: true,
            smoothTransitions: true,
            transitionDuration: 300,
            autoAdvanceDelay: 500,
            enableSkipping: true,
            preserveState: true,
            respectExistingPersistence: true, // Don't interfere with existing form persistence
            ...options
        };
        
        this.currentStep = 0;
        this.steps = [];
        this.isInitialized = false;
        this.completedSteps = new Set();
        this.skippedSteps = new Set();
        
        // Bind methods to preserve context
        this.handleGridItemToggled = this.handleGridItemToggled.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
    }
    
    /**
     * Initialize the guided form system
     * @param {string} containerId - The container ID holding the form
     */
    init(containerId = null) {
        console.log('[GuidedForms] Initializing guided form system');
        
        // Try multiple container selectors
        if (containerId) {
            this.container = document.querySelector(`.${containerId}`) || document.querySelector(`#${containerId}`);
        } else {
            // Auto-detect container
            this.container = document.querySelector('.mobile-container') || 
                           document.querySelector('.device-container') ||
                           document.querySelector('#mobile-container') ||
                           document.querySelector('#device-container') ||
                           document.body;
        }
        
        if (!this.container) {
            console.warn('[GuidedForms] Container not found:', containerId);
            return false;
        }
        
        console.log('[GuidedForms] Using container:', this.container.className || this.container.tagName);
        
        this.analyzeFormStructure();
        this.setupEventListeners();
        this.createProgressIndicator();
        this.initializeFirstStep();
        
        this.isInitialized = true;
        console.log(`[GuidedForms] Initialized with ${this.steps.length} steps`);
        return true;
    }
    
    /**
     * Analyze the form structure and create steps
     */
    analyzeFormStructure() {
        const rows = this.container.querySelectorAll('.row1');
        this.steps = [];
        
        rows.forEach((row, index) => {
            // Skip generate/clear button rows
            const hasOnlyButtons = row.querySelectorAll('button').length > 0 && 
                                 row.children.length === row.querySelectorAll('button').length;
            
            if (hasOnlyButtons) {
                console.log(`[GuidedForms] Skipping button-only row ${index}`);
                return;
            }
            
            const stepData = this.analyzeStep(row, index);
            if (stepData) {
                this.steps.push(stepData);
            }
        });
        
        console.log(`[GuidedForms] Found ${this.steps.length} form steps`);
    }
    
    /**
     * Analyze individual step to determine its characteristics
     */
    analyzeStep(row, index) {
        const label = row.querySelector('.category-label');
        const gridContainer = row.querySelector('.grid-container');
        const inputs = row.querySelectorAll('input:not([type="button"]):not([type="submit"])');
        const textareas = row.querySelectorAll('textarea');
        const selects = row.querySelectorAll('select');
        
        // Determine step type and validation requirements
        let stepType = 'mixed';
        let isRequired = true;
        let validationRule = null;
        
        if (gridContainer) {
            const gridItems = gridContainer.querySelectorAll('.grid-item');
            
            // Check for single-selection containers
            const containerId = gridContainer.id;
            const singleSelectionContainers = [
                'calorie-activity', 'calorie-diet-type', 'fitness-level', 
                'fitness-home-exercises', 'area-goal', 'test-goal'
            ];
            
            // Also check for data attributes that indicate single selection
            const isSingleSelection = singleSelectionContainers.includes(containerId) || 
                                    gridContainer.hasAttribute('data-single-select') ||
                                    gridContainer.classList.contains('single-select');
            
            if (isSingleSelection) {
                stepType = 'single-selection';
                validationRule = () => {
                    const selected = gridContainer.querySelector('.grid-item.selected');
                    console.log(`[GuidedForms] Single-selection validation for ${containerId}: ${selected ? 'has selection' : 'no selection'}`);
                    return selected !== null;
                };
            } else {
                stepType = 'multi-selection';
                validationRule = () => {
                    const selectedCount = gridContainer.querySelectorAll('.grid-item.selected').length;
                    console.log(`[GuidedForms] Multi-selection validation for ${containerId}: ${selectedCount} selected`);
                    return selectedCount > 0;
                };
            }
        } else if (inputs.length > 0 || textareas.length > 0 || selects.length > 0) {
            stepType = 'input';
            
            // Determine if inputs are required based on context
            const hasRequiredInputs = Array.from([...inputs, ...textareas]).some(input => {
                return input.hasAttribute('required') || 
                       input.placeholder?.toLowerCase().includes('required') ||
                       input.id?.includes('age') || input.id?.includes('height') || input.id?.includes('weight');
            });
            
            if (hasRequiredInputs) {
                validationRule = () => {
                    // Check ALL required inputs in this step, not just ANY
                    const requiredInputs = Array.from([...inputs, ...textareas, ...selects]).filter(input => {
                        return input.hasAttribute('required') || 
                               input.placeholder?.toLowerCase().includes('required') ||
                               input.id?.includes('age') || input.id?.includes('height') || input.id?.includes('weight') ||
                               input.tagName.toLowerCase() === 'select'; // All selects are required by default
                    });
                    
                    // If no explicitly required inputs found, treat all inputs as required
                    const inputsToCheck = requiredInputs.length > 0 ? requiredInputs : [...inputs, ...textareas, ...selects];
                    
                    console.log(`[GuidedForms] Checking ${inputsToCheck.length} required inputs in step`);
                    
                    // ALL required inputs must have values
                    const allInputsFilled = inputsToCheck.every(input => {
                        let hasValue = false;
                        
                        if (input.tagName.toLowerCase() === 'select') {
                            // For select elements with disabled placeholders, just check if value is not empty
                            // This works perfectly with disabled placeholder pattern: <option value="" disabled selected>
                            hasValue = input.value && input.value.trim() !== '';
                            
                            if (!hasValue) {
                                console.log(`[GuidedForms] Select ${input.id || input.name || 'unnamed'} has no selection (value: "${input.value}")`);
                            }
                        } else {
                            // For other inputs, check if they have non-empty values
                            hasValue = input.value && input.value.trim().length > 0;
                            if (!hasValue) {
                                console.log(`[GuidedForms] Input ${input.id || input.name || 'unnamed'} is still empty`);
                            }
                        }
                        
                        return hasValue;
                    });
                    
                    return allInputsFilled;
                };
            } else {
                isRequired = false;
                validationRule = () => true; // Optional inputs always pass validation
            }
        }
        
        return {
            index: this.steps.length,
            element: row,
            label: label ? label.textContent.trim() : `Step ${index + 1}`,
            type: stepType,
            isRequired,
            validationRule,
            gridContainer,
            inputs: Array.from(inputs),
            textareas: Array.from(textareas),
            selects: Array.from(selects),
            isVisible: false,
            isCompleted: false
        };
    }
    
    /**
     * Set up event listeners for form interactions
     */
    setupEventListeners() {
        // Listen for grid item toggles from datain.js
        document.addEventListener('grid-item-toggled', this.handleGridItemToggled);
        
        // Listen for input changes
        this.container.addEventListener('input', this.handleInputChange);
        this.container.addEventListener('change', this.handleSelectChange);
        this.container.addEventListener('blur', this.handleTextareaChange);
    }
    
    /**
     * Handle grid item toggle events
     */
    handleGridItemToggled(event) {
        if (!this.isInitialized) return;
        
        const item = event.detail.item;
        const step = this.findStepByElement(item);
        
        if (step && step.index === this.currentStep) {
            console.log(`[GuidedForms] Grid item toggled in step ${step.index}`);
            
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                this.checkStepCompletion(step);
            }, 100);
        }
    }
    
    /**
     * Handle input field changes
     */
    handleInputChange(event) {
        if (!this.isInitialized) return;
        
        const input = event.target;
        if (input.matches('input:not([type="button"]):not([type="submit"]), textarea')) {
            const step = this.findStepByElement(input);
            
            if (step && step.index === this.currentStep) {
                console.log(`[GuidedForms] Input changed in step ${step.index}`);
                
                // Debounce the validation check
                clearTimeout(this.inputValidationTimeout);
                this.inputValidationTimeout = setTimeout(() => {
                    this.checkStepCompletion(step);
                }, 300);
            }
        }
    }
    
    /**
     * Handle select field changes
     */
    handleSelectChange(event) {
        if (!this.isInitialized) return;
        
        const select = event.target;
        if (select.matches('select')) {
            const step = this.findStepByElement(select);
            
            if (step && step.index === this.currentStep) {
                console.log(`[GuidedForms] Select changed in step ${step.index}:`, select.value);
                this.checkStepCompletion(step);
            }
        }
    }
    
    /**
     * Handle textarea changes (on blur for better UX)
     */
    handleTextareaChange(event) {
        if (!this.isInitialized) return;
        
        const textarea = event.target;
        if (textarea.matches('textarea')) {
            const step = this.findStepByElement(textarea);
            
            if (step && step.index === this.currentStep) {
                console.log(`[GuidedForms] Textarea changed in step ${step.index}`);
                this.checkStepCompletion(step);
            }
        }
    }

    /**
     * Handle select focus (user clicked or tabbed to select)
     */
    handleSelectFocus(event) {
        if (!this.isInitialized) return;
        
        const select = event.target;
        if (select.matches('select')) {
            const step = this.findStepByElement(select);
            
            if (step && step.index === this.currentStep) {
                console.log(`[GuidedForms] Select focused in step ${step.index}`, select.id);
                
                // Mark this element as interacted with
                step.userInteracted = true;
                step.interactedElements.add(select);
                
                // Don't trigger validation on focus, wait for actual change
            }
        }
    }

    /**
     * Handle select click (user clicked on select)
     */
    handleSelectClick(event) {
        if (!this.isInitialized) return;
        
        const select = event.target;
        if (select.matches('select')) {
            const step = this.findStepByElement(select);
            
            if (step && step.index === this.currentStep) {
                console.log(`[GuidedForms] Select clicked in step ${step.index}`, select.id);
                
                // Mark this element as interacted with
                step.userInteracted = true;
                step.interactedElements.add(select);
                
                // Don't trigger validation on click, wait for actual change
            }
        }
    }
    
    /**
     * Find which step contains a given element
     */
    findStepByElement(element) {
        return this.steps.find(step => step.element.contains(element));
    }
    
    /**
     * Check if current step is completed and handle auto-advance
     */
    checkStepCompletion(step) {
        const isCompleted = step.validationRule();
        
        if (isCompleted && !step.isCompleted) {
            step.isCompleted = true;
            this.completedSteps.add(step.index);
            this.updateProgressIndicator();
            
            console.log(`[GuidedForms] Step ${step.index} completed`);
            
            // Trigger existing form persistence if available
            this.triggerExistingPersistence();
            
            // Auto-advance if enabled and not on last step
            if (this.config.autoAdvance && this.currentStep < this.steps.length - 1) {
                setTimeout(() => {
                    this.showStep(this.currentStep + 1);
                }, this.config.autoAdvanceDelay);
            }
        } else if (!isCompleted && step.isCompleted) {
            step.isCompleted = false;
            this.completedSteps.delete(step.index);
            this.updateProgressIndicator();
            
            console.log(`[GuidedForms] Step ${step.index} no longer completed`);
        }
    }

    /**
     * Trigger existing form persistence systems if they exist
     * This ensures compatibility with existing localStorage saving
     */
    triggerExistingPersistence() {
        if (!this.config.respectExistingPersistence) return;
        
        try {
            // Check for CalorieIQ form persistence
            if (typeof setJSON === 'function' && typeof collectFormData === 'function') {
                console.log('[GuidedForms] Triggering CalorieIQ persistence');
                setJSON('calorieIqInput', collectFormData());
            }
            
            // Check for other form persistence functions
            // Look for common persistence patterns
            const currentStepElement = this.steps[this.currentStep]?.element;
            if (currentStepElement) {
                const inputs = currentStepElement.querySelectorAll('input, textarea, select');
                const gridItems = currentStepElement.querySelectorAll('.grid-item.selected');
                
                // Trigger any existing save functions if they exist
                if (inputs.length > 0 && typeof saveInput === 'function') {
                    console.log('[GuidedForms] Triggering existing input persistence');
                    inputs.forEach(input => saveInput(input));
                }
                
                if (gridItems.length > 0 && typeof saveGridItem === 'function') {
                    console.log('[GuidedForms] Triggering existing grid item persistence');
                    gridItems.forEach(item => saveGridItem(item));
                }
            }
        } catch (error) {
            console.warn('[GuidedForms] Error triggering existing persistence:', error);
        }
    }
    
    /**
     * Show a specific step
     */
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            console.warn('[GuidedForms] Invalid step index:', stepIndex);
            return;
        }
        
        const previousStep = this.steps[this.currentStep];
        const nextStep = this.steps[stepIndex];
        
        console.log(`[GuidedForms] Moving from step ${this.currentStep} to step ${stepIndex}`);
        
        // Hide previous step
        if (previousStep) {
            this.hideStep(previousStep);
        }
        
        // Show next step
        this.currentStep = stepIndex;
        this.displayStep(nextStep);
        this.updateProgressIndicator();
    }
    
    /**
     * Display a step with smooth transition
     */
    displayStep(step) {
        step.element.style.display = 'flex';
        step.isVisible = true;
        
        if (this.config.smoothTransitions) {
            // Start hidden for animation
            step.element.style.opacity = '0';
            step.element.style.transform = 'translateY(20px)';
            step.element.style.transition = `opacity ${this.config.transitionDuration}ms ease, transform ${this.config.transitionDuration}ms ease`;
            
            // Trigger animation
            requestAnimationFrame(() => {
                step.element.style.opacity = '1';
                step.element.style.transform = 'translateY(0)';
            });
        }
        
        // Focus first interactive element
        this.focusFirstElement(step);
        
        console.log(`[GuidedForms] Displayed step ${step.index}: ${step.label}`);
    }
    
    /**
     * Hide a step with smooth transition
     */
    hideStep(step) {
        step.isVisible = false;
        
        if (this.config.smoothTransitions) {
            step.element.style.opacity = '0';
            step.element.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                step.element.style.display = 'none';
            }, this.config.transitionDuration);
        } else {
            step.element.style.display = 'none';
        }
        
        console.log(`[GuidedForms] Hidden step ${step.index}: ${step.label}`);
    }
    
    /**
     * Focus the first interactive element in a step
     */
    focusFirstElement(step) {
        const focusableElements = step.element.querySelectorAll(
            'input:not([type="button"]):not([type="submit"]), textarea, select, .grid-item'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    
    /**
     * Initialize the first step
     */
    initializeFirstStep() {
        // Hide all steps initially
        this.steps.forEach((step, index) => {
            if (index === 0) {
                this.displayStep(step);
            } else {
                step.element.style.display = 'none';
                step.isVisible = false;
            }
        });
        
        console.log('[GuidedForms] Initialized first step');
    }
    
    /**
     * Create progress indicator
     */
    createProgressIndicator() {
        if (!this.config.showProgressIndicator) return;
        
        // Remove existing indicator
        const existingIndicator = document.getElementById('guided-form-progress');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Enhanced container detection for data-in system
        let targetContainer = null;

        // Priority 1: Device container within current container
        targetContainer = this.container.querySelector('.device-container');
        console.log('[GuidedForms] Device container check:', targetContainer);

        // Priority 2: Data-in system containers - target the main container directly
        if (!targetContainer) {
            targetContainer = document.querySelector('.data-container-left');
            if (targetContainer) {
                console.log('[GuidedForms] Found data-container-left:', targetContainer.className);
            }
        }

        // Priority 3: General data-content containers
        if (!targetContainer) {
            targetContainer = this.container.querySelector('.data-content');
            console.log('[GuidedForms] Found data-content in current container:', targetContainer);
        }

        // Priority 4: Check if current container is already a data-content element
        if (!targetContainer && this.container.classList.contains('data-content')) {
            targetContainer = this.container;
            console.log('[GuidedForms] Current container is data-content:', targetContainer);
        }

        // Priority 5: Fallback to current container
        if (!targetContainer) {
            targetContainer = this.container;
            console.log('[GuidedForms] Using fallback container:', targetContainer);
        }

        console.log('[GuidedForms] Selected target container:', targetContainer.className || targetContainer.tagName);
        
        const progressContainer = document.createElement('div');
        progressContainer.id = 'guided-form-progress';
        
        // Determine positioning based on container type
        const isDataInContainer = targetContainer.closest('.data-container-left') || 
                                 targetContainer.classList.contains('data-container-left');
        
        if (isDataInContainer) {
            // Position inside data-container-left at the top edge with pill shape
            progressContainer.style.cssText = `
                position: absolute;
                top: -6px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #000;
                border-radius: 50px;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: "Inter", sans-serif;
                font-size: 12px;
                font-weight: 500;
                z-index: 11003;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            `;
            console.log('[GuidedForms] Using data-in container positioning');
        } else {
            // Use fixed positioning for other containers
            progressContainer.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #000;
                border-radius: 20px;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: "Inter", sans-serif;
                font-size: 12px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            `;
            console.log('[GuidedForms] Using fixed positioning');
        }
        
        // Progress dots
        const dotsContainer = document.createElement('div');
        dotsContainer.id = 'progress-dots';
        dotsContainer.style.cssText = 'display: flex; gap: 4px;';
        
        this.steps.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${index === this.currentStep ? '#000' : '#ccc'};
                transition: background 0.2s ease;
                cursor: pointer;
            `;
            
            // Allow clicking on dots to navigate (if step is accessible)
            dot.addEventListener('click', () => {
                if (index <= this.currentStep || this.completedSteps.has(index)) {
                    this.showStep(index);
                }
            });
            
            dotsContainer.appendChild(dot);
        });
        
        progressContainer.appendChild(dotsContainer);
        
        // Append to the appropriate container
        if (isDataInContainer) {
            targetContainer.appendChild(progressContainer);
            console.log('[GuidedForms] Progress indicator attached to data-in container');
        } else {
            document.body.appendChild(progressContainer);
            console.log('[GuidedForms] Progress indicator attached to document body');
        }
        
        console.log('[GuidedForms] Created progress indicator');
    }
    
    /**
     * Update progress indicator
     */
    updateProgressIndicator() {
        const dots = document.querySelectorAll('.progress-dot');
        
        dots.forEach((dot, index) => {
            if (index === this.currentStep) {
                dot.style.background = '#000';
            } else if (this.completedSteps.has(index)) {
                dot.style.background = '#666';
            } else {
                dot.style.background = '#ccc';
            }
        });
    }
    
    /**
     * Show all steps (exit guided mode)
     */
    showAllSteps() {
        console.log('[GuidedForms] Exiting guided mode, showing all steps');
        
        this.steps.forEach(step => {
            step.element.style.display = 'flex';
            step.element.style.opacity = '1';
            step.element.style.transform = 'translateY(0)';
            step.isVisible = true;
        });
        
        // Remove progress elements
        const progressIndicator = document.getElementById('guided-form-progress');
        
        if (progressIndicator) progressIndicator.remove();
        
        this.isInitialized = false;
    }
    
    /**
     * Get form completion status
     */
    getCompletionStatus() {
        const requiredSteps = this.steps.filter(step => step.isRequired);
        const completedRequired = requiredSteps.filter(step => this.completedSteps.has(step.index));
        
        return {
            totalSteps: this.steps.length,
            completedSteps: this.completedSteps.size,
            requiredSteps: requiredSteps.length,
            completedRequired: completedRequired.length,
            isComplete: completedRequired.length === requiredSteps.length,
            skippedSteps: this.skippedSteps.size
        };
    }
    
    /**
     * Clean up event listeners and elements
     */
    destroy() {
        console.log('[GuidedForms] Destroying guided form system');
        
        // Remove event listeners
        document.removeEventListener('grid-item-toggled', this.handleGridItemToggled);
        
        // Remove UI elements
        const progressIndicator = document.getElementById('guided-form-progress');
        
        if (progressIndicator) progressIndicator.remove();
        
        // Show all steps
        this.showAllSteps();
        
        // Clear timeouts
        if (this.inputValidationTimeout) {
            clearTimeout(this.inputValidationTimeout);
        }
        
        this.isInitialized = false;
    }
}

// Global instance and initialization
window.GuidedFormSystem = GuidedFormSystem;
window.guidedForms = null;

/**
 * Initialize guided forms for the current page
 */
function initGuidedForms(options = {}) {
    // Destroy existing instance
    if (window.guidedForms) {
        window.guidedForms.destroy();
    }
    
    // Create new instance
    window.guidedForms = new GuidedFormSystem(options);
    
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
        const success = window.guidedForms.init();
        if (success) {
            console.log('[GuidedForms] Successfully initialized guided forms');
        }
    }, 100);
    
    return window.guidedForms;
}

/**
 * Toggle guided mode on/off
 */
function toggleGuidedMode() {
    if (window.guidedForms && window.guidedForms.isInitialized) {
        window.guidedForms.destroy();
        console.log('[GuidedForms] Guided mode disabled');
    } else {
        initGuidedForms();
        console.log('[GuidedForms] Guided mode enabled');
    }
}

// Export functions for global access
window.initGuidedForms = initGuidedForms;
window.toggleGuidedMode = toggleGuidedMode;

// Auto-initialize when script loads (can be disabled by setting window.autoInitGuidedForms = false)
document.addEventListener('DOMContentLoaded', () => {
    if (window.autoInitGuidedForms !== false) {
        // Check if we're in a form context
        const hasFormElements = document.querySelector('.row1, .grid-container, .mobile-container, .device-container');
        if (hasFormElements) {
            console.log('[GuidedForms] Auto-initializing guided forms on DOMContentLoaded');
            initGuidedForms({
                autoAdvance: true,
                showProgressIndicator: true,
                smoothTransitions: true,
                enableSkipping: true,
                autoStart: true
            });
        }
    }
});

// Also listen for data-in-loaded events from datain.js
document.addEventListener('data-in-loaded', (e) => {
    console.log('[GuidedForms] Received data-in-loaded event');
    setTimeout(() => {
        const container = e.detail?.container || document;
        const hasFormElements = container.querySelector('.row1, .grid-container, .mobile-container, .device-container');
        if (hasFormElements && window.autoInitGuidedForms !== false) {
            console.log('[GuidedForms] Reinitializing guided forms after data-in-loaded');
            initGuidedForms({
                autoAdvance: true,
                showProgressIndicator: true,
                smoothTransitions: true,
                enableSkipping: true,
                autoStart: true
            });
        }
    }, 200);
});
