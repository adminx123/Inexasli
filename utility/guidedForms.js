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
 * Provides progressive disclosure, auto-advance, smooth transitions, and dynamic container sizing for form completion
 * 
 * Dynamic Sizing Features:
 * - Automatically adjusts data container height based on current step content
 * - Smooth transitions between different step sizes
 * - Mobile-responsive height        const hasFormElements = document.querySelector('.row1, [class*="grid-items"], .grid-container, device-container');calculations
 * - Configurable min/max height constraints
 * - Restores original container size when exiting guided mode
 * 
 * Usage:
 * const guidedForms = new GuidedFormSystem({
 *   smoothTransitions: true,       // Enable smooth transitions (default: true)
 *   autoAdvance: true,            // Auto advance on selection (default: true)
 *   showProgressIndicator: true   // Show progress dots (default: true)
 * });
 */

class GuidedFormSystem {
    constructor(options = {}) {
        this.config = {
            autoAdvance: true,
            showProgressIndicator: true,
            smoothTransitions: true,
            transitionDuration: 300,
            autoAdvanceDelay: 625,
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
            return false;
        }
        
        this.analyzeFormStructure();
        this.setupEventListeners();
        this.createProgressIndicator();
        this.initializeFirstStep();
        
        this.isInitialized = true;
        return true;
    }

    /**
     * Debounced resize handler to avoid excessive recalculations
     */
    debounceResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.steps[this.currentStep]) {
                this.adjustContainerSize(this.steps[this.currentStep]);
            }
        }, 250);
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
                return;
            }
            const stepData = this.analyzeStep(row, index);
            if (stepData) {
                this.steps.push(stepData);
            }
        });
    }
    
    /**
     * Analyze individual step to determine its characteristics
     */
    analyzeStep(row, index) {
        const label = row.getAttribute('data-step-label') || row.id || `Step ${index + 1}`;
        const gridContainer = row.querySelector('[class*="grid-items"], .grid-container');
        const inputs = row.querySelectorAll('input:not([type="button"]):not([type="submit"])');
        const textareas = row.querySelectorAll('textarea');
        const selects = row.querySelectorAll('select');
        
        // Determine step type and validation requirements
        let stepType = 'mixed';
        let isRequired = true;
        let validationRule = null;
        
        if (gridContainer) {
            const gridItems = gridContainer.querySelectorAll('.grid-item');
            
            // Check for single-selection containers based on data attributes or classes
            const isSingleSelection = gridContainer.hasAttribute('data-single-select') ||
                                    gridContainer.classList.contains('single-select') ||
                                    gridContainer.querySelectorAll('.grid-item').length > 0 && 
                                    gridContainer.querySelectorAll('.grid-item[data-single-select]').length > 0;
            
            if (isSingleSelection) {
                stepType = 'single-selection';
                validationRule = () => {
                    const selected = gridContainer.querySelector('.grid-item.selected');
                    return selected !== null;
                };
            } else {
                stepType = 'multi-selection';
                validationRule = () => {
                    const selectedCount = gridContainer.querySelectorAll('.grid-item.selected').length;
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
                    
                    // ALL required inputs must have values
                    const allInputsFilled = inputsToCheck.every(input => {
                        let hasValue = false;
                        if (input.tagName.toLowerCase() === 'select') {
                            // For select elements with disabled placeholders, just check if value is not empty
                            // This works perfectly with disabled placeholder pattern: <option value="" disabled selected>
                            hasValue = input.value && input.value.trim() !== '';
                        } else {
                            // For other inputs, check if they have non-empty values
                            hasValue = input.value && input.value.trim().length > 0;
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
            label: label,
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
                // Debounce the validation check with a longer delay (e.g., 1200ms)
                clearTimeout(this.inputValidationTimeout);
                this.inputValidationTimeout = setTimeout(() => {
                    // Only check completion if the input value hasn't changed in the last 1200ms
                    this.checkStepCompletion(step);
                }, 1200); // Increased delay to allow for user thinking/pausing
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
     * Check if current step is completed (no auto-advance)
     */
    checkStepCompletion(step) {
        const isCompleted = step.validationRule();

        if (isCompleted && !step.isCompleted) {
            step.isCompleted = true;
            this.completedSteps.add(step.index);
            this.updateProgressIndicator();
            this.triggerExistingPersistence();
            // No auto-advance: user must use progress bar or swipe to navigate
        } else if (!isCompleted && step.isCompleted) {
            step.isCompleted = false;
            this.completedSteps.delete(step.index);
            this.updateProgressIndicator();
        }
    }

    /**
     * Trigger existing form persistence systems if they exist
     * This ensures compatibility with existing localStorage saving
     */
    triggerExistingPersistence() {
        if (!this.config.respectExistingPersistence) return;
        
        try {
            // Trigger any existing persistence functions if they exist
            // Look for common persistence patterns without module-specific references
            const currentStepElement = this.steps[this.currentStep]?.element;
            if (currentStepElement) {
                const inputs = currentStepElement.querySelectorAll('input, textarea, select');
                const gridItems = currentStepElement.querySelectorAll('.grid-item.selected');
                
                // Trigger generic save functions if they exist
                if (inputs.length > 0 && typeof saveInput === 'function') {
                    inputs.forEach(input => saveInput(input));
                }
                
                if (gridItems.length > 0 && typeof saveGridItem === 'function') {
                    gridItems.forEach(item => saveGridItem(item));
                }
                
                // Trigger generic form data collection if available
                if (typeof collectFormData === 'function') {
                    collectFormData();
                }
            }
        } catch (error) {
            // Silently handle any persistence errors
        }
    }
    
    /**
     * Show a specific step
     */
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            return;
        }
        
        const previousStep = this.steps[this.currentStep];
        const nextStep = this.steps[stepIndex];
        
        // Hide previous step
        if (previousStep) {
            this.hideStep(previousStep);
        }
        
        // Show next step
        this.currentStep = stepIndex;
        this.displayStep(nextStep);
        this.updateProgressIndicator();
        
        // Dispatch event for datain.js button updates
        document.dispatchEvent(new CustomEvent('guided-forms-step-changed', {
            detail: {
                currentStep: this.currentStep,
                totalSteps: this.steps.length,
                canGoPrevious: this.currentStep > 0,
                canGoNext: this.currentStep < this.steps.length - 1
            }
        }));

        // --- SCROLL TO TOP LOGIC (robust debug) ---
        setTimeout(() => {
            // Log all .data-content containers and their scrollTop
            const allContents = document.querySelectorAll('.data-content');
            allContents.forEach((el, idx) => {
                console.log(`[GuidedForms][Debug] .data-content[${idx}] scrollTop BEFORE:`, el.scrollTop, el);
            });

            // Try to scroll all .data-content inside visible containers
            let didScroll = false;
            const visibleContainers = document.querySelectorAll('.data-container-income.visible, .data-container-in.visible');
            visibleContainers.forEach((container, cidx) => {
                const content = container.querySelector('.data-content');
                if (content) {
                    content.scrollTop = 0;
                    if (typeof content.scrollTo === 'function') content.scrollTo(0, 0);
                    console.log(`[GuidedForms] Scrolled .data-content in visible container[${cidx}] to top`, content);
                    didScroll = true;
                }
            });

            // Fallback: scroll all .data-content
            if (!didScroll) {
                allContents.forEach((el, idx) => {
                    el.scrollTop = 0;
                    if (typeof el.scrollTo === 'function') el.scrollTo(0, 0);
                    console.log(`[GuidedForms] Fallback: Scrolled .data-content[${idx}] to top`, el);
                });
            }

            // Fallback: scroll window
            if (!didScroll && allContents.length === 0) {
                window.scrollTo(0, 0);
                console.log('[GuidedForms] Fallback: Scrolled window to top');
            }

            // Log after scroll
            document.querySelectorAll('.data-content').forEach((el, idx) => {
                console.log(`[GuidedForms][Debug] .data-content[${idx}] scrollTop AFTER:`, el.scrollTop, el);
            });
        }, this.config.transitionDuration + 80); // Wait for transition to finish
        // --- END SCROLL TO TOP LOGIC ---
    }

    /**
     * Adjust container size to fit current step content
     */
    adjustContainerSize(step) {
        // Direct call to datain container manager - no delays needed here
        if (window.dataInContainerManager && window.dataInContainerManager.adjustContainerSize) {
            window.dataInContainerManager.adjustContainerSize(step.element);
        }
    }

    /**
     * Display a step with smooth transition
     */
    displayStep(step) {
        step.element.style.visibility = 'visible';
        step.element.style.pointerEvents = 'auto';
        step.isVisible = true;
        
        if (this.config.smoothTransitions) {
            // Start hidden for animation
            step.element.style.opacity = '0';
            step.element.style.transform = 'translateY(20px)';
            step.element.style.transition = `opacity ${this.config.transitionDuration}ms ease, transform ${this.config.transitionDuration}ms ease`;
            
            // Trigger animation and then adjust container size
            requestAnimationFrame(() => {
                step.element.style.opacity = '1';
                step.element.style.transform = 'translateY(0)';
                
                // Adjust container size after transition completes
                setTimeout(() => {
                    this.adjustContainerSize(step);
                }, this.config.transitionDuration);
            });
        } else {
            // No transitions - show immediately
            step.element.style.opacity = '1';
            step.element.style.transform = 'translateY(0)';
            this.adjustContainerSize(step);
        }
        
        // Focus first interactive element
        this.focusFirstElement(step);
    }
    
    /**
     * Hide a step with smooth transition
     */
    hideStep(step) {
        step.isVisible = false;
        step.element.style.pointerEvents = 'none';
        
        if (this.config.smoothTransitions) {
            step.element.style.opacity = '0';
            step.element.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                step.element.style.visibility = 'hidden';
            }, this.config.transitionDuration);
        } else {
            step.element.style.opacity = '0';
            step.element.style.visibility = 'hidden';
        }
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
            
            // Scroll into view for mobile keyboard handling (especially iOS)
            setTimeout(() => {
                focusableElements[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }, 300); // Delay to allow keyboard to appear
        }
    }
    
    /**
     * Initialize the first step
     */
    initializeFirstStep() {
        // Hide all steps initially using opacity/visibility
        this.steps.forEach((step, index) => {
            if (index === 0) {
                this.displayStep(step);
            } else {
                step.element.style.opacity = '0';
                step.element.style.visibility = 'hidden';
                step.element.style.pointerEvents = 'none';
                step.isVisible = false;
            }
        });
        
        // Apply dynamic sizing for the first step
        if (this.steps.length > 0) {
            this.adjustContainerSize(this.steps[0]);
        }
    }
    
    /**
     * Create progress indicator
     */
    createProgressIndicator() {
        // No longer creating progress indicator - navigation handled by datain.js buttons
        return;
    }
    
    /**
     * Update progress indicator
     */
    updateProgressIndicator() {
        // No longer updating progress indicator - navigation handled by datain.js buttons
        return;
    }
    
    /**
     * Show all steps (exit guided mode)
     */
    showAllSteps() {
        this.steps.forEach(step => {
            step.element.style.display = 'flex';
            step.element.style.opacity = '1';
            step.element.style.transform = 'translateY(0)';
            step.isVisible = true;
        });
        
        // Restore original container height
        this.restoreOriginalContainerSize();
        
        // Remove progress elements
        const progressIndicator = document.getElementById('guided-form-progress');
        if (progressIndicator) progressIndicator.remove();
        
        this.isInitialized = false;
    }

    /**
     * Clean up dynamic sizing when container collapses
     */
    cleanupDynamicSizing() {
        if (this.dataContainer) {
            // Remove any height overrides
            this.dataContainer.style.height = '';
            this.dataContainer.style.transition = '';
        }
    }

    /**
     * Restore original container size when exiting guided mode
     */
    restoreOriginalContainerSize() {
        // Container sizing is now handled by datain.js
        // No action needed here
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
        // Remove event listeners
        document.removeEventListener('grid-item-toggled', this.handleGridItemToggled);
        
        // Restore original container size
        this.restoreOriginalContainerSize();
        
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
    
    /**
     * Manually trigger container resize for current step
     * Useful for developers who want to refresh sizing after dynamic content changes
     */
    refreshContainerSize() {
        if (this.isInitialized && this.steps[this.currentStep]) {
            this.adjustContainerSize(this.steps[this.currentStep]);
        }
    }

    /**
     * Update dynamic sizing configuration
     * @param {Object} sizingConfig - New sizing configuration
     */
    updateSizingConfig(sizingConfig) {
        if (sizingConfig && typeof sizingConfig === 'object') {
            this.config = { ...this.config, ...sizingConfig };
            // Apply new configuration to current step
            if (this.isInitialized && this.steps[this.currentStep]) {
                this.adjustContainerSize(this.steps[this.currentStep]);
            }
        }
    }

    /**
     * Get current dynamic sizing status and measurements
     */
    getSizingInfo() {
        const currentStep = this.steps[this.currentStep];
        const info = {
            enabled: !!window.dataInContainerManager,
            currentStep: this.currentStep,
            stepCount: this.steps.length,
        };
        return info;
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
    
    // Create new instance with enhanced default options
    const defaultOptions = {
        autoAdvance: true,
        showProgressIndicator: true,
        smoothTransitions: true,
        enableSkipping: true,
        autoStart: true,
        ...options
    };
    
    window.guidedForms = new GuidedFormSystem(defaultOptions);
    
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
        const success = window.guidedForms.init();
    }, 100);
    
    return window.guidedForms;
}

/**
 * Toggle guided mode on/off
 */
function toggleGuidedMode() {
    if (window.guidedForms && window.guidedForms.isInitialized) {
        window.guidedForms.destroy();
    } else {
        initGuidedForms();
    }
}

/**
 * Navigate to previous step - called by datain.js buttons
 */
function guidedFormsPrevious() {
    // Check if content is loading (prevent navigation during load)
    if (window.isLoadingContent) {
        console.log('[GuidedForms] Navigation blocked - content loading');
        return false;
    }
    
    if (window.guidedForms && window.guidedForms.isInitialized && window.guidedForms.currentStep > 0) {
        window.guidedForms.showStep(window.guidedForms.currentStep - 1);
        return true;
    }
    return false;
}

/**
 * Navigate to next step - called by datain.js buttons
 */
function guidedFormsNext() {
    // Check if content is loading (prevent navigation during load)
    if (window.isLoadingContent) {
        console.log('[GuidedForms] Navigation blocked - content loading');
        return false;
    }
    
    if (window.guidedForms && window.guidedForms.isInitialized && window.guidedForms.steps && window.guidedForms.currentStep < window.guidedForms.steps.length - 1) {
        window.guidedForms.showStep(window.guidedForms.currentStep + 1);
        return true;
    }
    return false;
}

/**
 * Get current step info for button states - called by datain.js buttons
 */
function getGuidedFormsState() {
    if (window.guidedForms && window.guidedForms.isInitialized) {
        return {
            currentStep: window.guidedForms.currentStep,
            totalSteps: window.guidedForms.steps.length,
            canGoPrevious: window.guidedForms.currentStep > 0,
            canGoNext: window.guidedForms.currentStep < window.guidedForms.steps.length - 1,
            isInitialized: true
        };
    }
    return {
        currentStep: 0,
        totalSteps: 0,
        canGoPrevious: false,
        canGoNext: false,
        isInitialized: false
    };
}

// Export functions for global access
window.initGuidedForms = initGuidedForms;
window.toggleGuidedMode = toggleGuidedMode;
window.guidedFormsPrevious = guidedFormsPrevious;
window.guidedFormsNext = guidedFormsNext;
window.getGuidedFormsState = getGuidedFormsState;
