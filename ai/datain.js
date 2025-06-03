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
import '/utility/enhancedUI.js';
import '/utility/copy.js';
import '/utility/dataOverwrite.js';


function initializeFormPersistence(url) {
    console.log('[DataIn] Initializing FormPersistence for URL:', url);
    
    // Auto-detect module from URL patterns
    let moduleType = 'default';
    let moduleConfig = {};
    
    if (url.includes('/calorie/')) {
        moduleType = 'calorie';
        moduleConfig = {
            singleSelection: ['calorie-activity', 'calorie-sex'],
            multiSelection: ['calorie-goal', 'calorie-recommendations', 'calorie-diet-type']
        };
    } else if (url.includes('/fitness/')) {
        moduleType = 'fitness';
        moduleConfig = {
            singleSelection: ['fitness-activity', 'fitness-experience', 'fitness-equipment', 'fitness-time', 'fitness-intensity', 'fitness-sex'],
            multiSelection: []
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
    
    // Add category selection logic
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('grid-item') && e.target.closest('#category-selection')) {
            const selectedCategory = e.target.getAttribute('data-value');
            console.log('[DataIn] Category selected:', selectedCategory);
            
            if (selectedCategory) {
                // Update grid item selection
                document.querySelectorAll('#category-selection .grid-item').forEach(item => {
                    item.classList.remove('selected');
                });
                e.target.classList.add('selected');
                
                // Hide all product rows
                document.querySelectorAll('.row1[data-show-for]').forEach(row => {
                    row.classList.remove('show');
                    row.style.display = 'none';
                });
                
                // Show the selected category's products
                const targetRow = document.querySelector(`.row1[data-show-for="${selectedCategory}"]`);
                if (targetRow) {
                    targetRow.classList.add('show');
                    targetRow.style.display = 'block';
                    console.log('[DataIn] Showing products for category:', selectedCategory);
                }
            }
        }
        
        // Add product selection logic
        if (e.target.classList.contains('grid-item') && e.target.getAttribute('data-value') && e.target.getAttribute('data-value').startsWith('/ai/')) {
            const url = e.target.getAttribute('data-value');
            console.log('[DataIn] Product selected:', url);
            
            // Detect if this is the intro/incomeIQ item
            const isBudgetItem = url === '/ai/income/intro.html';
            
            // Toggle UI mode based on selection if the function exists
            if (typeof window.toggleUiMode === 'function') {
                window.toggleUiMode(isBudgetItem);
            }
            
            if (!isBudgetItem) {
                // For non-budget items, use regular content loading
                const gridItemEvent = new CustomEvent('promptGridItemSelected', { 
                    detail: { url: url }
                });
                document.dispatchEvent(gridItemEvent);
            }
            
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
    
    // Load inputstyles.css if not already loaded
    if (!document.querySelector('link[href*="inputstyles.css"]')) {
        const inputStylesLink = document.createElement('link');
        inputStylesLink.href = '/ai/styles/inputstyles.css';
        inputStylesLink.rel = 'stylesheet';
        document.head.appendChild(inputStylesLink);
    }
    
    let dataContainer = null;

    // Listen for dataout expansion/collapse
    document.addEventListener('dataout-state-changed', function(event) {
        if (!dataContainer) return;
        
        const dataOutState = event.detail.state;
        if (dataOutState === 'expanded') {
            // When dataout is expanded, make datain appear above it
            dataContainer.style.zIndex = '12000';
        } else {
            // When dataout is collapsed, reset datain's z-index
            if (dataContainer.dataset.state !== 'expanded') {
                dataContainer.style.zIndex = '10000';
            }
        }
    });

    async function loadStoredContent(url) {
        try {
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
                    <div class="utility-buttons-container" style="position: absolute; top: -4px; right: 10px; display: flex; flex-direction: row; gap: 8px; z-index: 11003;">
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
                    </div>
                    <div class="data-content" style="opacity: 0; transition: opacity 0.2s ease;">${content}</div>
                `;
                
                // Setup utility buttons early
                setupUtilityButtons();
                
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
                };
                
                // Load guided forms script if not already loaded
                if (!window.GuidedFormSystem && !document.querySelector('script[src*="guidedForms.js"]')) {
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
                    <div class="utility-buttons-container" style="position: absolute; top: -4px; right: 10px; display: flex; flex-direction: row; gap: 8px; z-index: 11003;">
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
                    </div>
                    <div class="data-content">${content}</div>
                `;
                
                // Initialize FormPersistence for this module
                initializeFormPersistence(url);
                
                // Re-initialize grid items for non-form content
                // initializeGridItems();
                
                // Setup utility buttons
                setupUtilityButtons();
            }

            // Dispatch custom event to notify that data-in content has loaded
            document.dispatchEvent(new CustomEvent('data-in-loaded', {
                detail: {
                    url: url,
                    container: dataContainer
                }
            }));

            // Re-bind close button
            const closeButton = dataContainer.querySelector('.close-data-container');
            if (closeButton) {
                closeButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDataContainer();
                });
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
        if (document.querySelector('.data-container-left')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Left container specific styling */
            .data-container-left {
                position: fixed;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-bottom: none;
                border-radius: 8px 8px 0 0;
                box-shadow: 4px -4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out, left 0.3s ease-in-out, transform 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
                display: flex;
                flex-direction: column;
            }

            .data-container-left.initial, .data-container-left.collapsed {
                width: 100%;
                max-width: 100%;
                min-width: 100%;
                height: 36px;
                left: 0;
                transform: none;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                z-index: 10001;
                margin-left: 0;
                margin-right: 0;
                padding-left: 10px;
                padding-right: 10px;
            }

            .data-container-left.expanded {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                height: 50vh;
                bottom: 0;
                left: 0;
                transform: none;
                z-index: 11000; /* Higher z-index when expanded to appear over grid */
                overflow: hidden; /* Remove scrolling */
                border-radius: 8px 8px 0 0; /* Rounded corners at the top */
                border: none;
                box-shadow: 0 -4px 0 #000; /* 3D shadow along the top edge */
            }

            .data-container-left:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-left .close-data-container {
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
                z-index: 11001; /* Make sure it's above other content */
            }
            
            .data-container-left.expanded .close-data-container {
                top: 4px;
                right: 10px;
                left: auto;
                font-size: 18px;
                padding: 5px;
                z-index: 11002;
                background-color: #f5f5f5;
                border-radius: 4px;
            }



            .data-container-left .data-content {
                padding: 10px;
                font-size: 14px;
                height: calc(100% - 40px); /* Fixed height calculation */
                max-height: none; /* Remove max-height limitation */
                overflow: hidden;
                font-family: "Inter", sans-serif;
                width: 100%;
                max-width: 100%;
                margin-top: 30px;
                position: relative; /* Add positioning context */
                display: block; /* Ensure proper display */
                box-sizing: border-box; /* Include padding in height calculation */
            }

            /* Utility buttons styling for all states */
            .data-container-left .utility-buttons-container {
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: center;
                z-index: 11003;
            }

            /* Hide utility buttons only when expanded */
            .data-container-left.expanded .utility-buttons-container {
                display: none;
            }

            /* Show utility buttons in all collapsed states */
            .data-container-left.initial .utility-buttons-container,
            .data-container-left.collapsed .utility-buttons-container,
            .data-container-left.visually-collapsed .utility-buttons-container {
                display: flex;
            }
            
            /* Visual collapsed state - looks like collapsed but keeps expanded DOM structure */
            .data-container-left.visually-collapsed {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                height: 36px;
                left: 0;
                transform: none;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
                z-index: 10001;
                margin-left: 0;
                margin-right: 0;
                padding-left: 10px;
                padding-right: 10px;
                overflow: hidden;
            }
            
            /* Ensure utility buttons are visible and properly positioned in collapsed state */
            .data-container-left.visually-collapsed .utility-buttons-container {
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
            .data-container-left .utility-buttons-container button:hover {
                background-color: rgba(255, 255, 255, 0.8);
            }



            /* Mobile responsiveness for left container */
            @media (max-width: 480px) {
                .data-container-left {
                    max-width: 100%;
                    padding: 3px;
                }

                .data-container-left.initial, .data-container-left.collapsed {
                    width: 100%;
                    height: 36px;
                    z-index: 10001;
                    padding-left: 10px;
                    padding-right: 10px;
                }
                
                .data-container-left.visually-collapsed {
                    width: 100%;
                    height: 36px;
                    z-index: 10001;
                    padding-left: 10px;
                    padding-right: 10px;
                }

                .data-container-left .utility-buttons-container {
                    gap: 6px;
                }

                .data-container-left .utility-buttons-container button {
                    width: 24px;
                    height: 24px;
                    font-size: 12px;
                }

                .data-container-left .utility-buttons-container button i {
                    font-size: 12px;
                }

                .data-container-left .utility-buttons-container button span {
                    font-size: 12px;
                }

                .data-container-left.expanded {
                    max-width: 100%;
                    width: 100%;
                    min-width: 100%;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    transform: none;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                }



                .data-container-left .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                
                .data-container-left.expanded .close-data-container {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-left .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow: hidden; /* Remove scrolling on mobile */
                    margin-top: 25px;
                    height: calc(100% - 35px); /* Adjusted for mobile */
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-left visually-collapsed`;
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
            </div>
            <div class="data-content" style="display: none;">No content selected. Please select a grid item.</div>
        `;

        document.body.appendChild(dataContainer);

        // Setup utility buttons for initial state
        setupUtilityButtons();

        // Add click listener to entire container for expansion, but exclude utility button clicks
        dataContainer.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Check if click is on utility buttons
            const isUtilityButton = e.target.closest('#datain-overwrite-btn, #datain-copy-btn, #datain-category-btn, #datain-payment-btn') ||
                                   e.target.id === 'datain-overwrite-btn' ||
                                   e.target.id === 'datain-copy-btn' ||
                                   e.target.id === 'datain-category-btn' ||
                                   e.target.id === 'datain-payment-btn';
            
            // Only expand if it's not a utility button click and container is not expanded
            if (!isUtilityButton && dataContainer.dataset.state !== 'expanded') {
                toggleDataContainer();
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

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';
            
            // Get reference to dataout container
            const dataOutContainer = document.querySelector('.data-container-right');

            if (isExpanded) {
                // Collapse: Transform to visual collapsed state without changing DOM
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('visually-collapsed');
                dataContainer.dataset.state = 'initial';
                setLocal('dataContainerState', 'initial');
                
                // Hide the data content and show collapsed elements
                const dataContent = dataContainer.querySelector('.data-content');
                const closeButton = dataContainer.querySelector('.close-data-container');
                const utilityButtons = dataContainer.querySelector('.utility-buttons-container');
                
                if (dataContent) {
                    dataContent.style.display = 'none';
                }
                if (closeButton) {
                    closeButton.style.display = 'none';
                }
                if (utilityButtons) {
                    // Remove any inline styles and let CSS handle positioning
                    utilityButtons.style.display = '';
                    utilityButtons.style.position = '';
                    utilityButtons.style.top = '';
                    utilityButtons.style.right = '';
                    utilityButtons.style.justifyContent = '';
                    utilityButtons.style.padding = '';
                    utilityButtons.style.marginLeft = '';
                }
                
                // Reset dataout container z-index when datain collapses
                if (dataOutContainer) {
                    dataOutContainer.style.zIndex = '10000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('datain-state-changed', {
                    detail: { state: 'initial' }
                }));
                
            } else {
                // Expand: Transform back to full expanded state
                dataContainer.classList.remove('visually-collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                
                // Show the data content and hide collapsed elements
                const dataContent = dataContainer.querySelector('.data-content');
                const closeButton = dataContainer.querySelector('.close-data-container');
                const utilityButtons = dataContainer.querySelector('.utility-buttons-container');
                
                if (dataContent) {
                    dataContent.style.display = 'block';
                }
                if (closeButton) {
                    closeButton.style.display = 'block';
                }
                if (utilityButtons) {
                    // Let CSS handle the expanded state positioning
                    utilityButtons.style.display = '';
                    utilityButtons.style.position = '';
                    utilityButtons.style.top = '';
                    utilityButtons.style.right = '';
                    utilityButtons.style.justifyContent = '';
                    utilityButtons.style.padding = '';
                }
                
                // Set dataout container to higher z-index to appear above expanded datain
                if (dataOutContainer) {
                    dataOutContainer.style.zIndex = '12000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('datain-state-changed', {
                    detail: { state: 'expanded' }
                }));
                
                const leftSideBarOpen = new CustomEvent('left-sidebar-open', {
                    detail: {
                        state: 'expanded'
                    }
                });

                document.dispatchEvent(leftSideBarOpen);
                
                // initializeGridItems();
                const storedUrl = getLocal('lastGridItemUrl');
                if (storedUrl) {
                    loadStoredContent(storedUrl);
                } else {
                    // Ensure proper expanded state when no content is loaded
                    dataContainer.innerHTML = `
                        <span class="close-data-container"></span>
                        <div class="utility-buttons-container" style="position: absolute; top: -4px; right: 10px; display: flex; flex-direction: row; gap: 8px; z-index: 11003;">
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
                        </div>
                        <div class="data-content">No content selected. Please select a grid item.</div>
                    `;
                    
                    // Re-setup utility buttons after innerHTML change
                    setupUtilityButtons();
                }
            }
        }

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

    // Re-add grid item initialization logic, but delegate toggle and persistence to FormPersistence
    // function initializeGridItems() {
    //     const gridItems = document.querySelectorAll('.grid-container .grid-item');
    //     gridItems.forEach(item => {
    //         if (!item.dataset.value) return;
    //         item.removeEventListener('click', handleGridItemClick);
    //         item.addEventListener('click', handleGridItemClick);
    //     });
    //     function handleGridItemClick() {
    //         // Let FormPersistence handle selection logic and persistence
    //         const toggleEvent = new CustomEvent('grid-item-toggled', { detail: { item: this } });
    //         document.dispatchEvent(toggleEvent);
    //     }
    // }

    // Call initializeGridItems after content load and on DOMContentLoaded
    // document.addEventListener('data-in-loaded', function() {
    //     initializeGridItems();
    // });
    // document.addEventListener('DOMContentLoaded', function() {
    //     initializeGridItems();
    // });

    // Setup utility buttons within the datain container
    function setupUtilityButtons() {
        const overwriteBtn = document.getElementById('datain-overwrite-btn');
        const copyBtn = document.getElementById('datain-copy-btn');
        const categoryBtn = document.getElementById('datain-category-btn');
        const paymentBtn = document.getElementById('datain-payment-btn');
        
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
                
                // Load categories.html directly into the datain container
                loadStoredContent('/ai/categories.html');
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

        // Check if data-out is already expanded to adjust z-index appropriately
        const dataOutContainer = document.querySelector('.data-container-right');
        if (dataOutContainer && dataOutContainer.dataset.state === 'expanded') {
            dataContainer.style.zIndex = '12000';
        }

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
    
    try {
        // Phase 1: Disable button and show loading state
        btn.disabled = true;
        btn.innerText = '🧠 Analyzing...';
        
        // Start the main API call immediately (before showing overlay)
        const apiPromise = apiCall();
        
        // Show educational modal overlay while API processes
        if (window.showEducationalLoadingOverlay) {
            overlayControl = window.showEducationalLoadingOverlay(moduleName);
        }
        
        // Wait for API to complete
        const result = await apiPromise;
        
        // Close the modal overlay using the proper control object
        if (overlayControl && overlayControl.close) {
            overlayControl.close();
        }
        
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



// Educational functionality has been moved to modal.js overlay system
// The enhancedLoading function now uses window.showEducationalLoadingOverlay(moduleName)