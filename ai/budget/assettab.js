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
            console.log(`Attempting to load stored content from ${url} (asset.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (asset.js)');

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">ASSET</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into asset container (asset.js)`);

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
                console.log(`Loaded and executed script: ${scriptUrl} (asset.js)`);
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (asset.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (asset.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-asset')) {
            console.log('Asset data container already exists, skipping initialization (asset.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-asset {
                position: fixed;
                top: calc(50% - 96px); /* Same height as Income */
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

            .data-container-asset.collapsed {
                height: 120px;
            }

            .data-container-asset.expanded {
                max-width: 85%;
                min-width: 25%;
                height: auto;
            }

            .data-container-asset:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-asset .close-data-container {
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

            .data-container-asset .data-label {
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

            .data-container-asset .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: 80vh;
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
            }

            @media (max-width: 480px) {
                .data-container-asset {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-asset.collapsed {
                    height: 100px;
                }

                .data-container-asset.expanded {
                    max-width: 85%;
                    min-width: 25%;
                }

                .data-container-asset .data-label {
                    font-size: 14px;
                    padding: 3px;
                }

                .data-container-asset .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-asset .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                }
            }
        `;
        document.head.appendChild(style);

        const lastState = getLocal('dataContainerState_asset') || 'initial';
        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-asset ${lastState}`;
        dataContainer.dataset.state = lastState;
        dataContainer.dataset.name = 'asset';
        dataContainer.innerHTML = `
            <span class="close-data-container">${lastState === 'expanded' ? '-' : '+'}</span>
            <span class="data-label">ASSET</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Asset data container injected with state:', lastState, '(asset.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Asset close button not found (asset.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Asset data label not found (asset.js)');
        }

        function initializeGridItems() {
            document.querySelectorAll('.data-container-asset .grid-container .grid-item').forEach(item => {
                const key = `grid_asset_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
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
                setLocal('dataContainerState_asset', 'initial');

                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">ASSET</span>
                `;
                console.log('Asset data container collapsed and reset (asset.js)');
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataContainerState_asset', 'expanded');

                console.log('Asset data container expanded (asset.js)');

                const storedUrl = getLocal('lastGridItemUrl_asset') || '/asset.html';
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
                console.log('Clicked outside asset data container, collapsing (asset.js)');
                toggleDataContainer();
            }
        });

        if (lastState === 'expanded') {
            const storedUrl = getLocal('lastGridItemUrl_asset') || '/asset.html';
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
        console.error('Error initializing asset data container (asset.js):', error);
    }
});