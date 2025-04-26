/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url}`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully');

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">INTRO</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into intro container`);

            // Execute scripts in the loaded content
            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                    // Set type="module" for scripts that are likely modules
                    if (script.src.includes('intro.js') || script.src.includes('setlocal.js') || script.src.includes('getlocal.js') || script.src.includes('tray.js')) {
                        newScript.type = 'module';
                    }
                    newScript.onload = () => {
                        if (script.src.includes('intro.js')) {
                            initializeIntroLogic(dataContainer);
                        }
                    };
                    newScript.onerror = () => console.error(`Failed to load script: ${script.src}`);
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });

            // Initialize inline scripts immediately
            initializeIntroLogic(dataContainer);
        } catch (error) {
            console.error(`Error loading stored content:`, error);
        }
    }

    // Function to initialize the logic from intro.js for the loaded content
    function initializeIntroLogic(container) {
        // Preserve original DOM methods
        const originalQuerySelector = document.querySelector.bind(document);
        const originalQuerySelectorAll = document.querySelectorAll.bind(document);
        const originalGetElementById = document.getElementById.bind(document);

        // Override DOM methods to prioritize container
        document.querySelector = (selector) => container.querySelector(selector) || originalQuerySelector(selector);
        document.querySelectorAll = (selector) => container.querySelectorAll(selector).length > 0 ? container.querySelectorAll(selector) : originalQuerySelectorAll(selector);
        document.getElementById = (id) => container.querySelector(`#${id}`) || originalGetElementById(id);

        try {
            // Trigger the DOMContentLoaded logic from intro.js
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error triggering DOMContentLoaded:', error);
        }

        // Restore original methods
        document.querySelector = originalQuerySelector;
        document.querySelectorAll = originalQuerySelectorAll;
        document.getElementById = originalGetElementById;
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-intro')) {
            console.log('Intro data container already exists, skipping initialization');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-intro {
                position: fixed;
                top: calc(5% + 36px);
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
        
            .data-container-intro.collapsed {
                max-width: 18px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
        
            .data-container-intro.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
        
            .data-container-intro:hover {
                background-color: rgb(255, 255, 255);
            }
        
            .data-container-intro .close-data-container {
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
        
            .data-container-intro .data-label {
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
        
            .data-container-intro.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
        
            .data-container-intro .data-content {
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
                .data-container-intro {
                    max-width: 28px;
                    padding: 3px;
                }
        
                .data-container-intro.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
        
                .data-container-intro.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
        
                .data-container-intro .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
        
                .data-container-intro.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
        
                .data-container-intro .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
        
                .data-container-intro .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-intro collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">INTRO</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Intro data container injected with state: collapsed');

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Intro data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('collapsed');
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">INTRO</span>
                `;
                console.log('Intro data container collapsed');
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/intro.html');
            }

            // Re-bind event listeners
            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');

            if (newLabel) {
                newLabel.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }

            if (newClose) {
                newClose.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }
        }

        // Add outside click listener to collapse when expanded
        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                if (!isClickInside) {
                    console.log('Clicked outside intro data container, collapsing');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing intro data container:', error);
    }
});