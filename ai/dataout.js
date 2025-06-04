/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
rotected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getLocal } from '/utility/getlocal.js';
import { setLocal } from '/utility/setlocal.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Additional logging for debugging
    console.log('[DataOut] Adding api-response-received event listener');
    // Listen specifically for the adventureiq module
    document.addEventListener('api-response-received', function(debugEvent) {
        console.log('[DataOut] DEBUG: api-response-received event caught:', debugEvent.detail);
    });
    

    let dataContainer = null;

    // Listen for datain expansion/collapse
    document.addEventListener('datain-state-changed', function(event) {
        if (!dataContainer) return;
        
        const dataInState = event.detail.state;
        if (dataInState === 'expanded') {
            // When datain is expanded, make dataout appear above it
            dataContainer.style.zIndex = '12000';
        } else {
            // When datain is collapsed, reset dataout's z-index
            if (dataContainer.dataset.state !== 'expanded') {
                dataContainer.style.zIndex = '10000';
            }
        }
    });

    async function loadStoredContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
            const content = await response.text();

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <div class="data-content">${content}</div>
            `;

            dataContainer.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }

                oldScript.replaceWith(newScript);
            });

          
        } catch (error) {
            console.error(`Error loading stored content (dataout.js):`, error);
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <div class="data-content">Error loading content: ${error.message}</div>
            `;
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-right')) {
            console.log('Right data container already exists, skipping initialization (dataout.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Right container specific styling */
            .data-container-right {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-top: none;
                border-radius: 0 0 27px 27px;
                box-shadow: -4px 4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-right.initial, .data-container-right.collapsed {
                width: 100%;
                max-width: 100%;
                min-width: 100%;
                height: 36px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 12000; /* Ensure collapsed Data Out is above expanded Data In */
                margin-left: 0;
                margin-right: 0;
                padding-left: 10px;
                padding-right: 10px;
            }
            /* Explicit override to ensure tab stays above Data In */
            .data-container-right.initial {
                z-index: 20000 !important;
            }
            .data-container-right.collapsed {
                z-index: 20000 !important;
            }
            .data-container-right.expanded {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                min-height: 50vh; /* Minimum 50% of viewport height, but can grow */
                max-height: 90vh; /* Maximum 90% of viewport height */
                top: 0;
                left: 0;
                transform: none;
                border: 2px solid #000; /* Solid border */
                border-top: none; /* Remove top border */
                border-radius: 0 0 27px 27px; /* Rounded bottom corners */
                box-shadow: -4px 4px 0 #000; /* 3D shadow effect */
                padding: 4px; /* Keep padding */
            }

            .data-container-right:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-right .close-data-container {
                position: absolute;
                top: 4px;
                right: 10px;
                padding: 5px;
                font-size: 14px;
                line-height: 1;
                color: #000;
                cursor: pointer;
                font-weight: bold;
                font-family: "Inter", sans-serif;
            }
            
            .data-container-right.expanded .close-data-container {
                top: 4px;
                right: 10px;
                font-size: 18px;
                padding: 5px;
                z-index: 11002;
                background-color: #f5f5f5;
                border-radius: 4px;
            }

            .data-container-right .data-label {
                text-decoration: none;
                color: #000;
                font-size: 12px;
                display: flex;
                justify-content: center;
                text-align: center;
                padding: 4px;
                cursor: pointer;
                transition: color 0.2s ease;
                line-height: 1.2;
                font-family: "Geist", sans-serif;
                writing-mode: horizontal-tb;
                text-orientation: mixed;
            }
            
            .data-container-right.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 18px;
                padding: 5px;
                z-index: 11002;
                background-color: #f5f5f5;
                border-radius: 4px;
            }

            .data-container-right .data-content {
                padding: 0;
                font-size: 14px;
                min-height: calc(50vh - 40px); /* Minimum height based on container min-height */
                max-height: calc(90vh - 40px); /* Maximum height based on container max-height */
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                width: 100%;
                max-width: 100%;
                margin-top: 30px;
            }

            /* Mobile responsiveness for right container */
            @media (max-width: 480px) {
                .data-container-right {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-right.initial, .data-container-right.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }

                .data-container-right.expanded {
                    max-width: 100%;
                    width: 100%;
                    min-width: 100%;
                    min-height: 90vh; /* Minimum height for mobile */
                    max-height: 95vh; /* Maximum height for mobile */
                    top: 0;
                    right: 0;
                    transform: none;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    padding: 0;
                }

                .data-container-right .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                
                .data-container-right.expanded .data-label {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-right .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                
                .data-container-right.expanded .close-data-container {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-right .data-content {
                    font-size: 12px;
                    padding: 0;
                    overflow-x: auto;
                    overflow-y: auto;
                    margin-top: 25px;
                    min-height: calc(90vh - 25px); /* Minimum height for mobile content */
                    max-height: calc(95vh - 25px); /* Maximum height for mobile content */
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-right initial`;
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container"></span>
            <span class="data-label">DATA OUT</span>
        `;
        document.body.appendChild(dataContainer);
        console.log('Right data container injected with state: initial (dataout.js)');

        // Add click listener to entire container for expansion
        dataContainer.addEventListener('click', function (e) {
            e.preventDefault();
            if (dataContainer.dataset.state !== 'expanded') {
                toggleDataContainer();
            }
        });

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Right close button not found (dataout.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Right data label not found (dataout.js)');
        }

        function initializeGridItems() {
            const gridItems = document.querySelectorAll('.grid-container .grid-item');
            gridItems.forEach(item => {
                if (!item.dataset.value) {
                    console.warn('Grid item is missing data-value attribute:', item);
                    return;
                }

                const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
                const value = localStorage.getItem(key);
                if (value === 'true') {
                    item.classList.add('selected');
                    console.log(`Restored ${key}: true`);
                } else if (value === 'false') {
                    item.classList.remove('selected');
                    console.log(`Restored ${key}: false`);
                }
                item.removeEventListener('click', toggleGridItem);
                item.addEventListener('click', toggleGridItem);
            });

            function toggleGridItem() {
                this.classList.toggle('selected');
                const key = `grid_${this.parentElement.id}_${this.dataset.value.replace(/\s+/g, '_')}`;
                localStorage.setItem(key, this.classList.contains('selected') ? 'true' : 'false');
            }
        }

        function toggleDataContainer() {
            console.log('[DataOut] toggleDataContainer called');
            if (!dataContainer) {
                console.error('[DataOut] ERROR: dataContainer is null/undefined!');
                return;
            }
            
            const isExpanded = dataContainer.dataset.state === 'expanded';
            console.log(`[DataOut] Current state: ${isExpanded ? 'expanded' : 'initial/collapsed'}`);
            
            // Get reference to datain container
            const dataInContainer = document.querySelector('.data-container-left');
        
            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                setLocal('dataOutContainerState', 'initial');
                dataContainer.innerHTML = `
                    <span class="close-data-container"></span>
                    <span class="data-label">DATA OUT</span>
                `;
                
                // Re-add click listener to entire container for expansion
                dataContainer.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (dataContainer.dataset.state !== 'expanded') {
                        toggleDataContainer();
                    }
                });
                
                // Reset datain container z-index when dataout collapses
                if (dataInContainer) {
                    dataInContainer.style.zIndex = '10000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('dataout-state-changed', {
                    detail: { state: 'initial' }
                }));
                
                console.log('[DataOut] Right data container collapsed and reset');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataOutContainerState', 'expanded');
                
                // Set datain container to higher z-index to appear above expanded dataout
                if (dataInContainer) {
                    dataInContainer.style.zIndex = '12000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('dataout-state-changed', {
                    detail: { state: 'expanded' }
                }));
                
                console.log('[DataOut] Right data container expanded');
        
                const lastGridItemUrl = getLocal('lastGridItemUrl');
                const outputMap = {
                    '/ai/calorie/calorieiq.html': '/ai/calorie/calorieoutput.html',
                    '/ai/symptom/symptomiq.html': '/ai/symptom/symptomoutput.html',
                    '/ai/fitness/fitnessiq.html': '/ai/fitness/fitnessoutput.html',
                    '/ai/adventure/adventureiq.html': '/ai/adventure/adventureoutput.html',
                    '/ai/decision/decisioniq.html': '/ai/decision/decisionoutput.html',
                    '/ai/enneagram/enneagramiq.html': '/ai/enneagram/enneagramoutput.html',
                    '/ai/event/eventiq.html': '/ai/event/eventoutput.html',
                    '/ai/newbiz/newbiziq.html': '/ai/newbiz/newbizoutput.html',
                    '/ai/quiz/quiziq.html': '/ai/quiz/quizoutput.html',
                    '/ai/research/researchiq.html': '/ai/research/researchoutput.html',
                    '/ai/social/socialiq.html': '/ai/social/socialoutput.html',
                    '/ai/speculation/speculationiq.html': '/ai/speculation/speculationoutput.html',
                    '/ai/philosophy/philosophyiq.html': '/ai/philosophy/philosophyoutput.html'
                };
                const outUrl = outputMap[lastGridItemUrl];
        
                if (outUrl) {
                    setLocal('lastDataOutUrl', outUrl);
                    loadStoredContent(outUrl);
                } else {
                    dataContainer.innerHTML = `
                        <span class="close-data-container"></span>
                        <span class="data-label">DATA OUT</span>
                        <div class="data-content">No relevant content available</div>
                    `;
                }
            }
        
            const newClose = dataContainer.querySelector('.close-data-container');
            const newLabel = dataContainer.querySelector('.data-label');
        
            if (newClose) {
                newClose.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }
        
            if (newLabel) {
                newLabel.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }
        }
        

        // Listen for grid item selection or output events
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            console.log(`Received promptGridItemSelected event with URL: ${url} (dataout.js)`);

            // Special handling for URLs that have output templates
            const outputMap = {
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieoutput.html',
                '/ai/symptom/symptomiq.html': '/ai/symptom/symptomoutput.html',
                '/ai/book/bookiq.html': '/ai/book/bookoutput.html',
                '/ai/fitness/fitnessiq.html': '/ai/fitness/fitnessoutput.html',
                '/ai/adventure/adventureiq.html': '/ai/adventure/adventureoutput.html',
                '/ai/decision/decisioniq.html': '/ai/decision/decisionoutput.html',
                '/ai/enneagram/enneagramiq.html': '/ai/enneagram/enneagramoutput.html',
                '/ai/event/eventiq.html': '/ai/event/eventoutput.html',
                '/ai/income/income.html': '/ai/income/incomeoutput.html',
                '/ai/quiz/quiziq.html': '/ai/quiz/quizoutput.html',
                '/ai/research/researchiq.html': '/ai/research/researchoutput.html',
                '/ai/social/socialiq.html': '/ai/social/socialoutput.html',
                '/ai/speculation/speculationiq.html': '/ai/speculation/speculationoutput.html',
                '/ai/philosophy/philosophyiq.html': '/ai/philosophy/philosophyoutput.html'
            };

            // Just store the mapping but don't auto-open DataOut 
            // We'll let users manually open it when they want to see output
            const outUrl = outputMap[url];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);

                // Don't automatically open the dataout container for any product
                // (removed the auto-opening logic that was here previously)
            }
        });

        // Listen for API response events from various modules
        document.addEventListener('api-response-received', function (e) {
            console.log('[DataOut] Received api-response-received event (dataout.js):', e.detail);

            // Add debug information
            if (!dataContainer) {
                console.error('[DataOut] ERROR: dataContainer not initialized when event received!');
                return;
            }
            console.log('[DataOut] Current data container state:', dataContainer.dataset.state);

            // Get the module name and corresponding output URL
            const moduleName = e.detail.module;
            const responseType = e.detail.type || 'default';

            // Map of module names to their module-specific output URLs
            const moduleOutputMap = {
                'fitnessiq': '/ai/fitness/fitnessoutput.html',
                'calorieiq': '/ai/calorie/calorieoutput.html',
                'symptomiq': '/ai/symptom/symptomoutput.html',
                'adventureiq': '/ai/adventure/adventureoutput.html',
                'decisioniq': '/ai/decision/decisionoutput.html',
                'enneagramiq': '/ai/enneagram/enneagramoutput.html',
                'eventiq': '/ai/event/eventoutput.html',
                'quiziq': '/ai/quiz/quizoutput.html',
                'researchiq': '/ai/research/researchoutput.html',
                'socialiq': '/ai/social/socialoutput.html',
                'speculationiq': '/ai/speculation/speculationoutput.html',
                'philosophyiq': '/ai/philosophy/philosophyoutput.html'
                // Add more modules as needed
            };

            const outUrl = moduleOutputMap[moduleName];
            if (outUrl) {
                console.log(`[DataOut] Opening data container for ${moduleName} response with URL: ${outUrl}`);
                setLocal('lastDataOutUrl', outUrl);

                // Force toggle data container to show the content
                // This is the fix for the automatic opening issue
                console.log('[DataOut] Forcing data container to open for API response');
                
                // Get reference to the datain container and collapse it first
                const dataInContainer = document.querySelector('.data-container-left');
                if (dataInContainer && dataInContainer.dataset.state === 'expanded') {
                    console.log('[DataOut] Collapsing datain container first');
                    // Create a custom event to trigger datain collapse
                    const collapseDatinEvent = new CustomEvent('collapse-datain-container');
                    document.dispatchEvent(collapseDatinEvent);
                    
                    // Add a small delay to ensure datain collapse animation has started
                    setTimeout(() => {
                        // Now expand the dataout container
                        if (dataContainer.dataset.state !== 'expanded') {
                            console.log('[DataOut] Container not expanded, expanding now...');
                            toggleDataContainer();
                            // Load content after a delay to ensure container is fully ready
                            setTimeout(() => {
                                console.log('[DataOut] Loading content after delay:', outUrl);
                                loadStoredContent(outUrl);
                            }, 300);
                        } else {
                            console.log('[DataOut] Container already expanded, loading content...');
                            loadStoredContent(outUrl);
                        }
                    }, 100);
                } else {
                    // No need to collapse datain, just expand dataout
                    if (dataContainer.dataset.state !== 'expanded') {
                        console.log('[DataOut] Container not expanded, expanding now...');
                        toggleDataContainer();
                        // Load content after a delay to ensure container is fully ready
                        setTimeout(() => {
                            console.log('[DataOut] Loading content after delay:', outUrl);
                            loadStoredContent(outUrl);
                        }, 300);
                    } else {
                        console.log('[DataOut] Container already expanded, loading content...');
                        loadStoredContent(outUrl);
                    }
                }
            } else {
                console.warn(`[DataOut] No output URL mapping found for module: ${moduleName}`);
            }
        });

        // Fallback: Monitor localStorage changes for lastDataOutUrl
        window.addEventListener('storage', function (e) {
            if (e.key === 'lastDataOutUrl' && e.newValue) {
                console.log(`Detected lastDataOutUrl change to: ${e.newValue} (dataout.js)`);
                if (dataContainer.dataset.state !== 'expanded') {
                    toggleDataContainer();
                } else {
                    loadStoredContent(e.newValue);
                }
            }
        });

        document.addEventListener('click', function (e) {
            const isClickInside = dataContainer.contains(e.target);
            // Check if click is on copy button or its modal/toast elements
            const isCopyButton = e.target.closest('#copyButtonContainer, #copyButton, .share-modal-backdrop, .share-modal-content, .share-action-btn') ||
                                e.target.id === 'copyButton' ||
                                e.target.id === 'copyButtonContainer' ||
                                e.target.closest('[id^="toast-"]');
            
            if (!isClickInside && !isCopyButton && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside right data container, collapsing (dataout.js)');
                toggleDataContainer();
            }
        });

        // Restore last state
        const lastState = getLocal('dataOutContainerState') || 'initial';
        if (lastState === 'expanded') {
            toggleDataContainer();
        }
        
        // Swipe functionality has been removed to fix automatic opening issues
    }

    async function initializeApp() {
        // Always initialize the data container regardless of cookie state
        // The cookie check was preventing initialization after consent modals
        initializeDataContainer();

        // Check if data-in is already expanded to adjust z-index appropriately
        const dataInContainer = document.querySelector('.data-container-left');
        if (dataInContainer && dataInContainer.dataset.state === 'expanded') {
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
            console.error('Error initializing right data container (dataout.js):', error);
        }
    }

    initializeApp(); // Always initialize container after consent
});