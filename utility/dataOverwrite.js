/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// dataOverwrite.js - Handles data overwrite confirmation modal

/**
 * Data Overwrite Modal
 * Shows a confirmation modal when user wants to clear all stored data
 * including localStorage and cookies.
 */

(function() {
    // CSS for the data overwrite modal
    const modalCSS = `
        .data-overwrite-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            font-family: "Inter", sans-serif;
        }
        
        .data-overwrite-modal {
            background-color: #fff;
            max-width: 500px;
            width: 90%;
            border-radius: 8px;
            border: 2px solid #000;
            padding: 25px;
            box-shadow: 4px 4px 0 #000;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
        }
        
        .data-overwrite-modal h2 {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: 600;
            color: #000;
        }
        
        .data-overwrite-modal p {
            margin: 0 0 20px 0;
            line-height: 1.5;
            color: #333;
            font-size: 16px;
        }
        
        .data-overwrite-modal .warning-text {
            color: #d32f2f;
            font-weight: 500;
            margin-bottom: 25px;
        }
        
        .data-overwrite-modal .button-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .data-overwrite-modal button {
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: "Inter", sans-serif;
            min-width: 120px;
        }
        
        .data-overwrite-modal .confirm-btn {
            background-color: #d32f2f;
            color: #fff;
            border: 2px solid #d32f2f;
            box-shadow: 4px 4px 0 #b71c1c;
        }
        
        .data-overwrite-modal .confirm-btn:hover {
            background-color: #b71c1c;
            border-color: #b71c1c;
        }
        
        .data-overwrite-modal .confirm-btn:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 #b71c1c;
        }
        
        .data-overwrite-modal .cancel-btn {
            background-color: #fff;
            color: #000;
            border: 2px solid #000;
            box-shadow: 4px 4px 0 #000;
        }
        
        .data-overwrite-modal .cancel-btn:hover {
            background-color: #f5f5f5;
        }
        
        .data-overwrite-modal .cancel-btn:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 #000;
        }
        
        .data-overwrite-modal .success-message {
            display: none;
            margin-top: 20px;
            padding: 15px;
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            color: #155724;
        }
        
        .data-overwrite-modal .error-message {
            display: none;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            color: #721c24;
        }
    `;

    // Create and inject the modal's CSS
    function injectOverwriteModalCSS() {
        if (!document.querySelector('#data-overwrite-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'data-overwrite-modal-styles';
            style.textContent = modalCSS;
            document.head.appendChild(style);
        }
    }

    // Clear all localStorage data
    function clearLocalStorage() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) keysToRemove.push(key);
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Clear all cookies
    function clearAllCookies() {
        try {
            const cookies = document.cookie.split(";");
            
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                // Clear cookie for current domain
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                // Clear cookie for current domain with www
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                // Clear cookie for parent domain
                const hostParts = window.location.hostname.split('.');
                if (hostParts.length > 1) {
                    const parentDomain = hostParts.slice(-2).join('.');
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${parentDomain}`;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing cookies:', error);
            return false;
        }
    }

    // Clear session storage as well
    function clearSessionStorage() {
        try {
            sessionStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
            return false;
        }
    }

    // Show success message
    function showSuccessMessage(modal) {
        const content = modal.querySelector('.modal-content');
        const successMessage = modal.querySelector('.success-message');
        const buttonContainer = modal.querySelector('.button-container');
        
        if (successMessage && buttonContainer) {
            buttonContainer.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                closeDataOverwriteModal();
                // Optionally reload the page to reflect the cleared state
                if (confirm('Data cleared successfully! Would you like to reload the page to see the changes?')) {
                    window.location.reload();
                }
            }, 3000);
        }
    }

    // Show error message
    function showErrorMessage(modal, errorText) {
        const errorMessage = modal.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = errorText;
            errorMessage.style.display = 'block';
        }
    }

    // Perform the data clearing operation
    function clearAllData(modal) {
        try {
            const localStorageCleared = clearLocalStorage();
            const cookiesCleared = clearAllCookies();
            const sessionStorageCleared = clearSessionStorage();
            
            if (localStorageCleared && cookiesCleared && sessionStorageCleared) {
                showSuccessMessage(modal);
            } else {
                showErrorMessage(modal, 'Some data may not have been cleared completely. Please try again or contact support.');
            }
        } catch (error) {
            console.error('Error during data clearing:', error);
            showErrorMessage(modal, 'An error occurred while clearing data. Please try again.');
        }
    }

    // Create the modal HTML
    function createDataOverwriteModalHTML() {
        return `
            <div class="modal-content">
                <h2>⚠️ Clear All Data</h2>
                <p>You are about to permanently delete all stored data including:</p>
                <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                    <li>All saved form data and preferences</li>
                    <li>Financial calculations and entries</li>
                    <li>AI conversation history</li>
                    <li>User settings and customizations</li>
                    <li>Login sessions and cookies</li>
                </ul>
                <p class="warning-text">⚠️ This action cannot be undone!</p>
                <div class="button-container">
                    <button class="cancel-btn" onclick="closeDataOverwriteModal()">Cancel</button>
                    <button class="confirm-btn" onclick="confirmDataOverwrite()">Clear All Data</button>
                </div>
                <div class="success-message">
                    ✅ All data has been successfully cleared! The page will reload shortly.
                </div>
                <div class="error-message">
                    ❌ An error occurred while clearing data.
                </div>
            </div>
        `;
    }

    // Close the data overwrite modal
    function closeDataOverwriteModal() {
        const modal = document.querySelector('.data-overwrite-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
        
        // Re-enable body scrolling
        document.body.style.overflow = '';
    }

    // Confirm and execute data overwrite
    function confirmDataOverwrite() {
        const modal = document.querySelector('.data-overwrite-overlay');
        if (modal) {
            clearAllData(modal);
        }
    }

    // Open the data overwrite modal
    function openDataOverwriteModal() {
        // Inject CSS if not already present
        injectOverwriteModalCSS();
        
        // Remove any existing modal
        const existingModal = document.querySelector('.data-overwrite-overlay');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'data-overwrite-overlay';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'data-overwrite-modal';
        modal.innerHTML = createDataOverwriteModalHTML();
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Close modal on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDataOverwriteModal();
            }
        });
        
        // Close modal on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeDataOverwriteModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // Expose functions globally
    window.openDataOverwriteModal = openDataOverwriteModal;
    window.closeDataOverwriteModal = closeDataOverwriteModal;
    window.confirmDataOverwrite = confirmDataOverwrite;

})();