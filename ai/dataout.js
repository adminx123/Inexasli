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
                <span class="close-data-container"></span>
                <span class="data-label">DATA OUT</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into dataout container (dataout.js)`);

            const scriptUrl = url.replace('.html', '.js');
            try {
                const existingScripts = document.querySelectorAll(`script[data-source="${scriptUrl}"]`);
                existingScripts.forEach(script => script.remove());
                const scriptResponse = await fetch(scriptUrl);
                if (scriptResponse.ok) {
                    const scriptContent = await scriptResponse.text();
                    const script = document.createElement('script');
                    script.textContent = scriptContent;
                    script.dataset.source = scriptUrl;
                    document.body.appendChild(script);
                    console.log(`Loaded and executed script: ${scriptUrl} (dataout.js)`);

                    // Re-initialize grid items after content load
                    initializeGridItems();
                }
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (dataout.js):`, error);
            }
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
                transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-right.collapsed {
                height: 150px !important;
            }

            .data-container-right.expanded {
                max-width: 85%;
                min-width: 25%;
                height: auto;
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
                max-height: 80vh;
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
            }

            /* Mobile responsiveness for right container */
            @media (max-width: 480px) {
                .data-container-right {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-right.collapsed {
                    height: 125px !important;
                }

                .data-container-right.expanded {
                    max-width: 85%;
                    min-width: 25%;
                }

                .data-container-right .data-label {
                    font-size: 14px;
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
                    '/ai/adventure/adventure.html': '/ai/adventure/adventureiqout.html'
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
<<<<<<< HEAD
                console.log('Right data container expanded (dataout.js)');
                populate()
=======
>>>>>>> 69f2bb524407a481d10773e5405155eb3a41ec95
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
            const outputMap = {
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq',
                '/ai/adventure/adventure.html': '/ai/adventure/adventureiqout.html'
            };
            const outUrl = outputMap[url];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                if (dataContainer.dataset.state !== 'expanded') {
                    toggleDataContainer();
                } else {
                    loadStoredContent(outUrl);
                }
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
  populate()
});

function waitForElement(selector) {
    let tries = 0;
    return new Promise((resolve, reject) => {
      const attempt = () => {
        const el = document.querySelector(selector);
        if (el) {
        //   console.log(`Element found: ${selector}`);
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
  
  async function findAllElements() {
   
  
    const entries = await Promise.all(
      Object.entries(spanSelectors2).map(async ([key, selector]) => {
        const element = await waitForElement(selector);
        return [key, element];
      })
    );
  
    const elements = Object.fromEntries(entries);
    return elements;
  }


  const spanSelectors2 = {
    caloriesTarget: '#calories-target',
    caloriesIntake: '#calories-intake',
    caloriesPercent: '#calories-percent',
    proteinTarget: '#protein-target',
    proteinIntake: '#protein-intake',
    proteinPercent: '#protein-percent',
    carbsTarget: '#carbs-target',
    carbsIntake: '#carbs-intake',
    carbsPercent: '#carbs-percent',
    fatTarget: '#fat-target',
    fatIntake: '#fat-intake',
    fatPercent: '#fat-percent',
    fiberTarget: '#fiber-target',
    fiberIntake: '#fiber-intake',
    fiberPercent: '#fiber-percent',
    vitaminDTarget: '#vitaminD-target',
    vitaminDIntake: '#vitaminD-intake',
    vitaminDPercent: '#vitaminD-percent',
    ironTarget: '#iron-target',
    ironIntake: '#iron-intake',
    ironPercent: '#iron-percent',
    calciumTarget: '#calcium-target',
    calciumIntake: '#calcium-intake',
    calciumPercent: '#calcium-percent',
    mealRecommendation: '#meal-recommendation',
    bmi: '#BMI'
  };

  function populate() {

    console.log('trying to load saved data');

    if (localStorage.getItem('calorieIqResponse')) {
        console.log('saved data found')
        const data = JSON.parse(localStorage.getItem('calorieIqResponse'));
        console.log('data', data)
        
        async function populateValues() {
            console.log("populate data started")
            
            const spans = await findAllElements();
            
            // Populate the spans with data
            spans.caloriesTarget.innerText = data.data.nutritionTable[0].targetAmount.trim();
            spans.caloriesIntake.innerText = data.data.nutritionTable[0].intake.trim();
            spans.caloriesPercent.innerText = data.data.nutritionTable[0].percentReached.trim();
            spans.proteinTarget.innerText = data.data.nutritionTable[1].targetAmount.trim();
            spans.proteinIntake.innerText = data.data.nutritionTable[1].intake.trim();
            spans.proteinPercent.innerText = data.data.nutritionTable[1].percentReached.trim();
            spans.carbsTarget.innerText = data.data.nutritionTable[2].targetAmount.trim();
            spans.carbsIntake.innerText = data.data.nutritionTable[2].intake.trim();
            spans.carbsPercent.innerText = data.data.nutritionTable[2].percentReached.trim();
            spans.fatTarget.innerText = data.data.nutritionTable[3].targetAmount.trim();
            spans.fatIntake.innerText = data.data.nutritionTable[3].intake.trim();
            spans.fatPercent.innerText = data.data.nutritionTable[3].percentReached.trim();
            spans.fiberTarget.innerText = data.data.nutritionTable[4].targetAmount.trim();
            spans.fiberIntake.innerText = data.data.nutritionTable[4].intake.trim();
            spans.fiberPercent.innerText = data.data.nutritionTable[4].percentReached.trim();
            spans.vitaminDTarget.innerText = data.data.nutritionTable[5].targetAmount.trim();
            spans.vitaminDIntake.innerText = data.data.nutritionTable[5].intake.trim();
            spans.vitaminDPercent.innerText = data.data.nutritionTable[5].percentReached.trim();
            spans.ironTarget.innerText = data.data.nutritionTable[6].targetAmount.trim();
            spans.ironIntake.innerText = data.data.nutritionTable[6].intake.trim();
            spans.ironPercent.innerText = data.data.nutritionTable[6].percentReached.trim();
            spans.calciumTarget.innerText = data.data.nutritionTable[7].targetAmount.trim();
            spans.calciumIntake.innerText = data.data.nutritionTable[7].intake.trim();
            spans.calciumPercent.innerText = data.data.nutritionTable[7].percentReached.trim();
            spans.mealRecommendation.innerText = data?.data?.mealRecommendations?.trim() ?? '';
            spans.bmi.innerText = data.data.metrics.bmi.trim();

            console.log('populate successfull');
            
        }

        populateValues()


    } else {
        console.log("saved data does not exist")
    }
}