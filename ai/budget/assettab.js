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
                <span class="close-data-container"></span>
                <span class="data-label">ASSET</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into asset container (asset.js)`);
        } catch (error) {
            console.error(`Error loading stored content (asset.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container')) {
            console.log('Asset data container already exists, skipping initialization (asset.js)');
            return;
        }

        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = '/ai/styles/prompt.css';
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">ASSET</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Asset data container injected with state: collapsed (asset.js)');

        const dataLabel = dataContainer.querySelector('.data-label');

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