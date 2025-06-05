/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// dataConsentManager.js - Handles user consent for data storage

/**
 * Data Consent Manager
 * Shows a modal immediately when a user visits that requires consent
 * before interacting with the site or storing any data.
 * Checks for previous consent in both localStorage and cookies.
 */

(function() {
    // Constants
    const CONSENT_COOKIE_NAME = "data_storage_consent";
    const CONSENT_LOCAL_STORAGE_KEY = "dataStorageConsent";
    const CONSENT_EXPIRY_DAYS = 365; // 1 year

    // CSS for the consent modal (matching dataOverwrite.js style)
    const modalCSS = `
        .data-consent-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: "Inter", sans-serif;
        }
        
        .data-consent-modal {
            background-color: #f2f9f3;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #4a7c59;
            box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
            font-family: "Inter", sans-serif;
            position: relative;
            z-index: 1000000;
            pointer-events: auto !important;
        }
        
        /* Disable all pointer events on the body when consent modal is active */
        body.consent-modal-active {
            overflow: hidden !important;
            pointer-events: none !important;
        }
        
        /* But allow pointer events on the modal itself */
        body.consent-modal-active .data-consent-modal {
            pointer-events: auto !important;
        }
        
        .data-consent-modal h2 {
            font-size: 1.2rem;
            color: #333;
            margin-top: 0;
            margin-bottom: 15px;
            font-family: "Geist", sans-serif;
        }
        
        .data-consent-modal p {
            font-size: 13px;
            line-height: 1.5;
            color: #666;
            margin-bottom: 15px;
        }
        
        .data-consent-modal .buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .consent-action-btn {
            padding: 14px 20px;
            background-color: #f2f9f3;
            color: #2d5a3d;
            border: 1px solid #4a7c59;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
        }
        
        .data-consent-modal .decline-message {
            display: none;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            color: #721c24;
            font-size: 13px;
        }
        
        .data-consent-modal .decline-actions {
            display: none;
            margin-top: 15px;
            flex-direction: column;
            gap: 12px;
        }
        
        /* Disable specific elements that might still be clickable */
        body.consent-modal-active .tab,
        body.consent-modal-active a,
        body.consent-modal-active button:not(.data-consent-modal button),
        body.consent-modal-active input,
        body.consent-modal-active select,
        body.consent-modal-active [data-location],
        body.consent-modal-active [onclick],
        body.consent-modal-active .data-container,
        body.consent-modal-active .data-label,
        body.consent-modal-active .nav-btn {
            pointer-events: none !important;
            cursor: default !important;
            opacity: 0.7;
        }
        
        @media (max-width: 480px) {
            .data-consent-modal {
                padding: 15px;
                width: 90%;
                max-width: 300px;
            }
            
            .data-consent-modal h2 {
                font-size: 1.1rem;
            }
        }
    `;

    // Store original event handlers
    const originalEvents = {
        click: null,
        touchstart: null,
        touchmove: null,
        touchend: null,
        keydown: null,
        keypress: null,
        keyup: null,
        mousedown: null,
        mouseup: null,
        mousemove: null,
        wheel: null,
        scroll: null,
        focus: null
    };

    // Helper functions
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error("Failed to set localStorage item:", e);
            return false;
        }
    }

    function getLocalStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error("Failed to get localStorage item:", e);
            return null;
        }
    }

    // Check if consent has already been given
    function hasConsent() {
        const cookieConsent = getCookie(CONSENT_COOKIE_NAME);
        const localStorageConsent = getLocalStorage(CONSENT_LOCAL_STORAGE_KEY);
        
        return cookieConsent === "true" || localStorageConsent === "true";
    }

    // Save consent in both cookie and localStorage for redundancy
    function saveConsent() {
        setCookie(CONSENT_COOKIE_NAME, "true", CONSENT_EXPIRY_DAYS);
        setLocalStorage(CONSENT_LOCAL_STORAGE_KEY, "true");
    }

    // Create and inject the modal's CSS
    function injectConsentModalCSS() {
        const style = document.createElement('style');
        style.textContent = modalCSS;
        document.head.appendChild(style);
    }
    
    // Completely freeze the page
    function freezePage() {
        // Add class to body to disable pointer events
        document.body.classList.add('consent-modal-active');
        
        // Prevent scrolling
        const originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        // Store original event handlers and replace with blockers
        const events = [
            'click', 'touchstart', 'touchmove', 'touchend',
            'keydown', 'keypress', 'keyup', 
            'mousedown', 'mouseup', 'mousemove',
            'wheel', 'scroll', 'focus'
        ];
        
        // Global event handler to block all interactions
        function blockEvent(e) {
            // Allow events only if they are inside the consent modal
            if (e.target && (e.target.closest('.data-consent-modal') || e.target.closest('.data-consent-overlay'))) {
                return true;
            }
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        
        // Store original handlers and replace with blockers
        events.forEach(eventName => {
            originalEvents[eventName] = document[`on${eventName}`];
            document[`on${eventName}`] = blockEvent;
            
            // Add capturing event listeners to document
            document.addEventListener(eventName, blockEvent, { capture: true });
        });
        
        // Create an invisible iframe to capture tab navigation
        const tabTrap = document.createElement('iframe');
        tabTrap.setAttribute('id', 'tab-trap');
        tabTrap.setAttribute('tabindex', '0');
        tabTrap.setAttribute('aria-hidden', 'true');
        tabTrap.style.position = 'absolute';
        tabTrap.style.left = '-9999px';
        tabTrap.style.width = '1px';
        tabTrap.style.height = '1px';
        document.body.appendChild(tabTrap);
        
        // Return cleanup function
        return function unfreezePage() {
            document.body.classList.remove('consent-modal-active');
            document.body.style.overflow = originalBodyOverflow;
            
            // Remove event blockers
            events.forEach(eventName => {
                document[`on${eventName}`] = originalEvents[eventName];
                document.removeEventListener(eventName, blockEvent, { capture: true });
            });
            
            // Remove tab trap
            const trap = document.getElementById('tab-trap');
            if (trap) trap.remove();
            
            // Specifically target and re-enable tabs
            document.querySelectorAll('.tab, [data-location]').forEach(tab => {
                tab.style.pointerEvents = '';
                tab.style.cursor = '';
                tab.style.opacity = '';
            });
        };
    }

    // Create and show the consent modal
    function showConsentModal() {
        // Create container
        const overlay = document.createElement('div');
        overlay.className = 'data-consent-overlay';
        overlay.id = 'dataConsentOverlay';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'data-consent-modal';
        
        // Add content to the modal
        modal.innerHTML = `
            <h2>Data Storage Consent</h2>
            <p>This website stores data locally in your browser to provide essential functionality and improve your experience. This includes saving your preferences, calculations, and settings.</p>
            <p>No personal data is sent to or stored on our servers. All data remains on your device only.</p>
            <p>By clicking "Accept", you consent to the storage of this data in your browser's local storage. If you decline, you will not be able to use this website.</p>
            <div class="buttons">
                <button class="consent-action-btn accept-btn">
                    <i class="bx bx-check" style="margin-right: 8px; font-size: 14px;"></i>Accept
                </button>
                <button class="consent-action-btn reject-btn">
                    <i class="bx bx-x" style="margin-right: 8px; font-size: 14px;"></i>Decline
                </button>
            </div>
            <div class="decline-message">
                <p>This website requires local data storage to function properly. Without your consent, we cannot provide you with the full functionality of this site.</p>
                <p>You have the following options:</p>
            </div>
            <div class="decline-actions">
                <button class="consent-action-btn reconsider-btn">
                    <i class="bx bx-check" style="margin-right: 8px; font-size: 14px;"></i>Reconsider & Accept
                </button>
                <button class="consent-action-btn leave-btn">
                    <i class="bx bx-exit" style="margin-right: 8px; font-size: 14px;"></i>Leave Site
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Freeze the page - get unfreeze function
        const unfreezePage = freezePage();
        
        // Add hover effects
        addConsentButtonHoverEffects();
        
        // Add event listener for the accept button
        const acceptButton = modal.querySelector('.accept-btn');
        acceptButton.addEventListener('click', function() {
            saveConsent();
            showConsentSuccess();
            
            // Close modal after brief delay
            setTimeout(() => {
                closeConsentModal();
                window.dataConsentGranted = true;
                unfreezePage();
                document.dispatchEvent(new CustomEvent('dataConsentGranted'));
            }, 1500);
        });
        
        // Add event listener for the reject button
        const rejectButton = modal.querySelector('.reject-btn');
        const declineMessage = modal.querySelector('.decline-message');
        const declineActions = modal.querySelector('.decline-actions');
        
        rejectButton.addEventListener('click', function() {
            // Hide the initial buttons
            const buttonsDiv = modal.querySelector('.buttons');
            buttonsDiv.style.display = 'none';
            
            // Show the decline message and actions
            declineMessage.style.display = 'block';
            declineActions.style.display = 'flex';
            
            // Set global consent status flag to false
            window.dataConsentGranted = false;
            
            // Trigger event for scripts to respond to consent rejection
            document.dispatchEvent(new CustomEvent('dataConsentRejected'));
        });
        
        // Add event listener for reconsider button
        const reconsiderButton = modal.querySelector('.reconsider-btn');
        reconsiderButton.addEventListener('click', function() {
            saveConsent();
            showConsentSuccess();
            
            // Close modal after brief delay
            setTimeout(() => {
                closeConsentModal();
                window.dataConsentGranted = true;
                unfreezePage();
                document.dispatchEvent(new CustomEvent('dataConsentGranted'));
            }, 1500);
        });
        
        // Add event listener for leave button
        const leaveButton = modal.querySelector('.leave-btn');
        leaveButton.addEventListener('click', function() {
            // Redirect to a neutral site or just close the window
            window.location.href = 'https://www.google.com';
        });
        
        // Specifically target and disable tabbed navigation
        setTimeout(() => {
            // These are specific selectors for your tabs system
            document.querySelectorAll('.tab, a[href*="html"], [data-location]').forEach(tab => {
                tab.style.pointerEvents = 'none';
                tab.style.cursor = 'default';
                tab.setAttribute('data-original-href', tab.getAttribute('href') || '');
                tab.setAttribute('href', 'javascript:void(0);');
            });
        }, 100);
    }

    // Add hover effects to buttons like dataOverwrite.js
    function addConsentButtonHoverEffects() {
        const modal = document.querySelector('.data-consent-overlay');
        if (!modal) return;
        
        modal.querySelectorAll('.consent-action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#eef7f0';
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#f2f9f3';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 4px rgba(74, 124, 89, 0.2)';
            });
            
            btn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 1px 2px rgba(74, 124, 89, 0.3)';
            });
            
            btn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
            });
        });
    }

    // Close the consent modal
    function closeConsentModal() {
        const modal = document.querySelector('.data-consent-overlay');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('consent-modal-active');
        }
    }

    // Show success message after consent acceptance
    function showConsentSuccess() {
        const modal = document.querySelector('.data-consent-overlay .data-consent-modal');
        if (modal) {
            modal.innerHTML = `
                <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
                    <div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
                    <p style="color: #555; font-size: 0.95rem; margin: 0;">
                        Consent Granted
                    </p>
                </div>
            `;
        }
    }

    // Initialize the consent manager
    function initialize() {
        if (!hasConsent()) {
            injectConsentModalCSS();
            // Show the consent modal immediately
            showConsentModal();
            // Set global consent status flag
            window.dataConsentGranted = false;
        } else {
            // Consent already granted
            window.dataConsentGranted = true;
        }
    }

    // Public API
    window.dataConsentManager = {
        hasConsent: hasConsent,
        requestConsent: showConsentModal,
        isGranted: function() { return window.dataConsentGranted === true; }
    };

    // Initialize as soon as the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();