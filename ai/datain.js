/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';
import { getLocal } from '/utility/getlocal.js';
import { setLocal } from '/utility/setlocal.js';


function initializeGridItems() {
    const gridItems = document.querySelectorAll('.grid-container .grid-item');
    gridItems.forEach(item => {
        if (!item.dataset.value) {
            return;
        }

        // const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
        // const value = localStorage.getItem(key);
        // if (value === 'true') {
        //     item.classList.add('selected');
        // } else if (value === 'false') {
        //     item.classList.remove('selected');
        // }

        // Remove existing listeners to prevent duplicates
        item.removeEventListener('click', toggleGridItem);
        item.addEventListener('click', toggleGridItem);
    });

    function toggleGridItem() {
        const container = this.closest('.grid-container');
        if ( container.id === 'calorie-activity' || container.id === 'calorie-diet-type') {
            // Single-selection: deselect others
            container.querySelectorAll('.grid-item').forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
        } else {
            // Multi-selection: toggle
            this.classList.toggle('selected');
        }

        const toggleEvent = new CustomEvent('grid-item-toggled', { detail: { item: this } });
        document.dispatchEvent(toggleEvent);
        // saveGridItem(this);
    }

    // function saveGridItem(item) {
    //     const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
    //     const value = item.classList.contains('selected') ? 'true' : 'false';
    //     try {
    //         localStorage.setItem(key, value);
    //     } catch (error) {
    //     }
    // }
}

setTimeout(() => {
    document.addEventListener('data-in-opened', () => {
        initializeGridItems();
    })
}, 300);

document.addEventListener('DOMContentLoaded', async function () {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    let dataContainer = null;



    async function loadStoredContent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();

            // Inject content into the container
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            
            // Ensure prompt.css is included for all product items
            const hasCssLink = content.includes('prompt.css');
            const cssLinkHtml = hasCssLink ? '' : '<link rel="stylesheet" href="/ai/styles/prompt.css">';
            
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA IN</span>
                <div class="data-content">
                    ${cssLinkHtml}
                    ${content}
                </div>
            `;

            // Initialize grid items directly
            initializeGridItems();

            // Dispatch a custom event that the datain container is fully loaded
            const dataInLoadedEvent = new CustomEvent('data-in-loaded', {
                detail: { url: url }
            });
            document.dispatchEvent(dataInLoadedEvent);

            dataContainer.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }

                oldScript.replaceWith(newScript);
            });
        } catch (error) {
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">DATA IN</span>
                <div class="data-content">Error loading content: ${error.message}</div>
            `;
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-left')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Left container specific styling */
            .data-container-left {
                position: fixed;
                top: 50%;
                left: 0;
                transform: translateY(-50%);
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
                display: flex;
                flex-direction: column;
            }

            .data-container-left.initial, .data-container-left.collapsed {
                max-width: 36px;
                height: 120px;
                display: flex;
                justify-content: center;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
                display: flex;
                flex-direction: column;
            }

            .data-container-left.initial, .data-container-left.collapsed {
                max-width: 36px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }

            .data-container-left.expanded {
                max-width: 100%;
                width: 100%;
                min-width: 100%;
                height: 100vh;
                top: 0;
                left: 0;
                transform: none;
                z-index: 11000; /* Higher z-index when expanded to appear over grid */
                overflow: hidden; /* Changed from default to hidden */
                border-radius: 0;
                border: none;
                box-shadow: none;
            }

            .data-container-left:hover {
                background-color: rgb(255, 255, 255);
            }

            .data-container-left .close-data-container {
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
                z-index: 11001; /* Make sure it's above other content */
            }
            
            .data-container-left.expanded .close-data-container {
                top: 4px;
                right: 10px;
                left: auto;
                font-size: 18px;
                padding: 5px;
                z-index: 11002;
                background-color: #f5f5f5;
                border-radius: 4px;
            }

            .data-container-left .data-label {
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
                z-index: 11001; /* Make sure it's above other content */
            }
            
            .data-container-left.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 18px;
                padding: 5px;
                z-index: 11002;
                background-color: #f5f5f5;
                border-radius: 4px;
            }

            .data-container-left .data-content {
                padding: 10px;
                font-size: 14px;
                height: calc(100% - 40px); /* Fixed height calculation */
                max-height: none; /* Remove max-height limitation */
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                width: 100%;
                max-width: 100%;
                margin-top: 30px;
                position: relative; /* Add positioning context */
                display: block; /* Ensure proper display */
                box-sizing: border-box; /* Include padding in height calculation */
            }

            /* Mobile responsiveness for left container */
            @media (max-width: 480px) {
                .data-container-left {
                    max-width: 28px;
                    padding: 3px;
                }

                .data-container-left.initial, .data-container-left.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }

                .data-container-left.expanded {
                    max-width: 100%;
                    width: 100%;
                    min-width: 100%;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    transform: none;
                    border-radius: 0;
                    border: none;
                    box-shadow: none;
                }

                .data-container-left .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                
                .data-container-left.expanded .data-label {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-left .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                
                .data-container-left.expanded .close-data-container {
                    font-size: 16px;
                    padding: 4px;
                }

                .data-container-left .data-content {
                    font-size: 12px;
                    padding: 8px;
                    overflow-x: auto;
                    margin-top: 25px;
                    height: calc(100% - 35px); /* Adjusted for mobile */
                }
            }
        `;
        document.head.appendChild(style);

        dataContainer = document.createElement('div');
        dataContainer.className = `data-container-left initial`;
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA IN</span>
        `;

        document.body.appendChild(dataContainer);

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                setLocal('dataContainerState', 'initial');
                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">DATA IN</span>
                `;
                
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                setLocal('dataContainerState', 'expanded');
                
                // Show swipe hint
                const swipeHint = document.createElement('div');
                swipeHint.className = 'swipe-hint';
                swipeHint.innerHTML = '<span class="swipe-animation">Swipe right to close</span> →';
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
                const animStyle = document.createElement('style');
                animStyle.textContent = `
                    @keyframes pulse {
                        0% { opacity: 0.7; }
                        50% { opacity: 1; }
                        100% { opacity: 0.7; }
                    }
                    @keyframes swipeRight {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(10px); }
                        100% { transform: translateX(0); }
                    }
                    .swipe-animation {
                        display: inline-block;
                        animation: pulse 1.5s infinite, swipeRight 1.5s infinite;
                    }
                `;
                document.head.appendChild(animStyle);
                dataContainer.appendChild(swipeHint);
                
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

                const leftSideBarOpen = new CustomEvent('left-sidebar-open', {
                    detail: {
                        state: 'expanded'
                    }
                });

                document.dispatchEvent(leftSideBarOpen);
                
                initializeGridItems();
                const storedUrl = getLocal('lastGridItemUrl');
                if (storedUrl) {
                    loadStoredContent(storedUrl);
                } else {
                    dataContainer.innerHTML = `
                        <span class="close-data-container">-</span>
                        <span class="data-label">DATA IN</span>
                        <div class="data-content">No content selected. Please select a grid item.</div>
                    `;
                }
            }

            // Re-bind toggle listeners
            const newClose = dataContainer.querySelector('.close-data-container');
            const newLabel = dataContainer.querySelector('.data-label');

            if (newClose) {
                newClose.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }

            if (newLabel) {
                newLabel.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }
        }

        // Listen for grid item selection events from promptgrid.js
        document.addEventListener('promptGridItemSelected', function (e) {
            const url = e.detail.url;
            
            setLocal('lastGridItemUrl', url);
            if (dataContainer.dataset.state !== 'expanded') {
                toggleDataContainer();
            } else {
                loadStoredContent(url);
            }
        });

        // Fallback: Monitor localStorage changes for lastGridItemUrl
        window.addEventListener('storage', function (e) {
            if (e.key === 'lastGridItemUrl' && e.newValue) {
                
                if (dataContainer.dataset.state !== 'expanded') {
                    toggleDataContainer();
                } else {
                    loadStoredContent(e.newValue);
                }
            }
        });

        // Collapse container when clicking outside
        document.addEventListener('click', function (e) {
            const isClickInside = dataContainer.contains(e.target);
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                
                toggleDataContainer();
            }
        });

        // Restore last state
        const lastState = getLocal('dataContainerState') || 'initial';
        if (lastState === 'expanded') {
            toggleDataContainer();
        }
        
        // Add swipe to close functionality
        let touchStartX = 0;
        let touchStartY = 0;
        let currentTranslate = 0;
        
        function handleTouchStart(e) {
            console.log('Touch start detected on datain container');
            
            if (dataContainer.dataset.state !== 'expanded') {
                console.log('Container not expanded, ignoring touch');
                return;
            }
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            console.log(`Touch coordinates: X=${touchStartX}, Y=${touchStartY}`);
            
            // Add transition temporarily during the swipe
            dataContainer.style.transition = 'none';
            
            // Make sure these event listeners are properly attached
            dataContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
            dataContainer.addEventListener('touchend', handleTouchEnd);
            dataContainer.addEventListener('touchcancel', handleTouchEnd);
            
            // Prevent default and stop propagation to ensure no other touch handlers interfere
            e.preventDefault();
            e.stopPropagation();
        }
        
        function handleTouchMove(e) {
            if (dataContainer.dataset.state !== 'expanded') return;
            
            // Always prevent default and stop propagation
            e.preventDefault();
            e.stopPropagation();
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            // Calculate horizontal distance moved
            const diffX = touchX - touchStartX;
            
            // Calculate vertical distance moved for determining if it's a horizontal swipe
            const diffY = touchY - touchStartY;
            
            console.log(`Touch move: diffX=${diffX}, diffY=${diffY}`);
            
            // Make horizontal swipe detection more sensitive (reduced from 1.0 to 0.8)
            if (Math.abs(diffX) > Math.abs(diffY) * 0.8) {
                // For datain (left container), only respond to rightward swipes
                if (diffX > 0) {
                    currentTranslate = diffX;
                    dataContainer.style.transform = `translateX(${diffX}px)`;
                    console.log(`Applied transform: translateX(${diffX}px)`);
                    
                    // Add dynamic opacity effect based on swipe distance
                    // Calculate opacity: 1 at 0px swipe, decreasing to 0.7 at 100px swipe
                    const opacityValue = Math.max(0.7, 1 - (Math.abs(diffX) / 300));
                    dataContainer.style.opacity = opacityValue;
                    
                    // Show swipe indicator if swipe distance is significant
                    if (Math.abs(diffX) > 50) {
                        if (!dataContainer.querySelector('.swipe-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'swipe-indicator';
                            indicator.innerHTML = 'Swipe to close →';
                            indicator.style.cssText = `
                                position: absolute;
                                top: 50%;
                                right: 20%;
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
                            dataContainer.appendChild(indicator);
                            
                            // Fade in the indicator
                            setTimeout(() => {
                                indicator.style.opacity = '1';
                            }, 10);
                        }
                    }
                }
            }
        }
        
        function handleTouchEnd(e) {
            if (dataContainer.dataset.state !== 'expanded') return;
            
            // Remove swipe indicator if it exists
            const indicator = dataContainer.querySelector('.swipe-indicator');
            if (indicator) {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 200);
            }
            
            // Restore transition for smooth animation
            dataContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            
            // Check if the swipe was significant enough to close the container
            if (currentTranslate > 100) { // Threshold for closing gesture (100px)
                // Complete the swipe animation
                dataContainer.style.transform = 'translateX(100%)';
                dataContainer.style.opacity = '0';
                
                // Close the container after animation completes
                setTimeout(() => {
                    dataContainer.style.transform = '';
                    dataContainer.style.opacity = '1';
                    dataContainer.style.transition = '';
                    toggleDataContainer();
                }, 300);
            } else {
                // Reset position if swipe wasn't far enough
                dataContainer.style.transform = '';
                dataContainer.style.opacity = '1';
                setTimeout(() => {
                    dataContainer.style.transition = '';
                }, 300);
            }
            
            // Remove event listeners
            dataContainer.removeEventListener('touchmove', handleTouchMove);
            dataContainer.removeEventListener('touchend', handleTouchEnd);
            dataContainer.removeEventListener('touchcancel', handleTouchEnd);
            
            currentTranslate = 0;
        }
        
        // Add touch event listeners to container and its content
        dataContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        
        // Also add touch events to the data-content area to ensure nested scrollable content doesn't block swipes
        dataContainer.addEventListener('touchmove', (e) => {
            // Only prevent default when we need to (horizontal swipe)
            const touch = e.touches[0];
            const diffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;
            
            // Only prevent default for horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) * 0.8 && diffX > 0) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });
        
        // Debug message to confirm initialization
        console.log('Swipe functionality initialized for datain container');
    }

    try {
        if (!isCookieExpired) {
            initializeDataContainer();
            
            // Mobile device detection for debugging
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log(`Device detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
            console.log(`User agent: ${navigator.userAgent}`);
            
            // Additional debug info for touch support
            if (isMobile) {
                console.log('Touch events should be fully supported on this device');
                console.log(`Touch points supported: ${navigator.maxTouchPoints}`);
                console.log(`Screen size: ${window.screen.width}x${window.screen.height}`);
            }
        }
    } catch (error) {
        console.error('Error initializing left data container (datain.js):', error);
    }
});