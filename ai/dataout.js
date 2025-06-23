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

            // Update content - container is always visible at 100% viewport
            dataContainer.innerHTML = `
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
                <div class="data-content">Error loading content: ${error.message}</div>
            `;
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-out')) {
            console.log('Data out container already exists, skipping initialization (dataout.js)');
            dataContainer = document.querySelector('.data-container-out');
            // Load initial content if a lastDataOutUrl exists
            const lastUrl = getLocal('lastDataOutUrl');
            if (lastUrl) {
                loadStoredContent(lastUrl);
            } else {
                 dataContainer.innerHTML = `
                    <div class="data-content">No content loaded yet.</div>
                `;
            }
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Data out container - always 100% viewport, no state management */
            .data-container-out {
                position: fixed;
                top: 0;
                left: 0;
                background-color: #f2f9f3;
                padding: 4px;
                border: 1px solid #4a7c59;
                border-top: none;
                border-radius: 0 0 27px 27px;
                box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
                z-index: 500;
                width: 100%;
                height: 100vh;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                opacity: 1;
            }

            .data-container-out:hover {
                background-color: #eef7f0;
            }

            .data-container-out .data-content {
                padding: 0;
                font-size: 14px;
                height: calc(100vh - 40px);
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                width: 100%;
                margin-top: 30px;
            }

            /* Mobile responsiveness */
            @media (max-width: 480px) {
                .data-container-out {
                    width: 100%;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    right: 0;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                    padding: 0;
                }

                .data-container-out .data-content {
                    font-size: 12px;
                    padding: 0;
                    overflow-x: auto;
                    overflow-y: auto;
                    margin-top: 25px;
                    height: calc(100vh - 25px);
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = 'data-container-out';
        dataContainer.innerHTML = `
            <div class="data-content">No content loaded yet.</div> 
        `;
        document.body.appendChild(dataContainer);
        console.log('Data out container injected - always visible at 100% viewport (dataout.js)');

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
                '/ai/adventure/adventureiq.html': '/ai/adventure/adventureoutput.html',
                '/ai/decision/decisioniq.html': '/ai/decision/decisionoutput.html',
                '/ai/enneagram/enneagramiq.html': '/ai/enneagram/enneagramoutput.html',
                '/ai/event/eventiq.html': '/ai/event/eventoutput.html',
                '/ai/fashion/fashioniq.html': '/ai/fashion/fashionoutput.html',
                '/ai/income/incomeiq.html': '/ai/income/incomeoutput.html',
                '/ai/quiz/quiziq.html': '/ai/quiz/quizoutput.html',
                '/ai/research/researchiq.html': '/ai/research/researchoutput.html',
                '/ai/social/socialiq.html': '/ai/social/socialoutput.html',
                '/ai/speculation/speculationiq.html': '/ai/speculation/speculationoutput.html',
                '/ai/philosophy/philosophyiq.html': '/ai/philosophy/philosophyoutput.html'
            };
            const outUrl = outputMap[url];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                // Load content directly since container is always visible
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
                'calorieiq': '/ai/calorie/calorieoutput.html',
                'symptomiq': '/ai/symptom/symptomoutput.html',
                'adventureiq': '/ai/adventure/adventureoutput.html',
                'decisioniq': '/ai/decision/decisionoutput.html',
                'enneagramiq': '/ai/enneagram/enneagramoutput.html',
                'eventiq': '/ai/event/eventoutput.html',
                'incomeiq': '/ai/income/incomeoutput.html',
                'quiziq': '/ai/quiz/quizoutput.html',
                'researchiq': '/ai/research/researchoutput.html',
                'socialiq': '/ai/social/socialoutput.html',
                'speculationiq': '/ai/speculation/speculationoutput.html',
                'philosophyiq': '/ai/philosophy/philosophyoutput.html',
                'fashioniq': '/ai/fashion/fashionoutput.html'
            };
            const outUrl = moduleOutputMap[moduleName];
            if (outUrl) {
                console.log(`[DataOut] Loading content for ${moduleName} into always-visible container. URL: ${outUrl}`);
                setLocal('lastDataOutUrl', outUrl);
                // Load content directly since container is always visible
                loadStoredContent(outUrl);
            } else {
                console.warn(`[DataOut] No output URL mapping found for module: ${moduleName}`);
            }
        });

        window.addEventListener('storage', function (e) {
            if (e.key === 'lastDataOutUrl' && e.newValue) {
                console.log(`Detected lastDataOutUrl change to: ${e.newValue} (dataout.js)`);
                // Load content directly since container is always visible
                loadStoredContent(e.newValue);
            }
        });

        // REMOVED click listener for document (click outside)
        // REMOVED Restore last state logic (container is always visible)
        // REMOVED Swipe functionality (if any was here)
        
        // Load initial content if a lastDataOutUrl exists from a previous session
        const initialUrl = getLocal('lastDataOutUrl');
        if (initialUrl) {
            console.log('[DataOut] Loading initial content from localStorage:', initialUrl);
            loadStoredContent(initialUrl);
        }
    }

    async function initializeApp() {
        // Always initialize the data container - no state management needed
        initializeDataContainer();

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
            console.error('Error initializing data out container (dataout.js):', error);
        }
    }

    initializeApp(); // Always initialize container - no state management
});