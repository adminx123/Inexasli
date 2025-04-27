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
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000;
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    async function loadStoredContent(dataContainer, url) {
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
                }
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (dataout.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (dataout.js):`, error);
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA OUT</span>
                <div class="data-content">Error loading content</div>
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
            .data-container-right.collapsed { height: 120px; }
            .data-container-right.expanded { max-width: 85%; min-width: 25%; height: auto; }
            .data-container-right:hover { background-color: rgb(255, 255, 255); }
            .data-container-right .close-data-container {
                position: absolute;
                top: 4px;
                right: 10px;
                left: auto;
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
            .api-output-container {
                position: relative;
                display: inline-block;
                max-width: 100%;
            }
            .api-output {
                display: block;
                background-color: #f5f5f5;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                white-space: pre-wrap;
                max-height: 300px;
                overflow-y: auto;
                font-family: "Inter", sans-serif;
                font-size: 14px;
            }
            .copy-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: #e0e0e0;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                cursor: pointer;
                font-size: 12px;
                font-family: "Geist", sans-serif;
            }
            .copy-btn:hover { background-color: #d0d0d0; }
            @media (max-width: 480px) {
                .data-container-right { max-width: 28px; padding: 3px; }
                .data-container-right.collapsed { height: 100px; }
                .data-container-right.expanded { max-width: 85%; min-width: 25%; }
                .data-container-right .data-label { font-size: 14px; padding: 3px; }
                .data-container-right .close-data-container { font-size: 12px; padding: 4px; }
                .data-container-right .data-content { font-size: 12px; padding: 8px; overflow-x: auto; }
            }
        `;
        document.head.appendChild(style);

        const lastState = getLocal('dataOutContainerState') || 'initial';
        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-right ${lastState}`;
        dataContainer.dataset.state = lastState;
        dataContainer.innerHTML = `
            <span class="close-data-container">${lastState === 'expanded' ? '-' : '+'}</span>
            <span class="data-label">DATA OUT</span>
        `;
        document.body.appendChild(dataContainer);
        console.log('Right data container injected with state:', lastState, '(dataout.js)');

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

                const lastGridItemUrl = getLocal('lastGridItemUrl');
                let outUrl;
                
                // Map grid item URLs to output URLs
                const outputMap = {
                    '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                    '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                    '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq' // Example for future grid item
                    // Add more mappings as needed
                };

                outUrl = outputMap[lastGridItemUrl];
                
                if (outUrl) {
                    setLocal('lastDataOutUrl', outUrl);
                    loadStoredContent(dataContainer, outUrl);
                } else {
                    dataContainer.innerHTML = `
                        <span class="close-data-container">-</span>
                        <span class="data-label">DATA OUT</span>
                        <div class="data-content">No relevant content available</div>
                    `;
                }
                console.log('Right data container expanded (dataout.js)');
                populate()
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

        document.addEventListener('click', function (e) {
            const isClickInside = dataContainer.contains(e.target);
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside right data container, collapsing (dataout.js)');
                toggleDataContainer();
            }
        });

        if (lastState === 'expanded') {
            const lastGridItemUrl = getLocal('lastGridItemUrl');
            const outputMap = {
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq'
            };
            const outUrl = outputMap[lastGridItemUrl];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                loadStoredContent(dataContainer, outUrl);
            } else {
                dataContainer.innerHTML = `
                    <span class="close-data-container">-</span>
                    <span class="data-label">DATA OUT</span>
                    <div class="data-content">No relevant content available</div>
                `;
            }
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