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

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url} (dataout.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (dataout.js)');

            // Inject content into the container
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA OUT</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into dataout container (dataout.js)`);

            // Load and execute corresponding JS file (if any)
            const scriptUrl = url.replace('.html', '.js');
            try {
                const existingScripts = document.querySelectorAll(`script[data-source="${scriptUrl}"]`);
                existingScripts.forEach(script => script.remove());

                const scriptResponse = await fetch(scriptUrl);
                if (!scriptResponse.ok) throw new Error(`Failed to fetch script ${scriptUrl}`);

                const scriptContent = await scriptResponse.text();
                const script = document.createElement('script');
                script.textContent = scriptContent;
                script.dataset.source = scriptUrl;
                document.body.appendChild(script);
                console.log(`Loaded and executed script: ${scriptUrl} (dataout.js)`);
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (dataout.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (dataout.js):`, error);
            // Fallback content on error
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

        /* Right container specific styling */
.data-container-right {
    position: fixed;
    top: 50%;
    right: 0; /* Align to the right side */
    transform: translateY(-50%);
    background-color: #f5f5f5;
    padding: 4px;
    border: 2px solid #000;
    border-right: none;
    border-radius: 8px 0 0 8px; /* Right-specific radius */
    box-shadow: -4px 4px 0 #000; /* Right-side shadow */
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
    height: 120px;
}

.data-container-right.expanded {
    max-width: 85%;
        min-width: 25%; /* Minimum width for mobile */
    height: auto;
}

.data-container-right:hover {
    background-color: rgb(255, 255, 255);
}

.data-container-right .close-data-container {
    position: absolute;
    top: 4px;
    right: 10px;
    left: auto; /* Ensure it stays on the right */
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
        max-width: 28px; /* Initial collapsed state for mobile */
        padding: 3px;
    }

    .data-container-right.collapsed {
        height: 100px;
    }

    .data-container-right.expanded {
        max-width: 85%;
        min-width: 25%; /* Minimum width for mobile */
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

        // Get the last known state from localStorage, default to 'initial'
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

                // Re-render collapsed version
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

                // Check lastGridItemUrl to determine content
                const lastGridItemUrl = getLocal('lastGridItemUrl');
                if (lastGridItemUrl === '/ai/calorie/calorieiq.html') {
                    const outUrl = '/ai/calorie/calorieiqout.html';
                    setLocal('lastDataOutUrl', outUrl);
                    loadStoredContent(dataContainer, outUrl);
                } else {
                    // Default content if no matching URL
                    dataContainer.innerHTML = `
                        <span class="close-data-container">-</span>
                        <span class="data-label">DATA OUT</span>
                        <div class="data-content">No relevant content available</div>
                    `;
                }
                console.log('Right data container expanded (dataout.js)');
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

        document.addEventListener('click', function (e) {
            const isClickInside = dataContainer.contains(e.target);
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside right data container, collapsing (dataout.js)');
                toggleDataContainer();
            }
        });

        // Load stored content on initialization if the container is expanded
        if (lastState === 'expanded') {
            const lastGridItemUrl = getLocal('lastGridItemUrl');
            if (lastGridItemUrl === '/ai/calorie/calorieiq.html') {
                const outUrl = '/ai/calorie/calorieiqout.html';
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
});