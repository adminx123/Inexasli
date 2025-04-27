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
const storedFormData = JSON.parse(localStorage.getItem("calorieIqFormData"));

document.addEventListener('DOMContentLoaded', async function () {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    let dataContainer = null;

    async function loadStoredContent(url) {
        try {
            console.log(`Attempting to load stored content from ${url} (datain.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (datain.js)');

            // Inject content into the container
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <span class="data-label">DATA IN</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into datain container (datain.js)`);

            // Load and execute corresponding JS file
            const scriptUrl = url.replace('.html', '.js');
            try {
                // Remove existing script to prevent duplicates
                const existingScripts = document.querySelectorAll(`script[data-source="${scriptUrl}"]`);
                existingScripts.forEach(script => script.remove());

                const scriptResponse = await fetch(scriptUrl);
                if (!scriptResponse.ok) throw new Error(`Failed to fetch script ${scriptUrl}`);

                const scriptContent = await scriptResponse.text();
                const script = document.createElement('script');
                script.textContent = scriptContent;
                script.dataset.source = scriptUrl; // Tag script for identification
                document.body.appendChild(script);
                console.log(`Loaded and executed script: ${scriptUrl} (datain.js)`);

                // Re-initialize grid items after content load
                initializeGridItems();
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (datain.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (datain.js):`, error);
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <span class="data-label">DATA IN</span>
                <div class="data-content">Error loading content: ${error.message}</div>
            `;
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-left')) {
            console.log('Left data container already exists, skipping initialization (datain.js)');
            return;
        }

const style = document.createElement('style');
style.textContent = `
    /* Left container specific styling */
    .data-container-left {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        background-color: #f5f5f5;
        padding: 4px;
        border: 2px solid #000;
        border-left: none;
        border-radius: 0 8px 8px 0;
        box-shadow: 4px 4px 0 #000;
        z-index: 10000;
        max-width: 34px;
        min-height: 30px;
        transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
        overflow: hidden;
        font-family: "Inter", sans-serif;
        visibility: visible;
        opacity: 1;
    }

    .data-container-left.collapsed {
        height: 150px;
    }

    .data-container-left.expanded {
        max-width: 85%;
        min-width: 25%;
        height: auto;   
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
    }

    .data-container-left .data-label {
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

    .data-container-left .data-content {
        padding: 10px;
        font-size: 14px;
        max-height: 80vh;
        overflow-y: auto;
        overflow-x: auto;
        font-family: "Inter", sans-serif;
        max-width: 100%;
    }

    /* Mobile responsiveness for left container */
    @media (max-width: 480px) {
        .data-container-left {
            max-width: 28px;
            padding: 3px;
        }

        .data-container-left.collapsed {
            height: 125px !important;
        }

        .data-container-left.expanded {
            max-width: 85%;
            min-width: 25%;
        }

        .data-container-left .data-label {
            font-size: 14px;
            padding: 3px;
        }

        .data-container-left .close-data-container {
            font-size: 12px;
            padding: 4px;
        }

        .data-container-left .data-content {
            font-size: 12px;
            padding: 8px;
            overflow-x: auto;
        }
    }
`;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-left initial`;
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container"></span>
            <span class="data-label">DATA IN</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Left data container injected with state: initial (datain.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Left close button not found (datain.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Left data label not found (datain.js)');
        }

        function initializeGridItems() {
<<<<<<< HEAD
            document.querySelectorAll('.grid-container .grid-item').forEach(item => {
                if (!item.dataset.value) {
                    console.warn('Grid item is missing data-value attribute:', item);
                    return; 
                }
        
=======
            const gridItems = document.querySelectorAll('.grid-container .grid-item');
            gridItems.forEach(item => {
>>>>>>> 69f2bb524407a481d10773e5405155eb3a41ec95
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
                setLocal('dataContainerState', 'initial');
                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">DATA IN</span>
                `;
                console.log('Left data container collapsed and reset (datain.js)');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataContainerState', 'expanded');
                console.log('Left data container expanded (datain.js)');

                const storedUrl = getLocal('lastGridItemUrl');
                if (storedUrl) {
                    loadStoredContent(storedUrl);
                } else {
                    dataContainer.innerHTML = `
                        <span class="close-data-container">-</span>
                        <span class="data-label">DATA IN</span>
                        <div class="data-content">No content selected. Please select a grid item.</div>
                    `;
                }
<<<<<<< HEAD

                // Initialize grid items after expansion
                initializeGridItems();
        
                if (storedFormData) {
                    populateIn(storedFormData);
                }
=======
>>>>>>> 69f2bb524407a481d10773e5405155eb3a41ec95
            }

            // Re-bind toggle listeners
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

        // Listen for grid item selection events from promptgrid.js
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            console.log(`Received promptGridItemSelected event with URL: ${url} (datain.js)`);
            setLocal('lastGridItemUrl', url);
            if (dataContainer.dataset.state !== 'expanded') {
                toggleDataContainer();
            } else {
                loadStoredContent(url);
            }
        });

        // Fallback: Monitor localStorage changes for lastGridItemUrl
        window.addEventListener('storage', function (e) {
            if (e.key === 'lastGridItemUrl' && e.newValue) {
                console.log(`Detected lastGridItemUrl change to: ${e.newValue} (datain.js)`);
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
                console.log('Clicked outside left data container, collapsing (datain.js)');
                toggleDataContainer();
            }
        });
    }

    try {
        if (!isCookieExpired) {
            initializeDataContainer();
        }
    } catch (error) {
        console.error('Error initializing left data container (datain.js):', error);
    }
    if (storedFormData) {
        // console.log('stored formdata ', storedFormData)
        populateIn(storedFormData);
        
    } else {
        // console.log('no stored formdata ')
        
    }
});
        async function populateIn(storedFormData) {
            // console.log("Propagating stored form data into input fields, selects, and grid items.");
        
            async function waitForElement(selector) {
                let tries = 0;
                return new Promise((resolve, reject) => {
                    const attempt = () => {
                        const el = document.querySelector(selector);
                        if (el) {
                            resolve(el);
                        } else {
                            tries++;
                            if (tries > 50) {
                                reject(new Error(`Element not found after waiting: ${selector}`));
                                return;
                            }
                            setTimeout(attempt, 100);
                        }
                    };
                    attempt();
                });
            }
        
            if (storedFormData.goals && Array.isArray(storedFormData.goals)) {
                for (const goal of storedFormData.goals) {
                    try {
                        const goalElement = await waitForElement(`#calorie-goal .grid-item[data-value="${goal}"]`);
                        goalElement.classList.add('selected');
                        // console.log(`Goal selected: ${goal}`);
                    } catch (error) {
                        console.warn(`Goal element not found for value: ${goal}`);
                    }
                }
            }
        
            if (storedFormData.activityLevel) {
                try {
                    const activityElement = await waitForElement(`#calorie-activity .grid-item[data-value="${storedFormData.activityLevel}"]`);
                    activityElement.classList.add('selected');
                    // console.log(`Activity level selected: ${storedFormData.activityLevel}`);
                } catch (error) {
                    console.warn(`Activity level element not found for value: ${storedFormData.activityLevel}`);
                }
            }
        
            if (storedFormData.needMealRecommendation) {
                try {
                    const mealRecommendationElement = await waitForElement(`#calorie-recommendations .grid-item[data-value="Meal Recommendations"]`);
                    mealRecommendationElement.classList.add('selected');
                    // console.log("Meal recommendation selected.");
                } catch (error) {
                    console.warn("Meal recommendation element not found.");
                }
            }
        
            // Populate diet restriction (single grid item)
            if (storedFormData.dietRestriction) {
                try {
                    const dietElement = await waitForElement(`#calorie-diet-type .grid-item[data-value="${storedFormData.dietRestriction}"]`);
                    dietElement.classList.add('selected');
                    // console.log(`Diet restriction selected: ${storedFormData.dietRestriction}`);
                } catch (error) {
                    console.warn(`Diet restriction element not found for value: ${storedFormData.dietRestriction}`);
                }
            }
        
            // Populate age
            if (storedFormData.age) {
                try {
                    const ageInput = await waitForElement('#calorie-age');
                    ageInput.value = storedFormData.age;
                    // console.log(`Age populated: ${storedFormData.age}`);
                } catch (error) {
                    console.warn("Age input element not found.");
                }
            }
        
            if (storedFormData.height) {
                try {
                    const heightInput = await waitForElement('#calorie-height');
                    heightInput.value = storedFormData.height;
                    // console.log(`Height populated: ${storedFormData.height}`);
                } catch (error) {
                    console.warn("Height input element not found.");
                }
            }
        
            if (storedFormData.weight) {
                try {
                    const weightInput = await waitForElement('#calorie-weight');
                    const weightUnitInput = await waitForElement('#calorie-weight-unit');
                    weightInput.value = storedFormData.weight.weight;
                    weightUnitInput.value = storedFormData.weight.unit;
                    // console.log(`Weight populated: ${storedFormData.weight.weight} ${storedFormData.weight.unit}`);
                } catch (error) {
                    console.warn("Weight input or unit element not found.");
                }
            }
        
            if (storedFormData.sex) {
                try {
                    const sexInput = await waitForElement('#calorie-measure');
                    sexInput.value = storedFormData.sex;
                    // console.log(`Sex populated: ${storedFormData.sex}`);
                } catch (error) {
                    console.warn("Sex input element not found.");
                }
            }
        
            if (storedFormData.foodLog) {
                try {
                    const foodLogInput = await waitForElement('#calorie-food-log');
                    foodLogInput.value = storedFormData.foodLog;
                    // console.log(`Food log populated: ${storedFormData.foodLog}`);
                } catch (error) {
                    console.warn("Food log input element not found.");
                }
            }
        
            console.log("Form data propagation completed.");
        }