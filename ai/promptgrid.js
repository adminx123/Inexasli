/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent 
 * of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';
import { setLocal } from '/utility/setlocal.js'; // Added import for setLocal

document.addEventListener('DOMContentLoaded', async function() {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    // Categorization of grid items by tab
    const itemCategories = {
        'dataanalysis': ['BookIQ', 'CalorieIQ', 'ReceiptsIQ', 'ResearchIQ', 'EmotionIQ'],
        'reportgeneration': ['EnneagramIQ', 'SocialIQ', 'ReportIQ', 'SymptomIQ'],
        'planningandforecasting': ['AdventureIQ', 'EventIQ', 'FitnessIQ', 'IncomeIQ', 'NewBizIQ'],
        'creative': ['AdAgencyIQ', 'QuizIQ'],
        'decision': ['DecisionIQ'],
        'workflow': ['App', 'WorkflowIQ'],
        'educational': ['General']
    };

    // Function to filter grid items by category
    function filterGridItems(category) {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            let itemText = item.textContent.split(/<hr>|Premium/)[0].trim().replace(/™/g, '');
            if (category === 'all' || itemCategories[category]?.includes(itemText)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Define togglePromptContainer before loadContent
    function togglePromptContainer() {
        const promptContainer = document.querySelector('.prompt-container');
        if (!promptContainer) return;
        if (promptContainer.dataset.state === 'initial') {
            promptContainer.className = 'prompt-container expanded';
            promptContainer.dataset.state = 'expanded';
            console.log('Prompt container expanded (promptgrid.js)');
        } else {
            promptContainer.className = 'prompt-container initial';
            promptContainer.dataset.state = 'initial';
            console.log('Prompt container returned to initial state (promptgrid.js)');
        }
    }

    // Function to load content into datain container
    async function loadContent(url) {
        try {
            console.log(`Attempting to load content from ${url} (promptgrid.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Content fetched successfully (promptgrid.js)');

            const dataContainer = document.querySelector('.data-container-left');
            if (!dataContainer) {
                console.error('Data container (.data-container-left) not found. Ensure datain.js is loaded and initialized (promptgrid.js)');
                return;
            }

            // Collapse the prompt container if expanded
            const promptContainer = document.querySelector('.prompt-container');
            if (promptContainer && promptContainer.dataset.state === 'expanded') {
                togglePromptContainer();
                console.log('Prompt container collapsed (promptgrid.js)');
                // Wait for collapse animation (300ms matches CSS transition)
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Force reinitialization of datain container if needed
            if (!dataContainer.classList.contains('initial') && !dataContainer.classList.contains('expanded')) {
                console.warn('Data container in unknown state, reinitializing (promptgrid.js)');
                dataContainer.className = 'data-container-left initial';
                dataContainer.dataset.state = 'initial';
            }

            // Expand the datain container
            if (dataContainer.dataset.state !== 'expanded') {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                const closeButton = dataContainer.querySelector('.close-data-container');
                if (closeButton) {
                    closeButton.textContent = '-';
                } else {
                    console.error('Close button not found in data container (promptgrid.js)');
                }
                console.log('Left data container expanded (promptgrid.js)');
            } else {
                console.log('Left data container already expanded (promptgrid.js)');
            }

            // Inject content into the datain container
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA IN</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Content loaded from ${url} into datain container (promptgrid.js)`);

            // Store the URL in localStorage
            setLocal('lastGridItemUrl', url); // Added to store lastGridItemUrl
            console.log(`Stored lastGridItemUrl: ${url} (promptgrid.js)`);


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

            const openedEvent = new CustomEvent('data-in-opened', {
                detail: {
                    state: 'expanded'
                }
            });

            document.dispatchEvent(openedEvent);
            console.log('Data-in container opened event dispatched (promptgrid.js)');

            // Optionally load corresponding JS file
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
            //     console.log(`Loaded script: ${scriptUrl} (promptgrid.js)`);
            // } catch (error) {
            //     console.log(`No script found for ${scriptUrl}, skipping (promptgrid.js)`);
            // }
        } catch (error) {
            console.error('Error loading content (promptgrid.js):', error);
        }
    }

    function initializePromptContainer() {
        if (document.querySelector('.prompt-container')) {
            console.log('Prompt container already exists, skipping initialization (promptgrid.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
/* Prompt Container */
.prompt-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 0 #000;
    z-index: 10000;
    width: 200px;
    max-width: 1200px;
    min-height: 50px;
    transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
    font-family: "Inter", sans-serif;
    visibility: visible;
    opacity: 1;
}

.prompt-container.initial {
    height: 50px;
    overflow: hidden;
}

.prompt-container.expanded {
    width: 90vw;
    max-height: 90vh;
    height: auto;
    overflow-y: auto;
}

.prompt-container:hover {
    background-color: rgb(255, 255, 255);
}

.prompt-container .prompt-label {
    text-decoration: none;
    color: #000;
    font-size: 14px;
    display: block;
    text-align: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    font-family: "Geist", sans-serif;
}

.prompt-container .grid-container {
    display: none;
}

.prompt-container.expanded .grid-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    justify-content: center;
}

.prompt-container .grid-item {
    background-color: #e0e0e0;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    font-family: "Geist", sans-serif;
    flex: 1 1 150px;
    max-width: 200px;
}

.prompt-container .grid-item:hover {
    background-color: #d0d0d0;
}

.prompt-container .grid-item hr {
    margin: 5px 0;
    border: none;
    border-top: 1px solid #000;
}

.prompt-container .premium-notice {
    font-size: 10px;
    color: rgb(255, 255, 255);
    display: block;
}

@media (max-width: 480px) {
    .prompt-container {
        width: 150px;
    }
    .prompt-container.expanded {
        width: 95vw;
        max-height: 85vh;
    }
    .prompt-container .prompt-label {
        font-size: 12px;
        padding: 10px 15px;
    }
    .prompt-container .grid-item {
        font-size: 11px;
        padding: 8px;
        flex: 1 1 120px;
        max-width: 160px;
    }
}
        `;
        document.head.appendChild(style);

        const promptContainer = document.createElement('div');
        promptContainer.className = 'prompt-container initial';
        promptContainer.dataset.state = 'initial';
        promptContainer.innerHTML = `
            <span class="prompt-label">PROMPT</span>
            <div>
                <select id="category-select">
                    <option value="all">ALL</option>
                    <option value="dataanalysis">DATA</option>
                    <option value="reportgeneration">REPORT</option>
                    <option value="planningandforecasting">PLANNING</option>
                    <option value="creative">CREATIVE</option>
                    <option value="decision">DECISION</option>
                    <option value="workflow">WORKFLOW</option>
                    <option value="educational">EDUCATIONAL</option>
                </select>
            </div>
            <div class="grid-container">
                <div class="grid-item">AdAgencyIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">AdventureIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">App<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">BookIQ™<hr></div>
                <div class="grid-item">CalorieIQ™<hr></div>
                <div class="grid-item">DecisionIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">EmotionIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">EnneagramIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">EventIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">FitnessIQ™<hr></div>
                <div class="grid-item">General<hr></div>
                <div class="grid-item">IncomeIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">NewBizIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">QuizIQ™<hr></div>
                <div class="grid-item">ReceiptsIQ™<hr></div>
                <div class="grid-item">ReportIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">ResearchIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">SocialIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">SpeculationIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item">SymptomIQ™<hr></div>
                <div class="grid-item">WorkflowIQ™<hr><span class="premium-notice">Premium</span></div>
            </div>
        `;

        document.body.appendChild(promptContainer);
        console.log('Prompt container injected with grid items (promptgrid.js)');

        const promptLabel = promptContainer.querySelector('.prompt-label');
        if (promptLabel) {
            promptLabel.addEventListener('click', function(e) {
                e.preventDefault();
                togglePromptContainer();
            });
        } else {
            console.error('Prompt label not found (promptgrid.js)');
        }

        // Add click handlers for grid items
        const gridItems = promptContainer.querySelectorAll('.grid-item');
        gridItems.forEach((item, index) => {
            const urls = [
                '/ai/marketing/adagencyiq.html',
                '/ai/adventure/adventureiq.html',
                '/ai/app/appiq.html',
                '/ai/book/bookiq.html',
                '/ai/calorie/calorieiq.html',
                '/ai/decision/decisioniq.html',
                '/ai/emotion/emotioniq.html',
                '/ai/enneagram/enneagramiq.html',
                '/ai/event/eventiq.html',
                '/ai/fitness/fitnessiq.html',
                '/ai/general/general.html',
                '/ai/budget/incomeiq.html',
                '/ai/business/newbiziq.html',
                '/ai/quiz/quiziq.html',
                '/ai/receipts/receiptsiq.html',
                '/ai/report/reportiq.html',
                '/ai/research/researchiq.html',
                '/ai/social/socialiq.html',
                '/ai/speculation/speculationiq.html',
                '/ai/symptom/symptomiq.html',
                '/ai/workflow/workflowiq.html'
            ];
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Grid item clicked: ${urls[index]} (promptgrid.js)`);
                loadContent(urls[index]);
            });
        });

        // Collapse when clicking outside
        document.addEventListener('click', function(e) {
            const promptContainer = document.querySelector('.prompt-container');
            if (!promptContainer) return;
            const isClickInsidePromptContainer = promptContainer.contains(e.target);
            if (!isClickInsidePromptContainer && promptContainer.dataset.state === 'expanded') {
                console.log('Clicked outside prompt container, collapsing it (promptgrid.js)');
                togglePromptContainer();
            }
        });

        // Event listener for category selection dropdown
        const categorySelect = document.getElementById('category-select');
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            filterGridItems(category);
        });
    }

    // Initial check
    try {
        if (!isCookieExpired) {
            initializePromptContainer();
        }
    } catch (error) {
        console.error('Error initializing prompt container (promptgrid.js):', error);
    }
});