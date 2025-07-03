/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getLocal } from '/utility/getlocal.js';
import { setLocal } from '/utility/setlocal.js';
import { FormPersistence } from '/utility/formPersistence.js';
import { initializeBidirectionalSwipe, initializeSimpleVerticalSwipe } from '/utility/swipeFunctionality.js';
import { initAutoExpandTextareas, createSplitTextarea, createSplitCalendarText, deleteEntry, handleConditionalInput, addEntryButton, addCalendarEntryButton } from '/ai/styles/inputFunctionality.js';
import '/utility/enhancedUI.js';
import '/utility/copy.js';
import '/utility/dataOverwrite.js';
import '/ai/faq.js'; // Add FAQ modal script

// Import validation utilities
import { 
    validateModuleData, 
    ValidationError, 
    displayValidationErrors 
} from '/utility/inputValidation.js';

// Universal validation function for all modules
function validateFormDataForModule(moduleName, formData) {
    try {
        // For natural language inputs, we want to be more permissive
        // Apply basic security validation but don't block creative content
        const validatedData = validateModuleData(moduleName, formData);
        console.log(`[DataIn] Validation passed for module: ${moduleName}`);
        return { valid: true, data: validatedData };
    } catch (error) {
        if (error instanceof ValidationError) {
            console.warn(`[DataIn] Validation failed for module ${moduleName}:`, error.message);
            return { 
                valid: false, 
                error: error.message, 
                field: error.field,
                errors: error.errors || [] 
            };
        }
        console.error(`[DataIn] Unexpected validation error for module ${moduleName}:`, error);
        return { 
            valid: false, 
            error: 'Validation failed due to unexpected error',
            field: 'general'
        };
    }
}

// Enhanced generate button handler that adds validation
function wrapGenerateHandler(originalHandler, moduleName) {
    return async function(event) {
        console.log(`[DataIn] Enhanced generate handler called for module: ${moduleName}`);
        
        try {
            // Get form persistence instance for this module
            const formPersistenceInstance = window[`${moduleName}FormPersistence`];
            if (!formPersistenceInstance) {
                console.warn(`[DataIn] No FormPersistence instance found for module: ${moduleName}`);
                return originalHandler.call(this, event);
            }
            
            // Get current form data
            const formData = formPersistenceInstance.getSavedFormData();
            if (!formData) {
                console.warn(`[DataIn] No form data found for module: ${moduleName}`);
                alert('Please complete the form before generating results.');
                return;
            }
            
            // Validate form data
            const validationResult = validateFormDataForModule(moduleName, formData);
            
            if (!validationResult.valid) {
                // Show validation errors to user
                console.warn(`[DataIn] Validation failed:`, validationResult.error);
                
                // Find form element to show errors
                const formElement = document.querySelector('.device-container') || document.body;
                
                if (validationResult.errors && validationResult.errors.length > 0) {
                    // Multiple field errors
                    displayValidationErrors(validationResult.errors, formElement);
                    alert(`Please fix the following errors:\n${validationResult.errors.map(e => `• ${e.message}`).join('\n')}`);
                } else {
                    // Single error
                    alert(`Validation Error: ${validationResult.error}`);
                }
                return;
            }
            
            console.log(`[DataIn] Validation passed, proceeding with generation for module: ${moduleName}`);
            
            // Call original handler with validated data
            return originalHandler.call(this, event);
            
        } catch (error) {
            console.error(`[DataIn] Error in enhanced generate handler for module ${moduleName}:`, error);
            // Fall back to original handler if validation fails unexpectedly
            return originalHandler.call(this, event);
        }
    };
}

// Function to enhance generate buttons with validation
function enhanceGenerateButtons() {
    console.log('[DataIn] Enhancing generate buttons with validation');
    
    // List of known generate button patterns
    const generateButtonSelectors = [
        '#generate-calorie-btn',
        '#generate-decision-btn', 
        '#generate-enneagram-btn',
        '#generate-event-btn',
        '#generate-fashion-btn',
        '#generate-income-btn',
        '#generate-philosophy-btn',
        '#generate-quiz-btn',
        '#generate-research-btn',
        '#generate-social-btn',
        '#generate-period-btn'
    ];
    
    generateButtonSelectors.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) {
            // Extract module name from button ID
            const moduleName = selector.replace('#generate-', '').replace('-btn', '');
            console.log(`[DataIn] Found generate button for module: ${moduleName}`);
            
            // Store original onclick handler if it exists
            const originalOnClick = button.onclick;
            if (originalOnClick) {
                console.log(`[DataIn] Wrapping existing onclick handler for ${moduleName}`);
                button.onclick = wrapGenerateHandler(originalOnClick, moduleName);
            }
            
            // Also wrap any addEventListener handlers by storing reference to the button
            // This is a bit more complex but ensures we catch all handlers
            button.setAttribute('data-validation-enhanced', 'true');
            button.setAttribute('data-module-name', moduleName);
        }
    });
}

// Override addEventListener for generate buttons to ensure validation
function enhanceEventListeners() {
    // Store original addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' && this.id && this.id.includes('generate') && this.id.includes('btn')) {
            const moduleName = this.getAttribute('data-module-name') || 
                              this.id.replace('generate-', '').replace('-btn', '');
            
            if (moduleName && typeof listener === 'function') {
                console.log(`[DataIn] Enhancing addEventListener for generate button: ${moduleName}`);
                const enhancedListener = wrapGenerateHandler(listener, moduleName);
                return originalAddEventListener.call(this, type, enhancedListener, options);
            }
        }
        
        return originalAddEventListener.call(this, type, listener, options);
    };
}

// Prevent zoom/pinch on content containers
function preventZoom() {
    const style = document.createElement('style');
    style.textContent = `
        .device-container, .row1, .grid-container {
            touch-action: manipulation !important;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }
        html { -webkit-text-size-adjust: 100% !important; }
    `;
    document.head.appendChild(style);
}

function initializeFormPersistence(url) {
    console.log('[DataIn] Initializing FormPersistence for URL:', url);
    
    // Prevent zoom on load
    preventZoom();
    
    // Auto-detect module from URL patterns
    let moduleType = 'default';
    let moduleConfig = {};
    
    if (url.includes('/calorie/')) {
        moduleType = 'calorie';
        moduleConfig = {
            singleSelection: ['calorie-activity', 'calorie-sex'],
            multiSelection: ['calorie-goal', 'calorie-recommendations', 'calorie-diet-type']
        };
    } else if (url.includes('/income/')) {
        moduleType = 'income';
        moduleConfig = {
            singleSelection: [],
            multiSelection: [],
            frequencyFields: ['income-country', 'income-subregion', 'filing-status']
        };
    } else if (url.includes('/decision/')) {
        moduleType = 'decision';
    } else if (url.includes('/enneagram/')) {
        moduleType = 'enneagram';
    } else if (url.includes('/event/')) {
        moduleType = 'event';
    } else if (url.includes('/philosophy/')) {
        moduleType = 'philosophy';
    } else if (url.includes('/quiz/')) {
        moduleType = 'quiz'; // UNDO: revert to original key for quiz module
    } else if (url.includes('/research/')) {
        moduleType = 'research';
    } else if (url.includes('/social/')) {
        moduleType = 'social';
    } else if (url.includes('/fashion/')) {
        moduleType = 'fashion';
    } else if (url.includes('/categories.html')) {
        moduleType = 'categories';
        moduleConfig = {
            singleSelection: ['category-selection'],
            multiSelection: []
        };
    } else if (url.includes('/period/')) {
        moduleType = 'period';
        moduleConfig = {
            singleSelection: ['period-tracking-reason'],
            multiSelection: [],
            splitTextareas: true // Special handling for split textarea entries
        };
    } else {
        // Try to detect from URL path
        const pathParts = url.split('/');
        for (let part of pathParts) {
            if (part.endsWith('iq.html')) {
                moduleType = part.replace('iq.html', '');
                break;
            }
        }
    }
    
    console.log(`[DataIn] Detected module type: ${moduleType}`);
    
    // Initialize per-module FormPersistence instance
    try {
        // For fashion, manually specify singleSelection containers to match other modules
        if (moduleType === 'fashion') {
            moduleConfig.singleSelection = [
                'fashion-personal-style',
                'fashion-climate',
                'fashion-occasion'
            ];
            moduleConfig.multiSelection = [];
        }
        
        const formPersistence = FormPersistence.getInstance(moduleType, moduleConfig);
        formPersistence.init({ moduleName: moduleType, ...moduleConfig });
        // Attach to window for module scripts to use
        window[`${moduleType}FormPersistence`] = formPersistence;
        console.log('[DataIn] FormPersistence instance initialized for module:', moduleType);
    } catch (error) {
        console.error('[DataIn] Error initializing FormPersistence:', error);
    }
    
    // Add module-specific initialization
    if (moduleType === 'categories') {
        initializeCategoryModule();
    }
}

// Category module initialization function
function initializeCategoryModule() {
    console.log('[DataIn] Initializing category module functionality');
    
    // Function to filter products using the same logic as categories.html
    function filterProducts(selectedCategory) {
        const products = document.querySelectorAll('.grid-item[data-category]');
        console.log('[DataIn] Filtering products for category:', selectedCategory, 'Found products:', products.length);
        
        products.forEach(product => {
            const categories = product.getAttribute('data-category').split(',');
            
            if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
                // FORCE SHOW with inline style (overrides everything)
                product.style.display = 'flex';
                console.log('[DataIn] Showing:', product.textContent);
            } else {
                // FORCE HIDE with inline style (overrides everything)
                product.style.display = 'none';
                console.log('[DataIn] Hiding:', product.textContent);
            }
        });
        
        // Store selection in localStorage for other modules to access
        localStorage.setItem('categoriesPageSelection', selectedCategory);
        console.log('[DataIn] Category filtered:', selectedCategory);
    }
    
    // Add category selection logic - but don't conflict with categories.html
    // This is a backup handler in case categories.html doesn't load properly
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('grid-item') && e.target.closest('#category-selection')) {
            const selectedCategory = e.target.getAttribute('data-value');
            console.log('[DataIn] Category selected:', selectedCategory);
            
            if (selectedCategory) {
                // Update active state (use 'active' class to match categories.html)
                document.querySelectorAll('#category-selection .grid-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Filter products
                filterProducts(selectedCategory);
            }
        }
        
        // Add product selection logic
        if (e.target.classList.contains('grid-item') && e.target.getAttribute('data-value') && e.target.getAttribute('data-value').startsWith('/ai/')) {
            const url = e.target.getAttribute('data-value');
            console.log('[DataIn] Product selected:', url);
            
            // Use regular content loading for all modules
            const gridItemEvent = new CustomEvent('promptGridItemSelected', { 
                detail: { url: url }
            });
            document.dispatchEvent(gridItemEvent);
            
            // Store the URL in localStorage for persistence
            if (typeof window.setLocal === 'function') {
                window.setLocal('lastGridItemUrl', url);
            } else {
                localStorage.setItem('lastGridItemUrl', url);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    // Load BoxIcons if not already loaded
    if (!document.querySelector('link[href*="boxicons"]')) {
        const boxIconsLink = document.createElement('link');
        boxIconsLink.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
        boxIconsLink.rel = 'stylesheet';
        document.head.appendChild(boxIconsLink);
    }
    
    // Define files that should use inputstyles.css
    const inputFiles = [
        '/ai/calorie/calorieiq.html',
        '/ai/decision/decisioniq.html',
        '/ai/enneagram/enneagramiq.html',
        '/ai/event/eventiq.html',
        '/ai/fashion/fashioniq.html',
        '/ai/fitness/fitnessiq.html',
        '/ai/period/periodiq.html',
        '/ai/philosophy/philosophyiq.html',
        '/ai/quiz/quiziq.html',
        '/ai/research/researchiq.html',
        '/ai/social/socialiq.html',
        '/ai/categories.html',
        '/ai/income/incomeiq.html'
    ];
    
    // Define files that should use incomestyles.css
    const incomeFiles = ['/ai/income/incomeiq.html'];
    
    // Function to check if current page needs specific CSS
    function shouldLoadInputStyles() {
        const currentPath = window.location.pathname;
        return inputFiles.some(file => currentPath.includes(file.replace('.html', ''))) || 
               document.querySelector('[data-value*="/ai/calorie/"], [data-value*="/ai/decision/"], [data-value*="/ai/enneagram/"], [data-value*="/ai/event/"], [data-value*="/ai/fashion/"], [data-value*="/ai/fitness/"], [data-value*="/ai/philosophy/"], [data-value*="/ai/quiz/"], [data-value*="/ai/research/"], [data-value*="/ai/social/"], [data-value*="/ai/income/"], [data-value*="/ai/categories.html"]');
    }
    
    function shouldLoadIncomeStyles() {
        const currentPath = window.location.pathname;
        return incomeFiles.some(file => currentPath.includes(file.replace('.html', ''))) ||
               document.querySelector('[data-value*="/ai/income/"]');
    }
    
    // Load inputstyles.css only for input files
    if (shouldLoadInputStyles() && !document.querySelector('link[href*="inputstyles.css"]')) {
        const inputStylesLink = document.createElement('link');
        inputStylesLink.href = '/ai/styles/inputstyles.css';
        inputStylesLink.rel = 'stylesheet';
        document.head.appendChild(inputStylesLink);
    }
    
    // Load incomestyles.css only for income files
    if (shouldLoadIncomeStyles() && !document.querySelector('link[href*="incomestyles.css"]')) {
        const incomeStylesLink = document.createElement('link');
        incomeStylesLink.href = '/ai/styles/incomestyles.css';
        incomeStylesLink.rel = 'stylesheet';
        document.head.appendChild(incomeStylesLink);
    }
    
    let dataContainer = null;
    let isVisible = false; // Move to broader scope for utility buttons



    
    // Function to load appropriate CSS based on URL
    function loadCSSForUrl(url) {
        // Use the same arrays defined at the top level for consistency
        // Check if URL matches input files and load inputstyles.css
        if (inputFiles.includes(url) && !document.querySelector('link[href*="inputstyles.css"]')) {
            const inputStylesLink = document.createElement('link');
            inputStylesLink.href = '/ai/styles/inputstyles.css';
            inputStylesLink.rel = 'stylesheet';
            document.head.appendChild(inputStylesLink);
            console.log('[DataIn] Loaded inputstyles.css for:', url);
        }
        
        // Check if URL matches income files and load incomestyles.css
        if (incomeFiles.includes(url) && !document.querySelector('link[href*="incomestyles.css"]')) {
            const incomeStylesLink = document.createElement('link');
            incomeStylesLink.href = '/ai/styles/incomestyles.css';
            incomeStylesLink.rel = 'stylesheet';
            document.head.appendChild(incomeStylesLink);
            console.log('[DataIn] Loaded incomestyles.css for:', url);
        }
    }

    async function loadStoredContent(url) {
        try {
            // Load appropriate CSS based on the URL being loaded
            loadCSSForUrl(url);
            
            // Simply update content area - no DOM restructuring
            const dataContent = dataContainer.querySelector('.data-content');
            dataContent.innerHTML = 'Loading...';

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();
            
            // Check if content contains form elements that need guided forms
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const hasFormElements = tempDiv.querySelector('.row1, .grid-container, .device-container');
            
            if (hasFormElements) {
                console.log('[DataIn] Form content detected, preparing guided forms initialization');
                
                // Update content with initial hiding to prevent flash
                dataContent.innerHTML = `<div style="opacity: 0; transition: opacity 0.2s ease;">${content}</div>`;
                
                // Function to show content after guided forms is ready
                const showContentAfterGuidedForms = () => {
                    // Initialize FormPersistence for this module
                    initializeFormPersistence(url);
                    
                    // Show content with smooth transition
                    const contentWrapper = dataContent.querySelector('div');
                    if (contentWrapper) {
                        contentWrapper.style.opacity = '1';
                    }
                    
                    console.log('[DataIn] Content revealed after guided forms initialization');

                    // Initialize swipe functionality for guided forms ONLY if form elements are present AND it's not the categories page
                    const isCategoriesPage = url.includes('/ai/categories.html');
                    if (window.guidedForms && typeof window.guidedForms.showStep === 'function' && hasFormElements && !isCategoriesPage) {
                        console.log('[DataIn] Initializing bidirectional swipe for guided forms on .data-content (form elements detected, not categories page)');
                        
                        // Initialize both left and right swipe handlers with a single call
                        initializeBidirectionalSwipe(dataContent, {
                            right: () => {
                                if (window.guidedForms && window.guidedForms.currentStep > 0) {
                                    console.log('[DataIn] Swipe Right detected, going to previous step.');
                                    window.guidedForms.showStep(window.guidedForms.currentStep - 1);
                                }
                            },
                            left: () => {
                                if (window.guidedForms && window.guidedForms.steps && window.guidedForms.currentStep < window.guidedForms.steps.length - 1) {
                                    console.log('[DataIn] Swipe Left detected, going to next step.');
                                    window.guidedForms.showStep(window.guidedForms.currentStep + 1);
                                }
                            }
                        }, { sessionStorageKey: 'swipeEducationShownDatain' });
                    } else if (!hasFormElements) {
                        console.log('[DataIn] No form elements detected, skipping swipe functionality initialization');
                    } else if (isCategoriesPage) {
                        console.log('[DataIn] Categories page detected, skipping swipe functionality initialization');
                    }
                };
                
                // Load guided forms script if not already loaded
                if (!window.GuidedFormSystem && !window.initGuidedForms && !document.querySelector('script[src*="guidedForms.js"]')) {
                    // Disable auto-initialization from the script itself
                    window.autoInitGuidedForms = false;
                    const guidedFormsScript = document.createElement('script');
                    guidedFormsScript.src = '/utility/guidedForms.js';
                    guidedFormsScript.onload = () => {
                        console.log('[DataIn] Guided forms script loaded');
                        // Initialize guided forms immediately after script loads
                        if (window.initGuidedForms) {
                            console.log('[DataIn] Auto-starting guided forms');
                            const guidedFormsInstance = window.initGuidedForms({
                                autoAdvance: true,
                                showProgressIndicator: true,
                                smoothTransitions: true,
                                enableSkipping: true,
                                autoStart: true
                            });
                            // Small delay to ensure guided forms has processed the content
                            setTimeout(showContentAfterGuidedForms, 50);
                        } else {
                            // Fallback if guided forms fails to load
                            showContentAfterGuidedForms();
                        }
                    };
                    guidedFormsScript.onerror = () => {
                        console.warn('[DataIn] Guided forms script failed to load, showing content without guided forms');
                        showContentAfterGuidedForms();
                    };
                    document.head.appendChild(guidedFormsScript);
                } else if (window.initGuidedForms) {
                    // Script already loaded, initialize immediately
                    console.log('[DataIn] Auto-starting guided forms (script already loaded)');
                    const guidedFormsInstance = window.initGuidedForms({
                        autoAdvance: true,
                        showProgressIndicator: true,
                        smoothTransitions: true,
                        enableSkipping: true,
                        autoStart: true
                    });
                    // Small delay to ensure guided forms has processed the content
                    setTimeout(showContentAfterGuidedForms, 50);
                } else {
                    // No guided forms available, show content normally
                    showContentAfterGuidedForms();
                }
            } else {
                // No form elements, insert content normally without guided forms
                dataContent.innerHTML = content;
                
                // Initialize FormPersistence for this module
                initializeFormPersistence(url);
            }

            // Dispatch custom event to notify that data-in content has loaded
            const moduleType = url.includes('/fashion/') ? 'fashion' :
                              url.includes('/calorie/') ? 'calorie' :
                              url.includes('/decision/') ? 'decision' :
                              url.includes('/enneagram/') ? 'enneagram' :
                              url.includes('/event/') ? 'event' :
                              url.includes('/philosophy/') ? 'philosophy' :
                              url.includes('/quiz/') ? 'quiz' :
                              url.includes('/research/') ? 'research' :
                              url.includes('/social/') ? 'social' :
                              url.includes('/income/') ? 'income' :
                              'unknown';
                              
            document.dispatchEvent(new CustomEvent('data-in-loaded', {
                detail: {
                    url: url,
                    container: dataContainer,
                    moduleType: moduleType
                }
            }));

            // Execute scripts from the loaded content
            const scripts = dataContent.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                
                // Preserve script type attribute (important for modules)
                if (script.type) {
                    newScript.type = script.type;
                }
                
                // Replace the old script with the new one to trigger execution
                script.parentNode.insertBefore(newScript, script);
                script.remove();
            });

            // At the end of all form/content initialization (after content is revealed):
            if (window.enablePremiumFeatures) {
              window.enablePremiumFeatures();
            }
        } catch (error) {
            console.error('Error loading content:', error);
            const dataContent = dataContainer.querySelector('.data-content');
            dataContent.innerHTML = 'Error loading content. Please try again.';
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-in')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Pure Transform Container - Always Same Structure */
            .data-container-in {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 90vh;
                background-color: rgba(255, 255, 255, 0.97);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-bottom: none;
                border-radius: 24px 24px 0 0;
                box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12), 0 -4px 16px rgba(0, 0, 0, 0.08), 0 -1px 4px rgba(0, 0, 0, 0.04);
                z-index: 1000;
                font-family: "Inter", sans-serif;
                display: flex;
                flex-direction: column;
                /* Pure transform approach - only move up/down */
                transform: translateY(calc(100% - 38.5px));
                transition: transform 0.3s ease-in-out;
                overflow: hidden;
            }

            /* Visible state - move container up */
            .data-container-in.visible {
                transform: translateY(0);
            }

            .data-container-in:hover {
                background-color: rgba(255, 255, 255, 0.99);
                box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.15), 0 -6px 20px rgba(0, 0, 0, 0.1), 0 -2px 8px rgba(0, 0, 0, 0.06);
            }

            /* Header always visible at top */
            .data-container-in .container-header {
                min-height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 10px;
                background: linear-gradient(180deg, rgba(235, 245, 240, 0.6) 0%, rgba(245, 250, 247, 0.3) 70%, rgba(255, 255, 255, 0.05) 100%);
                border-radius: 24px 24px 0 0;
                flex-shrink: 0;
                box-sizing: border-box;
                backdrop-filter: blur(2px);
            }

            /* Utility buttons - always visible in header */
            .data-container-in .utility-buttons-container {
                display: flex;
                flex-direction: row;
                gap: 6px;
                align-items: center;
                justify-content: space-evenly;
                width: 100%;
                min-height: 36px;
                padding: 0;
                box-sizing: border-box;
                overflow: hidden;
                flex-wrap: nowrap;
            }

            /* Hide only the guided form navigation button when container is minimized */
            .data-container-in:not(.visible) #datain-guided-nav-btn {
                display: none !important;
            }

            /* Hide FAQ and overwrite buttons when container is minimized */
            .data-container-in:not(.visible) #datain-faq-btn,
            .data-container-in:not(.visible) #datain-overwrite-btn {
                display: none !important;
            }

            /* Hide copy button when container is expanded (copy is for output content only) */
            .data-container-in.visible #datain-copy-btn {
                display: none !important;
            }

            /* Remove close button styles since we don't want it */

            /* Content area - always present, scrollable */
            .data-container-in .data-content {
                flex: 1;
                padding: 10px;
                font-size: 14px;
                overflow-y: auto;
                overflow-x: hidden;
                width: 100%;
                box-sizing: border-box;
                scroll-behavior: smooth;
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
            }

            /* Custom scrollbar for webkit browsers */
            .data-container-in .data-content::-webkit-scrollbar {
                width: 6px;
            }

            .data-container-in .data-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .data-container-in .data-content::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }

            .data-container-in .data-content::-webkit-scrollbar-thumb:hover {
                background-color: rgba(0, 0, 0, 0.3);
            }

            /* Button hover effects */
            .data-container-in .utility-buttons-container button:hover {
                transform: translateY(-2px);
            }

            /* Mobile responsiveness */
            @media (max-width: 480px) {
                .data-container-in .utility-buttons-container {
                    gap: 4px;
                    min-height: 36px;
                }

                .data-container-in .utility-buttons-container button {
                    width: 26px;
                    height: 26px;
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .data-container-in .utility-buttons-container button i {
                    font-size: 11px;
                }

                .data-container-in .utility-buttons-container button span {
                    font-size: 11px;
                }

                .data-container-in .close-data-container {
                    font-size: 14px;
                    padding: 4px;
                }

                .data-container-in .data-content {
                    font-size: 12px;
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(style);

        // Create container with persistent structure - NO CLOSE BUTTON
        dataContainer = document.createElement('div');
        dataContainer.className = 'data-container-in';
        dataContainer.innerHTML = `
            <div class="container-header">
                <div class="utility-buttons-container">
                    <button id="datain-category-btn" title="Open Categories" style="width: 28px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                        <i class="bx bx-grid-alt" style="font-size: 14px;"></i>
                    </button>
                    <button id="datain-payment-btn" title="Premium Features" style="width: 28px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                        <span style="font-size: 14px; font-weight: normal;">$</span>
                    </button>
                    <button id="datain-overwrite-btn" title="Clear All Data" style="width: 28px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                        <i class="bx bx-trash" style="font-size: 14px;"></i>
                    </button>
                    <button id="datain-copy-btn" title="Copy to clipboard" style="width: 28px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                        <i class="bx bx-copy" style="font-size: 14px;"></i>
                    </button>
                    <button id="datain-faq-btn" title="Tips & FAQ" style="width: 28px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                        <i class="bx bx-question-mark" style="font-size: 16px;"></i>
                    </button>
                    <button id="datain-guided-nav-btn" title="Step Navigation" style="width: 56px; height: 28px; border: none; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: none; align-items: center; justify-content: space-between; transition: all 0.2s ease; flex-shrink: 0; padding: 0 4px; position: relative;">
                        <i id="datain-guided-prev-icon" class="bx bx-left-arrow-alt" style="font-size: 14px; opacity: 0.3; transition: opacity 0.2s ease, transform 0.15s ease;"></i>
                        <div style="width: 1px; height: 16px; background-color: rgba(0, 0, 0, 0.1); position: absolute; left: 50%; transform: translateX(-50%);"></div>
                        <i id="datain-guided-next-icon" class="bx bx-right-arrow-alt" style="font-size: 14px; opacity: 0.3; transition: opacity 0.2s ease, transform 0.15s ease;"></i>
                    </button>
                </div>
            </div>
            <div class="data-content">No content selected. Please select a grid item.</div>
        `;

        document.body.appendChild(dataContainer);

        // Setup utility buttons for initial state
        setupUtilityButtons();

        // Initialize simple vertical swipe for container toggle
        initializeSimpleVerticalSwipe(dataContainer, toggleDataContainer);

        // Add click listener to container header for toggle
        const containerHeader = dataContainer.querySelector('.container-header');
        containerHeader.addEventListener('click', function (e) {
            // Check if click is on utility buttons
            const isUtilityButton = e.target.closest('button') || e.target.tagName === 'BUTTON';
            
            if (!isUtilityButton) {
                e.preventDefault();
                toggleDataContainer();
            }
        });

        // Listen for the special collapse event from dataout.js
        document.addEventListener('collapse-datain-container', function() {
            console.log('[DataIn] Received collapse-datain-container event');
            if (isVisible) {
                console.log('[DataIn] Collapsing datain container due to dataout expansion');
                toggleDataContainer();
            }
        });

        // Listen for grid item selection events from promptgrid.js
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            if (isVisible) {
                loadStoredContent(url);
            }
        });

        // Fallback: Monitor localStorage changes for lastGridItemUrl
        window.addEventListener('storage', function (e) {
            if (e.key === 'lastGridItemUrl' && e.newValue && isVisible) {
                loadStoredContent(e.newValue);
            }
            // Update payment button when rate limit status changes
            if (e.key === 'rateLimitStatus') {
                updatePaymentButtonDisplay();
            }
        });

        // Collapse container when clicking outside
        document.addEventListener('click', function (e) {
            // If the container isn't visible, do nothing.
            if (!isVisible) return;

            const isClickInsideDataIn = dataContainer.contains(e.target);

            // Check if the click is inside any known modal that might be on top of datain.
            // If a click is inside another modal, this listener should ignore it.
            const isClickInsideAnotherModal = e.target.closest('#faq-modal-backdrop, .data-overwrite-modal, .payment-modal, .share-modal-backdrop');
            const isClickOnToast = e.target.closest('[id^="toast-"]');

            if (isClickInsideAnotherModal || isClickOnToast) {
                // Click is inside another modal or a toast, so we do nothing.
                return;
            }

            // If the click is outside the datain container, and not inside another modal, close it.
            if (!isClickInsideDataIn) {
                toggleDataContainer();
            }
        });

        // Don't auto-expand on page load - let user choose when to engage
        // This prevents terms/consent modal from appearing immediately
        // Instead, show hint animation on categories button for new users
        const lastGridItemUrl = getLocal('lastGridItemUrl');
        
        // Only auto-expand if user has already accepted terms/consent AND had container visible
        const lastState = getLocal('dataContainerState') || 'hidden';
        const hasAcceptedTerms = window.termsConsentManager && window.termsConsentManager.checkStatus();
        
        if (lastState === 'visible' && hasAcceptedTerms) {
            toggleDataContainer();
        } else {
            // Show hint animation for new users or those who haven't accepted terms
            showCategoriesButtonHint();
        }
    }



    // Pure transform toggle function - accessible to utility buttons
    function toggleDataContainer() {
        if (!dataContainer) return;

        isVisible = !isVisible;
        
        if (isVisible) {
            // Check for terms and consent before showing content
            if (window.termsConsentManager && !window.termsConsentManager.checkStatus()) {
                console.log('[DataIn] Terms/consent not accepted, showing modal');
                window.termsConsentManager.show();
            }
            
            // Show: move container up
            dataContainer.classList.add('visible');
            document.body.style.overflow = 'hidden';
            setLocal('dataContainerState', 'visible');
            
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('datain-state-changed', { detail: { state: 'visible' } }));
            document.dispatchEvent(new CustomEvent('left-sidebar-open', { detail: { state: 'visible' } }));
            
            // Load stored content if available
            const storedUrl = getLocal('lastGridItemUrl');
            if (storedUrl) {
                loadStoredContent(storedUrl);
            }
        } else {
            // Hide: move container down
            dataContainer.classList.remove('visible');
            document.body.style.overflow = '';
            setLocal('dataContainerState', 'hidden');
            
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('datain-state-changed', { detail: { state: 'hidden' } }));
        }
    }

    // Update payment button display with usage information
    function updatePaymentButtonDisplay() {
        const paymentBtn = document.getElementById('datain-payment-btn');
        if (!paymentBtn) return;
        
        const paymentSpan = paymentBtn.querySelector('span');
        if (!paymentSpan) return;
        
        try {
            const rateLimitStatus = JSON.parse(localStorage.getItem('rateLimitStatus') || 'null');
            
            if (rateLimitStatus && rateLimitStatus.remaining && rateLimitStatus.limits) {
                const usesLeft = rateLimitStatus.remaining.perDay || 0;
                const usesTotal = rateLimitStatus.limits.perDay || 0;
                paymentSpan.textContent = `${usesLeft}|${usesTotal}`;
                console.log('[DataIn] Updated payment button display:', `${usesLeft}|${usesTotal}`);
            } else {
                // Fallback to $ for new users or when no rate limit data
                paymentSpan.textContent = '$';
            }
        } catch (error) {
            console.warn('[DataIn] Error updating payment button display:', error);
            // Fallback to $ on error
            paymentSpan.textContent = '$';
        }
    }

    // Make updatePaymentButtonDisplay globally accessible
    window.updatePaymentButtonDisplay = updatePaymentButtonDisplay;

    // Make inputFunctionality functions globally accessible
    window.initAutoExpandTextareas = initAutoExpandTextareas;
    window.createSplitTextarea = createSplitTextarea;
    window.createSplitCalendarText = createSplitCalendarText;
    window.deleteEntry = deleteEntry;
    window.handleConditionalInput = handleConditionalInput;
    window.addEntryButton = addEntryButton;
    window.addCalendarEntryButton = addCalendarEntryButton;

    // Setup utility buttons within the datain container
    function setupUtilityButtons() {
        const overwriteBtn = document.getElementById('datain-overwrite-btn');
        const copyBtn = document.getElementById('datain-copy-btn');
        const categoryBtn = document.getElementById('datain-category-btn');
        const paymentBtn = document.getElementById('datain-payment-btn');
        const faqBtn = document.getElementById('datain-faq-btn');
        const guidedNavBtn = document.getElementById('datain-guided-nav-btn');
        
        // Update payment button display with current usage info
        updatePaymentButtonDisplay();
        
        // Setup guided forms navigation button
        if (guidedNavBtn) {
            const prevIcon = document.getElementById('datain-guided-prev-icon');
            const nextIcon = document.getElementById('datain-guided-next-icon');
            
            // Add hover effects for the button
            guidedNavBtn.addEventListener('mouseenter', () => {
                guidedNavBtn.style.transform = 'translateY(-2px)';
            });
            guidedNavBtn.addEventListener('mouseleave', () => {
                guidedNavBtn.style.transform = '';
            });
            
            // Add mousemove event for icon hover effects
            guidedNavBtn.addEventListener('mousemove', (e) => {
                const rect = guidedNavBtn.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const buttonWidth = rect.width;
                const isLeftSide = mouseX < buttonWidth / 2;
                
                // Highlight the appropriate side
                if (isLeftSide) {
                    prevIcon.style.transform = 'scale(1.1)';
                    nextIcon.style.transform = 'scale(1)';
                } else {
                    prevIcon.style.transform = 'scale(1)';
                    nextIcon.style.transform = 'scale(1.1)';
                }
            });
            
            // Reset icon transforms when leaving the button
            guidedNavBtn.addEventListener('mouseleave', () => {
                prevIcon.style.transform = 'scale(1)';
                nextIcon.style.transform = 'scale(1)';
            });
            
            // Add click handler for bidirectional navigation
            guidedNavBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const rect = guidedNavBtn.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const buttonWidth = rect.width;
                const isLeftSide = clickX < buttonWidth / 2;
                
                if (isLeftSide && window.guidedFormsPrevious) {
                    // Left side clicked - go to previous step
                    const success = window.guidedFormsPrevious();
                    if (success) {
                        updateGuidedButtonStates();
                    }
                } else if (!isLeftSide && window.guidedFormsNext) {
                    // Right side clicked - go to next step
                    const success = window.guidedFormsNext();
                    if (success) {
                        updateGuidedButtonStates();
                    }
                }
            });
        }
        
        // Update button states initially
        updateGuidedButtonStates();
        
        if (overwriteBtn) {
            // Add hover effects
            overwriteBtn.addEventListener('mouseenter', () => {
                overwriteBtn.style.transform = 'translateY(-2px)';
            });
            overwriteBtn.addEventListener('mouseleave', () => {
                overwriteBtn.style.transform = '';
            });
            
            // Add click handler for data overwrite
            overwriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Call the same modal functionality as dataOverwrite.js
                if (window.openDataOverwriteModal) {
                    window.openDataOverwriteModal();
                } else {
                    // Fallback confirmation
                    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                        // Clear all localStorage data
                        const keysToRemove = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key) keysToRemove.push(key);
                        }
                        keysToRemove.forEach(key => localStorage.removeItem(key));
                        
                        alert('All data has been cleared successfully.');
                        location.reload();
                    }
                }
            });
        }
        
        if (copyBtn) {
            // Add hover effects
            copyBtn.addEventListener('mouseenter', () => {
                copyBtn.style.transform = 'translateY(-2px)';
            });
            copyBtn.addEventListener('mouseleave', () => {
                copyBtn.style.transform = '';
            });
            
            // Add click handler for copy functionality - open modal from copy.js
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Use the modal functionality from copy.js
                if (window.copyUtil && window.copyUtil.openShareModal) {
                    // Find a suitable container ID - use the data-content div
                    const dataContent = dataContainer.querySelector('.data-content');
                    if (dataContent) {
                        // Add a temporary ID if it doesn't have one
                        if (!dataContent.id) {
                            dataContent.id = 'datain-content-' + Date.now();
                        }
                        
                        // Open the share modal using the copy.js functionality
                        window.copyUtil.openShareModal(dataContent.id, null);
                    } else {
                        alert('No content available to copy.');
                    }
                } else {
                    console.error('copyUtil not available - falling back to simple copy');
                    // Fallback to simple copy if modal isn't available
                    const dataContent = dataContainer.querySelector('.data-content');
                    if (dataContent) {
                        const textContent = dataContent.innerText || dataContent.textContent;
                        if (textContent && textContent.trim()) {
                            navigator.clipboard.writeText(textContent).then(() => {
                                copyBtn.title = 'Copied!';
                                setTimeout(() => copyBtn.title = 'Copy to clipboard', 1000);
                            }).catch(err => {
                                console.error('Failed to copy text: ', err);
                                alert('Copy failed');
                            });
                        } else {
                            alert('No content available to copy.');
                        }
                    }
                }
            });
        }
        
        if (categoryBtn) {
            // Add hover effects
            categoryBtn.addEventListener('mouseenter', () => {
                categoryBtn.style.transform = 'translateY(-2px)';
            });
            categoryBtn.addEventListener('mouseleave', () => {
                categoryBtn.style.transform = '';
            });
            
            // Add click handler to load categories.html
            categoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if container is collapsed and expand it before loading content
                if (!isVisible) {
                    // Expand the container first
                    toggleDataContainer();
                    // Wait a moment for the expansion animation to complete, then load content
                    setTimeout(() => {
                        loadStoredContent('/ai/categories.html');
                    }, 100);
                } else {
                    // Container is already expanded, load content immediately
                    loadStoredContent('/ai/categories.html');
                }
            });
        }
        
        if (paymentBtn) {
            // Add hover effects
            paymentBtn.addEventListener('mouseenter', () => {
                paymentBtn.style.transform = 'translateY(-2px)';
            });
            paymentBtn.addEventListener('mouseleave', () => {
                paymentBtn.style.transform = '';
            });
            
            // Add click handler for payment modal
            paymentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Call the payment modal functionality
                if (window.openPaymentModal) {
                    window.openPaymentModal();
                } else {
                    console.error('Payment modal function not available');
                }
            });
        }
        
        if (faqBtn) {
            // Add hover effects
            faqBtn.addEventListener('mouseenter', () => {
                faqBtn.style.transform = 'translateY(-2px)';
            });
            faqBtn.addEventListener('mouseleave', () => {
                faqBtn.style.transform = '';
            });
            faqBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.openFaqModal) {
                    window.openFaqModal();
                }
            });
        }
    }

    // Update guided forms navigation button states
    function updateGuidedButtonStates() {
        const guidedNavBtn = document.getElementById('datain-guided-nav-btn');
        const prevIcon = document.getElementById('datain-guided-prev-icon');
        const nextIcon = document.getElementById('datain-guided-next-icon');
        
        if (guidedNavBtn && prevIcon && nextIcon) {
            const state = window.getGuidedFormsState ? window.getGuidedFormsState() : { isInitialized: false };
            
            if (state.isInitialized) {
                // Show button when guided forms is active
                guidedNavBtn.style.display = 'flex';
                
                // Update previous icon
                prevIcon.style.opacity = state.canGoPrevious ? '1' : '0.3';
                
                // Update next icon
                nextIcon.style.opacity = state.canGoNext ? '1' : '0.3';
                
                // Update button cursor and title
                const canNavigate = state.canGoPrevious || state.canGoNext;
                guidedNavBtn.style.cursor = canNavigate ? 'pointer' : 'not-allowed';
                guidedNavBtn.title = `Step Navigation (${state.currentStep + 1}/${state.totalSteps})`;
            } else {
                // Hide button when guided forms is not active
                guidedNavBtn.style.display = 'none';
            }
        }
    }
    
    async function initializeApp() {
        // Ensure lastGridItemUrl is set to categories.html if not present
        // Do this BEFORE initializing the container so the container can check for it
        let lastGridItemUrl = getLocal('lastGridItemUrl');
        if (!lastGridItemUrl) {
            if (typeof window.setLocal === 'function') {
                window.setLocal('lastGridItemUrl', '/ai/categories.html');
            } else {
                localStorage.setItem('lastGridItemUrl', '/ai/categories.html');
            }
        }

        initializeDataContainer();

        // REMOVED: Check if data-out is already expanded to adjust z-index appropriately
        // const dataOutContainer = document.querySelector('.data-container-out');
        // if (dataOutContainer && dataOutContainer.dataset.state === 'expanded') {
        //     dataContainer.style.zIndex = '12000';
        // }

        try {
            // Mobile device detection for debugging
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log(`Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
            console.log(`User agent: ${navigator.userAgent}`);
            if (isMobile) {
                console.log('Touch events should be fully supported on this device');
                console.log(`Touch points supported: ${navigator.maxTouchPoints}`);
                console.log(`Screen size: ${window.screen.width}x${window.screen.height}`);
            }
        } catch (error) {
            console.error('Error initializing left data container (datain.js):', error);
        }
    }

    initializeApp();

    // After content load, rebind grid item events using FormPersistence
    document.addEventListener('data-in-loaded', function() {
        // Try to get the current FormPersistence instance and rebind events
        if (window.calorieFormPersistence && typeof window.calorieFormPersistence.rebindGridItemEvents === 'function') {
            window.calorieFormPersistence.rebindGridItemEvents();
        }
        if (window.fitnessFormPersistence && typeof window.fitnessFormPersistence.rebindGridItemEvents === 'function') {
            window.fitnessFormPersistence.rebindGridItemEvents();
        }
        if (window.quizFormPersistence && typeof window.quizFormPersistence.rebindGridItemEvents === 'function') {
            window.quizFormPersistence.rebindGridItemEvents();
        }
        if (window.decisionFormPersistence && typeof window.decisionFormPersistence.rebindGridItemEvents === 'function') {
            window.decisionFormPersistence.rebindGridItemEvents();
        }
        if (window.enneagramFormPersistence && typeof window.enneagramFormPersistence.rebindGridItemEvents === 'function') {
            window.enneagramFormPersistence.rebindGridItemEvents();
        }
        if (window.eventFormPersistence && typeof window.eventFormPersistence.rebindGridItemEvents === 'function') {
            window.eventFormPersistence.rebindGridItemEvents();
        }
        if (window.philosophyFormPersistence && typeof window.philosophyFormPersistence.rebindGridItemEvents === 'function') {
            window.philosophyFormPersistence.rebindGridItemEvents();
        }
        if (window.researchFormPersistence && typeof window.researchFormPersistence.rebindGridItemEvents === 'function') {
            window.researchFormPersistence.rebindGridItemEvents();
        }
        if (window.socialFormPersistence && typeof window.socialFormPersistence.rebindGridItemEvents === 'function') {
            window.socialFormPersistence.rebindGridItemEvents();
        }
        if (window.categoriesFormPersistence && typeof window.categoriesFormPersistence.rebindGridItemEvents === 'function') {
            window.categoriesFormPersistence.rebindGridItemEvents();
        }
        
        // Update guided forms button states after content loads
        setTimeout(() => {
            updateGuidedButtonStates();
            
            // Set up periodic button state updates for guided forms
            if (window.guidedFormsButtonUpdateInterval) {
                clearInterval(window.guidedFormsButtonUpdateInterval);
            }
            
            window.guidedFormsButtonUpdateInterval = setInterval(() => {
                updateGuidedButtonStates();
            }, 500); // Update every 500ms when guided forms are active
            
            // Re-enhance generate buttons after content loads
            enhanceGenerateButtons();
            console.log('[DataIn] Re-enhanced generate buttons after content load');
        }, 200);
    });
    
    // Also update button states when guided forms state changes
    document.addEventListener('guided-forms-step-changed', function() {
        setTimeout(() => {
            updateGuidedButtonStates();
        }, 50);
    });
});

// ====================
// Generative Wait System - Universal Loading Enhancement
// ====================

/**
 * Universal loading enhancement function that replaces static "Loading..." 
 * with engaging educational content while AI processes requests.
 * 
 * @param {string} buttonId - ID of the button to update
 * @param {string} moduleName - Name of the module (calorie, fitness, emotion, etc.)
 * @param {Function} apiCall - The main API call function to execute
 * @returns {Promise} Result of the main API call
 */
window.enhancedLoading = async function(buttonId, moduleName, apiCall) {
    const btn = document.getElementById(buttonId);
    if (!btn) {
        console.warn(`Button with ID '${buttonId}' not found`);
        return await apiCall();
    }
    
    const originalText = btn.innerText;
    const originalDisabled = btn.disabled;
    let overlayControl = null;
    let apiDone = false;
    let overlayReady = false;
    let closeOverlayIfReady = () => {
        if (overlayControl && overlayControl.close) {
            overlayControl.close();
        }
    };
    
    try {
        // Phase 1: Disable button and show loading state
        btn.disabled = true;
        btn.innerText = '🧠 Analyzing...';
        
        // Start the main API call immediately (before showing overlay)
        const apiPromise = (async () => {
            const result = await apiCall();
            apiDone = true;
            if (overlayReady) closeOverlayIfReady();
            return result;
        })();
        
        // Show educational modal overlay while API processes (await since it's now async)
        if (window.showEducationalLoadingOverlay) {
            overlayControl = await window.showEducationalLoadingOverlay(moduleName);
            overlayReady = true;
            if (apiDone) closeOverlayIfReady();
        }
        
        // Wait for API to complete
        const result = await apiPromise;
        
        // Show success state
        btn.innerText = '✅ Success! Opening your results...';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = originalDisabled;
        }, 1500);
        
        return result;
        
    } catch (error) {
        // Close modal on error using the proper control object
        if (overlayControl && overlayControl.close) {
            overlayControl.close();
        }
        
        // Error state
        btn.innerText = '❌ Error occurred. Please try again.';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = originalDisabled;
        }, 3000);
        throw error;
    }
};

// ====================
// Container Sizing Management
// ====================

/**
 * Container sizing configuration
 */
const containerSizingConfig = {
    minContainerHeight: 300,
    maxContainerHeight: '80vh',
    sizingPadding: 100,
    transitionDuration: 300,
    dynamicSizing: true
};

/**
 * Calculate the height needed for a specific step/content
 */
function calculateStepHeight(stepElement) {
    if (!stepElement) {
        return containerSizingConfig.minContainerHeight;
    }

    // Temporarily show the step to measure it
    const originalDisplay = stepElement.style.display;
    const originalOpacity = stepElement.style.opacity;
    const originalTransform = stepElement.style.transform;
    const originalPosition = stepElement.style.position;
    
    // Make element visible but transparent for measurement
    stepElement.style.display = 'flex';
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'none';
    stepElement.style.position = 'static';
    stepElement.style.visibility = 'hidden'; // Hidden but still takes up space
    
    // Force a reflow to ensure accurate measurements
    stepElement.offsetHeight;
    
    // Get the actual height including margins
    const rect = stepElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(stepElement);
    const marginTop = parseFloat(computedStyle.marginTop) || 0;
    const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
    
    const stepHeight = rect.height + marginTop + marginBottom;
    
    // Restore original styles
    stepElement.style.display = originalDisplay;
    stepElement.style.opacity = originalOpacity;
    stepElement.style.transform = originalTransform;
    stepElement.style.position = originalPosition;
    stepElement.style.visibility = '';
    
    // Handle edge cases
    const finalHeight = Math.max(stepHeight, 50); // Minimum 50px for very small steps
    
    return finalHeight;
}

/**
 * Calculate optimal container height based on content
 */
function calculateOptimalContainerHeight(contentHeight) {
    if (!contentHeight || contentHeight <= 0) {
        return containerSizingConfig.minContainerHeight;
    }

    // Add padding for progress indicator, close button, and general spacing
    const totalHeight = contentHeight + containerSizingConfig.sizingPadding;
    
    // Respect minimum height
    const minHeight = containerSizingConfig.minContainerHeight;
    
    // Calculate preferred maximum height
    let preferredMaxHeight;
    if (typeof containerSizingConfig.maxContainerHeight === 'string' && containerSizingConfig.maxContainerHeight.endsWith('vh')) {
        const vhValue = parseFloat(containerSizingConfig.maxContainerHeight);
        preferredMaxHeight = (window.innerHeight * vhValue) / 100;
    } else {
        preferredMaxHeight = parseInt(containerSizingConfig.maxContainerHeight) || window.innerHeight * 0.8;
    }
    
    // Mobile-specific adjustments for preferred max height
    if (window.innerWidth <= 480) {
        preferredMaxHeight = Math.min(preferredMaxHeight, window.innerHeight * 0.9);
    }
    
    // Allow content-driven expansion beyond preferred max when needed
    // Use a reasonable absolute maximum to prevent excessive heights
    const absoluteMaxHeight = window.innerHeight * 0.95; // Never exceed 95% of viewport
    
    // If content needs more space than preferred max, allow it up to absolute max
    let effectiveMaxHeight;
    if (totalHeight > preferredMaxHeight && totalHeight <= absoluteMaxHeight) {
        effectiveMaxHeight = totalHeight; // Allow content to dictate height
    } else if (totalHeight > absoluteMaxHeight) {
        effectiveMaxHeight = absoluteMaxHeight; // Cap at absolute maximum
    } else {
        effectiveMaxHeight = preferredMaxHeight; // Use preferred max
    }
    
    // Constrain to min/max bounds
    const finalHeight = Math.max(minHeight, Math.min(totalHeight, effectiveMaxHeight));
    
    return finalHeight;
}

/**
 * Adjust container size to fit content
 */
function adjustContainerSize(contentElement) {
    if (!containerSizingConfig.dynamicSizing) {
        return;
    }

    const dataContainer = document.querySelector('.data-container-in');
    if (!dataContainer) {
        return;
    }

    // Only apply dynamic sizing if the container is actually expanded
    if (!dataContainer.classList.contains('visible')) {
        return;
    }

    // Small delay to ensure content is fully rendered
    setTimeout(() => {
        try {
            // Double-check the container is still expanded (user might have collapsed it)
            if (!dataContainer || !dataContainer.classList.contains('visible')) {
                return;
            }

            // Calculate the content height needed
            const contentHeight = contentElement ? calculateStepHeight(contentElement) : 0;
            const containerHeight = calculateOptimalContainerHeight(contentHeight);
            
            // Apply the new height with smooth transition
            dataContainer.style.transition = `height ${containerSizingConfig.transitionDuration}ms ease-in-out`;
            dataContainer.style.height = `${containerHeight}px`;
            
            // Dispatch resize event for any listeners
            window.dispatchEvent(new Event('resize'));
            
            console.log(`[DataIn] Container resized to ${containerHeight}px for content`);
            
        } catch (error) {
            console.error('[DataIn] Error adjusting container size:', error);
        }
    }, 100);
}

/**
 * Global API for container sizing - accessible to other utilities
 */
window.dataInContainerManager = {
    calculateStepHeight,
    calculateOptimalContainerHeight,
    adjustContainerSize,
    config: containerSizingConfig
};

// Remove local rate limit display logic; use centralized logic from rateLimiter.js
// On page load, show localStorage value first, then update from backend using centralized handler
// (Assume dataContainer is available after initializeDataContainer)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const dataContainer = document.querySelector('.data-container-in');
        if (dataContainer) {
            // Update payment button display directly from localStorage
            updatePaymentButtonDisplay();
        }
    }, 500);
    
    // Initialize validation enhancements
    console.log('[DataIn] Initializing validation enhancements');
    enhanceEventListeners();
    
    // Add a slight delay to ensure all modules are loaded before enhancing buttons
    setTimeout(() => {
        enhanceGenerateButtons();
        console.log('[DataIn] Validation enhancements complete');
    }, 1000);
});    // Show simulated hover hint on categories button for new users
    function showCategoriesButtonHint() {
        const categoryBtn = document.getElementById('datain-category-btn');
        if (!categoryBtn) return;
        
        let hintStopped = false;
        let hintInterval;
        
        const doHoverEffect = () => {
            if (hintStopped) return;
            
            // Simulate hover: move up
            categoryBtn.style.transform = 'translateY(-2px)';
            
            setTimeout(() => {
                if (hintStopped) return;
                // Simulate hover leave: move back down
                categoryBtn.style.transform = '';
            }, 250); // Hold "hover" for 250ms (faster)
        };
        
        const stopHint = () => {
            if (!hintStopped) {
                hintStopped = true;
                categoryBtn.style.transform = '';
                if (hintInterval) {
                    clearInterval(hintInterval);
                }
            }
        };
        
        // Start the hint cycle - repeat every 1 second (faster)
        doHoverEffect(); // Do it once immediately
        hintInterval = setInterval(doHoverEffect, 1000);
        
        // Stop hint when user clicks or after 10 seconds
        categoryBtn.addEventListener('click', stopHint, { once: true });
        setTimeout(stopHint, 10000); // Stop after 10 seconds
    }