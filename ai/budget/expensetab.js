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
            console.log(`Attempting to load stored content from ${url} (expense.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully (expense.js)');

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container"></span>
                <span class="data-label">EXPENSE</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into expense container (expense.js)`);
        } catch (error) {
            console.error(`Error loading stored content (expense.js):`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-expense')) {
            console.log('Expense data container already exists, skipping initialization (expense.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
         .data-container-expense {
    position: fixed;
    top: calc(30% + 36px); /* Shifted down 96px */
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

            .data-container-expense.collapsed {
                width: 34px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .data-container-expense.expanded {
                width: 85vw;
                max-width: calc(85vw - 20px);
                min-width: 25%;
                height: calc(100vh - 40px);
                top: 20px;
                margin-right: -webkit-calc(85vw - 20px);
                margin-right: -moz-calc(85vw - 20px);
                margin-right: calc(85vw - 20px);
            }

            .data-container-expense:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-expense .close-data-container {
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

            .data-container-expense .data-label {
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

            .data-container-expense.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }

            .data-container-expense .data-content {
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
                .data-container-expense {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-expense.collapsed {
                    width: 28px;
                    height: 100px;
                }

                .data-container-expense.expanded {
                    width: 85vw;
                    max-width: calc(85vw - 10px);
                    height: calc(100vh - 20px);
                    top: 10px;
                    margin-right: -webkit-calc(85vw - 10px);
                    margin-right: -moz-calc(85vw - 10px);
                    margin-right: calc(85vw - 10px);
                }

                .data-container-expense .data-label {
                    font-size: 10px;
                    padding: 3px;
                }

                .data-container-expense.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }

                .data-container-expense .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }

                .data-container-expense .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-expense collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">EXPENSE</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Expense data container injected with state: collapsed (expense.js)');

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Expense data label not found (expense.js)');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('collapsed');
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">EXPENSE</span>
                `;
                console.log('Expense data container collapsed (expense.js)');
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/expense.html');
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
                    console.log('Clicked outside expense data container, collapsing (expense.js)');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing expense data container (expense.js):', error);
    }
});