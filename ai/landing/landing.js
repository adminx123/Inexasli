/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';
import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';

// Set the prompt cookie to ensure datain.js, dataout.js, and promptgrid.js initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set the prompt cookie to the current timestamp
    const currentTime = Date.now();
    
    // Set the cookie directly in the document
    document.cookie = `prompt=${currentTime}; path=/; max-age=86400`; // valid for 24 hours
    
    console.log('Prompt cookie set by landing.js:', currentTime);
    
    // Categorization of grid items by type
    const itemCategories = {
        'dataanalysis': ['BookIQ', 'CalorieIQ', 'ReceiptsIQ', 'ResearchIQ', 'EmotionIQ'],
        'reportgeneration': ['EnneagramIQ', 'SocialIQ', 'ReportIQ', 'SymptomIQ'],
        'planningandforecasting': ['AdventureIQ', 'EventIQ', 'FitnessIQ', 'IncomeIQ', 'NewBizIQ'],
        'creative': ['MarketingIQ', 'QuizIQ'],
        'decision': ['DecisionIQ'],
        'workflow': ['App', 'WorkflowIQ'],
        'educational': ['General']
    };
    
    // Function to filter grid items by category
    function filterGridItems(category) {
        const gridItems = document.querySelectorAll('.product-item');
        gridItems.forEach(item => {
            let itemText = item.textContent.split(/\n|Premium/)[0].trim().replace(/™/g, '');
            if (category === 'all' || itemCategories[category]?.includes(itemText)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        console.log(`Filtered grid items by category: ${category}`);
    }
    
    // Setup category dropdown filter
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            filterGridItems(category);
        });
        console.log('Category select dropdown initialized');
    }
    
    // Create a style element that will forcefully control container visibility
    const createVisibilityController = () => {
        // Remove any existing controller first
        const existingController = document.getElementById('container-visibility-controller');
        if (existingController) {
            existingController.remove();
        }
        
        // Create new style element
        const styleElement = document.createElement('style');
        styleElement.id = 'container-visibility-controller';
        document.head.appendChild(styleElement);
        return styleElement.sheet;
    };
    
    // Get or create the visibility controller stylesheet
    let visibilityStyleSheet = createVisibilityController();
    
    // Function to toggle between datain/dataout and budget tabs with CSS rules
    function toggleUiMode(isBudgetMode) {
        console.log(`Toggling UI mode. Budget mode: ${isBudgetMode}`);
        
        // Clear any existing rules
        while (visibilityStyleSheet.cssRules.length > 0) {
            visibilityStyleSheet.deleteRule(0);
        }
        
        // Budget tabs selectors
        const budgetTabSelectors = [
            '.data-container-intro',
            '.data-container-income',
            '.data-container-expense',
            '.data-container-asset',
            '.data-container-liability',
            '.data-container-summary'
        ];
        
        // Data container selectors
        const dataContainerSelectors = [
            '.data-container-left',
            '.data-container-right'
        ];
        
        // Save the mode in localStorage for persistence
        setLocal('budgetModeActive', isBudgetMode ? 'true' : 'false');
        
        if (isBudgetMode) {
            console.log('Switching to Budget mode: hiding datain/dataout, showing budget tabs');
            
            // Add CSS rules to hide data containers
            dataContainerSelectors.forEach(selector => {
                visibilityStyleSheet.insertRule(`${selector} { display: none !important; }`, 0);
            });
            
            // Show budget tabs by setting visibility to visible
            budgetTabSelectors.forEach(selector => {
                visibilityStyleSheet.insertRule(`${selector} { visibility: visible; }`, 0);
            });
            
            // Apply direct DOM manipulation
            applyDirectStyleChanges(isBudgetMode);
            
            // IMPORTANT: Call our manual initialization function after a delay
            setTimeout(() => {
                // Make sure all tabs are visible first
                budgetTabSelectors.forEach(selector => {
                    const tab = document.querySelector(selector);
                    if (tab) {
                        tab.style.visibility = 'visible';
                    }
                });
                
                console.log('Directly calling budgetTabFlow initialization function');
                
                // Call the manual initialization function we defined in landing.html
                if (typeof window.manuallyInitBudgetFlow === 'function') {
                    window.manuallyInitBudgetFlow();
                    console.log('Successfully called manual budget flow initialization');
                } else {
                    console.error('Manual budget flow initialization function not found');
                }
            }, 500);
            
        } else {
            console.log('Switching to standard mode: showing datain/dataout, hiding budget tabs');
            
            // Hide budget tabs using visibility
            budgetTabSelectors.forEach(selector => {
                visibilityStyleSheet.insertRule(`${selector} { visibility: hidden; }`, 0);
            });
            
            // Apply direct DOM manipulation
            applyDirectStyleChanges(isBudgetMode);
        }
    }
    
    // Direct DOM manipulation as backup
    function applyDirectStyleChanges(isBudgetMode) {
        const dataInContainer = document.querySelector('.data-container-left');
        const dataOutContainer = document.querySelector('.data-container-right');
        
        const budgetTabs = [
            document.querySelector('.data-container-intro'),
            document.querySelector('.data-container-income'),
            document.querySelector('.data-container-expense'),
            document.querySelector('.data-container-asset'),
            document.querySelector('.data-container-liability'),
            document.querySelector('.data-container-summary')
        ].filter(Boolean); // Remove nulls
        
        if (isBudgetMode) {
            // Hide data containers
            if (dataInContainer) dataInContainer.style.setProperty('display', 'none', 'important');
            if (dataOutContainer) dataOutContainer.style.setProperty('display', 'none', 'important');
            
            // Show budget tabs by setting visibility
            budgetTabs.forEach(tab => {
                tab.style.removeProperty('display'); // Ensure no display:none
                tab.style.setProperty('visibility', 'visible');
            });
        } else {
            // Hide budget tabs
            budgetTabs.forEach(tab => {
                tab.style.setProperty('visibility', 'hidden');
            });
            
            // Show data containers by removing the display style
            if (dataInContainer) dataInContainer.style.removeProperty('display');
            if (dataOutContainer) dataOutContainer.style.removeProperty('display');
        }
    }
    
    // Set up periodic check to maintain correct visibility
    function setupVisibilityCheck(isBudgetMode) {
        // Clear any existing interval
        if (window._visibilityCheckInterval) {
            clearInterval(window._visibilityCheckInterval);
        }
        
        // Set up new interval
        window._visibilityCheckInterval = setInterval(() => {
            applyDirectStyleChanges(isBudgetMode);
        }, 500); // Check every 500ms
        
        // Clear interval after 5 seconds to avoid unnecessary processing
        setTimeout(() => {
            if (window._visibilityCheckInterval) {
                clearInterval(window._visibilityCheckInterval);
                window._visibilityCheckInterval = null;
            }
        }, 5000);
    }
    
    // Hide all containers initially
    function hideAllContainersInitially() {
        // Create initial CSS rules to hide everything
        while (visibilityStyleSheet.cssRules.length > 0) {
            visibilityStyleSheet.deleteRule(0);
        }
        
        // Hide data containers
        visibilityStyleSheet.insertRule('.data-container-left { display: none !important; }', 0);
        visibilityStyleSheet.insertRule('.data-container-right { display: none !important; }', 0);
        
        // Hide budget tabs BUT use visibility:hidden instead of display:none
        // This keeps the elements in the DOM for budgetTabFlow.js to find them
        visibilityStyleSheet.insertRule('.data-container-intro { visibility: hidden; }', 0);
        visibilityStyleSheet.insertRule('.data-container-income { visibility: hidden; }', 0);
        visibilityStyleSheet.insertRule('.data-container-expense { visibility: hidden; }', 0);
        visibilityStyleSheet.insertRule('.data-container-asset { visibility: hidden; }', 0);
        visibilityStyleSheet.insertRule('.data-container-liability { visibility: hidden; }', 0);
        visibilityStyleSheet.insertRule('.data-container-summary { visibility: hidden; }', 0);
        
        // Also apply direct DOM manipulation
        const dataContainers = [
            '.data-container-left',
            '.data-container-right'
        ];
        
        const budgetContainers = [
            '.data-container-intro',
            '.data-container-income',
            '.data-container-expense',
            '.data-container-asset',
            '.data-container-liability',
            '.data-container-summary'
        ];
        
        dataContainers.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.setProperty('display', 'none', 'important');
            }
        });
        
        budgetContainers.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.setProperty('visibility', 'hidden');
                // Let the element remain in the layout for budgetTabFlow.js to find
            }
        });
    }
    
    // Function to load content into datain container
    async function loadContent(url) {
        try {
            console.log(`Grid item clicked, loading content from: ${url}`);
            
            // Detect if this is the budget/incomeIQ item
            const isBudgetItem = url === '/ai/income/budget.html';
            
            // Toggle UI mode based on selection
            toggleUiMode(isBudgetItem);
            
            if (!isBudgetItem) {
                // For non-budget items, use regular content loading
                // Create and dispatch event for promptgrid.js to handle
                const gridItemEvent = new CustomEvent('promptGridItemSelected', { 
                    detail: { url: url }
                });
                document.dispatchEvent(gridItemEvent);
            }
            
            // Store the URL in localStorage for persistence
            setLocal('lastGridItemUrl', url);
            console.log(`Stored lastGridItemUrl: ${url}`);
            
        } catch (error) {
            console.error('Error triggering content load:', error);
        }
    }
    
    // Handle grid item clicks
    const gridItems = document.querySelectorAll('.product-grid .product-item');
    const urls = [
        '/ai/adventure/adventureiq.html',
        '/ai/app/appiq.html',
        '/ai/book/bookiq.html',
        '/ai/calorie/calorieiq.html',
        '/ai/decision/decisioniq.html',
        '/ai/emotion/emotioniq.html',
        '/ai/enneagram/enneagramiq.html',
        '/ai/event/eventiq.html',
        '/ai/fitness/fitnessiq.html',
        '/ai/general/general.html',
        '/ai/income/budget.html', // IncomeIQ URL
        '/ai/marketing/marketingiq.html', // MarketingIQ URL
        '/ai/business/businessiq.html', // NewBizIQ URL
        '/ai/quiz/quiziq.html',
        '/ai/receipts/receiptsiq.html',
        '/ai/report/reportiq.html',
        '/ai/research/researchiq.html',
        '/ai/social/socialiq.html',
        '/ai/speculation/speculationiq.html',
        '/ai/symptom/symptomiq.html',
        '/ai/workflow/workflowiq.html'
    ];
    
    // Add click handlers to all grid items
    if (gridItems.length > 0) {
        gridItems.forEach((item, index) => {
            if (index < urls.length) {
                item.addEventListener('click', () => {
                    loadContent(urls[index]);
                });
            }
        });
        console.log('Grid item click handlers initialized');
    }
    
    // Initialize visibility control and hide all containers initially
    hideAllContainersInitially();
    
    // Check if we should be in budget mode on page load
    const lastGridItemUrl = getLocal('lastGridItemUrl');
    if (lastGridItemUrl) {
        console.log('Found lastGridItemUrl:', lastGridItemUrl);
        const shouldActivateBudgetMode = lastGridItemUrl === '/ai/income/budget.html';
        
        // Use a delay to ensure all containers are created before toggling
        setTimeout(() => {
            toggleUiMode(shouldActivateBudgetMode);
        }, 500);
    }
    
    // Force initialization events for components
    setTimeout(() => {
        // Dispatch a custom event to notify the components to initialize
        const initEvent = new CustomEvent('force-components-init', {
            detail: { timestamp: currentTime }
        });
        document.dispatchEvent(initEvent);
        console.log('Forced initialization event dispatched');
    }, 100);
});