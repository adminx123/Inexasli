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
import { initializeSwipeFunctionality } from '/utility/swipeFunctionality.js';


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

    // Listen for dataout expansion/collapse
    document.addEventListener('dataout-state-changed', function(event) {
        if (!dataContainer) return;
        
        const dataOutState = event.detail.state;
        if (dataOutState === 'expanded') {
            // When dataout is expanded, make datain appear above it
            dataContainer.style.zIndex = '12000';
        } else {
            // When dataout is collapsed, reset datain's z-index
            if (dataContainer.dataset.state !== 'expanded') {
                dataContainer.style.zIndex = '10000';
            }
        }
    });

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
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out;
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
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out;
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
            
            // Get reference to dataout container
            const dataOutContainer = document.querySelector('.data-container-right');

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                setLocal('dataContainerState', 'initial');
                dataContainer.innerHTML = `
                    <span class="close-data-container">+</span>
                    <span class="data-label">DATA IN</span>
                `;
                
                // Reset dataout container z-index when datain collapses
                if (dataOutContainer) {
                    dataOutContainer.style.zIndex = '10000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('datain-state-changed', {
                    detail: { state: 'initial' }
                }));
                
            } else {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                
                // Set dataout container to higher z-index to appear above expanded datain
                if (dataOutContainer) {
                    dataOutContainer.style.zIndex = '12000';
                }
                
                // Dispatch state change event
                document.dispatchEvent(new CustomEvent('datain-state-changed', {
                    detail: { state: 'expanded' }
                }));
                
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
        
        // Initialize swipe functionality for the datain container
        let swipeHandler = null;
        
        // Observer to watch for state changes on the dataContainer
        const dataContainerObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
                    const state = dataContainer.dataset.state;
                    
                    if (state === 'expanded') {
                        // If expanded and swipe handler doesn't exist, create one
                        if (!swipeHandler) {
                            swipeHandler = initializeSwipeFunctionality(
                                dataContainer, 
                                'left', 
                                toggleDataContainer, 
                                { 
                                    sessionStorageKey: 'swipeEducationShownLeft'
                                }
                            );
                            console.log('Swipe functionality initialized for datain container');
                        }
                    } else {
                        // If not expanded and swipe handler exists, destroy it
                        if (swipeHandler) {
                            swipeHandler.destroy();
                            swipeHandler = null;
                            console.log('Swipe functionality removed from datain container');
                        }
                    }
                }
            });
        });
        
        // Start observing
        dataContainerObserver.observe(dataContainer, { attributes: true });
        
        // Initialize swipe handler if container is already expanded
        if (dataContainer.dataset.state === 'expanded') {
            swipeHandler = initializeSwipeFunctionality(
                dataContainer, 
                'left', 
                toggleDataContainer, 
                { 
                    sessionStorageKey: 'swipeEducationShownLeft' 
                }
            );
            console.log('Initial swipe functionality initialized for datain container');
        }
        
        // Debug message to confirm initialization
        console.log('Swipe functionality initialized for datain container');
    }

    async function initializeApp() {
        initializeDataContainer();

        // Check if data-out is already expanded to adjust z-index appropriately
        const dataOutContainer = document.querySelector('.data-container-right');
        if (dataOutContainer && dataOutContainer.dataset.state === 'expanded') {
            dataContainer.style.zIndex = '12000';
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
    }

    initializeApp();
});