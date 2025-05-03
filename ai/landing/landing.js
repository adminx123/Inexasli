/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';
import { setLocal } from '/utility/setlocal.js';

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
        'creative': ['AdAgencyIQ', 'QuizIQ'],
        'decision': ['DecisionIQ'],
        'workflow': ['App', 'WorkflowIQ'],
        'educational': ['General']
    };
    
    // Function to filter grid items by category
    function filterGridItems(category) {
        const gridItems = document.querySelectorAll('.grid-item');
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
    
    // Handle grid item clicks
    const gridItems = document.querySelectorAll('.grid-container .grid-item');
    const urls = [
      `  '/ai/marketing/adagencyiq.html',
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
        '/ai/budget/incomeiq.html',
        '/ai/business/businessiq.html',
        '/ai/quiz/quiziq.html',
        '/ai/receipts/receiptsiq.html',
        '/ai/report/reportiq.html',
        '/ai/research/researchiq.html',
        '/ai/social/socialiq.html',
        '/ai/speculation/speculationiq.html',
        '/ai/symptom/symptomiq.html',
        '/ai/workflow/workflowiq.html'`
    ];
    
    // Function to load content into datain container
    async function loadContent(url) {
        try {
            console.log(`Grid item clicked, loading content from: ${url}`);
            
            // Create and dispatch event for promptgrid.js to handle
            const gridItemEvent = new CustomEvent('promptGridItemSelected', { 
                detail: { url: url }
            });
            document.dispatchEvent(gridItemEvent);
            
            // Store the URL in localStorage for persistence
            setLocal('lastGridItemUrl', url);
            console.log(`Stored lastGridItemUrl: ${url}`);
            
        } catch (error) {
            console.error('Error triggering content load:', error);
        }
    }
    
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