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

    // CSS for the terms overlay
    const termsCSS = `
        .terms-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 99998; /* Just below dataConsent */
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            font-family: "Inter", sans-serif;
        }
        
        .terms-container {
            background-color: #f2f9f3;
            max-width: 600px;
            width: 90%;
            border-radius: 8px;
            border: 2px solid #4a7c59;
            padding: 25px;
            box-shadow: 4px 4px 0 rgba(74, 124, 89, 0.7);
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        
        .terms-container h2 {
            font-size: 1.3rem;
            color: #222;
            margin-top: 0;
            margin-bottom: 15px;
            font-family: "Geist", sans-serif;
        }
        
        .terms-container p {
            font-size: 0.95rem;
            line-height: 1.5;
            color: #444;
            margin-bottom: 20px;
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
        }
        
        .terms-checkbox {
            margin-top: 3px;
        }
        
        .terms-checkbox-label {
            font-size: 0.9rem;
            color: #333;
            line-height: 1.4;
        }
        
        .terms-buttons {
            display: flex;
            justify-content: space-between;
            gap: 15px;
        }
        
        .terms-continue-btn {
            padding: 10px 20px;
            background-color: #4a7c59;
            color: #fff;
            border: 2px solid #4a7c59;
            border-radius: 6px;
            box-shadow: 4px 4px 0 rgba(74, 124, 89, 0.7);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: bold;
            font-family: "Geist", sans-serif;
            flex-grow: 1;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        
        .terms-continue-btn[disabled] {
            background-color: #f0f0f0;
            color: #999;
            cursor: not-allowed;
            box-shadow: 2px 2px 0 #999;
            border-color: #999;
        }
        
        .terms-continue-btn:not([disabled]):hover {
            background-color: #3d6b4a;
        }
        
        .terms-continue-btn:not([disabled]):active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 rgba(74, 124, 89, 0.7);
        }
        
        .terms-leave-btn {
            padding: 10px 20px;
            background-color: #fff;
            color: #000;
            border: 2px solid #4a7c59;
            border-radius: 6px;
            box-shadow: 4px 4px 0 rgba(74, 124, 89, 0.7);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: bold;
            font-family: "Geist", sans-serif;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        
        .terms-leave-btn:hover {
            background-color: #eef7f0;
        }
        
        .terms-leave-btn:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 rgba(74, 124, 89, 0.7);
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
            
            .terms-container p {
                font-size: 0.9rem;
            }
            
            .terms-buttons {
                flex-direction: column;
            }
            
            .terms-continue-btn,
            .terms-leave-btn {
                width: 100%;
                margin-bottom: 8px;
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

    // Show the terms modal using modal.js
    function showFullTerms() {
        if (typeof window.openModal === 'function') {
            window.openModal(TERMS_FILE_PATH);
        } else {
            console.error('modal.js is not loaded. Cannot show terms.');
            // Fallback - open in new tab
            window.open(TERMS_FILE_PATH, '_blank');
        }
    }

    // Create and show the terms acceptance dialog
    function showTermsDialog() {
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
            <p>Before using IncomeIQ™, please read and accept our terms of service.</p>
            <div class="terms-checkbox-container">
                <input type="checkbox" id="termsCheckbox" class="terms-checkbox">
                <label for="termsCheckbox" class="terms-checkbox-label">
                    I have read, understand, and agree to the <span class="terms-link" id="viewTermsLink">Terms of Service</span> (last updated: ${LAST_UPDATED_DATE}). 
                    By proceeding, I acknowledge that I use IncomeIQ™ at my own risk, and INEXASLI is not liable for any loss, harm, or decisions based on its educational tools. 
                    All liability is capped as outlined in the Terms.
                </label>
            </div>
            <div class="terms-buttons">
                <button id="termsContinueBtn" class="terms-continue-btn" disabled>Continue</button>
                <button id="termsLeaveBtn" class="terms-leave-btn">Leave Site</button>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
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
                    overlay.remove();
                    
                    // Set global flag
                    window.termsAccepted = true;
                    
                    // Trigger event
                    document.dispatchEvent(new CustomEvent('termsAccepted'));
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
    }

    // Initialize the terms manager - This will coordinate with dataConsentManager
    function initialize() {
        // Check if terms already accepted
        if (hasAcceptedTerms()) {
            window.termsAccepted = true;
            return;
        }
        
        // If dataConsentManager exists, we need to wait for consent before showing terms
        if (window.dataConsentManager) {
            // If consent already granted, show terms now
            if (window.dataConsentGranted === true) {
                injectTermsCSS();
                showTermsDialog();
            } else {
                // Wait for consent to be granted
                document.addEventListener('dataConsentGranted', function() {
                    // Only show terms if they haven't been accepted yet
                    if (!hasAcceptedTerms()) {
                        injectTermsCSS();
                        showTermsDialog();
                    }
                });
            }
        } else {
            // No dataConsentManager, show terms directly
            injectTermsCSS();
            showTermsDialog();
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