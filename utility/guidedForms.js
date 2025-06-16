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
 * - Mobile-responsive height calculations
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
            // Check for CalorieIQ form persistence
            if (typeof setJSON === 'function' && typeof collectFormData === 'function') {
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
                    inputs.forEach(input => saveInput(input));
                }
                
                if (gridItems.length > 0 && typeof saveGridItem === 'function') {
                    gridItems.forEach(item => saveGridItem(item));
                }
            }
        } catch (error) {
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

        // --- SCROLL TO TOP LOGIC (robust debug) ---
        setTimeout(() => {
            // Log all .data-content containers and their scrollTop
            const allContents = document.querySelectorAll('.data-content');
            allContents.forEach((el, idx) => {
                console.log(`[GuidedForms][Debug] .data-content[${idx}] scrollTop BEFORE:`, el.scrollTop, el);
            });

            // Try to scroll all .data-content inside expanded containers
            let didScroll = false;
            const expandedContainers = document.querySelectorAll('.data-container-income.expanded, .data-container-in.expanded');
            expandedContainers.forEach((container, cidx) => {
                const content = container.querySelector('.data-content');
                if (content) {
                    content.scrollTop = 0;
                    if (typeof content.scrollTo === 'function') content.scrollTo(0, 0);
                    console.log(`[GuidedForms] Scrolled .data-content in expanded container[${cidx}] to top`, content);
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
        step.element.style.display = 'flex';
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
            // No transitions - adjust size immediately
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
        
        if (this.config.smoothTransitions) {
            step.element.style.opacity = '0';
            step.element.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                step.element.style.display = 'none';
            }, this.config.transitionDuration);
        } else {
            step.element.style.display = 'none';
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
        
        // Apply dynamic sizing for the first step
        if (this.steps.length > 0) {
            this.adjustContainerSize(this.steps[0]);
        }
    }
    
    /**
     * Create progress indicator
     */
    createProgressIndicator() {
        if (!this.config.showProgressIndicator) return;
        
        // Don't show progress indicator when datain is collapsed
        const datainContainer = document.querySelector('.data-container-in');
        if (datainContainer && (datainContainer.classList.contains('collapsed') || datainContainer.classList.contains('visually-collapsed'))) {
            return;
        }
        
        // Remove existing indicator
        const existingIndicator = document.getElementById('guided-form-progress');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const progressContainer = document.createElement('div');
        progressContainer.id = 'guided-form-progress';
        progressContainer.style.cssText = `
            position: absolute;
            top: 10px;
            left: 15px;
            border-radius: 50px;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: "Inter", sans-serif;
            font-size: 12px;
            font-weight: 500;
            z-index: 11003;
        `;
        
        // Progress dots
        const dotsContainer = document.createElement('div');
        dotsContainer.id = 'progress-dots';
        dotsContainer.style.cssText = 'display: flex; gap: 12px; touch-action: pan-x;'; // Larger gap for touch

        this.steps.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.style.cssText = `
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: ${index === this.currentStep ? '#000' : '#ccc'};
                transition: background 0.2s ease, box-shadow 0.2s;
                cursor: pointer;
                box-shadow: ${index === this.currentStep ? '0 0 0 3px #aaa' : 'none'};
            `;
            dot.title = this.steps[index]?.label || `Step ${index + 1}`;
            dot.addEventListener('click', () => {
                this.showStep(index);
            });
            dotsContainer.appendChild(dot);
        });
        // Swipe support for mobile
        let touchStartX = null;
        dotsContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
            }
        });
        dotsContainer.addEventListener('touchend', (e) => {
            if (touchStartX !== null && e.changedTouches.length === 1) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0 && this.currentStep < this.steps.length - 1) {
                        this.showStep(this.currentStep + 1);
                    } else if (dx > 0 && this.currentStep > 0) {
                        this.showStep(this.currentStep - 1);
                    }
                }
            }
            touchStartX = null;
        });
        progressContainer.appendChild(dotsContainer);
        
        // Append to datain container since we know it exists and is expanded
        datainContainer.appendChild(progressContainer);
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

// Export functions for global access
window.initGuidedForms = initGuidedForms;
window.toggleGuidedMode = toggleGuidedMode;

// Auto-initialize when script loads (can be disabled by setting window.autoInitGuidedForms = false)
document.addEventListener('DOMContentLoaded', () => {
    if (window.autoInitGuidedForms !== false) {
        // Check if we're in a form context
        const hasFormElements = document.querySelector('.row1, .grid-container, .device-container');
        if (hasFormElements) {
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
document.addEventListener('data-in-loaded', (e) => {
    setTimeout(() => {
        const container = e.detail?.container || document;
        const hasFormElements = container.querySelector('.row1, .grid-container, .device-container');
        if (hasFormElements && window.autoInitGuidedForms !== false) {
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
