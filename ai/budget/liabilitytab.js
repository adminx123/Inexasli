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
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url} (liability.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (liability.js)');

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">LIABILITY</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into liability container (liability.js)`);

            const scriptUrl = url.replace('.html', '.js');
            if (scriptUrl === '/liability.js') {
                console.log('Skipping self-referential script load for liability.js (liability.js)');
                return;
            }

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
                console.log(`Loaded and executed script: ${scriptUrl} (liability.js)`);
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (liability.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (liability.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-liability')) {
            console.log('Liability data container already exists, skipping initialization (liability.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-liability {
                position: fixed;
                top: calc(50% + 24px); /* Below Asset, same as Expense */
                right: 0;
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

            .data-container-liability.collapsed {
                height: 120px;
            }

            .data-container-liability.expanded {
                max-width: 85%;
                min-width: 25%;
                height: auto;
            }

            .data-container-liability:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-liability .close-data-container {
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

            .data-container-liability .data-label {
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

            .data-container-liability .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: 80vh;
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
            }

            @media (max-width: 480px) {
                .data-container-liability {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-liability.collapsed {
                    height: 100px;
                }

                .data-container-liability.expanded {
                    max-width: 85%;
                    min-width: 25%;
                }

                .data-container-liability .data-label {
                    font-size: 14px;
                    padding: 3px;
                }

                .data-container-liability .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-liability .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                }
            }
        `;
        document.head.appendChild(style);

        const lastState = getLocal('dataContainerState_liability') || 'initial';
        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-liability ${lastState}`;
        dataContainer.dataset.state = lastState;
        dataContainer.dataset.name = 'liability';
        dataContainer.innerHTML = `
            <span class="close-data-container">${lastState === 'expanded' ? '-' : '+'}</span>
            <span class="data-label">LIABILITY</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Liability data container injected with state:', lastState, '(liability.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Liability close button not found (liability.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Liability data label not found (liability.js)');
        }

        function initializeGridItems() {
            document.querySelectorAll('.data-container-liability .grid-container .grid-item').forEach(item => {
                const key = `grid_liability_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
                const value = localStorage.getItem(key);
                if (value === 'true') {
                    item.classList.add('selected');
                    console.log(`Restored ${key}: true`);
                } else if (value === 'false') {
                    item.classList.remove('selected');
                    console.log(`Restored ${key}: false`);
                }
            });
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                setLocal('dataContainerState_liability', 'initial');

                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">LIABILITY</span>
                `;
                console.log('Liability data container collapsed and reset (liability.js)');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataContainerState_liability', 'expanded');

                console.log('Liability data container expanded (liability.js)');

                const storedUrl = getLocal('lastGridItemUrl_liability') || '/liability.html';
                if (storedUrl) {
                    loadStoredContent(dataContainer, storedUrl);
                }

                initializeGridItems();
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
                console.log('Clicked outside liability data container, collapsing (liability.js)');
                toggleDataContainer();
            }
        });

        if (lastState === 'expanded') {
            const storedUrl = getLocal('lastGridItemUrl_liability') || '/liability.html';
            if (storedUrl) {
                loadStoredContent(dataContainer, storedUrl);
            }
        }
    }

    try {
        if (!isCookieExpired) {
            initializeDataContainer();
        }
    } catch (error) {
        console.error('Error initializing liability data container (liability.js):', error);
    }
});