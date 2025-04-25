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
            console.log(`Attempting to load stored content from ${url} (summary.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (summary.js)');

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">SUMMARY</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into summary container (summary.js)`);

            const scriptUrl = url.replace('.html', '.js');
            if (scriptUrl === '/summary.js') {
                console.log('Skipping self-referential script load for summary.js (summary.js)');
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
                console.log(`Loaded and executed script: ${scriptUrl} (summary.js)`);
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (summary.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (summary.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-summary')) {
            console.log('Summary data container already exists, skipping initialization (summary.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-summary {
                position: fixed;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-bottom: none;
                border-radius: 8px 8px 0 0;
                box-shadow: 0 -4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-summary.collapsed {
                height: 120px;
            }

            .data-container-summary.expanded {
                max-width: 85%;
                min-width: 25%;
                height: auto;
            }

            .data-container-summary:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-summary .close-data-container {
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                padding: 5px;
                font-size: 14px;
                line-height: 1;
                color: #000;
                cursor: pointer;
                font-weight: bold;
                font-family: "Inter", sans-serif;
            }

            .data-container-summary .data-label {
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
            }

            .data-container-summary .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: 80vh;
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
            }

            @media (max-width: 480px) {
                .data-container-summary {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-summary.collapsed {
                    height: 100px;
                }

                .data-container-summary.expanded {
                    max-width: 85%;
                    min-width: 25%;
                }

                .data-container-summary .data-label {
                    font-size: 14px;
                    padding: 3px;
                }

                .data-container-summary .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-summary .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                }
            }
        `;
        document.head.appendChild(style);

        const lastState = getLocal('dataContainerState_summary') || 'initial';
        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-summary ${lastState}`;
        dataContainer.dataset.state = lastState;
        dataContainer.dataset.name = 'summary';
        dataContainer.innerHTML = `
            <span class="close-data-container">${lastState === 'expanded' ? '-' : '+'}</span>
            <span class="data-label">SUMMARY</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Summary data container injected with state:', lastState, '(summary.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Summary close button not found (summary.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Summary data label not found (summary.js)');
        }

        function initializeGridItems() {
            document.querySelectorAll('.data-container-summary .grid-container .grid-item').forEach(item => {
                const key = `grid_summary_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
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
                setLocal('dataContainerState_summary', 'initial');

                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">SUMMARY</span>
                `;
                console.log('Summary data container collapsed and reset (summary.js)');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataContainerState_summary', 'expanded');

                console.log('Summary data container expanded (summary.js)');

                const storedUrl = getLocal('lastGridItemUrl_summary') || '/summary.html';
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
                console.log('Clicked outside summary data container, collapsing (summary.js)');
                toggleDataContainer();
            }
        });

        if (lastState === 'expanded') {
            const storedUrl = getLocal('lastGridItemUrl_summary') || '/summary.html';
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
        console.error('Error initializing summary data container (summary.js):', error);
    }
});