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
 *   dynamicSizing: true,           // Enable dynamic sizing (default: true)
 *   minContainerHeight: 200,       // Minimum height in pixels (default: 200)
 *   maxContainerHeight: '80vh',    // Maximum height (default: '80vh')
 *   sizingPadding: 60             // Extra padding for calculations (default: 60)
 * });
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
            dynamicSizing: true, // Enable dynamic container sizing
            minContainerHeight: 200, // Minimum container height in pixels
            maxContainerHeight: '80vh', // Maximum container height
            sizingPadding: 60, // Extra padding for dynamic sizing calculations
            ...options
        };
        
        this.currentStep = 0;
        this.steps = [];
        this.isInitialized = false;
        this.completedSteps = new Set();
        this.skippedSteps = new Set();
        this.originalContainerHeight = null; // Store original container height
        this.dataContainer = null; // Reference to the data container
        
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

        // Initialize data container reference for dynamic sizing
        this.initializeDataContainerRef();
        
        this.analyzeFormStructure();
        this.setupEventListeners();
        this.createProgressIndicator();
        this.initializeFirstStep();
        
        this.isInitialized = true;
        return true;
    }

    /**
     * Initialize data container reference for dynamic sizing
     */
    initializeDataContainerRef() {
        // Find the data container that might need dynamic sizing
        this.dataContainer = document.querySelector('.data-container-left.expanded');
        
        // If no expanded container found, look for any data-container-left
        if (!this.dataContainer) {
            this.dataContainer = document.querySelector('.data-container-left') || 
                               this.container.closest('.data-container-left');
        }
        
        if (this.dataContainer && this.config.dynamicSizing) {
            // Only store original height if container is actually expanded
            if (this.dataContainer.classList.contains('expanded')) {
                const computedStyle = window.getComputedStyle(this.dataContainer);
                this.originalContainerHeight = computedStyle.height;
            } else {
                // Clear reference until container is expanded
                this.dataContainer = null;
            }
            
            // Set up listeners regardless of current state
            this.setupDataContainerListeners();
        }
    }

    /**
     * Set up listeners for data container state changes
     */
    setupDataContainerListeners() {
        // Listen for data-in state changes to reapply dynamic sizing
        document.addEventListener('datain-state-changed', (event) => {
            const state = event.detail?.state;
            
            if (state === 'expanded' && this.isInitialized) {
                // Update our reference to the expanded container
                this.dataContainer = document.querySelector('.data-container-left.expanded');
                // Reapply sizing for current step
                if (this.steps[this.currentStep]) {
                    setTimeout(() => {
                        this.adjustContainerSize(this.steps[this.currentStep]);
                    }, 100);
                }
            } else if (state === 'initial' || state === 'collapsed') {
                // When collapsing, remove our height override to allow normal collapse behavior
                if (this.dataContainer) {
                    this.dataContainer.style.height = '';
                    this.dataContainer.style.transition = '';
                }
                // Clear the reference since container is no longer expanded
                this.dataContainer = null;
            }
        });

        // Listen for window resize to recalculate container sizes
        window.addEventListener('resize', () => {
            if (this.isInitialized && this.dataContainer && this.config.dynamicSizing) {
                this.debounceResize();
            }
        });
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
     * Check if current step is completed and handle auto-advance
     */
    checkStepCompletion(step) {
        const isCompleted = step.validationRule();
        
        if (isCompleted && !step.isCompleted) {
            step.isCompleted = true;
            this.completedSteps.add(step.index);
            this.updateProgressIndicator();
            
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
        
        // Apply dynamic sizing for new step
        this.adjustContainerSize(nextStep);
    }

    /**
     * Adjust container size to fit current step content
     */
    adjustContainerSize(step) {
        if (!this.config.dynamicSizing || !this.dataContainer) {
            return;
        }

        // Only apply dynamic sizing if the container is actually expanded
        if (!this.dataContainer.classList.contains('expanded')) {
            return;
        }

        // Small delay to ensure step is fully rendered
        setTimeout(() => {
            try {
                // Double-check the container is still expanded (user might have collapsed it)
                if (!this.dataContainer || !this.dataContainer.classList.contains('expanded')) {
                    return;
                }

                // Calculate the content height needed for this step
                const stepHeight = this.calculateStepHeight(step);
                const containerHeight = this.calculateOptimalContainerHeight(stepHeight);
                
                // Apply the new height with smooth transition
                this.dataContainer.style.transition = 'height 0.3s ease-in-out';
                this.dataContainer.style.height = `${containerHeight}px`;
                
                // Dispatch resize event for any listeners
                window.dispatchEvent(new Event('resize'));
                
            } catch (error) {
            }
        }, 100);
    }

    /**
     * Calculate the height needed for a specific step
     */
    calculateStepHeight(step) {
        if (!step || !step.element) {
            return this.config.minContainerHeight;
        }

        // Temporarily show the step to measure it
        const wasVisible = step.isVisible;
        const originalDisplay = step.element.style.display;
        const originalOpacity = step.element.style.opacity;
        const originalTransform = step.element.style.transform;
        const originalPosition = step.element.style.position;
        
        // Make element visible but transparent for measurement
        step.element.style.display = 'flex';
        step.element.style.opacity = '0';
        step.element.style.transform = 'none';
        step.element.style.position = 'static';
        step.element.style.visibility = 'hidden'; // Hidden but still takes up space
        
        // Force a reflow to ensure accurate measurements
        step.element.offsetHeight;
        
        // Get the actual height including margins
        const rect = step.element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(step.element);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        
        const stepHeight = rect.height + marginTop + marginBottom;
        
        // Restore original styles
        step.element.style.display = originalDisplay;
        step.element.style.opacity = originalOpacity;
        step.element.style.transform = originalTransform;
        step.element.style.position = originalPosition;
        step.element.style.visibility = '';
        
        // Handle edge cases
        const finalHeight = Math.max(stepHeight, 50); // Minimum 50px for very small steps
        
        return finalHeight;
    }

    /**
     * Calculate optimal container height based on step content
     */
    calculateOptimalContainerHeight(stepHeight) {
        if (!stepHeight || stepHeight <= 0) {
            return this.config.minContainerHeight;
        }

        // Add padding for progress indicator, close button, and general spacing
        const totalHeight = stepHeight + this.config.sizingPadding;
        
        // Respect minimum height
        const minHeight = this.config.minContainerHeight;
        
        // Respect maximum height with mobile considerations
        let maxHeight;
        if (typeof this.config.maxContainerHeight === 'string' && this.config.maxContainerHeight.endsWith('vh')) {
            const vhValue = parseFloat(this.config.maxContainerHeight);
            maxHeight = (window.innerHeight * vhValue) / 100;
        } else {
            maxHeight = parseInt(this.config.maxContainerHeight) || window.innerHeight * 0.8;
        }
        
        // Mobile-specific adjustments
        if (window.innerWidth <= 480) {
            // On mobile, be more conservative with max height to ensure usability
            maxHeight = Math.min(maxHeight, window.innerHeight * 0.7);
        }
        
        // Constrain to min/max bounds
        const finalHeight = Math.max(minHeight, Math.min(totalHeight, maxHeight));
        
        return finalHeight;
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
        
        // Apply dynamic sizing for the first step only if container is expanded
        if (this.steps.length > 0 && this.dataContainer && this.dataContainer.classList.contains('expanded')) {
            this.adjustContainerSize(this.steps[0]);
        }
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

        // Priority 2: Data-in system containers - target the main container directly
        if (!targetContainer) {
            targetContainer = document.querySelector('.data-container-left');
        }

        // Priority 3: General data-content containers
        if (!targetContainer) {
            targetContainer = this.container.querySelector('.data-content');
        }

        // Priority 4: Check if current container is already a data-content element
        if (!targetContainer && this.container.classList.contains('data-content')) {
            targetContainer = this.container;
        }

        // Priority 5: Fallback to current container
        if (!targetContainer) {
            targetContainer = this.container;
        }

        const progressContainer = document.createElement('div');
        progressContainer.id = 'guided-form-progress';
        
        // Determine positioning based on container type
        const isDataInContainer = targetContainer.closest('.data-container-left') || 
                                 targetContainer.classList.contains('data-container-left');
        
        if (isDataInContainer) {
            // Position inside data-container-left level with button centers - moved higher
            progressContainer.style.cssText = `
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
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
        } else {
            // Use fixed positioning for other containers level with button centers - moved higher
            progressContainer.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 20px;
                padding: 4px 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: "Inter", sans-serif;
                font-size: 12px;
                font-weight: 500;
                z-index: 10000;
            `;
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
        } else {
            document.body.appendChild(progressContainer);
        }
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
        
        // Clear container reference
        this.dataContainer = null;
    }

    /**
     * Restore original container size when exiting guided mode
     */
    restoreOriginalContainerSize() {
        if (this.dataContainer && this.originalContainerHeight && this.config.dynamicSizing) {
            // Only restore if container is still expanded
            if (this.dataContainer.classList.contains('expanded')) {
                this.dataContainer.style.transition = 'height 0.3s ease-in-out';
                this.dataContainer.style.height = this.originalContainerHeight;
                
                // Remove the transition after completion
                setTimeout(() => {
                    if (this.dataContainer) {
                        this.dataContainer.style.transition = '';
                    }
                }, 300);
            } else {
                // Container is collapsed, just clean up
                this.cleanupDynamicSizing();
            }
        }
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
        
        // Clear references
        this.dataContainer = null;
        this.originalContainerHeight = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Manually trigger container resize for current step
     * Useful for developers who want to refresh sizing after dynamic content changes
     */
    refreshContainerSize() {
        if (this.isInitialized && this.config.dynamicSizing && this.steps[this.currentStep]) {
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
        if (!this.config.dynamicSizing) {
            return { enabled: false };
        }
        const currentStep = this.steps[this.currentStep];
        const info = {
            enabled: true,
            currentStep: this.currentStep,
            stepCount: this.steps.length,
            dataContainer: !!this.dataContainer,
            originalHeight: this.originalContainerHeight,
        };
        if (currentStep && this.dataContainer) {
            info.currentStepHeight = this.calculateStepHeight(currentStep);
            info.currentContainerHeight = this.dataContainer.style.height || window.getComputedStyle(this.dataContainer).height;
        }
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
        dynamicSizing: true, // Enable dynamic container sizing by default
        minContainerHeight: 200,
        maxContainerHeight: '80vh',
        sizingPadding: 60,
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
