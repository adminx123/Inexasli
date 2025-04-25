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
            console.log(`Attempting to load stored content from ${url} (asset.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (asset.js)');

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">ASSET</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into asset container (asset.js)`);
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
                top: 96px; /* ~1 inch from top */
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
                width: 34px;
                height: 120px;
            }
        
            .data-container-asset.expanded {
                width: 85vw; /* Expand to 85% of viewport width */
                max-width: calc(85vw - 20px); /* Account for right margin */
                min-width: 25%;
                height: calc(100vh - 40px); /* Nearly full height, 20px top/bottom margins */
                top: 20px; /* 20px from top */
                margin-right: -webkit-calc(85vw - 20px); /* Expand rightward, leave 20px gap */
                margin-right: -moz-calc(85vw - 20px);
                margin-right: calc(85vw - 20px);
            }
        
            .data-container-asset:hover {
                background-color: rgb(255, 255, 255);
            }
        
            .data-container-asset .close-data-container {
                position: absolute;
                top: 4px;
                left: 10px; /* Adjusted for left-side anchoring */
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
                    width: 28px;
                    height: 100px;
                }
        
                .data-container-asset.expanded {
                    width: 85vw;
                    max-width: calc(85vw - 10px); /* Smaller right margin on mobile */
                    height: calc(100vh - 20px); /* Adjust for smaller margins on mobile */
                    top: 10px; /* Smaller top margin on mobile */
                    margin-right: -webkit-calc(85vw - 10px);
                    margin-right: -moz-calc(85vw - 10px);
                    margin-right: calc(85vw - 10px);
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

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-asset collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">ASSET</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Asset data container injected with state: collapsed (asset.js)');

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

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('collapsed');
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">ASSET</span>
                `;
                console.log('Asset data container collapsed (asset.js)');
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/asset.html');
            }

            // Re-bind event listeners
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

        // Add outside click listener to collapse when expanded
        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                if (!isClickInside) {
                    console.log('Clicked outside asset data container, collapsing (asset.js)');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing asset data container (asset.js):', error);
    }
});