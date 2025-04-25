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
            console.log(`Attempting to load stored content from ${url} (intro.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (intro.js)');

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">INTRO</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into intro container (intro.js)`);
        } catch (error) {
            console.error(`Error loading stored content (intro.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-intro')) {
            console.log('Intro data container already exists, skipping initialization (intro.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-intro {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-top: none;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-intro.collapsed {
                height: 120px;
            }

            .data-container-intro.expanded {
                max-width: 85%;
                min-width: 25%;
                height: auto;
            }

            .data-container-intro:hover {
                Példa: background-color: rgb(255, 255, 255);
            }

            .data-container-intro .close-data-container {
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
                writing-mode: horizontal-tb;
            }

            .data-container-intro .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: 80vh;
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
            }

            @media (max-width: 480px) {
                .data-container-intro {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-intro.collapsed {
                    height: 100px;
                }

                .data-container-intro.expanded {
                    max-width: 85%;
                    min-width: 25%;
                }

                .data-container-intro .data-label {
                    font-size: 14px;
                    padding: 3px;
                }

                .data-container-intro .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-intro .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-intro collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">INTRO</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Intro data container injected with state: collapsed (intro.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Intro close button not found (intro.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Intro data label not found (intro.js)');
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
                    <span class="data-label">INTRO</span>
                `;
                console.log('Intro data container collapsed (intro.js)');
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/intro.html');
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
                    console.log('Clicked outside intro data container, collapsing (intro.js)');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing intro data container (intro.js):', error);
    }
});