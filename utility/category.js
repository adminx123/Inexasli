/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */


function createCategoryButton() {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '0'; // Position at the very bottom
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
    
    // Apply 3D tab styling - for bottom left corner
    button.style.backgroundColor = '#f5f5f5';
    button.style.color = '#000';
    button.style.border = '2px solid #000';
    button.style.borderLeft = 'none'; // Remove left border to look tucked into corner
    button.style.borderBottom = 'none'; // Remove bottom border to look tucked into corner
    button.style.borderRadius = '0 8px 0 0'; // Rounded only on top right corner
    button.style.boxShadow = '4px -4px 0 #000'; // Shadow up and right
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
    button.style.bottom = '0'; // Ensure it's at the very bottom
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
    
    // Add active/click effect
    button.addEventListener('mousedown', function() {
        button.style.transform = 'translate(2px, -2px)'; // Move diagonally up-right when pressed
        button.style.boxShadow = '2px -2px 0 #000'; // Smaller shadow when pressed
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'translate(0, 0)';
        button.style.boxShadow = '4px -4px 0 #000'; // Restore shadow when released
    });
    
    // Add click event
    button.addEventListener('click', handleCategoryClick);
    
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

/**
 * Handle category button click
 * Implement your category-related functionality here
 */
function handleCategoryClick() {
    // This function can be customized to implement category-related functionality
    console.log("Category button clicked");
    
    // Example implementation: Toggle category panel or navigate to category page
    // For now, we'll just show an alert as a placeholder
    alert("Category feature activated!");
}

/**
 * Initialize the category button functionality
 * @param {boolean} showButton - Whether to show the floating button
 * @returns {HTMLElement|null} - The button container element if created
 */
function initCategoryButton(showButton = true) {
    if (showButton) {
        return createCategoryButton();
    }
    return null;
}

// Export functions for use in other files
window.categoryManager = {
    initButton: initCategoryButton,
    handleCategoryClick: handleCategoryClick
};

// Create the button immediately when script is loaded
if (document.body) {
    initCategoryButton(true);
} else {
    // If body isn't available yet, wait for it
    window.addEventListener('load', function() {
        initCategoryButton(true);
    });
}