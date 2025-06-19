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
 * Features:
 * - Global swipe hint tracking: Shows swipe hint only ONCE across the entire website
 * - Once a user sees the swipe hint on any module, they won't see it again anywhere
 * - Uses localStorage key 'inexasli_global_swipe_hint_seen' for persistence
 * - Prevents multiple event handlers and race conditions
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
    
    // Check if this container already has swipe functionality to prevent conflicts
    if (container._swipeData) {
        console.log(`Adding ${direction} swipe to existing swipe handler on ${container.id || 'container'}`);
        container._swipeData.handlers[direction] = onSwipeComplete;
        return container._swipeData.destroyFunction;
    }
    
    // Default options
    const defaultOptions = {
        threshold: 100,                // Minimum distance to trigger swipe action (px) - balanced for good UX
        showEducationIndicator: false, // Show initial swipe education indicator (disabled to prevent duplicates)
        showSwipeHint: true,           // Show swipe hint animation on first view (3-second bottom hint) - GLOBAL TRACKING
        animationDuration: 300,        // Animation duration in ms
        sessionStorageKey: 'swipeEducationShown' + direction.charAt(0).toUpperCase() + direction.slice(1)
    };
    
    // Merge default options with user options
    const config = { ...defaultOptions, ...options };
    
    // Touch tracking variables
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTranslate = 0;
    let isProcessingSwipe = false; // Prevent multiple simultaneous swipes
    
    // Initialize swipe data structure for this container
    const swipeData = {
        handlers: { [direction]: onSwipeComplete },
        config,
        touchStartX: 0,
        touchStartY: 0,
        currentTranslate: 0,
        isProcessingSwipe: false
    };
    
    // Event handlers
    function handleTouchStart(e) {
        if (swipeData.isProcessingSwipe) {
            console.log('Swipe already in progress, ignoring new touch start');
            return;
        }
        
        console.log(`Touch start detected on ${container.id || 'container'}`);
        
        swipeData.touchStartX = e.touches[0].clientX;
        swipeData.touchStartY = e.touches[0].clientY;
        console.log(`Touch coordinates: X=${swipeData.touchStartX}, Y=${swipeData.touchStartY}`);
        
        // Remove transition temporarily during the swipe
        container.style.transition = 'none';
        
        // Add event listeners for swipe gestures (non-passive for preventDefault)
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('touchcancel', handleTouchEnd);
    }
    
    function handleTouchMove(e) {
        if (swipeData.isProcessingSwipe) {
            return;
        }
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Calculate horizontal and vertical distances moved
        const diffX = touchX - swipeData.touchStartX;
        const diffY = touchY - swipeData.touchStartY;
        
        // Determine which direction this swipe is going
        const isLeftSwipe = diffX < 0;
        const isRightSwipe = diffX > 0;
        const detectedDirection = isLeftSwipe ? 'left' : 'right';
        
        // Check if we have a handler for this direction
        const hasHandler = swipeData.handlers[detectedDirection];
        
        // If this appears to be primarily a horizontal swipe AND we have a handler for this direction
        if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && hasHandler) {
            // Only prevent default for intentional horizontal swipes that we can handle
            e.preventDefault();
            e.stopPropagation();
        } else if (Math.abs(diffY) > 15) {
            // This appears to be a vertical scroll, so don't interfere - increased threshold
            return;
        }
        
        console.log(`Touch move: diffX=${diffX}, diffY=${diffY}, detected: ${detectedDirection}, hasHandler: ${!!hasHandler}`);
        
        // Only apply transform for swipes we can handle
        if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && hasHandler) {
            swipeData.currentTranslate = diffX;
            container.style.transform = `translateX(${diffX}px)`;
            console.log(`Applied transform: translateX(${diffX}px)`);
            
            // Add dynamic opacity effect based on swipe distance
            const opacityValue = Math.max(0.7, 1 - (Math.abs(diffX) / 300));
            container.style.opacity = opacityValue.toString();
        }
    }
    
    function handleTouchEnd(e) {
        if (swipeData.isProcessingSwipe) {
            console.log('Swipe already being processed, ignoring touch end');
            return;
        }
        
        // Restore transition for smooth animation
        container.style.transition = `transform ${config.animationDuration}ms ease, opacity ${config.animationDuration}ms ease`;
        
        // Determine swipe direction based on current translate
        const swipeDirection = swipeData.currentTranslate < 0 ? 'left' : 'right';
        const handler = swipeData.handlers[swipeDirection];
        
        // Check if the swipe was significant enough and we have a handler
        const swipeThresholdMet = Math.abs(swipeData.currentTranslate) > config.threshold;
        
        if (swipeThresholdMet && handler) {
            // Mark as processing to prevent multiple executions
            swipeData.isProcessingSwipe = true;
            
            // Complete the swipe animation
            const translateValue = swipeDirection === 'left' ? '-100%' : '100%';
            container.style.transform = `translateX(${translateValue})`;
            container.style.opacity = '0';
            
            console.log(`Executing ${swipeDirection} swipe callback`);
            
            // Trigger callback after animation completes
            setTimeout(() => {
                container.style.transform = '';
                container.style.opacity = '1';
                container.style.transition = '';
                
                // Execute the callback if provided
                if (typeof handler === 'function') {
                    try {
                        handler();
                    } catch (error) {
                        console.error('Error executing swipe callback:', error);
                    }
                }
                
                // Reset processing flag after a small delay to prevent rapid-fire swipes
                setTimeout(() => {
                    swipeData.isProcessingSwipe = false;
                }, 100);
            }, config.animationDuration);
        } else {
            // Reset position if swipe wasn't far enough or no handler
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
        
        swipeData.currentTranslate = 0;
    }
    
    // Add touch event listeners to container
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Store swipe data on the container to prevent conflicts
    const destroyFunction = () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
        delete container._swipeData;
        console.log(`Swipe functionality removed from ${container.id || 'container'}`);
    };
    
    swipeData.destroyFunction = destroyFunction;
    container._swipeData = swipeData;
    
    // Show swipe hint if enabled (only for the first direction)
    if (config.showSwipeHint && !container._swipeHintShown) {
        showSwipeHint(container, direction, config.animationDuration);
        container._swipeHintShown = true;
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
    
    return destroyFunction;
}

/**
 * Check if user has already seen the global swipe hint
 * Uses localStorage to persist across sessions and modules
 */
function hasSeenGlobalSwipeHint() {
    try {
        return localStorage.getItem('inexasli_global_swipe_hint_seen') === 'true';
    } catch (error) {
        console.warn('[SwipeFunctionality] Could not access localStorage for swipe tracking:', error);
        return false;
    }
}

/**
 * Mark that user has seen the global swipe hint
 * This prevents it from showing again across all modules
 */
function markGlobalSwipeHintSeen() {
    try {
        localStorage.setItem('inexasli_global_swipe_hint_seen', 'true');
        console.log('[SwipeFunctionality] Global swipe hint marked as seen');
    } catch (error) {
        console.warn('[SwipeFunctionality] Could not save swipe tracking to localStorage:', error);
    }
}

/**
 * Shows a temporary swipe hint animation
 */
function showSwipeHint(container, direction, animationDuration) {
    // Global check: Only show if user has never seen it before
    if (hasSeenGlobalSwipeHint()) {
        console.log('[SwipeFunctionality] Swipe hint already seen globally, skipping');
        return;
    }
    
    // Check if swipe hint already exists to prevent duplicates
    if (container.querySelector('.swipe-hint')) {
        return;
    }
    
    // Mark as seen immediately when we decide to show it
    markGlobalSwipeHintSeen();
    
    // Create swipe hint element
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    
    // Always show bidirectional swipe hint for consistency
    const hintText = '← SWIPE →';
    
    // Set content with just SWIPE and arrows
    swipeHint.innerHTML = `<span class="swipe-animation">${hintText}</span>`;
    
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
    const animClass = `swipe-navigate-animation`;
    if (!document.querySelector(`style[data-id="${animClass}"]`)) {
        const animStyle = document.createElement('style');
        animStyle.dataset.id = animClass;
        animStyle.textContent = `
            @keyframes swipeNavigateHint {
                0% { transform: translateX(0); opacity: 1; }
                25% { transform: translateX(-8px); opacity: 0.9; }
                75% { transform: translateX(8px); opacity: 0.9; }
                100% { transform: translateX(0); opacity: 1; }
            }
            .swipe-animation {
                display: inline-block;
                animation: swipeNavigateHint 3s ease-in-out infinite;
            }
        `;
        document.head.appendChild(animStyle);
    }
    
    // Add to container
    container.appendChild(swipeHint);
    
    // Fade in the hint and then fade it out after 15% less time (2.55 seconds instead of 3)
    setTimeout(() => {
        swipeHint.style.opacity = '1';
        setTimeout(() => {
            swipeHint.style.opacity = '0';
            setTimeout(() => {
                if (swipeHint.parentNode) {
                    swipeHint.parentNode.removeChild(swipeHint);
                }
            }, 500);
        }, 2550); // 15% reduction: 3000ms * 0.85 = 2550ms
    }, 500);
}

/**
 * Adds a one-time education indicator to help users understand the swipe gesture
 */
function addSwipeEducationIndicator(container, direction) {
    // Global check: Only show if user has never seen swipe functionality before
    if (hasSeenGlobalSwipeHint()) {
        console.log('[SwipeFunctionality] Swipe education already seen globally, skipping');
        return;
    }
    
    // Mark as seen immediately when we decide to show it
    markGlobalSwipeHintSeen();
    
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

/**
 * Initializes bidirectional swipe functionality for a container element
 * This is a convenience function for adding both left and right swipe handlers
 * 
 * @param {HTMLElement} container - The container element to add swipe functionality to
 * @param {Object} handlers - Object containing left and/or right callback functions
 * @param {Function} handlers.left - Callback for left swipe
 * @param {Function} handlers.right - Callback for right swipe
 * @param {Object} options - Additional configuration options
 */
export function initializeBidirectionalSwipe(container, handlers, options = {}) {
    if (!container) {
        console.error('Container element is required for swipe functionality');
        return;
    }
    
    if (!handlers || (!handlers.left && !handlers.right)) {
        console.error('At least one swipe handler (left or right) must be provided');
        return;
    }
    
    let destroyFunctions = [];
    
    // Initialize left swipe if handler provided
    if (handlers.left) {
        const destroyLeft = initializeSwipeFunctionality(container, 'left', handlers.left, options);
        destroyFunctions.push(destroyLeft);
    }
    
    // Initialize right swipe if handler provided
    if (handlers.right) {
        const destroyRight = initializeSwipeFunctionality(container, 'right', handlers.right, options);
        destroyFunctions.push(destroyRight);
    }
    
    // Return a function to destroy all swipe handlers
    return () => {
        destroyFunctions.forEach(destroy => {
            if (typeof destroy === 'function') {
                destroy();
            }
        });
        console.log(`Bidirectional swipe functionality removed from ${container.id || 'container'}`);
    };
}

/**
 * Initializes vertical swipe functionality for a container element
 * Specifically designed for opening/closing containers with up/down swipes
 * 
 * @param {HTMLElement} container - The container element to add vertical swipe functionality to
 * @param {Object} handlers - Object containing up and/or down callback functions
 * @param {Function} handlers.up - Callback for upward swipe (typically to close/minimize)
 * @param {Function} handlers.down - Callback for downward swipe (typically to open/expand)
 * @param {Object} options - Additional configuration options
 */
export function initializeVerticalSwipe(container, handlers, options = {}) {
    if (!container) {
        console.error('Container element is required for vertical swipe functionality');
        return;
    }
    
    if (!handlers || (!handlers.up && !handlers.down)) {
        console.error('At least one vertical swipe handler (up or down) must be provided');
        return;
    }
    
    // Default options for vertical swipes
    const defaultOptions = {
        threshold: 120,                // Minimum distance to trigger swipe action (px) - increased for less sensitivity
        animationDuration: 300,        // Animation duration in ms
        preventHorizontalSwipe: true,  // Prevent horizontal scrolling during vertical swipes
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Touch tracking variables
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTranslateY = 0;
    let isProcessingVerticalSwipe = false;
    
    // Event handlers for vertical swipes
    function handleVerticalTouchStart(e) {
        if (isProcessingVerticalSwipe) {
            return;
        }
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        console.log(`[VerticalSwipe] Touch start at X: ${touchStartX}, Y: ${touchStartY}`);
        
        // Remove transition temporarily during the swipe
        container.style.transition = 'none';
        
        // Add event listeners for vertical swipe gestures
        container.addEventListener('touchmove', handleVerticalTouchMove, { passive: false });
        container.addEventListener('touchend', handleVerticalTouchEnd);
        container.addEventListener('touchcancel', handleVerticalTouchEnd);
    }
    
    function handleVerticalTouchMove(e) {
        if (isProcessingVerticalSwipe) {
            return;
        }
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Calculate horizontal and vertical distances moved
        const diffX = touchX - touchStartX;
        const diffY = touchY - touchStartY;
        
        // Determine if this is primarily a vertical swipe
        const isVerticalSwipe = Math.abs(diffY) > Math.abs(diffX) * 2.0; // Much stricter ratio - requires 2x more vertical than horizontal
        
        console.log(`[VerticalSwipe] Move - diffX: ${diffX}, diffY: ${diffY}, isVertical: ${isVerticalSwipe}, absY: ${Math.abs(diffY)}, absX: ${Math.abs(diffX)}`);
        
        if (isVerticalSwipe && Math.abs(diffY) > 30) { // Much higher minimum movement threshold to avoid interference with scroll
            // Determine direction
            const isUpSwipe = diffY < 0;
            const isDownSwipe = diffY > 0;
            const detectedDirection = isUpSwipe ? 'up' : 'down';
            const hasHandler = handlers[detectedDirection];
            
            console.log(`[VerticalSwipe] Direction: ${detectedDirection}, hasHandler: ${!!hasHandler}`);
            
            if (hasHandler) {
                // Prevent default scrolling for vertical swipes we can handle
                e.preventDefault();
                e.stopPropagation();
                
                // Apply visual feedback with vertical transform
                currentTranslateY = diffY;
                container.style.transform = `translateY(${diffY}px)`;
                
                // Add dynamic opacity effect based on swipe distance
                const opacityValue = Math.max(0.7, 1 - (Math.abs(diffY) / 200));
                container.style.opacity = opacityValue.toString();
                
                console.log(`Vertical swipe detected: ${detectedDirection}, distance: ${Math.abs(diffY)}px`);
            }
        }
    }
    
    function handleVerticalTouchEnd(e) {
        if (isProcessingVerticalSwipe) {
            return;
        }
        
        console.log(`[VerticalSwipe] Touch end - currentTranslateY: ${currentTranslateY}, absoluteDistance: ${Math.abs(currentTranslateY)}, threshold: ${config.threshold}`);
        
        // Restore transition for smooth animation
        container.style.transition = `transform ${config.animationDuration}ms ease, opacity ${config.animationDuration}ms ease`;
        
        // Determine swipe direction and check threshold
        const swipeDirection = currentTranslateY < 0 ? 'up' : 'down';
        const handler = handlers[swipeDirection];
        const swipeThresholdMet = Math.abs(currentTranslateY) > config.threshold;
        
        console.log(`[VerticalSwipe] Direction: ${swipeDirection}, threshold met: ${swipeThresholdMet} (${Math.abs(currentTranslateY)} > ${config.threshold}), hasHandler: ${!!handler}`);
        
        if (swipeThresholdMet && handler) {
            // Mark as processing to prevent multiple executions
            isProcessingVerticalSwipe = true;
            
            console.log(`[VerticalSwipe] *** EXECUTING ${swipeDirection} swipe callback ***`);
            
            // Complete the swipe animation
            const translateValue = swipeDirection === 'up' ? '-100%' : '100%';
            container.style.transform = `translateY(${translateValue})`;
            container.style.opacity = '0';
            
            // Trigger callback after animation completes
            setTimeout(() => {
                console.log(`[VerticalSwipe] Animation complete, calling handler...`);
                
                // Reset visual state
                container.style.transform = '';
                container.style.opacity = '1';
                container.style.transition = '';
                
                // Execute the callback if provided
                if (typeof handler === 'function') {
                    try {
                        console.log(`[VerticalSwipe] About to call handler function...`);
                        handler();
                        console.log(`[VerticalSwipe] Handler function completed successfully`);
                    } catch (error) {
                        console.error('[VerticalSwipe] Error executing vertical swipe callback:', error);
                    }
                } else {
                    console.error(`[VerticalSwipe] Handler is not a function:`, typeof handler, handler);
                }
                
                // Reset processing flag
                setTimeout(() => {
                    isProcessingVerticalSwipe = false;
                    console.log(`[VerticalSwipe] Processing flag reset`);
                }, 100);
            }, config.animationDuration);
        } else {
            // Reset position if swipe wasn't far enough or no handler
            console.log(`[VerticalSwipe] Resetting position - threshold not met or no handler`);
            container.style.transform = '';
            container.style.opacity = '1';
            setTimeout(() => {
                container.style.transition = '';
            }, config.animationDuration);
        }
        
        // Remove event listeners
        container.removeEventListener('touchmove', handleVerticalTouchMove);
        container.removeEventListener('touchend', handleVerticalTouchEnd);
        container.removeEventListener('touchcancel', handleVerticalTouchEnd);
        
        currentTranslateY = 0;
    }
    
    // Add touch event listeners to container
    container.addEventListener('touchstart', handleVerticalTouchStart, { passive: true });
    
    // Return destroy function
    const destroyVerticalSwipe = () => {
        container.removeEventListener('touchstart', handleVerticalTouchStart);
        container.removeEventListener('touchmove', handleVerticalTouchMove);
        container.removeEventListener('touchend', handleVerticalTouchEnd);
        container.removeEventListener('touchcancel', handleVerticalTouchEnd);
        console.log(`Vertical swipe functionality removed from ${container.id || 'container'}`);
    };
    
    console.log(`Vertical swipe functionality initialized for ${container.id || 'container'}`);
    return destroyVerticalSwipe;
}

/**
 * Reset the global swipe hint tracking (useful for testing)
 * This will allow the swipe hint to show again
 */
export function resetGlobalSwipeTracking() {
    try {
        localStorage.removeItem('inexasli_global_swipe_hint_seen');
        console.log('[SwipeFunctionality] Global swipe tracking reset');
        return true;
    } catch (error) {
        console.warn('[SwipeFunctionality] Could not reset swipe tracking:', error);
        return false;
    }
}

/**
 * Check if user has seen the global swipe hint (exported for external use)
 */
export function hasUserSeenSwipeHint() {
    return hasSeenGlobalSwipeHint();
}

/**
 * Manually mark swipe hint as seen (exported for external use)
 */
export function markSwipeHintSeen() {
    markGlobalSwipeHintSeen();
}

/**
 * Debug utility to check swipe handler status on an element
 */
export function debugSwipeHandlers(container) {
    if (!container) {
        console.log('No container provided for debug');
        return null;
    }
    
    const swipeData = container._swipeData;
    if (!swipeData) {
        console.log(`No swipe handlers found on ${container.id || 'container'}`);
        return null;
    }
    
    const debug = {
        hasHandlers: Object.keys(swipeData.handlers).length > 0,
        directions: Object.keys(swipeData.handlers),
        isProcessing: swipeData.isProcessingSwipe,
        currentTranslate: swipeData.currentTranslate
    };
    
    console.log(`Swipe debug for ${container.id || 'container'}:`, debug);
    return debug;
}

// Export to window for global access and debugging
if (typeof window !== 'undefined') {
    window.swipeUtils = {
        hasUserSeenSwipeHint,
        markSwipeHintSeen,
        resetGlobalSwipeTracking,
        debugSwipeHandlers
    };
}

/**
 * Simple vertical swipe for container toggle - clean and minimal
 * 
 * @param {HTMLElement} container - The container element
 * @param {Function} toggleFunction - Function to call when swipe is detected
 */
export function initializeSimpleVerticalSwipe(container, toggleFunction) {
    if (!container || typeof toggleFunction !== 'function') {
        console.error('[SimpleVerticalSwipe] Invalid container or toggle function');
        return;
    }

    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    let isTouching = false;
    let hasMoved = false;

    container.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        isTouching = true;
        hasMoved = false;
        console.log('[SimpleVerticalSwipe] Touch start - Y:', touchStartY);
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        if (!isTouching) return;
        
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = touchY - touchStartY;
        const deltaX = touchX - touchStartX;
        
        // Mark that user has moved (not just a tap)
        if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
            hasMoved = true;
        }
        
        // Only handle if it's primarily vertical movement
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
            e.preventDefault(); // Prevent scrolling
            console.log('[SimpleVerticalSwipe] Vertical movement detected - deltaY:', deltaY);
        }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
        if (!isTouching) return;
        isTouching = false;
        
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const touchDuration = Date.now() - touchStartTime;
        
        console.log('[SimpleVerticalSwipe] Touch end - deltaY:', deltaY, 'deltaX:', deltaX, 'duration:', touchDuration, 'hasMoved:', hasMoved);
        
        // Only trigger swipe if user actually moved (not just a tap)
        // and it's primarily vertical and meets threshold
        if (hasMoved && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 40) {
            const isUpSwipe = deltaY < 0;
            const isDownSwipe = deltaY > 0;
            
            console.log('[SimpleVerticalSwipe] Swipe detected:', isUpSwipe ? 'UP' : 'DOWN');
            console.log('[SimpleVerticalSwipe] Current container state:', container.dataset.state);
            
            if (isUpSwipe && container.dataset.state !== 'expanded') {
                console.log('[SimpleVerticalSwipe] Expanding container via swipe up');
                toggleFunction();
            } else if (isDownSwipe && container.dataset.state === 'expanded') {
                console.log('[SimpleVerticalSwipe] Collapsing container via swipe down');
                toggleFunction();
            }
        } else if (!hasMoved && touchDuration < 300) {
            // This was a tap/click - let the normal click handlers deal with it
            console.log('[SimpleVerticalSwipe] Tap detected - letting click handlers handle it');
        }
    }, { passive: true });

    console.log('[SimpleVerticalSwipe] Initialized for container');
}