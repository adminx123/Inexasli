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
import { initAutoExpandTextareas, createSplitTextarea, createSplitCalendarText, deleteEntry, handleConditionalInput, addEntryButton, cleanupHiddenFieldData } from '/ai/styles/inputFunctionality.js';
import '/utility/enhancedUI.js';
import '/utility/copy.js';
import '/utility/dataOverwrite.js';
import '/ai/faq.js'; // Add FAQ modal script

// Import additional utility functions for centralized exposure
import { getJSON } from '/utility/getJSON.js';
import { setJSON } from '/utility/setJSON.js';
import { getCookie } from '/utility/getcookie.js';
import { setCookie } from '/utility/setcookie.js';
import { MixedScanner, initializeMixedScanner } from '/utility/mixedScanner.js';

// ====================
// DataIn.js - Centralized Animation & Container Management
// ====================
/**
 * ANIMATION SYSTEM REFACTOR - ALL ANIMATIONS NOW CENTRALIZED
 * 
 * Issues Fixed:
 * 1. ✅ Categories button (bx-grid-alt) animation now only triggers when container is collapsed
 * 2. ✅ Right arrow animation properly filters out categories.html using lastGridItemUrl
 * 3. ✅ Missing setLocal('lastGridItemUrl') added to loadStoredContent()
 * 4. ✅ Swipe hint animations coordinated with centralized controller
 * 
 * New DataInAnimationController Features:
 * - startCategoriesButtonHint(): Only when collapsed, auto-stops when expanded
 * - startRightArrowAnimation(): Centralized right arrow animation with overlap prevention
 * - stopAllAnimations(): Emergency stop for all animations
 * - onContentLoaded(): Stops conflicting animations when new content loads
 * - onContainerStateChange(): Manages animations based on container expand/collapse
 * 
 * State Management:
 * - isAnimatingRightArrow: Prevents right arrow animation overlaps
 * - isAnimatingCategoriesButton: Prevents categories button animation overlaps  
 * - categoriesButtonHintInterval: Tracks categories button interval for cleanup
 * 
 * Integration Points:
 * - toggleDataContainer(): Calls onContainerStateChange()
 * - loadStoredContent(): Sets lastGridItemUrl for proper filtering
 * - data-in-loaded event: Calls onContentLoaded()
 * - Legacy wrapper functions maintained for compatibility
 */

// Import validation utilities
import { 
    validateModuleData, 
    ValidationError, 
    displayValidationErrors 
} from '/utility/inputValidation.js';

// Import rate limiting utilities centrally
import { getFingerprintForWorker, incrementRequestCount, isRateLimited, canSendRequest, handleRateLimitResponse, createWorkerPayload } from '/ai/rate-limiter/rateLimiter.js';

// Import image upload utility
import '/utility/piexif.js';
import '/utility/imageUpload.js';

// Import makeChanges utility for response invalidation monitoring
import '/utility/makeChanges.js';

// Expose all utility functions to window for centralized access by input modules
window.utilityFunctions = {
    getLocal,
    setLocal,
    getJSON,
    setJSON,
    getCookie,
    setCookie,
    FormPersistence,
    validateModuleData,
    ValidationError,
    displayValidationErrors,
    initializeBidirectionalSwipe,
    initializeSimpleVerticalSwipe,
    initAutoExpandTextareas,
    createSplitTextarea,
    createSplitCalendarText,
    deleteEntry,
    handleConditionalInput,
    cleanupHiddenFieldData,
    addEntryButton,
    getFingerprintForWorker,
    incrementRequestCount,
    isRateLimited,
    handleRateLimitResponse,
    createWorkerPayload,
    MixedScanner,
    initializeMixedScanner
};

// Also expose individual functions directly to window for easier access
window.getLocal = getLocal;
window.setLocal = setLocal;

// Expose loading state for other modules to check
Object.defineProperty(window, 'isLoadingContent', {
    get() { return isLoadingContent; },
    enumerable: true
});

// Track animation state to prevent overlaps
let isAnimatingRightArrow = false;
let isAnimatingCategoriesButton = false;
let categoriesButtonHintInterval = null;

// Track loading state to prevent race conditions
let isLoadingContent = false;
let currentLoadController = null;
let lastNavigationTime = 0;

/**
 * Centralized Animation Controller for DataIn
 */
const DataInAnimationController = {
    // Stop all running animations
    stopAllAnimations() {
        isAnimatingRightArrow = false;
        isAnimatingCategoriesButton = false;
        
        if (categoriesButtonHintInterval) {
            clearInterval(categoriesButtonHintInterval);
            categoriesButtonHintInterval = null;
        }
        
        // Reset any transforms on animated elements
        const categoryBtn = document.getElementById('datain-category-btn');
        if (categoryBtn) {
            categoryBtn.style.transform = '';
        }
    },
    
    // Start categories button hint (only when collapsed)
    startCategoriesButtonHint() {
        const categoryBtn = document.getElementById('datain-category-btn');
        if (!categoryBtn || isAnimatingCategoriesButton) return;
        
        // Only animate when container is collapsed
        const dataContainer = document.querySelector('.data-container-in');
        if (dataContainer && dataContainer.classList.contains('visible')) {
            console.log('[DataIn] Skipping categories animation - container is expanded');
            return;
        }
        
        isAnimatingCategoriesButton = true;
        let hintStopped = false;
        
        const doHoverEffect = () => {
            if (hintStopped || !isAnimatingCategoriesButton) return;
            
            // Double-check container is still collapsed
            if (dataContainer && dataContainer.classList.contains('visible')) {
                this.stopCategoriesButtonHint();
                return;
            }
            
            // Simulate hover: move up
            categoryBtn.style.transform = 'translateY(-2px)';
            
            setTimeout(() => {
                if (hintStopped || !isAnimatingCategoriesButton) return;
                // Simulate hover leave: move back down
                categoryBtn.style.transform = '';
            }, 250);
        };
        
        const stopHint = () => {
            if (!hintStopped) {
                hintStopped = true;
                isAnimatingCategoriesButton = false;
                categoryBtn.style.transform = '';
                if (categoriesButtonHintInterval) {
                    clearInterval(categoriesButtonHintInterval);
                    categoriesButtonHintInterval = null;
                }
            }
        };
        
        // Start the hint cycle
        doHoverEffect();
        categoriesButtonHintInterval = setInterval(doHoverEffect, 1000);
        
        // Stop hint when user clicks or after 10 seconds
        categoryBtn.addEventListener('click', stopHint, { once: true });
        setTimeout(stopHint, 10000);
    },
    
    // Stop categories button hint
    stopCategoriesButtonHint() {
        isAnimatingCategoriesButton = false;
        const categoryBtn = document.getElementById('datain-category-btn');
        if (categoryBtn) {
            categoryBtn.style.transform = '';
        }
        if (categoriesButtonHintInterval) {
            clearInterval(categoriesButtonHintInterval);
            categoriesButtonHintInterval = null;
        }
    },
    
    // Start right arrow animation
    startRightArrowAnimation(rightArrow) {
        if (isAnimatingRightArrow || !rightArrow) return;
        
        isAnimatingRightArrow = true;
        let animationCount = 0;
        const maxAnimations = 40; // 10 seconds at 250ms intervals
        
        const animate = () => {
            if (!isAnimatingRightArrow || animationCount >= maxAnimations) {
                isAnimatingRightArrow = false;
                if (rightArrow) {
                    rightArrow.style.transform = 'scale(1) translateY(0px)';
                }
                return;
            }
            
            rightArrow.style.transform = 'scale(1.1) translateY(-2px)';
            
            setTimeout(() => {
                if (isAnimatingRightArrow && rightArrow) {
                    rightArrow.style.transform = 'scale(1) translateY(0px)';
                }
            }, 125);
            
            animationCount++;
            if (isAnimatingRightArrow) {
                setTimeout(animate, 250);
            }
        };
        
        animate();
    },
    
    // Coordinate with swipe functionality - called when content loads
    onContentLoaded() {
        // Stop categories hint when new content loads
        this.stopCategoriesButtonHint();
    },
    
    // Coordinate with container state changes
    onContainerStateChange(isVisible) {
        if (isVisible) {
            // Container expanded - stop categories hint
            this.stopCategoriesButtonHint();
        } else {
            // Container collapsed - potentially start categories hint for new users
            const hasAcceptedTerms = window.termsConsentManager && window.termsConsentManager.checkStatus();
            if (!hasAcceptedTerms) {
                setTimeout(() => {
                    this.startCategoriesButtonHint();
                }, 500);
            }
        }
    }
};

// Make animation controller globally accessible
window.DataInAnimationController = DataInAnimationController;

/**
 * Start right arrow hint animation
 * Legacy wrapper function for backward compatibility
 */
function startRightArrowAnimation(rightArrow) {
    DataInAnimationController.startRightArrowAnimation(rightArrow);
}
window.getJSON = getJSON;
window.setJSON = setJSON;
window.getCookie = getCookie;
window.setCookie = setCookie;
window.FormPersistence = FormPersistence;
window.cleanupHiddenFieldData = cleanupHiddenFieldData;
window.MixedScanner = MixedScanner;
window.initializeMixedScanner = initializeMixedScanner;

// Load HTML5-QRCode library dynamically for scanner functionality
function loadHtml5QrCodeLibrary() {
    return new Promise((resolve, reject) => {
        // Check if library is already loaded
        if (typeof window.Html5QrcodeScanner !== 'undefined') {
            console.log('[DataIn] HTML5-QRCode library already loaded');
            resolve();
            return;
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="html5-qrcode"]')) {
            console.log('[DataIn] HTML5-QRCode library script already exists, waiting...');
            // Wait for it to load
            const checkInterval = setInterval(() => {
                if (typeof window.Html5QrcodeScanner !== 'undefined') {
                    clearInterval(checkInterval);
                    console.log('[DataIn] HTML5-QRCode library loaded successfully');
                    resolve();
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('HTML5-QRCode library failed to load within timeout'));
            }, 10000);
            return;
        }

        console.log('[DataIn] Loading HTML5-QRCode library from CDN...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
        script.async = true;
        
        script.onload = () => {
            console.log('[DataIn] HTML5-QRCode library loaded successfully from CDN');
            resolve();
        };
        
        script.onerror = (error) => {
            console.error('[DataIn] Failed to load HTML5-QRCode library:', error);
            reject(new Error('Failed to load HTML5-QRCode library from CDN'));
        };
        
        document.head.appendChild(script);
    });
}

// Enhanced initializeMixedScanner that ensures HTML5-QRCode is loaded first
window.initializeMixedScannerWithLibrary = async function(containerId, options = {}) {
    try {
        console.log('[DataIn] Initializing Mixed Scanner with library loading...');
        await loadHtml5QrCodeLibrary();
        return initializeMixedScanner(containerId, options);
    } catch (error) {
        console.error('[DataIn] Failed to initialize Mixed Scanner:', error);
        throw error;
    }
};

// Load the library immediately when datain.js loads
loadHtml5QrCodeLibrary().catch(error => {
    console.warn('[DataIn] Failed to preload HTML5-QRCode library:', error);
});

// Image upload functions are exposed globally by imageUpload.js
// But let's ensure they're available after import
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DataIn] Image upload utility status:');
    console.log('[DataIn] getImageUploadImages:', typeof window.getImageUploadImages);
    console.log('[DataIn] clearImageUpload:', typeof window.clearImageUpload);
    console.log('[DataIn] initializeImageUpload:', typeof window.initializeImageUpload);
});

console.log('[DataIn] Utility functions exposed to window object');

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

// Note: Legacy handler functions have been removed and replaced with centralized animation controller

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
            singleSelection: ['calorie-activity', 'calorie-sex', 'calorie-goal'],
            multiSelection: ['calorie-recommendations', 'calorie-diet-type']
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
    } else if (url.includes('/shop/')) {
        moduleType = 'shop';
    } else if (url.includes('/enneagram/')) {
        moduleType = 'enneagram';
    } else if (url.includes('/event/')) {
        moduleType = 'event';
    } else if (url.includes('/philosophy/')) {
        moduleType = 'philosophy';
    } else if (url.includes('/quiz/')) {
        moduleType = 'quiz'; // UNDO: revert to original key for quiz module
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
            singleSelection: ['period-cycle-regularity-container', 'period-flow-intensity-container'],
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
        
        // Make rate limiting utilities available globally for all modules
        window.rateLimiter = {
            getFingerprintForWorker,
            incrementRequestCount,
            isRateLimited,
            canSendRequest,
            handleRateLimitResponse,
            createWorkerPayload
        };
        
        console.log('[DataIn] FormPersistence instance initialized for module:', moduleType);
        
        // Centralized cleanup of hidden field data for all modules
        if (cleanupHiddenFieldData && moduleType !== 'categories') {
            setTimeout(() => cleanupHiddenFieldData(moduleType), 100);
        }
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
        '/ai/shop/shopiq.html',
        '/ai/enneagram/enneagramiq.html',
        '/ai/event/eventiq.html',
        '/ai/fashion/fashioniq.html',
        '/ai/fitness/fitnessiq.html',
        '/ai/period/periodiq.html',
        '/ai/philosophy/philosophyiq.html',
        '/ai/quiz/quiziq.html',
        '/ai/categories.html',
        '/ai/income/incomeiq.html'
    ];
    
    // Define files that should use incomestyles.css
    const incomeFiles = ['/ai/income/incomeiq.html'];
    
    // Function to check if current page needs specific CSS
    function shouldLoadInputStyles() {
        const currentPath = window.location.pathname;
        return inputFiles.some(file => currentPath.includes(file.replace('.html', ''))) || 
               document.querySelector('[data-value*="/ai/calorie/"], [data-value*="/ai/decision/"], [data-value*="/ai/enneagram/"], [data-value*="/ai/event/"], [data-value*="/ai/fashion/"], [data-value*="/ai/fitness/"], [data-value*="/ai/philosophy/"], [data-value*="/ai/quiz/"], [data-value*="/ai/income/"], [data-value*="/ai/categories.html"]');
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
        console.log('[DataIn] Loading content for URL:', url);
        
        // Prevent race conditions by checking if content is already loading
        if (isLoadingContent) {
            console.log('[DataIn] Content already loading, cancelling previous request');
            if (currentLoadController) {
                currentLoadController.abort();
            }
        }
        
        // Set loading state and create new abort controller
        isLoadingContent = true;
        currentLoadController = new AbortController();
        
        try {
            // Update lastGridItemUrl for proper animation filtering
            setLocal('lastGridItemUrl', url);
            
            // Load appropriate CSS based on the URL being loaded
            loadCSSForUrl(url);
            
            // Simply update content area - no DOM restructuring
            const dataContent = dataContainer.querySelector('.data-content');
            dataContent.innerHTML = '';

            const response = await fetch(url, { 
                signal: currentLoadController.signal 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();
            
            // Check if this request was cancelled
            if (currentLoadController.signal.aborted) {
                console.log('[DataIn] Request was cancelled, not updating content');
                return;
            }
            
            // Check if content contains form elements that need guided forms
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const hasFormElements = tempDiv.querySelector('.row1, .grid-container, .device-container');
            
            if (hasFormElements) {
                console.log('[DataIn] Form content detected, preparing guided forms initialization');
                
                // Update content directly without opacity transitions
                dataContent.innerHTML = content;
                
                // Hide content immediately to prevent flash while guided forms processes
                dataContent.style.opacity = '0';
                dataContent.style.transition = 'none'; // No transition on hide
                
                // Restore visibility with smooth transition after 200ms
                setTimeout(() => {
                    dataContent.style.transition = 'opacity 0.3s ease-in-out';
                    dataContent.style.opacity = '1';
                }, 200);
                
                // Initialize auto-expand textareas immediately after content is loaded
                console.log('[DataIn] Initializing auto-expand textareas immediately after content load');
                initAutoExpandTextareas();
                
                // Function to show content after guided forms is ready
                const showContentAfterGuidedForms = () => {
                    // Initialize FormPersistence for this module
                    initializeFormPersistence(url);
                    
                    // Re-initialize auto-expand after form persistence (in case it repopulates textareas)
                    setTimeout(() => {
                        console.log('[DataIn] Re-initializing auto-expand after form persistence');
                        initAutoExpandTextareas();
                    }, 100);
                    
                    console.log('[DataIn] Content revealed after guided forms initialization');

                    // Initialize swipe functionality for guided forms ONLY if form elements are present AND it's not the categories page
                    const isCategoriesPage = url.includes('/ai/categories.html');
                    if (window.guidedForms && typeof window.guidedForms.showStep === 'function' && hasFormElements && !isCategoriesPage) {
                        console.log('[DataIn] Initializing bidirectional swipe for guided forms on .data-content (form elements detected, not categories page)');
                        
                        // Initialize both left and right swipe handlers with a single call
                        initializeBidirectionalSwipe(dataContent, {
                            right: () => {
                                // Add debouncing for swipe navigation
                                const currentTime = Date.now();
                                if (currentTime - lastNavigationTime < 300 || isLoadingContent) {
                                    console.log('[DataIn] Swipe navigation debounced or blocked');
                                    return;
                                }
                                lastNavigationTime = currentTime;
                                
                                if (window.guidedForms && window.guidedForms.currentStep > 0) {
                                    console.log('[DataIn] Swipe Right detected, going to previous step.');
                                    window.guidedForms.showStep(window.guidedForms.currentStep - 1);
                                }
                            },
                            left: () => {
                                // Add debouncing for swipe navigation
                                const currentTime = Date.now();
                                if (currentTime - lastNavigationTime < 300 || isLoadingContent) {
                                    console.log('[DataIn] Swipe navigation debounced or blocked');
                                    return;
                                }
                                lastNavigationTime = currentTime;
                                
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
                
                // Initialize auto-expand textareas for non-form content too
                console.log('[DataIn] Initializing auto-expand textareas for non-form content');
                initAutoExpandTextareas();
                
                // Initialize FormPersistence for this module
                initializeFormPersistence(url);
                
                // Re-initialize auto-expand after form persistence
                setTimeout(() => {
                    console.log('[DataIn] Re-initializing auto-expand after form persistence (non-form content)');
                    initAutoExpandTextareas();
                }, 100);
            }

            // Dispatch custom event to notify that data-in content has loaded
            const moduleType = url.includes('/fashion/') ? 'fashion' :
                              url.includes('/calorie/') ? 'calorie' :
                              url.includes('/decision/') ? 'decision' :
                              url.includes('/enneagram/') ? 'enneagram' :
                              url.includes('/event/') ? 'event' :
                              url.includes('/philosophy/') ? 'philosophy' :
                              url.includes('/quiz/') ? 'quiz' :
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
            // Only log error if request wasn't cancelled
            if (!currentLoadController?.signal?.aborted) {
                console.error('Error loading content:', error);
                const dataContent = dataContainer.querySelector('.data-content');
                if (dataContent) {
                    dataContent.innerHTML = 'Error loading content. Please try again.';
                }
            }
        } finally {
            // Reset loading state
            isLoadingContent = false;
            currentLoadController = null;
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
                left: 50%;
                width: 100%;
                max-width: 480px;
                transform: translate(-50%, calc(100% - 38.5px));
                height: 90vh;
                background-color: rgba(255, 255, 255, 0.97);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(49, 49, 49, 0.92);
                border-bottom: none;
                border-radius: 24px 24px 0 0;
                /* Strong shadow at the bottom, fading upward */
                box-shadow:
                  0 -2px 24px 8px rgba(49,49,49,0.38), /* darkest, tightest at edge */
                  0 -12px 48px 16px rgba(49,49,49,0.22), /* mid fade */
                  0 -32px 96px 32px rgba(49,49,49,0.10); /* far fade */
                z-index: 1000;
                font-family: "Inter", sans-serif;
                display: flex;
                flex-direction: column;
                transition: transform 0.3s ease-in-out;
                overflow: hidden;
            }

            /* Visible state - move container up */
            .data-container-in.visible {
                transform: translate(-50%, 0);
            }

            /* Utility buttons - always visible at top */
            .data-container-in .utility-buttons-container {
                display: flex;
                flex-direction: row;
                gap: 6px;
                align-items: center;
                justify-content: space-evenly;
                width: 100%;
                max-width: 480px; /* Match device-container width (not content) */
                min-height: 36px;
                padding: 0 2px; /* Minimal edge padding */
                margin: 0 auto; /* Center within container */
                box-sizing: border-box;
                overflow: hidden;
                flex-wrap: nowrap;
                background-color: transparent;
                border-radius: 24px 24px 0 0;
                flex-shrink: 0;
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
                <div class="utility-buttons-container" id="utility-buttons-top">
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
            <div class="utility-buttons-container" id="utility-buttons-bottom" style="display:none;"></div>
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

        // Listen for API responses to auto-collapse the input container
        document.addEventListener('api-response-received', function(e) {
            console.log('[DataIn] API response received, checking if container should collapse:', e.detail);
            // Only collapse if the container is currently visible
            if (isVisible && dataContainer) {
                console.log('[DataIn] Collapsing input container to show response');
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
            const isClickInsideAnotherModal = e.target.closest('#faq-modal-backdrop, .data-overwrite-modal, .payment-modal, .share-modal-backdrop, .modal');
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
            // Show hint animation on categories button for new users (only when collapsed)
            DataInAnimationController.startCategoriesButtonHint();
        }
    }



    // Pure transform toggle function - accessible to utility buttons
    function toggleDataContainer() {
        if (!dataContainer) return;

        // Check for terms and consent before any action
        if (window.termsConsentManager && !window.termsConsentManager.checkStatus()) {
            console.log('[DataIn] Terms/consent not accepted, showing modal instead of toggling');
            window.termsConsentManager.show();
            return; // Don't toggle container, just show terms modal
        }

        isVisible = !isVisible;
        
        const topContainer = dataContainer.querySelector('#utility-buttons-top');
        const bottomContainer = dataContainer.querySelector('#utility-buttons-bottom');
        const buttons = Array.from(topContainer.children);
        if (isVisible) {
            // Move buttons to bottom
            buttons.forEach(btn => bottomContainer.appendChild(btn));
            bottomContainer.style.display = 'flex';
            topContainer.style.display = 'none';
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
            // Move buttons back to top
            Array.from(bottomContainer.children).forEach(btn => topContainer.appendChild(btn));
            topContainer.style.display = 'flex';
            bottomContainer.style.display = 'none';
            // Hide: move container down
            dataContainer.classList.remove('visible');
            document.body.style.overflow = '';
            setLocal('dataContainerState', 'hidden');
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('datain-state-changed', { detail: { state: 'hidden' } }));
        }
        
        // Notify animation controller of state change
        DataInAnimationController.onContainerStateChange(isVisible);
    }

    // Central function to check terms consent before utility actions
    function checkTermsConsentBeforeAction(action, actionName = 'action') {
        if (window.termsConsentManager && !window.termsConsentManager.checkStatus()) {
            console.log(`[DataIn] Terms/consent not accepted, showing modal instead of ${actionName}`);
            window.termsConsentManager.show();
            return false; // Block the action
        }
        return true; // Allow the action
    }

    // Update payment button display with usage information
    function updatePaymentButtonDisplay() {
        const paymentBtn = document.getElementById('datain-payment-btn');
        if (!paymentBtn) return;
        
        const paymentSpan = paymentBtn.querySelector('span');
        if (!paymentSpan) return;
        
        try {
            let rateLimitStatus = JSON.parse(localStorage.getItem('rateLimitStatus') || 'null');
            
            if (rateLimitStatus && rateLimitStatus.remaining && rateLimitStatus.limits && rateLimitStatus.lastUpdated) {
                // Check if 12:00 UTC has passed since lastUpdated and reset if needed
                const now = new Date();
                const lastUpdated = new Date(rateLimitStatus.lastUpdated);
                
                // Calculate next 12:00 UTC after lastUpdated
                let nextReset = new Date(Date.UTC(lastUpdated.getUTCFullYear(), lastUpdated.getUTCMonth(), lastUpdated.getUTCDate(), 12, 0, 0));
                
                // If lastUpdated was already past 12:00 UTC on that day, reset is next day
                if (lastUpdated.getUTCHours() >= 12) {
                    nextReset = new Date(nextReset.getTime() + 24 * 60 * 60 * 1000);
                }
                
                // If current time is past the next reset time, reset the usage
                if (now.getTime() > nextReset.getTime()) {
                    rateLimitStatus.remaining.perDay = rateLimitStatus.limits.perDay;
                    rateLimitStatus.lastUpdated = now.getTime();
                    localStorage.setItem('rateLimitStatus', JSON.stringify(rateLimitStatus));
                    console.log('[DataIn] Rate limit reset applied - 12:00 UTC passed');
                }
                
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
                
                // Debounce rapid clicks (prevent navigation faster than 300ms)
                const currentTime = Date.now();
                if (currentTime - lastNavigationTime < 300) {
                    console.log('[DataIn] Navigation debounced - too fast');
                    return;
                }
                lastNavigationTime = currentTime;
                
                // Prevent navigation during content loading
                if (isLoadingContent) {
                    console.log('[DataIn] Navigation blocked - content loading');
                    return;
                }
                
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
                
                // Check terms consent before proceeding
                if (!checkTermsConsentBeforeAction(() => {}, 'data overwrite')) {
                    return;
                }
                
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
                
                // Check terms consent before proceeding
                if (!checkTermsConsentBeforeAction(() => {}, 'copy functionality')) {
                    return;
                }
                
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
                
                // Check terms consent before proceeding
                if (!checkTermsConsentBeforeAction(() => {}, 'categories access')) {
                    return;
                }
                
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
                
                // Check terms consent before proceeding
                if (!checkTermsConsentBeforeAction(() => {}, 'payment access')) {
                    return;
                }
                
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
                
                // Check terms consent before proceeding
                if (!checkTermsConsentBeforeAction(() => {}, 'FAQ access')) {
                    return;
                }
                
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
                const wasNextIconVisible = nextIcon.style.opacity === '1';
                nextIcon.style.opacity = state.canGoNext ? '1' : '0.3';
                
                // Trigger animation when arrow becomes visible on first step (but not on categories page)
                const lastGridItemUrl = getLocal('lastGridItemUrl') || '';
                const isCategoriesPage = lastGridItemUrl.includes('/ai/categories.html') || lastGridItemUrl.includes('%2Fai%2Fcategories.html');
                
                if (!wasNextIconVisible && nextIcon.style.opacity === '1' && state.currentStep === 0 && !isCategoriesPage) {
                    startRightArrowAnimation(nextIcon);
                }
                
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
        // Notify animation controller about content load
        DataInAnimationController.onContentLoaded();
        
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
        if (window.categoriesFormPersistence && typeof window.categoriesFormPersistence.rebindGridItemEvents === 'function') {
            window.categoriesFormPersistence.rebindGridItemEvents();
        }
        
        // Update guided forms button states after content loads
        setTimeout(() => {
            window.guidedFormsButtonUpdateInterval = setInterval(() => {
                updateGuidedButtonStates();
            }, 500); // Update every 500ms when guided forms are active
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

// ====================
// Centralized Generate Request Handler
// ====================

/**
 * Centralized function to handle generate requests for all AI modules
 * Replaces duplicate handleGenerate...Iq functions across modules
 * @param {string} moduleName - The module name (e.g., 'income', 'calorie', 'fashion')
 * @param {Object} options - Optional configuration
 * @param {string} options.buttonId - ID of the generate button (defaults to 'generate-{module}-btn')
 * @param {string} options.alertMessage - Custom alert message for empty form data
 * @param {Object} options.customFormData - Use custom form data instead of form persistence
 * @param {Function} options.onSuccess - Custom success handler
 * @param {Function} options.onError - Custom error handler
 * @returns {Promise} Result of the API call
 */
window.handleGenerateRequest = async function(moduleName, options = {}) {
    const {
        buttonId = `generate-${moduleName}-btn`,
        alertMessage = `Please complete the form before generating a ${moduleName} analysis.`,
        customFormData,
        onSuccess,
        onError
    } = options;

    let formData;
    
    if (customFormData) {
        // Use provided custom form data
        formData = customFormData;
    } else {
        // Special case for income module - use structured data from incomeIqinput1
        if (moduleName === 'income') {
            formData = getJSON('incomeIqinput1');
            if (!formData) {
                console.error(`[${moduleName}] No structured input data found in localStorage.`);
                alert(alertMessage);
                return;
            }
        } else {
            // Get form persistence instance for this module
            const formPersistence = window[`${moduleName}FormPersistence`];
            if (!formPersistence) {
                console.error(`[${moduleName}] FormPersistence instance not found.`);
                alert('Form system not initialized. Please refresh the page.');
                return;
            }

            // Get form data
            formData = formPersistence.getSavedFormData();
            if (!formData) {
                console.error(`[${moduleName}] No input data found in localStorage.`);
                alert(alertMessage);
                return;
            }
        }
    }

    // Check client-side rate limiting before proceeding  
    const rateLimitAllowed = window.rateLimiter.canSendRequest();
    if (!rateLimitAllowed) {
        // Rate limit check failed - if it's a free user, payment modal should already be triggered
        console.log(`[${moduleName}] Client-side rate limit check failed`);
        return;
    }

    // Create worker payload with fingerprint and email for paid users
    const workerPayload = window.rateLimiter.createWorkerPayload(moduleName, formData);
    
    // Debug logging for income module
    if (moduleName === 'income') {
        console.log('[DataIn] Income module debug:', {
            formDataFromLocalStorage: formData,
            hasIntroData: !!formData?.introData,
            hasIncomeData: !!formData?.incomeData,
            introDataFields: formData?.introData ? Object.keys(formData.introData) : [],
            incomeDataFields: formData?.incomeData ? Object.keys(formData.incomeData) : [],
            workerPayload: workerPayload
        });
    }
    
    const dataContainer = document.querySelector('.data-container-in');
    let backendResponse = null;
    let httpStatus = null;
    
    try {
        backendResponse = await window.enhancedLoading(
            buttonId,
            moduleName,
            async () => {
                // Send data to worker
                const apiUrl = 'https://inexasli.com/api/generate';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(workerPayload)
                });

                // Store HTTP status for error handling
                httpStatus = response.status;

                let responseData;
                try {
                    responseData = await response.json();
                } catch (e) {
                    responseData = { 
                        error: 'Invalid JSON', 
                        message: 'Invalid response from server.' 
                    };
                }

                // Store backend response for error handling
                backendResponse = responseData;

                // Always call handleRateLimitResponse with backend response
                window.rateLimiter.handleRateLimitResponse(dataContainer, responseData, !response.ok, moduleName);

                if (!response.ok) {
                    throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
                }

                if (responseData.message !== 'Success') {
                    throw new Error(`An error occurred: ${responseData.message || responseData.error || ''}`);
                }
                
                // Store the response (only if form persistence is available)
                const formPersistence = window[`${moduleName}FormPersistence`];
                if (formPersistence) {
                    formPersistence.saveResponseData(responseData);
                }
                
                // Dispatch an event to notify dataout.js that a response was received
                const event = new CustomEvent('api-response-received', {
                    detail: {
                        module: `${moduleName}iq`,
                        type: 'worker-response',
                        timestamp: Date.now()
                    }
                });
                document.dispatchEvent(event);
                
                // Call custom success handler if provided
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess(responseData);
                }
                
                return responseData;
            }
        );

        // Increment request count after successful API call
        window.rateLimiter.incrementRequestCount();
        
        return backendResponse;

    } catch (error) {
        // Call custom error handler if provided
        if (onError && typeof onError === 'function') {
            onError(error, backendResponse);
        } else {
            // Generic error handling - rate limits handled by rateLimiter.js
            if (httpStatus === 429) {
                // Rate limit errors are fully handled by rateLimiter.js
                console.log(`[${moduleName}] Rate limit error - handled by rate limiter`);
            } else {
                // Handle non-rate-limit errors
                console.error(`[${moduleName}] Error:`, error);
                let errorMessage = `An error occurred while generating your ${moduleName} analysis. Please try again later.`;
                
                if (httpStatus === 500) {
                    errorMessage = 'Server error occurred. Please try again in a few moments.';
                } else if (httpStatus === 400) {
                    errorMessage = 'Invalid request. Please check your input and try again.';
                } else if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                }
                
                alert(errorMessage);
            }
        }
        
        throw error;
    }
};

// Remove local rate limit display logic; use centralized logic from rateLimiter.js
// On page load, show localStorage value first, then update from backend using centralized handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const dataContainer = document.querySelector('.data-container-in');
        if (dataContainer) {
            // Update payment button display directly from localStorage
            updatePaymentButtonDisplay();
        }
    }, 500);
    
    // Legacy handler functions have been replaced with centralized animation controller
});