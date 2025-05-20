// filepath: /Users/dallasp/Library/Mobile Documents/com~apple~CloudDocs/Finance/Inexasli/utility/swipeFunctionality.js
/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

/**
 * Initializes swipe functionality for a container element
 * 
 * @param {HTMLElement} container - The container element to add swipe functionality to
 * @param {string} direction - The direction to swipe ('left' or 'right')
 * @param {Function} onSwipeComplete - Callback function to execute when swipe is complete
 * @param {Object} options - Additional configuration options
 */
export function initializeSwipeFunctionality(container, direction = 'left', onSwipeComplete = null, options = {}) {
    if (!container) {
        console.error('Container element is required for swipe functionality');
        return;
    }
    
    // Default options
    const defaultOptions = {
        threshold: 100,                // Minimum distance to trigger swipe action (px)
        showEducationIndicator: true,  // Show initial swipe education indicator
        showSwipeHint: true,           // Show swipe hint animation on first view
        animationDuration: 300,        // Animation duration in ms
        sessionStorageKey: 'swipeEducationShown' + direction.charAt(0).toUpperCase() + direction.slice(1)
    };
    
    // Merge default options with user options
    const config = { ...defaultOptions, ...options };
    
    // Touch tracking variables
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTranslate = 0;
    
    // Event handlers
    function handleTouchStart(e) {
        console.log(`Touch start detected on ${container.id || 'container'}`);
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        console.log(`Touch coordinates: X=${touchStartX}, Y=${touchStartY}`);
        
        // Remove transition temporarily during the swipe
        container.style.transition = 'none';
        
        // Add event listeners for swipe gestures
        container.addEventListener('touchmove', handleTouchMove, { passive: true });
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('touchcancel', handleTouchEnd);
        
        // Don't prevent default here to allow scrolling to work
    }
    
    function handleTouchMove(e) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Calculate horizontal and vertical distances moved
        const diffX = touchX - touchStartX;
        const diffY = touchY - touchStartY;
        
        // If this appears to be primarily a horizontal swipe AND in the correct direction
        const isCorrectDirection = (direction === 'left' && diffX < 0) || (direction === 'right' && diffX > 0);
        
        if (Math.abs(diffX) > Math.abs(diffY) * 0.8 && isCorrectDirection) {
            // Only prevent default for intentional horizontal swipes in the correct direction
            e.preventDefault();
            e.stopPropagation();
        } else if (Math.abs(diffY) > 10) {
            // This appears to be a vertical scroll, so don't interfere
            return;
        }
        
        console.log(`Touch move: diffX=${diffX}, diffY=${diffY}`);
        
        // Only apply transform for swipes in the correct direction
        if (Math.abs(diffX) > Math.abs(diffY) * 0.8 && isCorrectDirection) {
            currentTranslate = diffX;
            container.style.transform = `translateX(${diffX}px)`;
            console.log(`Applied transform: translateX(${diffX}px)`);
            
            // Add dynamic opacity effect based on swipe distance
            const opacityValue = Math.max(0.7, 1 - (Math.abs(diffX) / 300));
            container.style.opacity = opacityValue.toString();
            
            // Show swipe indicator if swipe distance is significant
            if (Math.abs(diffX) > 50) {
                if (!container.querySelector('.swipe-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'swipe-indicator';
                    indicator.innerHTML = direction === 'left' ? '← Swipe to close' : 'Swipe to close →';
                    indicator.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: ${direction === 'left' ? '20%' : '60%'};
                        transform: translateY(-50%);
                        background-color: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 10px 15px;
                        border-radius: 20px;
                        font-family: "Geist", sans-serif;
                        font-size: 16px;
                        z-index: 12000;
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    `;
                    container.appendChild(indicator);
                    
                    // Fade in the indicator
                    setTimeout(() => {
                        indicator.style.opacity = '1';
                    }, 10);
                }
            }
        }
    }
    
    function handleTouchEnd(e) {
        // Remove swipe indicator if it exists
        const indicator = container.querySelector('.swipe-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 200);
        }
        
        // Restore transition for smooth animation
        container.style.transition = `transform ${config.animationDuration}ms ease, opacity ${config.animationDuration}ms ease`;
        
        // Check swipe direction and threshold
        const swipeThresholdMet = direction === 'left' 
            ? currentTranslate < -config.threshold 
            : currentTranslate > config.threshold;
        
        // Check if the swipe was significant enough
        if (swipeThresholdMet) {
            // Complete the swipe animation
            const translateValue = direction === 'left' ? '-100%' : '100%';
            container.style.transform = `translateX(${translateValue})`;
            container.style.opacity = '0';
            
            // Trigger callback after animation completes
            setTimeout(() => {
                container.style.transform = '';
                container.style.opacity = '1';
                container.style.transition = '';
                
                // Execute the callback if provided
                if (typeof onSwipeComplete === 'function') {
                    onSwipeComplete();
                }
            }, config.animationDuration);
        } else {
            // Reset position if swipe wasn't far enough
            container.style.transform = '';
            container.style.opacity = '1';
            setTimeout(() => {
                container.style.transition = '';
            }, config.animationDuration);
        }
        
        // Remove event listeners
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
        
        currentTranslate = 0;
    }
    
    // Add touch event listeners to container
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Also add touch events to handle nested scrollable content
    container.addEventListener('touchmove', (e) => {
        // For nested scrollable content, we want to allow default scrolling behavior
        // We don't need to prevent default here as that would block scrolling
        // This event listener is just for handling additional logic, not blocking scrolls
    }, { passive: true });
    
    // Show swipe hint if enabled
    if (config.showSwipeHint) {
        showSwipeHint(container, direction, config.animationDuration);
    }
    
    // Show initial swipe education indicator if enabled
    if (config.showEducationIndicator) {
        document.addEventListener('touchstart', () => {
            // Only show education the first time per session
            if (!sessionStorage.getItem(config.sessionStorageKey)) {
                addSwipeEducationIndicator(container, direction);
                sessionStorage.setItem(config.sessionStorageKey, 'true');
            }
        }, { passive: true });
    }
    
    // Debug message to confirm initialization
    console.log(`Swipe ${direction} functionality initialized for ${container.id || 'container'}`);
    
    return {
        destroy: () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('touchcancel', handleTouchEnd);
            console.log(`Swipe functionality removed from ${container.id || 'container'}`);
        }
    };
}

/**
 * Shows a temporary swipe hint animation
 */
function showSwipeHint(container, direction, animationDuration) {
    // Create swipe hint element
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    
    // Set content based on direction
    const arrowSymbol = direction === 'left' ? '←' : '→';
    swipeHint.innerHTML = `${arrowSymbol} <span class="swipe-animation">Swipe ${direction} to close</span>`;
    
    // Apply styles
    swipeHint.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-family: "Geist", sans-serif;
        font-size: 16px;
        z-index: 12000;
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    
    // Add animation style for the swipe hint
    const animClass = `swipe-${direction}-animation`;
    if (!document.querySelector(`style[data-id="${animClass}"]`)) {
        const animStyle = document.createElement('style');
        animStyle.dataset.id = animClass;
        animStyle.textContent = `
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
            @keyframes swipe${direction.charAt(0).toUpperCase() + direction.slice(1)} {
                0% { transform: translateX(0); }
                50% { transform: translateX(${direction === 'left' ? '-' : ''}10px); }
                100% { transform: translateX(0); }
            }
            .swipe-animation {
                display: inline-block;
                animation: pulse 1.5s infinite, swipe${direction.charAt(0).toUpperCase() + direction.slice(1)} 1.5s infinite;
            }
        `;
        document.head.appendChild(animStyle);
    }
    
    // Add to container
    container.appendChild(swipeHint);
    
    // Fade in the hint and then fade it out after a few seconds
    setTimeout(() => {
        swipeHint.style.opacity = '1';
        setTimeout(() => {
            swipeHint.style.opacity = '0';
            setTimeout(() => {
                if (swipeHint.parentNode) {
                    swipeHint.parentNode.removeChild(swipeHint);
                }
            }, 500);
        }, 3000);
    }, 500);
}

/**
 * Adds a one-time education indicator to help users understand the swipe gesture
 */
function addSwipeEducationIndicator(container, direction) {
    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'swipe-education';
    
    // Set content based on direction
    const arrowSymbol = direction === 'left' ? '←' : '→';
    indicator.innerHTML = `<div class="swipe-arrow">${arrowSymbol}</div> Swipe ${direction} to close`;
    
    // Apply styles
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        ${direction === 'left' ? 'left: 30px;' : 'right: 30px;'}
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 12px;
        font-family: "Geist", sans-serif;
        font-size: 16px;
        z-index: 12500;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    // Add animation for the arrow
    const arrowClass = `arrow-${direction}-animation`;
    if (!document.querySelector(`style[data-id="${arrowClass}"]`)) {
        const arrowStyle = document.createElement('style');
        arrowStyle.dataset.id = arrowClass;
        arrowStyle.textContent = `
            @keyframes pulseArrow${direction.charAt(0).toUpperCase() + direction.slice(1)} {
                0% { opacity: 0.7; transform: translateX(0); }
                50% { opacity: 1; transform: translateX(${direction === 'left' ? '-' : ''}10px); }
                100% { opacity: 0.7; transform: translateX(0); }
            }
            .swipe-arrow {
                display: inline-block;
                animation: pulseArrow${direction.charAt(0).toUpperCase() + direction.slice(1)} 1.5s infinite;
                font-size: 20px;
                margin-right: 5px;
            }
        `;
        document.head.appendChild(arrowStyle);
    }
    
    // Add to document body
    document.body.appendChild(indicator);
    
    // Show and hide the indicator briefly after a delay
    setTimeout(() => {
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) indicator.parentNode.removeChild(indicator);
            }, 500);
        }, 3000);
    }, 1000);
}