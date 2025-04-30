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

    // Expense container management
    console.log('Expense tab manager initialized in expensetab.js');
    let expenseInitialized = false;
    
    function hideShowClass(className, action) {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.style.display = action === 'show' ? 'block' : 'none';
        });
    }

    function initializeExpenseForm(container) {
        if (expenseInitialized) {
            console.log('Expense form already initialized, skipping');
            return;
        }
        expenseInitialized = true;
        console.log('Expense form initialized');

        // Initialize tooltips
        const interactiveElements = container.querySelectorAll(
            ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
        );
        const tooltips = container.querySelectorAll(".checkboxrow .tooltip");
        tooltips.forEach(tooltip => {
            const content = tooltip.querySelector(".tooltip-content");
            const message = tooltip.getAttribute("data-tooltip");
            if (content && message) content.textContent = message;
        });
        interactiveElements.forEach(element => {
            element.removeEventListener('click', handleTooltipClick);
            element.addEventListener('click', handleTooltipClick);
            function handleTooltipClick(e) {
                const row = element.closest(".checkboxrow");
                const tooltip = row.querySelector(".tooltip");
                const content = tooltip ? tooltip.querySelector(".tooltip-content") : null;
                container.querySelectorAll(".checkboxrow").forEach(r => {
                    r.classList.remove("active");
                    const otherTooltip = r.querySelector(".tooltip");
                    if (otherTooltip) otherTooltip.classList.remove("show");
                });
                row.classList.add("active");
                if (tooltip && content) {
                    tooltip.classList.add("show");
                    const contentRect = content.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    if (contentRect.left < 0) {
                        content.style.left = '0';
                        content.style.transform = 'translateX(0)';
                    } else if (contentRect.right > viewportWidth) {
                        content.style.left = '100%';
                        content.style.transform = 'translateX(-100%)';
                    } else {
                        content.style.left = '50%';
                        content.style.transform = 'translateX(-50%)';
                    }
                }
                e.stopPropagation();
            }
        });
        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);
        function handleOutsideClick(e) {
            if (!e.target.closest(".checkboxrow")) {
                container.querySelectorAll(".checkboxrow").forEach(r => {
                    r.classList.remove("active");
                    const tooltip = r.querySelector(".tooltip");
                    if (tooltip) tooltip.classList.remove("show");
                });
            }
        }
    }

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url}`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully');

            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">EXPENSE</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into expense container`);

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'expensetab.js', 'setlocal.js', 'getlocal.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime(); // Prevent caching
                    if (
                        script.src.includes('frequency.js') ||
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

            initializeExpenseForm(dataContainer);
        } catch (error) {
            console.error(`Error loading stored content:`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-expense')) {
            console.log('Expense data container already exists, skipping initialization');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-expense {
                position: fixed;
                top: calc(35% + 36px);
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
                max-width: 36px; /* Doubled from 18px */
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-expense.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
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
                    z-index: 10001;
                }
                .data-container-expense.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
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
        console.log('Expense data container injected with state: collapsed');

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Expense data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;
            const isExpanded = dataContainer.dataset.state === 'expanded';
            if (isExpanded) {
                dataContainer.className = 'data-container-expense collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `<span class="data-label">EXPENSE</span>`;
            } else {
                dataContainer.className = 'data-container-expense expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/expense.html');
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
                    console.log('Clicked outside expense data container, collapsing');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing expense data container:', error);
    }
});