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
        try {
            localStorage.setItem(key, encodeURIComponent(value));
        } catch (error) {
            // Error handling without console logging
        }
    };
    const getLocal = window.getLocal || function (key) {
        try {
            const value = localStorage.getItem(key);
            return value ? decodeURIComponent(value) : null;
        } catch (error) {
            // Error handling without console logging
            return null;
        }
    };
    
    // Summary container management
    
    async function loadStoredContent(dataContainer, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <span class="data-label">SUMMARY</span>
                <div class="data-content">${content}</div>
            `;

            // Mark summary page as visited when loaded
            setLocal('summaryVisited', 'visited', 365);

            // Now check if all pages have been visited and set a flag
            const introVisited = getLocal('introVisited');
            const incomeVisited = getLocal('incomeVisited');
            const expenseVisited = getLocal('expenseVisited');
            const assetVisited = getLocal('assetVisited');
            const liabilityVisited = getLocal('liabilityVisited');
            const summaryVisited = getLocal('summaryVisited');

            if (introVisited === 'visited' && 
                incomeVisited === 'visited' && 
                expenseVisited === 'visited' && 
                assetVisited === 'visited' && 
                liabilityVisited === 'visited' &&
                summaryVisited === 'visited') {
                // All pages have been visited, set a combined flag
                setLocal('allPagesVisited', 'true', 365);
            }
        } catch (error) {
            // Error handling without console logging
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-summary')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-summary {
                position: fixed;
                top: calc(50% - 60px);
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
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .data-container-summary.collapsed {
                width: 34px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .data-container-summary.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                height: calc(100vh - 40px);
                top: 20px;
                margin-left: -webkit-calc(85vw - 20px);
                margin-left: -moz-calc(85vw - 20px);
                margin-left: calc(85vw - 20px);
            }

            .data-container-summary:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-summary .close-data-container {
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
                writing-mode: vertical-rl;
                text-orientation: mixed;
            }

            .data-container-summary.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }

            .data-container-summary .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: calc(100vh - 80px);
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
                margin-top: 30px; /* Space for label at top */
            }

            @media (max-width: 480px) {
                .data-container-summary {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-summary.collapsed {
                    width: 28px;
                    height: 100px;
                }

                .data-container-summary.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    height: calc(100vh - 20px);
                    top: 10px;
                    margin-left: -webkit-calc(85vw - 10px);
                    margin-left: -moz-calc(85vw - 10px);
                    margin-left: calc(85vw - 10px);
                }

                .data-container-summary .data-label {
                    font-size: 10px;
                    padding: 3px;
                }

                .data-container-summary.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }

                .data-container-summary .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-summary .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-summary collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">SUMMARY</span>
        `;

        document.body.appendChild(dataContainer);

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('collapsed');
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">SUMMARY</span>
                `;
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/summary.html');
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
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        // Error handling without console logging
    }
});