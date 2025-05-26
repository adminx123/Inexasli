// /*
//  * Copyright (c) 2025 INEXASLI. All rights reserved.
//  * This code is protected under Canadian and international copyright laws.
//  * Unauthorized use, reproduction, distribution, or modification of this code 
//  * without explicit written permission via email from info@inexasli.com 
//  * is strictly prohibited. Violators will be pursued and prosecuted to the 
//  * fullest extent of the law in British Columbia, Canada, and applicable 
//  * jurisdictions worldwide.
//  */

/**
 * Copy utility - Creates a copy button in the bottom right corner
 * that copies content to the clipboard
 */

/**
 * Create and display a floating copy button in the bottom right corner
 * @param {string} containerId - ID of the container element (where content will be copied from)
 * @param {Function} getContentCallback - Optional callback function to get specific content
 * @returns {HTMLElement} - The created button
 */
function createCopyButton(containerId, getContentCallback) {
    // Create a container for the button
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'copyButtonContainer';
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '0'; // Position at the very bottom (snug in corner)
    buttonContainer.style.right = '0'; // Position at the very right (snug in corner)
    buttonContainer.style.zIndex = '12001'; // Use highest z-index to be visible with other components
    buttonContainer.style.padding = '0';
    buttonContainer.style.margin = '0';
    buttonContainer.style.display = 'block';
    
    // Create the button with the 3D styling
    const button = document.createElement('button');
    button.id = 'copyButton';
    button.title = 'Copy to clipboard';
    
    // Apply 3D styling for bottom right corner
    button.style.backgroundColor = '#f5f5f5';
    button.style.color = '#000';
    button.style.border = '2px solid #000';
    button.style.borderRight = 'none'; // Remove right border to look tucked into corner
    button.style.borderBottom = 'none'; // Remove bottom border to look tucked into corner
    button.style.borderRadius = '8px 0 0 0'; // Rounded only on top left corner
    button.style.boxShadow = '-4px -4px 0 #000'; // Shadow up and left for right corner
    button.style.padding = '0';
    button.style.width = '36px';
    button.style.height = '36px';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.cursor = 'pointer';
    button.style.margin = '0';
    button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
    
    // Create the copy icon (using SVG for consistency)
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('width', '18');
    iconSvg.setAttribute('height', '18');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.style.stroke = 'currentColor';
    iconSvg.style.strokeWidth = '2';
    iconSvg.style.strokeLinecap = 'round';
    iconSvg.style.strokeLinejoin = 'round';
    
    // Path 1 for the document
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V4Z');
    
    // Path 2 for the second document (behind)
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8');
    
    iconSvg.appendChild(path1);
    iconSvg.appendChild(path2);
    button.appendChild(iconSvg);
    
    // Add hover effect
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#FFFFFF';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#f5f5f5';
    });
    
    // Add active/click effect for bottom right position
    button.addEventListener('mousedown', function() {
        button.style.transform = 'translate(-2px, -2px)'; // Move diagonally up-left when pressed
        button.style.boxShadow = '-2px -2px 0 #000'; // Smaller shadow when pressed
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'translate(0, 0)';
        button.style.boxShadow = '-4px -4px 0 #000'; // Restore shadow when released
    });
    
    // Add click event to copy content
    button.addEventListener('click', function() {
        copyContent(containerId, getContentCallback);
    });
    
    // Append button to container, and container to body
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    // Add media query for mobile devices
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const adjustForMobile = (query) => {
        if (query.matches) { // If media query matches (mobile)
            button.style.width = '28px'; // Match mobile tab width
            button.style.height = '28px'; // Match mobile tab height
            iconSvg.setAttribute('width', '14');
            iconSvg.setAttribute('height', '14');
            // Keep button snug in the corner even on mobile
            buttonContainer.style.bottom = '0';
            buttonContainer.style.right = '0';
        } else {
            button.style.width = '36px'; // Desktop size
            button.style.height = '36px'; // Desktop size
            iconSvg.setAttribute('width', '18');
            iconSvg.setAttribute('height', '18');
            // Keep button snug in the corner
            buttonContainer.style.bottom = '0';
            buttonContainer.style.right = '0';
        }
    };
    
    // Initial check
    adjustForMobile(mobileQuery);
    
    // Listen for changes (like rotation)
    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', adjustForMobile);
    } else {
        mobileQuery.addListener(adjustForMobile); // Fallback for older browsers
    }
    
    return buttonContainer;
}

/**
 * Copy content from an element to the clipboard
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function copyContent(containerId, getContentCallback) {
    try {
        const containerEl = document.getElementById(containerId);
        if (!containerEl) {
            console.error(`Element with ID '${containerId}' not found`);
            return;
        }

        let textToCopy = '';
        
        // Use callback if provided, otherwise use container's text content
        if (typeof getContentCallback === 'function') {
            textToCopy = getContentCallback(containerEl);
        } else {
            textToCopy = containerEl.textContent;
        }
        
        // Create a temporary success message/icon
        const button = document.getElementById('copyButton');
        const originalContent = button.innerHTML;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Show success state
                const successIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                successIcon.setAttribute('viewBox', '0 0 24 24');
                successIcon.setAttribute('width', button.querySelector('svg').getAttribute('width'));
                successIcon.setAttribute('height', button.querySelector('svg').getAttribute('height'));
                successIcon.setAttribute('fill', 'none');
                successIcon.style.stroke = 'currentColor';
                successIcon.style.strokeWidth = '2';
                successIcon.style.strokeLinecap = 'round';
                successIcon.style.strokeLinejoin = 'round';
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M9 12L11 14L15 10M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z');
                
                successIcon.appendChild(path);
                button.innerHTML = '';
                button.appendChild(successIcon);
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    button.innerHTML = originalContent;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy content:', err);
                alert('Failed to copy to clipboard');
            });
    } catch (err) {
        console.error('Copy function error:', err);
    }
}

/**
 * Format Philosophy content for nicer clipboard output
 * @param {HTMLElement} outputEl - The output element containing the philosophy data
 * @returns {string} - Formatted text for clipboard
 */
function formatPhilosophyContent(outputEl) {
    let textToCopy = '';
    
    // Get topic
    const topicEl = outputEl.querySelector('.wisdom-topic h2');
    if (topicEl) {
        textToCopy += topicEl.textContent.trim() + '\n\n';
    }
    
    // Get quotes
    const quoteCards = outputEl.querySelectorAll('.quote-card');
    quoteCards.forEach(card => {
        const tradition = card.querySelector('.tradition').textContent.trim();
        const quote = card.querySelector('.quote').textContent.trim();
        const source = card.querySelector('.source').textContent.trim();
        const relevance = card.querySelector('.relevance').textContent.trim();
        
        textToCopy += `${tradition}\n${quote}\n${source}\n${relevance}\n\n`;
    });
    
    // Get reflection
    const reflectionEl = outputEl.querySelector('.reflection');
    if (reflectionEl) {
        const reflectionTitle = reflectionEl.querySelector('.reflection-title').textContent.trim();
        const reflectionContent = reflectionEl.querySelector('.reflection-title + div').textContent.trim();
        textToCopy += `${reflectionTitle}:\n${reflectionContent}`;
    }
    
    return textToCopy;
}

/**
 * Initialize the copy button functionality
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container with content to copy
 * @param {string} options.contentType - Type of content (e.g., 'philosophy') for special formatting
 * @returns {HTMLElement} - The button container element
 */
function initCopyButton(options = {}) {
    const { containerId = 'output-span', contentType = '' } = options;
    
    let formatCallback;
    
    // Select formatter based on content type
    switch(contentType.toLowerCase()) {
        case 'philosophy':
            formatCallback = formatPhilosophyContent;
            break;
        default:
            formatCallback = null;
    }
    
    return createCopyButton(containerId, formatCallback);
}

// Export functions for use in other files
window.copyUtil = {
    init: initCopyButton,
    copy: copyContent
};