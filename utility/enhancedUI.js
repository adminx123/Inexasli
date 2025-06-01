/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

/**
 * Enhanced UI Components for INEXASLI AI Modules
 * Provides: Scroll-to-top FAB, Toast notifications, Embed-only enforcement, Accessibility features
 */

// Global configuration
const ENHANCED_UI_CONFIG = {
    scrollFab: {
        showThreshold: 100,
        mobileSize: 28,
        desktopSize: 36,
        alwaysShow: false // Set to false for normal operation
    },
    toast: {
        defaultDuration: 3000,
        maxToasts: 3,
        zIndex: 25001
    },
    accessibility: {
        skipLinkTarget: 'main-content'
    },
    embed: {
        allowedParents: ['inexasli.com', 'localhost', '127.0.0.1']
    }
};

/**
 * Initialize Enhanced UI System
 * @param {Object} options - Configuration options
 * @param {boolean} options.scrollToTop - Enable scroll-to-top FAB (default: true)
 * @param {boolean} options.embedEnforcement - Enable embed-only enforcement (default: true)
 * @param {boolean} options.accessibility - Enable accessibility features (default: true)
 * @param {boolean} options.guidedForms - Enable guided form completion (default: true)
 * @param {string} options.containerId - Main content container ID (default: 'output-span')
 */
function initEnhancedUI(options = {}) {
    const config = {
        scrollToTop: true,
        embedEnforcement: true,
        accessibility: true,
        guidedForms: true,
        containerId: 'output-span',
        ...options
    };

    console.log('🎯 Initializing Enhanced UI System');

    // Load Font Awesome first
    ensureFontAwesome(() => {
        if (config.accessibility) {
            initAccessibilityFeatures(config.containerId);
        }

        // Delay embed enforcement to allow for dynamic loading
        if (config.embedEnforcement) {
            setTimeout(() => {
                enforceEmbedOnly();
            }, 500); // Give time for dataout.js to set up containers
        }

        if (config.scrollToTop) {
            initScrollToTopFAB();
        }

        // Initialize guided forms if enabled and form elements are present
        if (config.guidedForms && typeof window.initGuidedForms === 'function') {
            const hasFormElements = document.querySelector('.row1, .grid-container, device-container');
            if (hasFormElements) {
                console.log('🎯 Initializing guided forms from Enhanced UI');
                setTimeout(() => {
                    window.initGuidedForms({
                        autoAdvance: true,
                        showProgressIndicator: true,
                        smoothTransitions: true,
                        enableSkipping: true
                    });
                }, 200);
            }
        }

        console.log('✅ Enhanced UI System initialized');
    });

    return {
        showToast,
        scrollToTop,
        isEmbedded: checkIfEmbedded,
        toggleGuidedMode: () => {
            if (typeof window.toggleGuidedMode === 'function') {
                window.toggleGuidedMode();
            }
        }
    };
}

/**
 * Scroll-to-Top Floating Action Button
 */
function initScrollToTopFAB() {
    // Create FAB container
    const fabContainer = document.createElement('div');
    fabContainer.id = 'scroll-fab-container';
    fabContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 12000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
    `;

    // Create FAB button
    const fab = document.createElement('button');
    fab.id = 'scroll-to-top-fab';
    fab.title = 'Scroll to top';
    fab.setAttribute('aria-label', 'Scroll to top of page');
    
    fab.style.cssText = `
        background-color: #f5f5f5;
        color: #000;
        border: 2px solid #000;
        border-radius: 50%;
        box-shadow: 4px 4px 0 #000;
        width: ${ENHANCED_UI_CONFIG.scrollFab.desktopSize}px;
        height: ${ENHANCED_UI_CONFIG.scrollFab.desktopSize}px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 18px;
        margin: 0;
        padding: 0;
    `;

    // Add arrow icon
    fab.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';

    // Hover effects
    fab.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#FFFFFF';
        this.style.transform = 'translate(-2px, -2px)';
        this.style.boxShadow = '6px 6px 0 #000';
    });

    fab.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f5f5f5';
        this.style.transform = 'translate(0, 0)';
        this.style.boxShadow = '4px 4px 0 #000';
    });

    // Click effect
    fab.addEventListener('mousedown', function() {
        this.style.transform = 'translate(2px, 2px)';
        this.style.boxShadow = '2px 2px 0 #000';
    });

    fab.addEventListener('mouseup', function() {
        this.style.transform = 'translate(-2px, -2px)';
        this.style.boxShadow = '6px 6px 0 #000';
    });

    // Click handler
    fab.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        scrollToTop();
    });

    // Mobile responsiveness
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const adjustFABForMobile = (query) => {
        const size = query.matches ? 
            ENHANCED_UI_CONFIG.scrollFab.mobileSize : 
            ENHANCED_UI_CONFIG.scrollFab.desktopSize;
        
        fab.style.width = `${size}px`;
        fab.style.height = `${size}px`;
        fab.style.fontSize = query.matches ? '14px' : '18px';
        
        // Keep button centered regardless of screen size
        fabContainer.style.bottom = query.matches ? '15px' : '20px';
        fabContainer.style.left = '50%';
        fabContainer.style.transform = 'translateX(-50%)';
    };

    adjustFABForMobile(mobileQuery);
    mobileQuery.addEventListener('change', adjustFABForMobile);

    // Scroll visibility logic
    let isVisible = false;
    const toggleFABVisibility = () => {
        let scrollY = window.scrollY || document.documentElement.scrollTop;
        
        // Check if we're in a dataout.js context and get container scroll position
        const dataContainer = document.querySelector('.data-container-right.expanded .data-content');
        if (dataContainer) {
            scrollY = dataContainer.scrollTop;
        }
        
        const shouldShow = scrollY > ENHANCED_UI_CONFIG.scrollFab.showThreshold || ENHANCED_UI_CONFIG.scrollFab.alwaysShow;

        if (shouldShow && !isVisible) {
            fabContainer.style.opacity = '1';
            fabContainer.style.visibility = 'visible';
            fabContainer.style.pointerEvents = 'auto';
            isVisible = true;
        } else if (!shouldShow && isVisible) {
            fabContainer.style.opacity = '0';
            fabContainer.style.visibility = 'hidden';
            fabContainer.style.pointerEvents = 'none';
            isVisible = false;
        }
    };

    // Initial visibility check
    toggleFABVisibility();

    // Throttled scroll listener for window
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            toggleFABVisibility();
            scrollTimeout = null;
        }, 16); // ~60fps
    }, { passive: true });

    // Monitor for data container creation and add scroll listener
    const observeDataContainers = () => {
        const dataContainer = document.querySelector('.data-container-right.expanded .data-content');
        if (dataContainer) {
            dataContainer.addEventListener('scroll', () => {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    toggleFABVisibility();
                    scrollTimeout = null;
                }, 16); // ~60fps
            }, { passive: true });
        }
    };

    // Use MutationObserver to watch for data container changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                observeDataContainers();
                toggleFABVisibility(); // Recheck visibility when DOM changes
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-state']
    });

    fabContainer.appendChild(fab);
    document.body.appendChild(fabContainer);
}

/**
 * Smooth scroll to top function
 */
function scrollToTop() {
    // Check if we're in a dataout.js context with an expanded data container
    const dataContainer = document.querySelector('.data-container-right.expanded .data-content');
    
    if (dataContainer) {
        // Scroll the content container to top
        const scrollToTopAnimation = () => {
            const currentScroll = dataContainer.scrollTop;
            if (currentScroll > 0) {
                dataContainer.scrollTop = currentScroll - currentScroll / 8;
                requestAnimationFrame(scrollToTopAnimation);
            }
        };
        
        scrollToTopAnimation();
        announceToScreenReader('Scrolled to top of content');
    } else {
        // Fallback to normal window scrolling for regular pages
        const scrollToTopAnimation = () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop;
            if (currentScroll > 0) {
                window.scrollTo(0, currentScroll - currentScroll / 8);
                requestAnimationFrame(scrollToTopAnimation);
            }
        };
        
        scrollToTopAnimation();
        announceToScreenReader('Scrolled to top of page');
    }
}

/**
 * Toast Notification System
 */
let toastCounter = 0;
const activeToasts = new Set();

function showToast(message, type = 'info', duration = ENHANCED_UI_CONFIG.toast.defaultDuration) {
    // Limit number of toasts
    if (activeToasts.size >= ENHANCED_UI_CONFIG.toast.maxToasts) {
        const oldestToast = Array.from(activeToasts)[0];
        closeToast(oldestToast);
    }

    const toastId = `toast-${++toastCounter}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    // Toast type configurations
    const typeStyles = {
        success: { bg: '#4caf50', icon: 'fas fa-check-circle' },
        error: { bg: '#f44336', icon: 'fas fa-exclamation-circle' },
        warning: { bg: '#ff9800', icon: 'fas fa-exclamation-triangle' },
        info: { bg: '#333', icon: 'fas fa-info-circle' }
    };

    const style = typeStyles[type] || typeStyles.info;

    toast.style.cssText = `
        position: fixed;
        top: ${20 + (activeToasts.size * 80)}px;
        right: 20px;
        background: ${style.bg};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: ${ENHANCED_UI_CONFIG.toast.zIndex};
        font-size: 14px;
        font-family: "Inter", sans-serif;
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 12px;
        word-wrap: break-word;
    `;

    toast.innerHTML = `
        <i class="${style.icon}" aria-hidden="true" style="font-size: 16px; flex-shrink: 0;"></i>
        <span style="flex: 1;">${message}</span>
        <button onclick="window.enhancedUI.closeToast('${toastId}')" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: 8px;
            font-size: 16px;
            opacity: 0.7;
            transition: opacity 0.2s;
            flex-shrink: 0;
        " aria-label="Close notification">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;

    document.body.appendChild(toast);
    activeToasts.add(toastId);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => closeToast(toastId), duration);
    }

    return toastId;
}

function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast && activeToasts.has(toastId)) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            activeToasts.delete(toastId);
            repositionToasts();
        }, 400);
    }
}

function repositionToasts() {
    let index = 0;
    activeToasts.forEach(toastId => {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.top = `${20 + (index * 80)}px`;
            index++;
        }
    });
}

/**
 * Embed-Only Enforcement
 */
function enforceEmbedOnly() {
    // Try immediate check
    if (checkIfEmbedded()) {
        console.log('✅ Embed enforcement passed immediately');
        return true;
    }
    
    // If initial check fails, give the page time to load/render completely
    console.log('⚠️ Embed check initially failed - retrying after delay');
    
    // Set a small delay to let dataout.js or other scripts initialize containers
    setTimeout(() => {
        // Final check
        if (!checkIfEmbedded()) {
            console.warn('⚠️ Direct access detected - redirecting to input page');
            
            // Determine the correct input page based on current location
            const currentPath = window.location.pathname;
            let redirectPath = '/';
            
            if (currentPath.includes('enneagram')) {
                redirectPath = '/ai/enneagram/enneagramiq.html';
            } else if (currentPath.includes('decision')) {
                redirectPath = '/ai/decision/decisioniq.html';
            } else if (currentPath.includes('calorie')) {
                redirectPath = '/ai/calorie/calorieiq.html';
            } else if (currentPath.includes('fitness')) {
                redirectPath = '/ai/fitness/fitnessiq.html';
            } else if (currentPath.includes('philosophy')) {
                redirectPath = '/ai/philosophy/philosophyiq.html';
            } else if (currentPath.includes('quiz')) {
                redirectPath = '/ai/quiz/quiziq.html';
            }
            
            // Show warning before redirect
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    font-family: 'Inter', sans-serif;
                    background: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                ">
                    <div style="
                        text-align: center;
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        border: 2px solid #000;
                        box-shadow: 4px 4px 0 #000;
                        max-width: 400px;
                    ">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff9800; margin-bottom: 20px;"></i>
                        <h2 style="margin: 0 0 15px 0; color: #333;">Direct Access Not Allowed</h2>
                        <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                            This results page can only be accessed through the proper input form.
                        </p>
                        <p style="color: #999; font-size: 14px;">Redirecting in 3 seconds...</p>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                window.location.href = redirectPath;
            }, 3000);
        } else {
            console.log('✅ Embed enforcement passed on retry');
        }
    }, 800); // Give enough time for containers to load
    
    // Initially continue without blocking, the delayed check will handle enforcement
    return true;
}

function checkIfEmbedded() {
    try {
        // Check if we're in an iframe
        if (window.self !== window.top) {
            // Additional security check - verify parent domain
            const parentHostname = window.parent.location.hostname;
            return ENHANCED_UI_CONFIG.embed.allowedParents.some(allowed => 
                parentHostname === allowed || parentHostname.endsWith('.' + allowed)
            );
        }
        
        // Check if we're being loaded into a data container (dataout.js integration)
        // This is the primary indicator for landing page integration
        if (document.querySelector('.data-container-right') || 
            document.querySelector('.data-content') ||
            (document.body && document.body.parentElement && document.body.parentElement.querySelector('.data-content'))) {
            console.log('✅ Detected dataout.js integration - allowing content');
            return true;
        }
        
        // Check if we're part of the landing page structure
        if (window.location.pathname.includes('/ai/landing/') || 
            document.querySelector('.landing-container') || 
            document.querySelector('.main-grid-wrapper') ||
            document.querySelector('[data-landing="true"]')) {
            console.log('✅ Detected landing page context - allowing content');
            return true;
        }
        
        // Check if we're being dynamically loaded (not a direct page load)
        if (document.referrer && document.referrer.includes('landing.html')) {
            console.log('✅ Detected referrer from landing.html - allowing content');
            return true;
        }
        
        // Additional check: if the current page URL suggests we're in the landing system
        if (window.location.search.includes('embedded=true') ||
            window.location.hash.includes('embedded')) {
            console.log('✅ Detected embed parameters - allowing content');
            return true;
        }
        
        // Check if dataout.js is loaded (indicates we're in the landing page context)
        const hasDataoutScript = Array.from(document.scripts).some(script => 
            script.src && (script.src.includes('/dataout.js') || script.src.includes('dataout.js'))
        );
        
        if (hasDataoutScript) {
            console.log('✅ Detected dataout.js script - allowing content');
            return true;
        }
        
        console.log('❌ No embed indicators found - direct access detected');
        return false; // Direct access
    } catch (e) {
        // Cross-origin error means we're in iframe from different domain
        // For security, assume it's valid embed since we can't verify
        console.log('✅ Cross-origin detected - assuming valid embed');
        return true;
    }
}

/**
 * Accessibility Features
 */
function initAccessibilityFeatures(containerId) {
    setupARIALandmarks(containerId);
    console.log('✅ Accessibility features initialized');
}

function setupARIALandmarks(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.setAttribute('role', 'main');
        container.setAttribute('aria-label', 'Analysis results');
    }
    
    // Add navigation landmark if tabs exist
    const tabs = document.querySelector('.tab-container, .tabs, [role="tablist"]');
    if (tabs && !tabs.getAttribute('role')) {
        tabs.setAttribute('role', 'navigation');
        tabs.setAttribute('aria-label', 'Analysis sections');
    }
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Font Awesome Loader
 */
function ensureFontAwesome(callback) {
    if (document.querySelector('link[href*="font-awesome"]') || 
        document.querySelector('link[href*="fontawesome"]') ||
        window.FontAwesome) {
        callback();
        return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.onload = callback;
    link.onerror = () => {
        console.warn('Failed to load Font Awesome, continuing without icons');
        callback();
    };
    document.head.appendChild(link);
}

// Global API
window.enhancedUI = {
    init: initEnhancedUI,
    showToast,
    closeToast,
    scrollToTop,
    isEmbedded: checkIfEmbedded,
    announceToScreenReader,
    ensureFontAwesome
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 Enhanced UI ready for initialization');
    });
} else {
    console.log('🎯 Enhanced UI ready for initialization');
}
