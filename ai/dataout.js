/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';
import { getLocal } from '/utility/getlocal.js';
import { setLocal } from '/utility/setlocal.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    let dataContainer = null;

    async function loadStoredContent(url) {
        try {
            console.log(`Attempting to load stored content from ${url} (dataout.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
            const content = await response.text();
            console.log('Stored content fetched successfully (dataout.js)');

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA OUT</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into dataout container (dataout.js)`);

            dataContainer.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }

                oldScript.replaceWith(newScript);
                console.log("has replaced the old script with the new", newScript)
            });

            // const scriptUrl = url.replace('.html', '.js');
            // try {
            //     const existingScripts = document.querySelectorAll(`script[data-source="${scriptUrl}"]`);
            //     existingScripts.forEach(script => script.remove());
            //     const scriptResponse = await fetch(scriptUrl);
            //     if (!scriptResponse.ok) throw new Error(`Failed to fetch script ${scriptUrl}`);
            //     const scriptContent = await scriptResponse.text();
            //     const script = document.createElement('script');
            //     script.textContent = scriptContent;
            //     script.dataset.source = scriptUrl;
            //     document.body.appendChild(script);
            //     console.log(`Loaded and executed script: ${scriptUrl} (dataout.js)`);

            //     // Re-initialize grid items after content load
            //     initializeGridItems();
            // } catch (error) {
            //     console.error(`Error loading script ${scriptUrl}, skipping (dataout.js):`, error);
            // }
        } catch (error) {
            console.error(`Error loading stored content (dataout.js):`, error);
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <span class="data-label">DATA OUT</span>
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
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-right: none;
                border-radius: 8px 0 0 8px;
                box-shadow: -4px 4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-right.initial, .data-container-right.collapsed {
                max-width: 36px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }

            .data-container-right.expanded {
                max-width: 85%;
                min-width: 25%;
                height: calc(100vh - 100px);
                /* Keep the centered positioning instead of fixed top */
                top: 50%;
                transform: translateY(-50%);
                z-index: 11000; /* Higher z-index when expanded to appear over grid */
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
                writing-mode: vertical-rl;
                text-orientation: mixed;
            }

            .data-container-right .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: calc(100vh - 80px);
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
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
                    max-width: 85%;
                    min-width: 25%;
                    height: calc(100vh - 20px);
                    top: 10px;
                }

                .data-container-right .data-label {
                    font-size: 10px;
                    padding: 3px;
                }

                .data-container-right .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-right .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-right initial`;
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA OUT</span>
        `;
        document.body.appendChild(dataContainer);
        console.log('Right data container injected with state: initial (dataout.js)');

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
            if (!dataContainer) return;
            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                setLocal('dataOutContainerState', 'initial');
                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">DATA OUT</span>
                `;
                console.log('Right data container collapsed and reset (dataout.js)');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataOutContainerState', 'expanded');
                console.log('Right data container expanded (dataout.js)');

                const lastGridItemUrl = getLocal('lastGridItemUrl');
                const outputMap = {
                    '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                    '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                    '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq',
                    '/ai/fitness/fitnessiq.html': '/ai/apioutput.html?gridItem=fitnessiq',
                    '/ai/adventure/adventureiq.html': '/apioutput.html?gridItem=adventureiq'
                };
                const outUrl = outputMap[lastGridItemUrl];

                if (outUrl) {
                    setLocal('lastDataOutUrl', outUrl);
                    loadStoredContent(outUrl);
                } else {
                    dataContainer.innerHTML = `
                        <span class="close-data-container">-</span>
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
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq',
                '/ai/fitness/fitnessiq.html': '/ai/apioutput.html?gridItem=fitnessiq',
                '/ai/adventure/adventureiq.html': '/apioutput.html?gridItem=adventureiq'
            };
            
            // Just store the mapping but don't auto-open DataOut for CalorieIQ specifically
            const outUrl = outputMap[url];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                
                // Only auto-open for items other than CalorieIQ
                if (url !== '/ai/calorie/calorieiq.html') {
                    if (dataContainer.dataset.state !== 'expanded') {
                        toggleDataContainer();
                    } else {
                        loadStoredContent(outUrl);
                    }
                }
            }
        });

        // Listen for API response events from various modules
        document.addEventListener('api-response-received', function (e) {
            console.log('Received api-response-received event (dataout.js):', e.detail);
            
            // Get the module name and corresponding output URL
            const moduleName = e.detail.module;
            const responseType = e.detail.type || 'default';
            
            // Map of module names to their output URLs
            const moduleOutputMap = {
                'fitnessiq': '/ai/apioutput.html?gridItem=fitnessiq',
                'calorieiq': '/ai/calorie/calorieiqout.html',
                'symptomiq': '/ai/apioutput.html?gridItem=symptomiq',
                'bookiq': '/ai/apioutput.html?gridItem=bookiq',
                'adventureiq': '/apioutput.html?gridItem=adventureiq'
                // Add more modules as needed
            };
            
            const outUrl = moduleOutputMap[moduleName];
            if (outUrl) {
                console.log(`Opening data container for ${moduleName} response with URL: ${outUrl}`);
                setLocal('lastDataOutUrl', outUrl);
                
                // Toggle data container if it's not already expanded
                if (dataContainer.dataset.state !== 'expanded') {
                    toggleDataContainer();
                } else {
                    loadStoredContent(outUrl);
                }
            } else {
                console.warn(`No output URL mapping found for module: ${moduleName}`);
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
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside right data container, collapsing (dataout.js)');
                toggleDataContainer();
            }
        });

        // Restore last state
        const lastState = getLocal('dataOutContainerState') || 'initial';
        if (lastState === 'expanded') {
            toggleDataContainer();
        }
    }

    try {
        if (!isCookieExpired) {
            initializeDataContainer();
        }
    } catch (error) {
        console.error('Error initializing right data container (dataout.js):', error);
    }
});