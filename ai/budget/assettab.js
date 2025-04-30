/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Dependency fallbacks
    const setLocal = window.setLocal || function (key, value, days) {
        console.warn('setLocal not defined, using localStorage directly');
        try {
            localStorage.setItem(key, encodeURIComponent(value));
        } catch (error) {
            console.error('Error in setLocal:', error);
        }
    };
    const getLocal = window.getLocal || function (key) {
        console.warn('getLocal not defined, using localStorage directly');
        try {
            const value = localStorage.getItem(key);
            return value ? decodeURIComponent(value) : null;
        } catch (error) {
            console.error('Error in getLocal:', error);
            return null;
        }
    };

    // Asset tab container logic
    console.log('Asset tab container initialized in assettab.js at:', new Date().toISOString());
    let assetInitialized = false;

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url} at:`, new Date().toISOString());
            const startTime = performance.now();
            const response = await fetch(url);
            const fetchTime = performance.now() - startTime;
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log(`Stored content fetched in ${fetchTime.toFixed(2)}ms at:`, new Date().toISOString());

            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">ASSET</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into asset container at:`, new Date().toISOString());

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'assettab.js', 'setlocal.js', 'getlocal.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime();
                    if (
                        script.src.includes('utils.js') ||
                        script.src.includes('hideShow.js')
                    ) {
                        newScript.type = 'module';
                    }
                    newScript.onerror = () => console.error(`Failed to load script: ${script.src}`);
                    document.body.appendChild(newScript);
                } else if (!script.src) {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                }
            });
        } catch (error) {
            console.error(`Error loading stored content at:`, new Date().toISOString(), error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-asset')) {
            console.log('Asset data container already exists, skipping initialization at:', new Date().toISOString());
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-asset {
                position: fixed;
                top: calc(50% + 36px);
                left: 0;
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-left: none;
                border-radius: 0 8px 8px 0;
                box-shadow: 4px 4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }
            .data-container-asset.collapsed {
                max-width: 36px; /* Doubled from 18px */
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-asset.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-asset:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-asset .close-data-container {
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
            .data-container-asset.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-asset .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: calc(100vh - 80px);
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
                margin-top: 30px;
            }
            @media (max-width: 480px) {
                .data-container-asset {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-asset.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-asset.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-asset .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-asset.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-asset .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-asset .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-asset collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">ASSET</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Asset data container injected with state: collapsed at:', new Date().toISOString());

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Asset data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;
            const isExpanded = dataContainer.dataset.state === 'expanded';
            if (isExpanded) {
                dataContainer.className = 'data-container-asset collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `<span class="data-label">ASSET</span>`;
            } else {
                dataContainer.className = 'data-container-asset expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/asset.html');
            }
            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');
            if (newLabel) newLabel.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
            if (newClose) newClose.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
        }

        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                const isNavButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isNavButton) {
                    console.log('Clicked outside asset data container, collapsing at:', new Date().toISOString());
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing asset data container at:', new Date().toISOString(), error);
    }
});