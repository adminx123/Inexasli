/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// Category manager implementation using immediately invoked function expression (IIFE)
// This creates a closure with private methods but exposes a public API
const categoryManager = (function() {
    // Categorization of grid items by domain
    const itemCategories = {
        'health': ['CalorieIQ', 'FitnessIQ', 'SymptomIQ', 'EmotionIQ'],
        'business': ['NewBizIQ', 'WorkflowIQ', 'MarketingIQ', 'DecisionIQ'],
        'finance': ['IncomeIQ', 'ReceiptsIQ', 'SpeculationIQ'],
        'lifestyle': ['AdventureIQ', 'EventIQ', 'SocialIQ'],
        'personal': ['EnneagramIQ', 'EmotionIQ', 'SocialIQ'],
        'learning': ['BookIQ', 'ResearchIQ', 'QuizIQ', 'General', 'ReportIQ'],
        'productivity': ['App', 'WorkflowIQ', 'DecisionIQ']
    };

    // Product URLs mapping 
    const productUrls = {
        'AdventureIQ': '/ai/adventure/adventureiq.html',
        'App': '/ai/app/appiq.html',
        'BookIQ': '/ai/book/bookiq.html',
        'CalorieIQ': '/ai/calorie/calorieiq.html',
        'DecisionIQ': '/ai/decision/decisioniq.html',
        'EmotionIQ': '/ai/emotion/emotioniq.html',
        'EnneagramIQ': '/ai/enneagram/enneagramiq.html',
        'EventIQ': '/ai/event/eventiq.html',
        'FitnessIQ': '/ai/fitness/fitnessiq.html',
        'General': '/ai/general/general.html',
        'IncomeIQ': '/ai/income/budget.html',
        'MarketingIQ': '/ai/marketing/marketingiq.html',
        'NewBizIQ': '/ai/business/businessiq.html',
        'QuizIQ': '/ai/quiz/quiziq.html',
        'ReceiptsIQ': '/ai/receipts/receiptsiq.html',
        'ReportIQ': '/ai/report/reportiq.html',
        'ResearchIQ': '/ai/research/researchiq.html',
        'SocialIQ': '/ai/social/socialiq.html',
        'SpeculationIQ': '/ai/speculation/speculationiq.html',
        'SymptomIQ': '/ai/symptom/symptomiq.html',
        'WorkflowIQ': '/ai/workflow/workflowiq.html'
    };

    // Create or get modal container
    function getCategoryModal() {
        let modal = document.getElementById('category-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'category-modal';
            modal.className = 'category-modal';
            
            // Add click handler to close when clicking outside the content
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    closeCategoryModal();
                }
            });
            
            // Add keydown handler to close on escape
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && modal.style.display === 'flex') {
                    closeCategoryModal();
                }
            });
            
            // Create and append modal content
            const modalContent = createCategoryModalContent();
            modal.appendChild(modalContent);
            
            document.body.appendChild(modal);
        }
        return modal;
    }
    
    // Function to open the category modal
    function openCategoryModal() {
        const modal = getCategoryModal();
        modal.style.display = 'flex';
    }
    
    // Function to close the category modal
    function closeCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Function to handle category selection
    function filterGridItems(category) {
        // Update active class on filter buttons
        document.querySelectorAll('.category-filter-item').forEach(btn => {
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Emit a custom event that other parts of the application can listen for
        const categorySelectedEvent = new CustomEvent('categorySelected', { 
            detail: { category: category }
        });
        document.dispatchEvent(categorySelectedEvent);
        
        // Clear any existing product items in the modal
        const existingProductGrid = document.querySelector('#category-modal .product-grid');
        if (existingProductGrid) {
            existingProductGrid.remove();
        }
        
        // Create a product grid to show filtered items
        const productGrid = createProductGrid(category);
        
        // Get the modal content element
        const modalContent = document.querySelector('.category-modal-content');
        if (modalContent) {
            // Add the product grid to the modal
            modalContent.appendChild(productGrid);
            
            // Add a back button to go back to categories
            if (!document.querySelector('.category-back-button')) {
                const backButton = document.createElement('button');
                backButton.className = 'category-back-button';
                backButton.textContent = '← Back to Categories';
                backButton.addEventListener('click', showCategoriesOnly);
                
                // Insert back button before the product grid
                modalContent.insertBefore(backButton, productGrid);
            }
            
            // Hide the category filters
            const filterGrid = document.querySelector('.category-filter-grid');
            if (filterGrid) {
                filterGrid.style.display = 'none';
            }
            
            // Update the modal title based on category
            const title = modalContent.querySelector('h2');
            if (title) {
                title.textContent = category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1);
            }
        }
    }
    
    // Function to create a product grid with items filtered by category
    function createProductGrid(category) {
        const productGrid = document.createElement('div');
        productGrid.className = 'product-grid';
        
        // Get the list of product names to display
        let productNames = [];
        if (category === 'all') {
            // For 'all' category, get all unique product names
            productNames = Object.keys(productUrls);
        } else {
            // For specific category, get products from that category
            productNames = itemCategories[category] || [];
        }
        
        // Create product items based on the filtered list
        productNames.forEach(name => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            
            // Create name span
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name + '™';
            
            // Create premium notice if needed
            const premiumSpan = document.createElement('span');
            premiumSpan.className = 'premium-notice';
            
            // Add premium tag to selected items
            const premiumItems = [
                'AdventureIQ', 'App', 'DecisionIQ', 'EmotionIQ', 'EnneagramIQ', 
                'EventIQ', 'IncomeIQ', 'MarketingIQ', 'NewBizIQ', 'ReportIQ',
                'ResearchIQ', 'SocialIQ', 'SpeculationIQ', 'WorkflowIQ'
            ];
            if (premiumItems.includes(name)) {
                premiumSpan.textContent = 'Premium';
            }
            
            // Add click handler to load the product
            productItem.addEventListener('click', () => {
                const url = productUrls[name];
                if (url) {
                    loadProductContent(url);
                    closeCategoryModal();
                }
            });
            
            // Append spans to product item
            productItem.appendChild(nameSpan);
            productItem.appendChild(premiumSpan);
            
            // Add the product item to the grid
            productGrid.appendChild(productItem);
        });
        
        return productGrid;
    }
    
    // Function to show only categories and hide products
    function showCategoriesOnly() {
        // Remove any product grid
        const existingProductGrid = document.querySelector('#category-modal .product-grid');
        if (existingProductGrid) {
            existingProductGrid.remove();
        }
        
        // Show the category filters
        const filterGrid = document.querySelector('.category-filter-grid');
        if (filterGrid) {
            filterGrid.style.display = 'flex';
        }
        
        // Remove the back button
        const backButton = document.querySelector('.category-back-button');
        if (backButton) {
            backButton.remove();
        }
        
        // Reset modal title
        const modalContent = document.querySelector('.category-modal-content');
        if (modalContent) {
            const title = modalContent.querySelector('h2');
            if (title) {
                title.textContent = 'Categories';
            }
        }
    }
    
    // Function to load product content - connects to landing.js functionality
    function loadProductContent(url) {
        try {
            console.log(`Product item clicked, loading content from: ${url}`);
            
            // Detect if this is the budget/incomeIQ item
            const isBudgetItem = url === '/ai/income/budget.html';
            
            // Toggle UI mode based on selection if the function exists
            if (typeof window.toggleUiMode === 'function') {
                window.toggleUiMode(isBudgetItem);
            }
            
            if (!isBudgetItem) {
                // For non-budget items, use regular content loading
                // Create and dispatch event for promptgrid.js to handle
                const gridItemEvent = new CustomEvent('promptGridItemSelected', { 
                    detail: { url: url }
                });
                document.dispatchEvent(gridItemEvent);
            }
            
            // Store the URL in localStorage for persistence
            if (typeof window.setLocal === 'function') {
                window.setLocal('lastGridItemUrl', url);
                console.log(`Stored lastGridItemUrl: ${url}`);
            } else {
                // Fallback if setLocal isn't available
                localStorage.setItem('lastGridItemUrl', url);
            }
            
        } catch (error) {
            console.error('Error triggering content load:', error);
        }
    }

    // Function to create modal HTML with category content - enhanced for boil-down approach
    function createCategoryModalContent() {
        // Create container for the modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'category-modal-content';
        
        // Add styles
        const modalStyles = `
            .category-modal {
                display: none;
                position: fixed;
                background-color: rgba(0, 0, 0, 0.5);
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                justify-content: center;
                align-items: center;
                padding: 30px;
                z-index: 20000;
                overflow-y: auto;
                font-family: "Inter", sans-serif;
            }
            
            .category-modal-content {
                background-color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow: auto;
                position: relative;
                font-family: "Inter", sans-serif;
                border: 2px solid #000;
                border-radius: 8px;
                box-shadow: 4px 4px 0 #000;
            }
            
            /* Back button styling */
            .category-back-button {
                background-color: #f5f5f5;
                color: #000;
                border: 1px solid #000;
                border-radius: 5px;
                padding: 8px 15px;
                margin-bottom: 15px;
                cursor: pointer;
                font-family: "Geist", sans-serif;
                font-size: 14px;
                box-shadow: 2px 2px 0 #000;
                transition: all 0.2s ease;
                align-self: flex-start;
            }
            
            .category-back-button:hover {
                background-color: #e5e5e5;
                transform: translateY(-2px);
                box-shadow: 3px 3px 0 #000;
            }
            
            .category-back-button:active {
                transform: translateY(0);
                box-shadow: 1px 1px 0 #000;
            }
            
            .category-filter-grid {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 12px;
                width: 100%;
                max-width: 100%;
                margin: 0;
                justify-content: center;
            }
            
            .category-filter-item {
                background-color: #e0e0e0;
                padding: 12px 15px;
                border-radius: 5px;
                text-align: center;
                cursor: pointer;
                font-size: 14px;
                font-family: "Geist", sans-serif;
                min-width: 100px;
                box-shadow: 2px 2px 0 #000;
                border: 1px solid #000;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                display: flex;
                justify-content: center;
                align-items: center;
                text-transform: uppercase;
                font-weight: 500;
                flex: 0 0 calc(33.33% - 12px);
                margin-bottom: 12px;
            }
            
            .category-filter-item:hover {
                background-color: #d0d0d0;
                transform: translateY(-2px);
                box-shadow: 3px 3px 0 #000;
            }
            
            .category-filter-item.active {
                background-color: #c0c0c0;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2), 2px 2px 0 #000;
                transform: translateY(0);
            }
            
            /* Product grid styling inside modal */
            .product-grid {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding-right: 5px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .product-item {
                background-color: #ffffff;
                padding: 10px 15px;
                border-radius: 5px;
                text-align: center;
                cursor: pointer;
                font-size: 13px;
                font-family: "Geist", sans-serif;
                width: 100%;
                box-shadow: 2px 2px 0 #000;
                border: 1px solid #000;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
            
            .product-item:hover {
                background-color: #f5f5f5;
                transform: translateY(-2px);
                box-shadow: 3px 3px 0 #000;
            }
            
            .product-item span:first-child {
                font-weight: 500;
            }
            
            .premium-notice {
                font-size: 10px;
                color: #888;
                display: inline-block;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 3px;
                background-color: #f0f0f0;
            }
            
            .modal-close-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #000;
            }
            
            @media (max-width: 768px) {
                .category-modal-content {
                    padding: 15px;
                    width: 90%;
                    max-width: 320px;
                }
                
                .category-filter-grid {
                    gap: 8px;
                }
                
                .category-filter-item {
                    font-size: 12px;
                    padding: 10px;
                    min-width: 80px;
                    flex: 0 0 calc(50% - 8px);
                }
                
                .product-item {
                    font-size: 12px;
                    padding: 10px 12px;
                }
                
                .premium-notice {
                    font-size: 9px;
                }
            }
        `;
        
        // Add styles to document
        const styleElement = document.createElement('style');
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', closeCategoryModal);
        modalContent.appendChild(closeButton);
        
        // Create title
        const title = document.createElement('h2');
        title.style.textAlign = 'center';
        title.style.fontFamily = '"Geist", sans-serif';
        title.style.marginBottom = '20px';
        title.style.fontSize = '20px';
        title.textContent = 'Categories';
        modalContent.appendChild(title);
        
        // Create category filter grid
        const filterGrid = document.createElement('div');
        filterGrid.className = 'category-filter-grid';
        
        // Add filter items with a more uniform layout
        const categories = [
            { id: 'all', label: 'ALL' },
            { id: 'health', label: 'HEALTH' },
            { id: 'business', label: 'BUSINESS' },
            { id: 'finance', label: 'FINANCE' },
            { id: 'lifestyle', label: 'LIFESTYLE' },
            { id: 'personal', label: 'PERSONAL' },
            { id: 'learning', label: 'LEARNING' },
            { id: 'productivity', label: 'PRODUCTIVITY' }
        ];
        
        categories.forEach(cat => {
            const filterItem = document.createElement('div');
            filterItem.className = 'category-filter-item' + (cat.id === 'all' ? ' active' : '');
            filterItem.setAttribute('data-category', cat.id);
            filterItem.textContent = cat.label;        filterItem.addEventListener('click', () => filterGridItems(cat.id));
            filterGrid.appendChild(filterItem);
        });
        
        modalContent.appendChild(filterGrid);
        
        // Add a subtitle or instruction
        const subtitle = document.createElement('p');
        subtitle.style.textAlign = 'center';
        subtitle.style.fontFamily = '"Inter", sans-serif';
        subtitle.style.fontSize = '14px';
        subtitle.style.margin = '20px 0 0';
        subtitle.style.color = '#555';
        subtitle.textContent = 'Select a category to filter products';
        modalContent.appendChild(subtitle);
        
        return modalContent;
    }
    
    // Create button in bottom left corner
    function createCategoryButton() {
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '0'; // Position at the very top
        buttonContainer.style.left = '0'; // Position at the very left
        buttonContainer.style.transform = 'none';
        buttonContainer.style.zIndex = '9999'; // Higher z-index to ensure visibility
        buttonContainer.style.padding = '0'; // Remove any padding
        buttonContainer.style.margin = '0'; // Remove any margin
        buttonContainer.style.display = 'block'; // Use block instead of flex
        
        // Create the button with the 3D tab styling
        const button = document.createElement('button');
        button.id = 'categoryButton';
        button.title = 'Open Categories'; // Add title for accessibility
        
        // Apply 3D tab styling - for top left corner
        button.style.backgroundColor = '#f5f5f5';
        button.style.color = '#000';
        button.style.border = '2px solid #000';
        button.style.borderLeft = 'none'; // Remove left border to look tucked into corner
        button.style.borderTop = 'none'; // Remove top border to look tucked into corner
        button.style.borderRadius = '0 0 8px 0'; // Rounded only on bottom right corner
        button.style.boxShadow = '4px 4px 0 #000'; // Shadow down and right
        button.style.padding = '0'; // Reduced padding
        button.style.width = '36px'; // Match other corner buttons
        button.style.height = '36px'; // Match other corner buttons
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.cursor = 'pointer';
        button.style.margin = '0'; // Remove any margin
        button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
        button.style.position = 'relative'; // Add position relative
        button.style.top = '0'; // Ensure it's at the very top
        button.style.left = '0'; // Ensure it's at the very left
        
        // Create a grid icon (4 squares)
        const icon = document.createElement('i');
        icon.className = 'bx bx-grid-alt'; // Using boxicons grid-alt icon for 4 squares
        icon.style.fontSize = '18px'; // Match other corner button icon sizes
        button.appendChild(icon);
        
        // Add hover effect matching the tab style
        button.addEventListener('mouseover', function() {
            button.style.backgroundColor = '#FFFFFF';
        });
        
        button.addEventListener('mouseout', function() {
            button.style.backgroundColor = '#f5f5f5';
        });
        
        // Add active/click effect - adjusted for top left position
        button.addEventListener('mousedown', function() {
            button.style.transform = 'translate(2px, 2px)'; // Move diagonally down-right when pressed
            button.style.boxShadow = '2px 2px 0 #000'; // Smaller shadow when pressed
        });
        
        button.addEventListener('mouseup', function() {
            button.style.transform = 'translate(0, 0)';
            button.style.boxShadow = '4px 4px 0 #000'; // Restore shadow when released
        });
        
        // Add click event to open the category modal
        button.addEventListener('click', openCategoryModal);
        
        // Append button to container, and container to body
        buttonContainer.appendChild(button);
        document.body.appendChild(buttonContainer);
        
        // Add media query for mobile devices
        const mobileQuery = window.matchMedia("(max-width: 480px)");
        const adjustForMobile = (query) => {
            if (query.matches) { // If media query matches (mobile)
                button.style.width = '28px'; // Match mobile tab width
                button.style.height = '28px'; // Match mobile tab height
                icon.style.fontSize = '14px'; // Smaller icon for mobile
            } else {
                button.style.width = '36px'; // Desktop size
                button.style.height = '36px'; // Desktop size
                icon.style.fontSize = '18px'; // Desktop icon size
            }
        };
        
        // Initial check
        adjustForMobile(mobileQuery);
        
        // Listen for changes (like rotation)
        mobileQuery.addListener(adjustForMobile);
        
        return buttonContainer;
    }
    
    // Initialize the category button
    function initCategoryButton(showButton = true) {
        if (showButton) {
            // Create the button
            const buttonContainer = createCategoryButton();
            
            // Add a document-level event listener for category events
            document.addEventListener('categorySelected', function(event) {
                const selectedCategory = event.detail.category;
                console.log(`Category selected: ${selectedCategory}`);
                
                // This will be triggered when a category is selected either from
                // the modal or from anywhere else that dispatches this event
                if (selectedCategory) {
                    const category = selectedCategory.toLowerCase();
                    filterGridItems(category);
                }
            });
            
            // Also attach event handlers to any pre-existing category filter items on the page
            // These are in the landing page and need to work with our filtering system
            const existingCategoryFilters = document.querySelectorAll('.category-filter-grid .category-filter-item');
            if (existingCategoryFilters.length > 0) {
                console.log('Found existing category filters on page, attaching handlers');
                existingCategoryFilters.forEach(filter => {
                    // Remove existing click listeners to avoid duplicates
                    const clone = filter.cloneNode(true);
                    filter.parentNode.replaceChild(clone, filter);
                    
                    // Add our filter handler
                    const category = clone.getAttribute('data-category');
                    if (category) {
                        clone.addEventListener('click', () => {
                            filterGridItems(category);
                            // Update active class on these page filters too
                            document.querySelectorAll('.category-filter-grid .category-filter-item').forEach(btn => {
                                if (btn.getAttribute('data-category') === category) {
                                    btn.classList.add('active');
                                } else {
                                    btn.classList.remove('active');
                                }
                            });
                        });
                    }
                });
            }
            
            return buttonContainer;
        }
        return null;
    }
    
    // Public API
    return {
        initButton: initCategoryButton,
        openModal: openCategoryModal,
        closeModal: closeCategoryModal
    };
})();

// Initialize the button immediately when script is loaded
if (document.body) {
    categoryManager.initButton(true);
} else {
    // If body isn't available yet, wait for it
    window.addEventListener('load', function() {
        categoryManager.initButton(true);
    });
}

// Open the category modal automatically when on landing page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the landing page
    if (window.location.pathname.includes('landing.html') || 
        window.location.pathname === '/' ||
        window.location.pathname === '/index.html') {
        
        // Wait a moment before opening the modal to ensure everything is loaded
        setTimeout(() => {
            categoryManager.openModal();
        }, 500);
    }
});

// Make functions available to landing.js
window.categoryManager = categoryManager;
// Expose loadProductContent for other scripts to use
window.loadProductContent = loadProductContent;