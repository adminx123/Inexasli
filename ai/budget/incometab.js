/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Import setLocal if not available from global scope
    const setLocal = window.setLocal || function (key, value, days) {
        try {
            localStorage.setItem(key, encodeURIComponent(value));
        } catch (error) {
            // Error handling without console.error
        }
    };

    // Only handles toggling open/close and loading the HTML now
    
    // Income container management
    let incomeInitialized = false;
    
    function hideShowClass(className, action) {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.style.display = action === 'show' ? 'block' : 'none';
        });
    }

    function initializeIncomeForm(container) {
        // Remove the check for incomeInitialized to allow reinitializing
        // when container is reopened
        
        incomeInitialized = true;

        // Initialize tooltips using the centralized implementation
        if (window.initializeTooltips) {
            const cleanup = window.initializeTooltips(container);
            // Store cleanup function on container for later use
            if (cleanup && cleanup.cleanup) {
                container._tooltipCleanup = cleanup.cleanup;
            }
        } else {
            // Fallback script loading if toolTip.js hasn't been loaded yet
            const tooltipScript = document.createElement('script');
            tooltipScript.src = '/utility/toolTip.js?v=' + new Date().getTime();
            tooltipScript.onload = function() {
                if (window.initializeTooltips) {
                    const cleanup = window.initializeTooltips(container);
                    if (cleanup && cleanup.cleanup) {
                        container._tooltipCleanup = cleanup.cleanup;
                    }
                }
            };
            document.head.appendChild(tooltipScript);
        }
    }

    async function loadStoredContent(dataContainer, url) {
        try {
            const startTime = performance.now();
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();

            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">INCOME</span>
                <div class="data-content">${content}</div>
            `;
            
            // Mark income page as visited when loaded
            setLocal('incomeVisited', 'visited', 365);

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'incometab.js', 'setlocal.js', 'getlocal.js', 'cookieoverwrite.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime();
                    if (
                        script.src.includes('frequency.js') ||
                        script.src.includes('utils.js') ||
                        script.src.includes('hideShow.js')
                    ) {
                        newScript.type = 'module';
                    }
                    newScript.onerror = () => {}; // Empty error handler
                    document.body.appendChild(newScript);
                } else if (!script.src) {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                }
            });
            
            initializeIncomeForm(dataContainer);
            
            // Initialize modal triggers after loading the content
            if (typeof window.setupModalTriggers === 'function') {
                window.setupModalTriggers();
            }
        } catch (error) {
            // Error handling without console.error
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-income')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-income {
                position: fixed;
                top: calc(20% + 36px);
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
            .data-container-income.collapsed {
                max-width: 36px; /* Doubled from 18px */
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-income.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-income:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-income .close-data-container {
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
            .data-container-income .data-label {
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
            .data-container-income.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-income .data-content {
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
                .data-container-income {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-income.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-income.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-income .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-income.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-income .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-income .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-income collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">INCOME</span>
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
                dataContainer.className = 'data-container-income collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `<span class="data-label">INCOME</span>`;
            } else {
                dataContainer.className = 'data-container-income expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/income/income.html');
            }
            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');
            if (newLabel) newLabel.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
            if (newClose) newClose.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
        }

        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                const isValidateButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isValidateButton) {
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        // Error handling without console.error
    }
});