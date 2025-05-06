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
    let summaryInitialized = false;
    
    function initializeSummaryForm(container) {
        // Remove the check for summaryInitialized to allow reinitializing
        // when container is reopened
        
        summaryInitialized = true;

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
            console.log('Summary tab - loadStoredContent started for URL:', url);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Summary tab - Content loaded successfully, length:', content.length);

            // Update container with content
            dataContainer.innerHTML = `
                <span class="close-data-container">×</span>
                <span class="data-label">SUMMARY</span>
                <div class="data-content">${content}</div>
            `;
            console.log('Summary tab - Content inserted into DOM');

            // Mark summary page as visited when loaded
            setLocal('summaryVisited', 'visited', 365);

            // Process scripts like other tabs
            console.log('Summary tab - Processing scripts');
            const scripts = dataContainer.querySelectorAll('script');
            console.log('Summary tab - Found', scripts.length, 'script elements');
            
            scripts.forEach((script, index) => {
                console.log(`Summary tab - Processing script ${index+1}:`, script.src || 'inline script');
                
                if (script.src && ![
                    'summarytab.js', 'setlocal.js', 'getlocal.js', 'cookieoverwrite.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime(); 
                    console.log('Summary tab - Adding external script to body:', newScript.src);
                    
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
                    console.log('Summary tab - Adding inline script to body, length:', script.textContent.length);
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                }
            });

            // Initialize the summary form
            initializeSummaryForm(dataContainer);

            // DIRECT UPDATE: Immediately update all the financial values 
            // without waiting for other scripts to load
            console.log('Summary tab - Performing direct update of all financial values');
            
            // Get values directly from localStorage
            const assets = parseFloat(getLocal('ASSETS')) || 0;
            const liabilities = parseFloat(getLocal('LIABILITIES')) || 0;
            const netWorth = assets - liabilities;
            const income = parseFloat(getLocal('ANNUALINCOME')) || 0;
            const expenses = parseFloat(getLocal('ANNUALEXPENSESUM')) || 0;
            const essential = parseFloat(getLocal('ESSENTIAL')) || 0;
            const discretionary = parseFloat(getLocal('DISCRETIONARY')) || 0;
            const housing = parseFloat(getLocal('HOUSING')) || 0;
            const transportation = parseFloat(getLocal('TRANSPORTATION')) || 0;
            const dependant = parseFloat(getLocal('DEPENDANT')) || 0;
            const debt = parseFloat(getLocal('DEBT')) || 0;
            const taxableIncome = parseFloat(getLocal('ANNUALTAXABLEINCOME')) || 0;
            
            console.log('Summary tab - Direct values:', { 
                assets, liabilities, netWorth, income, expenses, 
                essential, discretionary, housing, transportation, dependant, debt, taxableIncome 
            });
            
            // Update all financial elements directly
            const elementsToUpdate = {
                'ASSETS': assets,
                'LIABILITIES': liabilities,
                'NETWORTH': netWorth,
                'annual_income_sum': income,
                'ANNUALEXPENSESUM': expenses,
                'ESSENTIAL': essential,
                'DISCRETIONARY': discretionary,
                'HOUSING': housing,
                'TRANSPORTATION': transportation,
                'DEPENDANT': dependant,
                'DEBT': debt,
                'ANNUALTAXABLEINCOME': taxableIncome
            };
            
            for (const [elementId, value] of Object.entries(elementsToUpdate)) {
                const element = dataContainer.querySelector(`#${elementId}`);
                if (element) {
                    element.textContent = '$' + value.toFixed(2);
                    console.log(`Summary tab - Directly updated ${elementId} element to: ${element.textContent}`);
                } else {
                    console.log(`Summary tab - Could not find element with id: ${elementId}`);
                }
            }
            
            // Frequency element might need special handling
            const frequencyDropdown = dataContainer.querySelector('#frequency');
            if (frequencyDropdown) {
                frequencyDropdown.value = 'annual'; // Default to annual
                console.log('Summary tab - Set frequency dropdown to annual');
            }

            // Manually trigger the updateFreeContent function after a delay
            setTimeout(() => {
                console.log('Summary tab - Running delayed update functions');
                if (window.updateFreeContent) {
                    console.log('Summary tab - Calling updateFreeContent()');
                    window.updateFreeContent();
                    console.log('Summary tab - updateFreeContent() completed');
                    
                    if (getLocal('authenticated') === 'paid' && window.updatePremiumContent) {
                        console.log('Summary tab - Calling updatePremiumContent()');
                        window.updatePremiumContent();
                        console.log('Summary tab - updatePremiumContent() completed');
                    }
                } else {
                    console.warn('Summary tab - updateFreeContent not found in window context');
                }
                
                // Debug log to check localStorage values
                console.log('Summary tab - Current localStorage values for assets/liabilities:');
                console.log('ASSETS:', getLocal('ASSETS'));
                console.log('LIABILITIES:', getLocal('LIABILITIES'));
                console.log('NETWORTH calculation:', parseFloat(getLocal('ASSETS') || 0) - parseFloat(getLocal('LIABILITIES') || 0));
                
                // Check DOM elements that should display these values
                const assetsElement = document.getElementById('ASSETS');
                const liabilitiesElement = document.getElementById('LIABILITIES');
                const networthElement = document.getElementById('NETWORTH');
                
                console.log('ASSETS element exists:', !!assetsElement, assetsElement ? 'content: ' + assetsElement.textContent : '');
                console.log('LIABILITIES element exists:', !!liabilitiesElement, liabilitiesElement ? 'content: ' + liabilitiesElement.textContent : '');
                console.log('NETWORTH element exists:', !!networthElement, networthElement ? 'content: ' + networthElement.textContent : '');
            }, 500);

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
            console.error('Summary tab - Error in loadStoredContent:', error);
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
                z-index: 10001;
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
                    z-index: 10001;
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
                dataContainer.className = 'data-container-summary collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `<span class="data-label">SUMMARY</span>`;
            } else {
                dataContainer.className = 'data-container-summary expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/income/summary.html');
            }

            // Re-bind event listeners
            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');
            
            if (newLabel) newLabel.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
            if (newClose) newClose.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
        }

        // Add outside click listener to collapse when expanded
        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                const isNavButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isNavButton) {
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