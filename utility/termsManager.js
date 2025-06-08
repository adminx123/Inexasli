/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// termsManager.js - Manages terms of service acceptance
// This script depends on:
// 1. dataConsentManager.js - Must run first to get data storage consent
// 2. modal.js - Used to display the terms modal

/**
 * Terms of Service Manager
 * Shows a dialog for users to accept the terms of service.
 * Only appears after data consent has been granted.
 * Uses modal.js to show the full terms document.
 */

(function() {
    // Constants
    const TERMS_COOKIE_NAME = "terms_accepted";
    const TERMS_LOCAL_STORAGE_KEY = "termsAccepted";
    const TERMS_EXPIRY_DAYS = 365; // 1 year
    const TERMS_FILE_PATH = "/legal.txt"; // Path to terms of service file
    const LAST_UPDATED_DATE = "April 6, 2025"; // Update this when terms change

    // CSS for the terms modal (matching dataOverwrite.js style)
    const termsCSS = `
        .terms-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99998;
            font-family: "Inter", sans-serif;
        }

        /* Security: Disable pointer events on everything when modal is active */
        body.terms-modal-active * {
            pointer-events: none !important;
        }

        /* Re-enable pointer events only for the terms modal */
        body.terms-modal-active .terms-overlay,
        body.terms-modal-active .terms-overlay * {
            pointer-events: auto !important;
        }
        
        .terms-container {
            background-color: #f2f9f3;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #4a7c59;
            box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
            font-family: "Inter", sans-serif;
        }
        
        .terms-container h2 {
            font-size: 1.2rem;
            color: #333;
            margin-top: 0;
            margin-bottom: 15px;
            font-family: "Geist", sans-serif;
        }
        
        .terms-container p {
            font-size: 13px;
            line-height: 1.5;
            color: #666;
            margin-bottom: 15px;
        }

        .terms-link {
            color: #4a7c59;
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
        }
        
        .terms-link:hover {
            color: #3d6b4a;
        }
        
        .terms-checkbox-container {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            gap: 10px;
            text-align: left;
        }
        
        .terms-checkbox {
            margin-top: 3px;
        }
        
        .terms-checkbox-label {
            font-size: 13px;
            color: #666;
            line-height: 1.4;
        }
        
        .terms-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .terms-action-btn {
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
        
        .terms-action-btn[disabled] {
            background-color: #f0f0f0;
            color: #999;
            cursor: not-allowed;
            border-color: #ccc;
        }
        
        .terms-action-btn:not([disabled]):hover {
            background-color: #eef7f0;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(74, 124, 89, 0.3);
        }
        
        .terms-action-btn:not([disabled]):active {
            transform: translateY(0);
            box-shadow: 0 1px 2px rgba(74, 124, 89, 0.3);
        }
        
        @media (max-width: 480px) {
            .terms-container {
                padding: 15px;
                width: 90%;
                max-width: 300px;
            }
            
            .terms-container h2 {
                font-size: 1.1rem;
            }
        }
    `;

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

    // Check if terms have already been accepted
    function hasAcceptedTerms() {
        const cookieAccepted = getCookie(TERMS_COOKIE_NAME);
        const localStorageAccepted = getLocalStorage(TERMS_LOCAL_STORAGE_KEY);
        
        return cookieAccepted === "true" || localStorageAccepted === "true";
    }

    // Save terms acceptance in both cookie and localStorage for redundancy
    function saveTermsAcceptance() {
        setCookie(TERMS_COOKIE_NAME, "true", TERMS_EXPIRY_DAYS);
        setLocalStorage(TERMS_LOCAL_STORAGE_KEY, "true");
    }

    // Create and inject the terms overlay CSS
    function injectTermsCSS() {
        if (!document.getElementById('terms-manager-styles')) {
            const style = document.createElement('style');
            style.id = 'terms-manager-styles';
            style.textContent = termsCSS;
            document.head.appendChild(style);
        }
    }

    // Freeze page interactions to prevent bypass (same security as dataConsentManager)
    function freezePage() {
        // Add class to disable pointer events on everything except the modal
        document.body.classList.add('terms-modal-active');
        
        // Block all events that could allow interaction
        const events = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove',
            'touchstart', 'touchend', 'touchmove', 'touchcancel',
            'keydown', 'keyup', 'keypress',
            'scroll', 'wheel', 'resize',
            'focus', 'blur', 'change', 'input', 'submit',
            'contextmenu', 'selectstart', 'dragstart', 'drop'
        ];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, blockEvent, { capture: true, passive: false });
        });
        
        // Prevent navigation
        window.addEventListener('beforeunload', preventNavigation, { capture: true });
        window.addEventListener('unload', preventNavigation, { capture: true });
        
        // Trap tab focus within modal
        document.addEventListener('keydown', trapTabFocus, { capture: true });
    }

    // Unfreeze page interactions
    function unfreezePage() {
        // Remove the blocking class
        document.body.classList.remove('terms-modal-active');
        
        // Remove all event listeners
        const events = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove',
            'touchstart', 'touchend', 'touchmove', 'touchcancel',
            'keydown', 'keyup', 'keypress',
            'scroll', 'wheel', 'resize',
            'focus', 'blur', 'change', 'input', 'submit',
            'contextmenu', 'selectstart', 'dragstart', 'drop'
        ];
        
        events.forEach(eventType => {
            document.removeEventListener(eventType, blockEvent, { capture: true });
        });
        
        window.removeEventListener('beforeunload', preventNavigation, { capture: true });
        window.removeEventListener('unload', preventNavigation, { capture: true });
        document.removeEventListener('keydown', trapTabFocus, { capture: true });
    }

    // Block events that could allow interaction outside the modal
    function blockEvent(event) {
        const termsOverlay = document.getElementById('termsOverlay');
        if (!termsOverlay || !termsOverlay.contains(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
    }

    // Prevent navigation away from page
    function preventNavigation(event) {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }

    // Trap tab focus within the modal
    function trapTabFocus(event) {
        if (event.key === 'Tab') {
            const termsOverlay = document.getElementById('termsOverlay');
            if (!termsOverlay) return;
            
            const focusableElements = termsOverlay.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        // Block escape key to prevent bypass
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    // Show the terms modal using modal.js with retry mechanism for race conditions
    function showFullTerms() {
        // Function to attempt opening the modal
        const attemptOpenModal = (retryCount = 0) => {
            if (typeof window.openModal === 'function') {
                // Hide the terms manager modal temporarily
                const termsOverlay = document.getElementById('termsOverlay');
                if (termsOverlay) {
                    termsOverlay.style.display = 'none';
                    
                    // Temporarily unfreeze the page for the legal modal
                    unfreezePage();
                    
                    // Set up a one-time listener for when the modal closes
                    const handleModalClosed = () => {
                        // Show the terms manager modal again
                        termsOverlay.style.display = 'flex';
                        
                        // Refreeze the page
                        freezePage();
                        
                        // Remove the event listener
                        document.removeEventListener('modalClosed', handleModalClosed);
                    };
                    
                    document.addEventListener('modalClosed', handleModalClosed);
                }
                
                // Open the terms modal
                window.openModal(TERMS_FILE_PATH);
                
            } else if (retryCount < 5) {
                // Modal not ready yet, retry after a short delay (up to 5 times)
                setTimeout(() => attemptOpenModal(retryCount + 1), 50);
            } else {
                console.warn('modal.js not available after retries. Using fallback.');
                // Final fallback - open in new tab
                window.open(TERMS_FILE_PATH, '_blank');
            }
        };
        
        // Start the attempt
        attemptOpenModal();
    }

    // Create and show the terms acceptance dialog
    function showTermsDialog() {
        // Freeze the page to prevent bypass (same security as dataConsentManager)
        freezePage();
        
        // Create container
        const overlay = document.createElement('div');
        overlay.className = 'terms-overlay';
        overlay.id = 'termsOverlay';
        
        // Create dialog content
        const container = document.createElement('div');
        container.className = 'terms-container';
        
        // Add content to the dialog
        container.innerHTML = `
            <h2>Terms of Service</h2>
            <p>Before using INEXASLI AI Services, please read and accept our terms of service.</p>
            <div class="terms-checkbox-container">
                <input type="checkbox" id="termsCheckbox" class="terms-checkbox">
                <label for="termsCheckbox" class="terms-checkbox-label">
                    I have read, understand, and agree to the <span class="terms-link" id="viewTermsLink">Terms of Service</span> (last updated: ${LAST_UPDATED_DATE}). 
                    By proceeding, I acknowledge that I use INEXASLI AI Services at my own risk, and INEXASLI is not liable for any loss, harm, or decisions based on its educational tools. 
                    All liability is capped as outlined in the Terms.
                </label>
            </div>
            <div class="terms-buttons">
                <button id="termsContinueBtn" class="terms-action-btn" disabled>
                    <i class="bx bx-check" style="margin-right: 8px; font-size: 14px;"></i>Continue
                </button>
                <button id="termsLeaveBtn" class="terms-action-btn">
                    <i class="bx bx-exit" style="margin-right: 8px; font-size: 14px;"></i>Leave Site
                </button>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Add hover effects
        addTermsButtonHoverEffects();
        
        // Add modal-open class to disable tooltips
        document.body.classList.add('modal-open');
        
        // Set up event handlers
        const viewTermsLink = document.getElementById('viewTermsLink');
        if (viewTermsLink) {
            viewTermsLink.addEventListener('click', function(e) {
                e.preventDefault();
                showFullTerms();
            });
        }
        
        const termsCheckbox = document.getElementById('termsCheckbox');
        const continueBtn = document.getElementById('termsContinueBtn');
        
        if (termsCheckbox && continueBtn) {
            termsCheckbox.addEventListener('change', function() {
                continueBtn.disabled = !termsCheckbox.checked;
            });
            
            continueBtn.addEventListener('click', function() {
                if (termsCheckbox.checked) {
                    saveTermsAcceptance();
                    showTermsSuccess();
                    
                    // Close modal after brief delay
                    setTimeout(() => {
                        closeTermsModal();
                    }, 1500);
                }
            });
        }
        
        const leaveBtn = document.getElementById('termsLeaveBtn');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', function() {
                // Redirect to a neutral site
                window.location.href = 'https://www.google.com';
            });
        }

        // NO EVENT LISTENERS FOR ESCAPE KEY OR OUTSIDE CLICKS - PREVENTS BYPASS
        // Modal can only be closed by accepting terms or leaving site
    }

    // Add hover effects to buttons like dataOverwrite.js
    function addTermsButtonHoverEffects() {
        const modal = document.querySelector('.terms-overlay');
        if (!modal) return;
        
        modal.querySelectorAll('.terms-action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                if (!this.disabled) {
                    this.style.backgroundColor = '#eef7f0';
                    this.style.transform = 'translateY(-1px)';
                    this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
                }
            });
            
            btn.addEventListener('mouseleave', function() {
                if (!this.disabled) {
                    this.style.backgroundColor = '#f2f9f3';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 2px 4px rgba(74, 124, 89, 0.2)';
                }
            });
            
            btn.addEventListener('mousedown', function() {
                if (!this.disabled) {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 1px 2px rgba(74, 124, 89, 0.3)';
                }
            });
            
            btn.addEventListener('mouseup', function() {
                if (!this.disabled) {
                    this.style.transform = 'translateY(-1px)';
                    this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
                }
            });
        });
    }

    // Close the terms modal
    function closeTermsModal() {
        const modal = document.querySelector('.terms-overlay');
        if (modal) {
            // Unfreeze the page (remove security blocks)
            unfreezePage();

            // Hide modal
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Set global flag
            window.termsAccepted = true;
            
            // Trigger event
            document.dispatchEvent(new CustomEvent('termsAccepted'));
        }
    }

    // Show success message after terms acceptance
    function showTermsSuccess() {
        const modal = document.querySelector('.terms-overlay .terms-container');
        if (modal) {
            modal.innerHTML = `
                <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
                    <div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
                    <p style="color: #555; font-size: 0.95rem; margin: 0;">
                        Terms Accepted
                    </p>
                </div>
            `;
        }
    }

    // Initialize the terms manager - This will coordinate with dataConsentManager
    function initialize() {
        // Check if terms already accepted
        if (hasAcceptedTerms()) {
            window.termsAccepted = true;
            return;
        }
        
        // Function to safely show terms dialog with modal dependency check
        const safeShowTerms = () => {
            // Ensure modal.js is loaded before proceeding
            const checkModalAndShow = (retryCount = 0) => {
                if (typeof window.openModal === 'function' || retryCount >= 10) {
                    // Modal is ready or we've waited long enough
                    injectTermsCSS();
                    showTermsDialog();
                } else {
                    // Wait a bit more for modal.js to load
                    setTimeout(() => checkModalAndShow(retryCount + 1), 100);
                }
            };
            checkModalAndShow();
        };
        
        // If dataConsentManager exists, we need to wait for consent before showing terms
        if (window.dataConsentManager) {
            // If consent already granted, show terms now
            if (window.dataConsentGranted === true) {
                safeShowTerms();
            } else {
                // Wait for consent to be granted
                document.addEventListener('dataConsentGranted', function() {
                    // Only show terms if they haven't been accepted yet
                    if (!hasAcceptedTerms()) {
                        safeShowTerms();
                    }
                });
            }
        } else {
            // No dataConsentManager, show terms directly
            safeShowTerms();
        }
    }

    // Public API
    window.termsManager = {
        hasAcceptedTerms: hasAcceptedTerms,
        showTermsDialog: showTermsDialog,
        showFullTerms: showFullTerms
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded, initialize right away
        initialize();
    }
})();