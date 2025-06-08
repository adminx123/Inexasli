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

    async function loadStoredContent(url) {
        if (!dataContainer) {
            console.error('[DataOut] loadStoredContent called before dataContainer is initialized.');
            return;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
            const content = await response.text();

            // Ensure container is in the expanded state visually
            dataContainer.classList.remove('initial'); // Ensure 'initial' is removed if it was ever set
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded'; // Keep state for CSS and potential future logic
            // No need to setLocal for 'dataOutContainerState' as it's always expanded

            dataContainer.innerHTML = `
                <span class="data-label">DATA OUT</span> 
                <div class="data-content">${content}</div>
            `;
            // Removed close-data-container span

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
                <span class="data-label">DATA OUT</span>
                <div class="data-content">Error loading content: ${error.message}</div>
            `;
            // Removed close-data-container span
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-out')) {
            console.log('Data out container already exists, skipping initialization (dataout.js)');
            dataContainer = document.querySelector('.data-container-out'); // Assign existing
            // Ensure it's in the correct state if re-initializing somehow
            dataContainer.className = 'data-container-out expanded';
            dataContainer.dataset.state = 'expanded';
            // Load initial content if a lastDataOutUrl exists
            const lastUrl = getLocal('lastDataOutUrl');
            if (lastUrl) {
                loadStoredContent(lastUrl);
            } else {
                 dataContainer.innerHTML = `
                    <span class="data-label">DATA OUT</span>
                    <div class="data-content">No content loaded yet.</div>
                `;
            }
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Data out container specific styling */
            .data-container-out {
                position: fixed;
                top: 0;
                left: 0; /* Changed from 50% */
                transform: none; /* Changed from translateX(-50%) */
                background-color: #f2f9f3;
                padding: 4px;
                border: 1px solid #4a7c59;
                border-top: none;
                border-radius: 0 0 27px 27px;
                box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
                z-index: 500; /* Adjusted z-index if needed, ensure it's below datain when datain is active */
                width: 100%; /* Always full width */
                min-height: 50vh; /* Minimum 50% of viewport height */
                max-height: 98vh; /* Maximum 98% of viewport height */
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
                /* Removed transition as it's always open */
            }

            /* REMOVED .initial and .collapsed styles as they are no longer needed */

            .data-container-out.expanded { /* This is now the default and only state */
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                min-height: 50vh; 
                max-height: 98vh; 
                top: 0;
                left: 0;
                transform: none;
                border: 1px solid #4a7c59; 
                border-top: none; 
                border-radius: 0 0 27px 27px; 
                box-shadow: 0 2px 6px rgba(74, 124, 89, 0.25); 
                padding: 4px; 
            }

            .data-container-out:hover {
                background-color: #eef7f0; /* Keep hover effect if desired */
            }

            /* REMOVED .close-data-container styles as it's removed */
            
            .data-container-out .data-label {
                text-decoration: none;
                color: #000;
                font-size: 12px; /* Adjusted from expanded specific */
                display: flex;
                justify-content: center;
                text-align: center;
                padding: 4px;
                /* cursor: pointer; REMOVED - no longer clickable to toggle */
                transition: color 0.2s ease;
                line-height: 1.2;
                font-family: "Geist", sans-serif;
                writing-mode: horizontal-tb; /* Keep as is */
                text-orientation: mixed; /* Keep as is */
                position: absolute; /* To position it like before in expanded state */
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f5f5f5;
                border-radius: 4px;
            }
            
            /* REMOVED .data-container-out.expanded .data-label as it's merged above */

            .data-container-out .data-content {
                padding: 0;
                font-size: 14px;
                min-height: calc(50vh - 40px); 
                max-height: calc(98vh - 40px); 
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                width: 100%;
                max-width: 100%;
                margin-top: 30px; /* To clear the data-label */
            }

            /* Mobile responsiveness for data out container */
            @media (max-width: 480px) {
                .data-container-out { /* Simplified, as it's always expanded */
                    max-width: 100%;
                    width: 100%;
                    min-width: 100%;
                    min-height: 90vh; 
                    max-height: 95vh; 
                    top: 0;
                    left:0; /* ensure it takes full width */
                    right: 0;
                    transform: none;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    padding: 0;
                }

                /* REMOVED .initial, .collapsed mobile styles */

                .data-container-out .data-label { /* Adjusted from expanded specific */
                    font-size: 16px;
                    padding: 4px;
                }
                
                /* REMOVED .close-data-container mobile styles */

                .data-container-out .data-content {
                    font-size: 12px;
                    padding: 0;
                    overflow-x: auto;
                    overflow-y: auto;
                    margin-top: 25px; /* To clear data-label */
                    min-height: calc(90vh - 25px); 
                    max-height: calc(95vh - 25px); 
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        // Set to expanded state directly
        dataContainer.className = 'data-container-out expanded'; 
        dataContainer.dataset.state = 'expanded';
        dataContainer.innerHTML = `
            <span class="data-label">DATA OUT</span>
            <div class="data-content">Initializing Data Out...</div> 
        `;
        document.body.appendChild(dataContainer);
        console.log('Data out container injected and set to always expanded (dataout.js)');

        // REMOVED click listeners for container, close button, and data label for toggling
        // REMOVED initializeGridItems function as it seems unrelated to dataout toggling
        // REMOVED toggleDataContainer function entirely

        // Listen for grid item selection or output events
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            console.log(`Received promptGridItemSelected event with URL: ${url} (dataout.js)`);
            const outputMap = {
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieoutput.html',
                '/ai/symptom/symptomiq.html': '/ai/symptom/symptomoutput.html',
                '/ai/book/bookiq.html': '/ai/book/bookoutput.html',
                '/ai/fitness/fitnessiq.html': '/ai/fitness/fitnessoutput.html',
                '/ai/adventure/adventureiq.html': '/ai/adventure/adventureoutput.html',
                '/ai/decision/decisioniq.html': '/ai/decision/decisionoutput.html',
                '/ai/enneagram/enneagramiq.html': '/ai/enneagram/enneagramoutput.html',
                '/ai/event/eventiq.html': '/ai/event/eventoutput.html',
                '/ai/income/incomeiq.html': '/ai/income/incomeoutput.html',
                '/ai/newbiz/newbiziq.html': '/ai/newbiz/newbizoutput.html',
                '/ai/quiz/quiziq.html': '/ai/quiz/quizoutput.html',
                '/ai/research/researchiq.html': '/ai/research/researchoutput.html',
                '/ai/social/socialiq.html': '/ai/social/socialoutput.html',
                '/ai/speculation/speculationiq.html': '/ai/speculation/speculationoutput.html',
                '/ai/philosophy/philosophyiq.html': '/ai/philosophy/philosophyoutput.html'
            };
            const outUrl = outputMap[url];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                // Directly load content when a new product is selected
                console.log(`[DataOut] Product switched. Loading content for: ${outUrl}`);
                loadStoredContent(outUrl); 
            } else {
                console.warn(`[DataOut] No output URL mapping found in promptGridItemSelected for URL: ${url}`);
            }
        });

        document.addEventListener('api-response-received', function (e) {
            console.log('[DataOut] Received api-response-received event (dataout.js):', e.detail);
            if (!dataContainer) {
                console.error('[DataOut] ERROR: dataContainer not initialized when event received!');
                return;
            }
            const moduleName = e.detail.module;
            const moduleOutputMap = {
                'fitnessiq': '/ai/fitness/fitnessoutput.html',
                'calorieiq': '/ai/calorie/calorieoutput.html',
                'symptomiq': '/ai/symptom/symptomoutput.html',
                'adventureiq': '/ai/adventure/adventureoutput.html',
                'decisioniq': '/ai/decision/decisionoutput.html',
                'enneagramiq': '/ai/enneagram/enneagramoutput.html',
                'eventiq': '/ai/event/eventoutput.html',
                'incomeiq': '/ai/income/incomeoutput.html',
                'newbiziq': '/ai/newbiz/newbizoutput.html', // Added newbiziq
                'quiziq': '/ai/quiz/quizoutput.html',
                'researchiq': '/ai/research/researchoutput.html',
                'socialiq': '/ai/social/socialoutput.html',
                'speculationiq': '/ai/speculation/speculationoutput.html',
                'philosophyiq': '/ai/philosophy/philosophyoutput.html'
            };
            const outUrl = moduleOutputMap[moduleName];
            if (outUrl) {
                console.log(`[DataOut] Loading content for ${moduleName} into always-open container. URL: ${outUrl}`);
                setLocal('lastDataOutUrl', outUrl);
                
                const dataInContainer = document.querySelector('.data-container-in');
                if (dataInContainer && dataInContainer.dataset.state === 'expanded') {
                    console.log('[DataOut] Collapsing datain container first');
                    const collapseDatinEvent = new CustomEvent('collapse-datain-container');
                    document.dispatchEvent(collapseDatinEvent);
                    
                    setTimeout(() => {
                        loadStoredContent(outUrl);
                    }, 100); // Delay to allow datain to collapse
                } else {
                    loadStoredContent(outUrl);
                }
            } else {
                console.warn(`[DataOut] No output URL mapping found for module: ${moduleName}`);
            }
        });

        window.addEventListener('storage', function (e) {
            if (e.key === 'lastDataOutUrl' && e.newValue) {
                console.log(`Detected lastDataOutUrl change to: ${e.newValue} (dataout.js)`);
                // Since dataContainer is always open, just load the new content.
                loadStoredContent(e.newValue);
            }
        });

        // REMOVED click listener for document (click outside)
        // REMOVED Restore last state logic (it's always expanded)
        // REMOVED Swipe functionality (if any was here)
        
        // Load initial content if a lastDataOutUrl exists from a previous session
        const initialUrl = getLocal('lastDataOutUrl');
        if (initialUrl) {
            console.log('[DataOut] Loading initial content from localStorage:', initialUrl);
            loadStoredContent(initialUrl);
        } else {
            // Optionally, load a default page or show a default message
             if(dataContainer && dataContainer.querySelector('.data-content')) {
                dataContainer.querySelector('.data-content').innerHTML = 'No data loaded yet. Select a module to see output.';
             }
        }
    }

    async function initializeApp() {
        // Always initialize the data container regardless of cookie state
        // The cookie check was preventing initialization after consent modals
        initializeDataContainer();

        // REMOVED: Check if data-in is already expanded to adjust z-index appropriately
        // const dataInContainer = document.querySelector('.data-container-in');
        // if (dataInContainer && dataInContainer.dataset.state === 'expanded') {
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
            console.error('Error initializing right data container (dataout.js):', error);
        }
    }

    initializeApp(); // Always initialize container after consent
});