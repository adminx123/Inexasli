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
import '/utility/enhancedUI.js';
import '/utility/copy.js';
import '/utility/dataOverwrite.js';
import { renderRateLimitDisplay, handleRateLimitResponse } from '/ai/rate-limiter/rateLimiter.js';
import '/ai/faq.js'; // Add FAQ modal script

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
        '/ai/philosophy/philosophyiq.html',
        '/ai/quiz/quiziq.html',
        '/ai/research/researchiq.html',
        '/ai/social/socialiq.html',
        '/ai/categories.html'
    ];
    
    // Define files that should use incomestyles.css
    const incomeFiles = ['/ai/income/incomeiq.html'];
    
    // Function to check if current page needs specific CSS
    function shouldLoadInputStyles() {
        const currentPath = window.location.pathname;
        return inputFiles.some(file => currentPath.includes(file.replace('.html', ''))) || 
               document.querySelector('[data-value*="/ai/calorie/"], [data-value*="/ai/decision/"], [data-value*="/ai/enneagram/"], [data-value*="/ai/event/"], [data-value*="/ai/fashion/"], [data-value*="/ai/fitness/"], [data-value*="/ai/philosophy/"], [data-value*="/ai/quiz/"], [data-value*="/ai/research/"], [data-value*="/ai/social/"], [data-value*="/ai/categories.html"]');
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



    
    // Function to load appropriate CSS based on URL
    function loadCSSForUrl(url) {
        const inputFiles = [
            '/ai/calorie/calorieiq.html',
            '/ai/decision/decisioniq.html',
            '/ai/enneagram/enneagramiq.html',
            '/ai/event/eventiq.html',
            '/ai/fashion/fashioniq.html',
            '/ai/fitness/fitnessiq.html',
            '/ai/philosophy/philosophyiq.html',
            '/ai/quiz/quiziq.html',
            '/ai/research/researchiq.html',
            '/ai/social/socialiq.html',
            '/ai/categories.html'
        ];
        
        const incomeFiles = ['/ai/income/incomeiq.html'];
        
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
            
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <div class="data-content">Loading...</div>
            `;

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
                
                // Insert content with initial hiding to prevent flash
                dataContainer.innerHTML = `
                    <div class="utility-buttons-container" style="position: absolute; top: -4px; right: 10px; display: flex; flex-direction: row; gap: 8px;">
                        <button id="datain-category-btn" title="Open Categories" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-grid-alt" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-payment-btn" title="Premium Features" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <span style="font-size: 14px; font-weight: bold;">$</span>
                        </button>
                        <button id="datain-overwrite-btn" title="Clear All Data" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-trash" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-copy-btn" title="Copy to clipboard" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-copy" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-faq-btn" title="Tips & FAQ" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-question-mark" style="font-size: 16px;"></i>
                        </button>
                    </div>
                    <div class="data-content" style="opacity: 0; transition: opacity 0.2s ease;">${content}</div>
                `;
                
                // Setup utility buttons early
                setupUtilityButtons();
                renderRateLimitDisplay(dataContainer, 'https://rate-limiter.4hm7q4q75z.workers.dev');
                
                // Function to show content after guided forms is ready
                const showContentAfterGuidedForms = () => {
                    // Initialize FormPersistence for this module
                    initializeFormPersistence(url);
                    
                    // Re-initialize grid items
                    // initializeGridItems();
                    
                    // Show content with smooth transition
                    const dataContent = dataContainer.querySelector('.data-content');
                    if (dataContent) {
                        dataContent.style.opacity = '1';
                    }
                    
                    console.log('[DataIn] Content revealed after guided forms initialization');

                    // Initialize swipe functionality for guided forms
                    if (window.guidedForms && typeof window.guidedForms.showStep === 'function') {
                        const swipeTargetElement = dataContainer.querySelector('.data-content');
                        if (swipeTargetElement) {
                            console.log('[DataIn] Initializing bidirectional swipe for guided forms on .data-content');
                            
                            // Initialize both left and right swipe handlers with a single call
                            initializeBidirectionalSwipe(swipeTargetElement, {
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
                        } else {
                            console.warn('[DataIn] Could not find .data-content to initialize swipe for guided forms.');
                        }
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
                dataContainer.innerHTML = `
                    <span class="close-data-container"></span>
                    <div class="utility-buttons-container" style="position: absolute; top: -4px; right: 10px; display: flex; flex-direction: row; gap: 8px;">
                        <button id="datain-category-btn" title="Open Categories" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-grid-alt" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-payment-btn" title="Premium Features" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <span style="font-size: 14px; font-weight: bold;">$</span>
                        </button>
                        <button id="datain-overwrite-btn" title="Clear All Data" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-trash" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-copy-btn" title="Copy to clipboard" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-copy" style="font-size: 14px;"></i>
                        </button>
                        <button id="datain-faq-btn" title="Tips & FAQ" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                            <i class="bx bx-question-mark" style="font-size: 16px;"></i>
                        </button>
                    </div>
                    <div class="data-content">${content}</div>
                `;
                
                // Initialize FormPersistence for this module
                initializeFormPersistence(url);
                
                // Re-initialize grid items for non-form content
                // initializeGridItems();
                
                // Setup utility buttons
                setupUtilityButtons();
                renderRateLimitDisplay(dataContainer, 'https://rate-limiter.4hm7q4q75z.workers.dev');
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
            const scripts = dataContainer.querySelectorAll('script');
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

            // Re-bind close button
            const closeButton = dataContainer.querySelector('.close-data-container');
            if (closeButton) {
                closeButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDataContainer();
                });
            }

            // At the end of all form/content initialization (after content is revealed):
            if (window.enablePremiumFeatures) {
              window.enablePremiumFeatures();
            }
        } catch (error) {
            console.error('Error loading content:', error);
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <div class="data-content">Error loading content. Please try again.</div>
            `;
            
            // Re-bind close button even on error
            const closeButton = dataContainer.querySelector('.close-data-container');
            if (closeButton) {
                closeButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDataContainer();
                });
            }
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-in')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Data in container specific styling */
            .data-container-in {
                position: fixed;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f2f9f3;
                padding: 4px;
                border: 1px solid #4a7c59;
                border-bottom: none;
                border-radius: 24px 24px 0 0;
                box-shadow: 0 -2px 4px rgba(74, 124, 89, 0.2);
                z-index: 1000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, left 0.3s ease-in-out, transform 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
                display: flex;
                flex-direction: column;
            }

            .data-container-in.initial, .data-container-in.collapsed {
                width: 100%;
                max-width: 100%;
                min-width: 100%;
                height: 36px;
                left: 0;
                transform: none;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-left: 0;
                margin-right: 0;
                padding-left: 10px;
                padding-right: 10px;
            }

            .data-container-in.expanded {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                height: 90vh; /* Increased to 90vh for maximum expansion */
                bottom: 0;
                left: 0;
                transform: none;
                overflow: hidden; /* Keep container overflow hidden, but allow content scrolling */
                border-radius: 24px 24px 0 0; /* Rounded corners at the top */
                border: none;
                box-shadow: 0 -2px 6px rgba(74, 124, 89, 0.25); /* Soft shadow along the top edge */
            }

            .data-container-in:hover {
                background-color: #eef7f0;
            }

            .data-container-in .close-data-container {
                position: absolute;
                top: 4px;
                left: 10px;
                padding: 5px;
                font-size: 14px;
                line-height: 1;
                color: #000;
                cursor: pointer;
                font-weight: bold;
                font-family: "Inter", sans-serif;
            }
            
            .data-container-in.expanded .close-data-container {
                top: 4px;
                right: 10px;
                left: auto;
                font-size: 18px;
                padding: 5px;
                background-color: #f5f5f5;
                border-radius: 4px;
            }



            .data-container-in .data-content {
                padding: 10px;
                font-size: 14px;
                height: calc(100% - 40px); /* Fixed height calculation */
                max-height: none; /* Remove max-height limitation */
                overflow-y: auto; /* Enable vertical scrolling for content */
                overflow-x: hidden; /* Hide horizontal overflow */
                font-family: "Inter", sans-serif;
                width: 100%;
                max-width: 100%;
                margin-top: 30px;
                position: relative; /* Add positioning context */
                display: block; /* Ensure proper display */
                box-sizing: border-box; /* Include padding in height calculation */
                /* Add smooth scrolling */
                scroll-behavior: smooth;
                /* Custom scrollbar styling */
                scrollbar-width: thin;
                scrollbar-color: rgba(74, 124, 89, 0.3) transparent;
            }

            /* Custom scrollbar for webkit browsers */
            .data-container-in .data-content::-webkit-scrollbar {
                width: 6px;
            }

            .data-container-in .data-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .data-container-in .data-content::-webkit-scrollbar-thumb {
                background-color: rgba(74, 124, 89, 0.3);
                border-radius: 3px;
            }

            .data-container-in .data-content::-webkit-scrollbar-thumb:hover {
                background-color: rgba(74, 124, 89, 0.5);
            }

            /* Utility buttons styling for all states */
            .data-container-in .utility-buttons-container {
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: center;
            }

            /* Hide utility buttons only when expanded */
            .data-container-in.expanded .utility-buttons-container {
                display: none;
            }

            /* Show utility buttons in all collapsed states */
            .data-container-in.initial .utility-buttons-container,
            .data-container-in.collapsed .utility-buttons-container,
            .data-container-in.visually-collapsed .utility-buttons-container {
                display: flex;
            }
            
            /* Visual collapsed state - looks like collapsed but keeps expanded DOM structure */
            .data-container-in.visually-collapsed {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                height: 36px;
                left: 0;
                transform: none;
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: center;
                justify-content: flex-end;
                margin-left: 0;
                margin-right: 0;
                padding-left: 10px;
                padding-right: 10px;
                overflow: hidden;
            }
            
            /* Ensure utility buttons are visible and properly positioned in collapsed state */
            .data-container-in.visually-collapsed .utility-buttons-container {
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: center;
                position: static;
                top: auto;
                right: auto;
                padding: 0;
                justify-content: flex-end;
                margin-left: 0;
            }
            


            /* Button hover effects for collapsed state */
            .data-container-in .utility-buttons-container button:hover {
                background-color: rgba(255, 255, 255, 0.8);
            }



            /* Mobile responsiveness for left container */
            @media (max-width: 480px) {
                .data-container-in {
                    max-width: 100%;
                    padding: 3px;
                }

                .data-container-in.initial, .data-container-in.collapsed {
                    width: 100%;
                    height: 36px;
                    padding-left: 10px;
                    padding-right: 10px;
                }
                
                .data-container-in.visually-collapsed {
                    width: 100%;
                    height: 36px;
                    padding-left: 10px;
                    padding-right: 10px;
                }

                .data-container-in .utility-buttons-container {
                    gap: 6px;
                }

                .data-container-in .utility-buttons-container button {
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                }

                .data-container-in .utility-buttons-container button i {
                    font-size: 12px;
                }

                .data-container-in .utility-buttons-container button span {
                    font-size: 12px;
                }

                .data-container-in.expanded {
                    max-width: 100%;
                    width: 100%;
                    min-width: 100%;
                    height: 90vh; /* Increased to 90vh for maximum mobile expansion */
                    bottom: 0;
                    left: 0;
                    transform: none;
                    border-radius: 24px 24px 0 0;
                    border: none;
                    box-shadow: 0 -2px 6px rgba(74, 124, 89, 0.25);
                }



                .data-container-in .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                
                .data-container-in.expanded .close-data-container {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-in .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-y: auto; /* Enable scrolling on mobile */
                    overflow-x: hidden; /* Hide horizontal overflow on mobile */
                    margin-top: 25px;
                    height: calc(100% - 35px); /* Adjusted for mobile */
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-in visually-collapsed`;
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container" style="display: none;"></span>
            <div class="utility-buttons-container">
                <button id="datain-category-btn" title="Open Categories" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                    <i class="bx bx-grid-alt" style="font-size: 14px;"></i>
                </button>
                <button id="datain-payment-btn" title="Premium Features" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                    <span style="font-size: 14px; font-weight: bold;">$</span>
                </button>
                <button id="datain-overwrite-btn" title="Clear All Data" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                    <i class="bx bx-trash" style="font-size: 14px;"></i>
                </button>
                <button id="datain-copy-btn" title="Copy to clipboard" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                    <i class="bx bx-copy" style="font-size: 14px;"></i>
                </button>
                <button id="datain-faq-btn" title="Tips & FAQ" style="width: 28px; height: 28px; border: none; border-radius: 4px; background-color: transparent; color: #000; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">
                    <i class="bx bx-question-mark" style="font-size: 16px;"></i>
                </button>
            </div>
            <div class="data-content" style="display: none;">No content selected. Please select a grid item.</div>
        `;

        document.body.appendChild(dataContainer);

        // Inject RateLimit display at the top of the data container
        renderRateLimitDisplay(dataContainer, 'https://rate-limiter.4hm7q4q75z.workers.dev');

        // Setup utility buttons for initial state
        setupUtilityButtons();
        renderRateLimitDisplay(dataContainer, 'https://rate-limiter.4hm7q4q75z.workers.dev');

        // Initialize simple vertical swipe for container toggle
        initializeSimpleVerticalSwipe(dataContainer, toggleDataContainer);

        // Add click listener to container - smart behavior based on state and click location
        dataContainer.addEventListener('click', function (e) {
            // Check if click is on progress bar dots first - let them handle their own clicks
            const isProgressDot = e.target.closest('.progress-dot') || 
                                 e.target.classList.contains('progress-dot') ||
                                 e.target.closest('#guided-form-progress') ||
                                 e.target.id === 'guided-form-progress';
            
            if (isProgressDot) {
                return; // Let progress dots handle their own clicks without interference
            }
            
            e.preventDefault();
            
            // Check if click is on utility buttons
            const isUtilityButton = e.target.closest('#datain-overwrite-btn, #datain-copy-btn, #datain-category-btn, #datain-payment-btn') ||
                                   e.target.id === 'datain-overwrite-btn' ||
                                   e.target.id === 'datain-copy-btn' ||
                                   e.target.id === 'datain-category-btn' ||
                                   e.target.id === 'datain-payment-btn';
            
            // Check if click is on close button (let that handle it)
            const isCloseButton = e.target.closest('.close-data-container') || 
                                 e.target.classList.contains('.close-data-container');
            
            // Check if click is within the data-content area (form content)
            const isDataContent = e.target.closest('.data-content') || 
                                 e.target.classList.contains('.data-content');
            
            const currentState = dataContainer.dataset.state;
            
            // Smart click behavior:
            if (!isUtilityButton && !isCloseButton) {
                if (currentState !== 'expanded') {
                    // If collapsed, any click should expand
                    console.log('[DataIn] Container clicked while collapsed - expanding');
                    toggleDataContainer();
                } else if (currentState === 'expanded' && !isDataContent) {
                    // If expanded, only collapse if clicking outside the content area (on header/border)
                    console.log('[DataIn] Container header clicked while expanded - collapsing');
                    toggleDataContainer();
                } else {
                    // If expanded and clicking on content area, do nothing (let user interact with forms)
                    console.log('[DataIn] Content area clicked while expanded - allowing interaction');
                }
            }
        });

        const closeButton = dataContainer.querySelector('.close-data-container');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            
        }

        // dataLabel click handler removed - container click handler already covers this functionality
        
        // Listen for the special collapse event from dataout.js
        document.addEventListener('collapse-datain-container', function() {
            console.log('[DataIn] Received collapse-datain-container event');
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                console.log('[DataIn] Collapsing datain container due to dataout expansion');
                toggleDataContainer();
            }
        });

        // Listen for grid item selection events from promptgrid.js
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            // Only expand and load content if container is already expanded
            // If collapsed, just store the URL for later when user expands manually
            if (dataContainer.dataset.state === 'expanded') {
                loadStoredContent(url);
            }
            // If collapsed, don't auto-expand - let user manually expand to see content
        });

        // Fallback: Monitor localStorage changes for lastGridItemUrl
        window.addEventListener('storage', function (e) {
            if (e.key === 'lastGridItemUrl' && e.newValue) {
                
                // Only auto-load if container is already expanded
                if (dataContainer.dataset.state === 'expanded') {
                    loadStoredContent(e.newValue);
                }
                // If collapsed, just store the URL - user needs to manually expand to see content
            }
        });

        // Collapse container when clicking outside
        document.addEventListener('click', function (e) {
            const isClickInside = dataContainer.contains(e.target);
            // Check if click is on copy button or its modal/toast elements
            const isCopyButton = e.target.closest('#copyButtonContainer, #copyButton, .share-modal-backdrop, .share-modal-content, .share-action-btn') ||
                                e.target.id === 'copyButton' ||
                                e.target.id === 'copyButtonContainer' ||
                                e.target.closest('[id^="toast-"]');
            
            // Check if click is on utility buttons
            const isUtilityButton = e.target.closest('#datain-overwrite-btn, #datain-copy-btn, #datain-category-btn, #datain-payment-btn') ||
                                   e.target.id === 'datain-overwrite-btn' ||
                                   e.target.id === 'datain-copy-btn' ||
                                   e.target.id === 'datain-category-btn' ||
                                   e.target.id === 'datain-payment-btn';
            
            if (!isClickInside && !isCopyButton && !isUtilityButton && dataContainer.dataset.state === 'expanded') {
                
                toggleDataContainer();
            }
        });

        // Restore last state OR auto-open for first-time visitors
        const lastState = getLocal('dataContainerState') || 'initial';
        const lastGridItemUrl = getLocal('lastGridItemUrl');
        
        if (lastState === 'expanded') {
            // User had it expanded before, restore that state
            toggleDataContainer();
        } else if (lastGridItemUrl === '/ai/categories.html' && lastState === 'initial') {
            // First visit or user hasn't interacted much - auto-open with categories
            toggleDataContainer();
        }
    }



    // Toggle function for the data container - moved to broader scope for utility buttons
    function toggleDataContainer() {
        if (!dataContainer) return;

        const isExpanded = dataContainer.dataset.state === 'expanded';

        // Always clear all sizing classes and inline height
        dataContainer.classList.remove('expanded', 'initial', 'collapsed', 'visually-collapsed');
        dataContainer.style.height = '';

        if (isExpanded) {
            // COLLAPSE: Only visually-collapsed class, height 36px
            dataContainer.classList.add('visually-collapsed');
            dataContainer.dataset.state = 'initial';
            setLocal('dataContainerState', 'initial');
            document.body.style.overflow = '';
            // Hide content and close button
            dataContainer.querySelectorAll('.data-content, .close-data-container').forEach(el => el.style.display = 'none');
            // Show utility buttons (but keep rate-limit-display always visible)
            dataContainer.querySelectorAll('.utility-buttons-container').forEach(el => {
                el.style.display = 'flex';
                const rateLimit = el.querySelector('.rate-limit-display');
                if (rateLimit) rateLimit.style.display = 'inline-block';
            });
            // Hide progress bar on collapse
            const progressBar = dataContainer.querySelector('#guided-form-progress');
            if (progressBar) progressBar.style.display = 'none';
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('datain-state-changed', { detail: { state: 'initial' } }));
        } else {
            // EXPAND: Only expanded class, height 90vh
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            document.body.style.overflow = 'hidden';
            // Show content and close button
            dataContainer.querySelectorAll('.data-content, .close-data-container').forEach(el => el.style.display = 'block');
            // Hide utility buttons (but keep rate-limit-display always visible)
            dataContainer.querySelectorAll('.utility-buttons-container').forEach(el => {
                el.style.display = 'none';
                const rateLimit = el.querySelector('.rate-limit-display');
                if (rateLimit) rateLimit.style.display = 'inline-block';
            });
            // Show progress bar on expand
            const progressBar = dataContainer.querySelector('#guided-form-progress');
            if (progressBar) progressBar.style.display = '';
            // Dispatch state change event
            document.dispatchEvent(new CustomEvent('datain-state-changed', { detail: { state: 'expanded' } }));
            // Auto-adjust container size if needed
            setTimeout(() => {
                const dataContent = dataContainer.querySelector('.data-content');
                const currentContent = dataContent ? dataContent.querySelector('.row1:not([style*="display: none"])') : null;
                if (currentContent) {
                    adjustContainerSize(currentContent);
                }
            }, 50);
            const leftSideBarOpen = new CustomEvent('left-sidebar-open', { detail: { state: 'expanded' } });
            document.dispatchEvent(leftSideBarOpen);
            const storedUrl = getLocal('lastGridItemUrl');
            if (storedUrl) {
                loadStoredContent(storedUrl);
            }
        }
    }

    // Setup utility buttons within the datain container
    function setupUtilityButtons() {
        const overwriteBtn = document.getElementById('datain-overwrite-btn');
        const copyBtn = document.getElementById('datain-copy-btn');
        const categoryBtn = document.getElementById('datain-category-btn');
        const paymentBtn = document.getElementById('datain-payment-btn');
        const faqBtn = document.getElementById('datain-faq-btn');
        
        if (overwriteBtn) {
            // Add hover effects
            overwriteBtn.addEventListener('mouseenter', () => {
                overwriteBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            });
            overwriteBtn.addEventListener('mouseleave', () => {
                overwriteBtn.style.backgroundColor = 'transparent';
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
                copyBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            });
            copyBtn.addEventListener('mouseleave', () => {
                copyBtn.style.backgroundColor = 'transparent';
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
                categoryBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            });
            categoryBtn.addEventListener('mouseleave', () => {
                categoryBtn.style.backgroundColor = 'transparent';
            });
            
            // Add click handler to load categories.html
            categoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if container is collapsed and expand it before loading content
                if (dataContainer.dataset.state !== 'expanded') {
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
                paymentBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            });
            paymentBtn.addEventListener('mouseleave', () => {
                paymentBtn.style.backgroundColor = 'transparent';
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
                faqBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            });
            faqBtn.addEventListener('mouseleave', () => {
                faqBtn.style.backgroundColor = 'transparent';
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
    if (!dataContainer.classList.contains('expanded')) {
        return;
    }

    // Small delay to ensure content is fully rendered
    setTimeout(() => {
        try {
            // Double-check the container is still expanded (user might have collapsed it)
            if (!dataContainer || !dataContainer.classList.contains('expanded')) {
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
            // Only update from localStorage on load, using centralized handler
            const status = JSON.parse(localStorage.getItem('rateLimitStatus') || 'null') || {};
            // Use the imported handleRateLimitResponse from rateLimiter.js
            handleRateLimitResponse(dataContainer, status, false, 'Module');
        }
    }, 500);
});