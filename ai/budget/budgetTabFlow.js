/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

// Budget Tab Flow - Controls the guided tab workflow for the budget planner

// Add the CSS styles for tab animations
(function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Tab animations for guiding the user through the budget workflow */
        @keyframes pulse-shadow {
            0%, 100% { box-shadow: 4px 4px 0 #000; }
            50% { box-shadow: 6px 6px 0 #000; }
        }
        
        @keyframes gentle-glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1); }
        }
        
        @keyframes pulse-color {
            0%, 100% { color: inherit; }
            50% { color:rgb(255, 255, 255); }
        }
        
        /* Applied to the next tab in sequence to draw attention - left side tabs */
        .next-tab-highlight {
            animation: pulse-shadow 2s infinite, gentle-glow 2s infinite;
            transform-origin: left;
        }
        
        /* Applied to the right-side tabs (like summary) */
        .next-tab-highlight-right {
            animation: pulse-shadow 2s infinite, gentle-glow 2s infinite;
            transform-origin: right;
        }
        
        .next-tab-highlight .data-label,
        .next-tab-highlight-right .data-label {
            animation: pulse-color 2s infinite;
        }
        
        /* Applied to tabs that have been completed */
        .completed-tab {
            opacity: 0.85;
        }
        
        /* Applied to the current active tab container */
        .active-tab {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
        }
    `;
    document.head.appendChild(styleElement);
})();

// Initialize the tab flow controller when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab workflow controller with minimalist animations
    const tabFlow = {
        steps: [
            { id: 'intro', selector: '.data-container-intro', position: 'left' },
            { id: 'income', selector: '.data-container-income', position: 'left' },
            { id: 'expense', selector: '.data-container-expense', position: 'left' },
            { id: 'asset', selector: '.data-container-asset', position: 'left' },
            { id: 'liability', selector: '.data-container-liability', position: 'left' },
            { id: 'summary', selector: '.data-container-summary', position: 'right' }
        ],
        
        // Helper functions for localStorage (fallbacks if library not loaded)
        getLocalStorage: function(key) {
            try {
                const value = localStorage.getItem(key);
                return value ? decodeURIComponent(value) : null;
            } catch (error) {
                console.error('Error getting localStorage value:', error);
                return null;
            }
        },
        
        // Find the next unvisited step
        findNextStep: function() {
            for (let i = 0; i < this.steps.length; i++) {
                const stepId = this.steps[i].id;
                const visited = this.getLocalStorage(stepId + 'Visited') === 'visited';
                if (!visited) {
                    return i;
                }
            }
            return this.steps.length - 1; // Default to summary if all visited
        },
        
        // Initialize tab animations
        init: function() {
            console.log('Initializing budget tab flow animations');
            
            // Wait for tabs to be loaded in the DOM
            this.waitForTabs(() => {
                const nextStepIndex = this.findNextStep();
                console.log('Next unvisited step:', this.steps[nextStepIndex].id);
                
                // Apply appropriate animations to each tab
                this.applyTabAnimations(nextStepIndex);
                
                // Set up monitoring for changes
                this.startMonitoring(nextStepIndex);
            });
        },
        
        // Wait for all tabs to be loaded in the DOM
        waitForTabs: function(callback) {
            const checkInterval = setInterval(() => {
                const allTabsLoaded = this.steps.every(step => 
                    document.querySelector(step.selector) !== null
                );
                
                if (allTabsLoaded) {
                    clearInterval(checkInterval);
                    console.log('All tabs loaded, initializing animations');
                    callback();
                }
            }, 400);
        },
        
        // Apply the appropriate animations based on tab state
        applyTabAnimations: function(nextStepIndex) {
            this.steps.forEach((step, index) => {
                const tabElement = document.querySelector(step.selector);
                if (!tabElement) return;
                
                // Remove any existing animation classes
                tabElement.classList.remove('next-tab-highlight', 'next-tab-highlight-right', 'completed-tab', 'active-tab');
                
                const visited = this.getLocalStorage(step.id + 'Visited') === 'visited';
                
                if (index === nextStepIndex) {
                    // This is the next tab to visit - highlight it
                    if (step.position === 'left') {
                        tabElement.classList.add('next-tab-highlight');
                    } else {
                        tabElement.classList.add('next-tab-highlight-right');
                    }
                    
                    // Also open this tab if it's the intro and first time visiting
                    // Removed auto-opening functionality as requested
                    /*
                    if (step.id === 'intro' && !visited) {
                        setTimeout(() => {
                            const label = tabElement.querySelector('.data-label');
                            if (label) label.click();
                        }, 1000);
                    }
                    */
                } 
                else if (visited) {
                    // This tab has been visited
                    tabElement.classList.add('completed-tab');
                }
                
                // If this tab is expanded, add active-tab class
                if (tabElement.dataset && tabElement.dataset.state === 'expanded') {
                    tabElement.classList.add('active-tab');
                }
            });
        },
        
        // Monitor for changes in tab states
        startMonitoring: function(initialNextStep) {
            let currentNextStep = initialNextStep;
            
            // Check for state changes every second
            setInterval(() => {
                const newNextStep = this.findNextStep();
                
                // If the next step has changed, update animations
                if (newNextStep !== currentNextStep) {
                    console.log('Next step changed from', this.steps[currentNextStep].id, 'to', this.steps[newNextStep].id);
                    currentNextStep = newNextStep;
                    this.applyTabAnimations(newNextStep);
                }
                
                // Also check for expanded/collapsed changes
                this.steps.forEach((step, index) => {
                    const tabElement = document.querySelector(step.selector);
                    if (!tabElement) return;
                    
                    const isExpanded = tabElement.dataset && tabElement.dataset.state === 'expanded';
                    const hasActiveClass = tabElement.classList.contains('active-tab');
                    
                    if (isExpanded && !hasActiveClass) {
                        tabElement.classList.add('active-tab');
                    } else if (!isExpanded && hasActiveClass) {
                        tabElement.classList.remove('active-tab');
                    }
                });
            }, 1000);
        }
    };
    
    // Initialize tab animations
    tabFlow.init();
});