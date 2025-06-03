/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 

// dataOverwrite.js
// Handles modal functionality for deleting local storage related to lastgridurl

/**
 * Opens a confirmation modal asking if the user wants to delete
 * the local storage for the current lastgridurl input and response
 */
function openDataOverwriteModal() {
    // Create modal element if it doesn't exist
    let modal = document.querySelector('.data-overwrite-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'data-overwrite-modal';
        document.body.appendChild(modal);
    }

    // Get current lastgridurl from localStorage
    const currentGridUrl = localStorage.getItem('lastgridurl') || 'No URL stored';
    const hasInput = localStorage.getItem('lastgridurl_input');
    const hasResponse = localStorage.getItem('lastgridurl_response');

    // Create modal content with exact styling from payment modal
    const modalContent = document.createElement('div');
    modalContent.className = 'data-overwrite-modal-content';
    modalContent.innerHTML = `
        <h2 class="data-overwrite-modal-title">Delete Local Storage Data</h2>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; margin-bottom: 15px; text-align: left; width: 100%;">
            <p style="color: #555; font-size: 0.8rem; margin: 0 0 5px 0; font-weight: 600;">Current Grid URL:</p>
            <p style="color: #333; font-size: 0.75rem; margin: 0; word-break: break-all; font-family: monospace;">${decodeURIComponent(currentGridUrl)}</p>
        </div>

        <div style="margin-bottom: 15px;">
            <p class="data-overwrite-modal-description" style="margin-bottom: 10px;">
                This will permanently delete the following local storage items:
            </p>
            <ul style="text-align: left; color: #666; font-size: 0.8rem; margin: 0; padding-left: 20px;">
                <li><strong>lastgridurl</strong> - Current grid URL</li>
                <li><strong>lastgridurl_input</strong> - ${hasInput ? 'Stored input data' : 'No input data stored'}</li>
                <li><strong>lastgridurl_response</strong> - ${hasResponse ? 'Stored response data' : 'No response data stored'}</li>
            </ul>
        </div>

        <p style="color: #dc3545; font-size: 0.8rem; margin-bottom: 20px; font-weight: 500;">
            ⚠️ This action cannot be undone. Are you sure you want to continue?
        </p>
        
        <div class="data-overwrite-modal-buttons">
            <button onclick="cancelDataOverwrite()" class="data-overwrite-modal-button cancel">
                Cancel
            </button>
            <button onclick="confirmDataOverwrite()" class="data-overwrite-modal-button confirm">
                Delete Data
            </button>
        </div>
    `;

    // Clear and set new content
    modal.innerHTML = '';
    modal.appendChild(modalContent);

    // Show modal with exact styling from payment modal
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.padding = '30px';
    modal.style.zIndex = '20000';
    modal.style.overflowY = 'auto';
    modal.style.fontFamily = '"Inter", sans-serif';
    modal.style.backdropFilter = 'blur(3px)';
    modal.style.transition = 'background-color 0.3s ease';
    modal.style.cursor = 'pointer';

    // Add modal styles
    addDataOverwriteModalStyles();

    // Add modal-open class to disable tooltips
    document.body.classList.add('modal-open');

    // Add event listeners
    addDataOverwriteEventListeners(modal);
}

/**
 * Adds event listeners for the data overwrite modal
 */
function addDataOverwriteEventListeners(modal) {
    // Close modal on Escape key
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeDataOverwriteModal();
        }
    }

    // Close modal when clicking outside
    function handleClickOutside(event) {
        if (event.target === modal) {
            closeDataOverwriteModal();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // Store references for cleanup
    modal._keyDownHandler = handleKeyDown;
    modal._clickOutsideHandler = handleClickOutside;
}

/**
 * Add CSS styles for the data overwrite modal (matching payment modal)
 */
function addDataOverwriteModalStyles() {
    // Check if styles already exist
    if (document.getElementById('data-overwrite-modal-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'data-overwrite-modal-styles';
    style.textContent = `
        .data-overwrite-modal {
            display: none;
            position: fixed;
            background-color: rgba(0, 0, 0, 0.5);
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            justify-content: center;
            align-items: center;
            padding: 30px;
            z-index: 20000;
            overflow-y: auto;
            font-family: "Inter", sans-serif;
            backdrop-filter: blur(3px);
            transition: background-color 0.3s ease;
            cursor: pointer;
        }
        
        .data-overwrite-modal-content {
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 25px;
            width: 90%;
            max-width: 450px;
            position: relative;
            font-family: "Inter", sans-serif;
            border: 2px solid #000;
            border-radius: 8px;
            box-shadow: 4px 4px 0 #000;
            cursor: default;
        }
        
        .data-overwrite-modal-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
            font-family: "Geist", sans-serif;
        }
        
        .data-overwrite-modal-description {
            margin-bottom: 25px;
            text-align: center;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .data-overwrite-modal-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            width: 100%;
        }
        
        .data-overwrite-modal-button {
            padding: 10px 20px;
            border: 2px solid #000;
            border-radius: 6px;
            font-family: "Geist", sans-serif;
            font-weight: 500;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 3px 3px 0 #000;
        }
        
        .data-overwrite-modal-button.confirm {
            background-color: #ff5555;
            color: white;
        }
        
        .data-overwrite-modal-button.cancel {
            background-color: #f5f5f5;
            color: #000;
        }
        
        .data-overwrite-modal-button:hover {
            transform: translateY(-2px);
        }
        
        .data-overwrite-modal-button:active {
            transform: translateY(0);
            box-shadow: 1px 1px 0 #000;
        }
        
        @media (max-width: 480px) {
            .data-overwrite-modal-content {
                padding: 20px 15px;
                width: 90%;
                max-width: 320px;
            }
            
            .data-overwrite-modal-title {
                font-size: 1.1rem;
            }
            
            .data-overwrite-modal-description {
                font-size: 0.9rem;
            }
            
            .data-overwrite-modal-buttons {
                flex-direction: column;
                gap: 10px;
            }
            
            .data-overwrite-modal-button {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Closes the data overwrite modal
 */
function closeDataOverwriteModal() {
    const modal = document.querySelector('.data-overwrite-modal');
    if (modal) {
        // Remove event listeners
        if (modal._keyDownHandler) {
            document.removeEventListener('keydown', modal._keyDownHandler);
        }
        if (modal._clickOutsideHandler) {
            document.removeEventListener('click', modal._clickOutsideHandler);
        }

        // Hide modal
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

/**
 * Handles the cancel action
 */
function cancelDataOverwrite() {
    closeDataOverwriteModal();
}

/**
 * Handles the confirm action - deletes the local storage data
 */
function confirmDataOverwrite() {
    try {
        // Remove the specific localStorage items
        localStorage.removeItem('lastgridurl');
        localStorage.removeItem('lastgridurl_input');
        localStorage.removeItem('lastgridurl_response');

        // Show success message
        showDataOverwriteSuccess();
        
        // Close modal after brief delay
        setTimeout(() => {
            closeDataOverwriteModal();
        }, 1500);

    } catch (error) {
        console.error('Error deleting local storage data:', error);
        showDataOverwriteError();
    }
}

/**
 * Shows success message after data deletion
 */
function showDataOverwriteSuccess() {
    const modal = document.querySelector('.data-overwrite-modal .data-overwrite-modal-content');
    if (modal) {
        modal.innerHTML = `
            <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
                <div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
                <h2 style="color: #28a745; font-size: 1.3rem; margin-bottom: 15px; font-family: 'Geist', sans-serif; font-weight: 600;">Success!</h2>
                <p style="color: #555; font-size: 0.95rem; margin: 0;">
                    Local storage data has been successfully deleted.
                </p>
            </div>
        `;
    }
}

/**
 * Shows error message if deletion fails
 */
function showDataOverwriteError() {
    const modal = document.querySelector('.data-overwrite-modal .data-overwrite-modal-content');
    if (modal) {
        modal.innerHTML = `
            <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
                <div style="color: #dc3545; font-size: 48px; margin-bottom: 20px;">✗</div>
                <h2 style="color: #dc3545; font-size: 1.3rem; margin-bottom: 15px; font-family: 'Geist', sans-serif; font-weight: 600;">Error</h2>
                <p style="color: #555; font-size: 0.95rem; margin-bottom: 20px;">
                    An error occurred while deleting the data. Please try again.
                </p>
                <button onclick="closeDataOverwriteModal()" 
                        class="data-overwrite-modal-button cancel"
                        style="padding: 10px 20px; border: 2px solid #000; border-radius: 6px; font-family: 'Geist', sans-serif; font-weight: 500; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; box-shadow: 3px 3px 0 #000; background-color: #f5f5f5; color: #000;">
                    Close
                </button>
            </div>
        `;
    }
}

// Make functions globally accessible
window.openDataOverwriteModal = openDataOverwriteModal;
window.closeDataOverwriteModal = closeDataOverwriteModal;
window.cancelDataOverwrite = cancelDataOverwrite;
window.confirmDataOverwrite = confirmDataOverwrite;

// Export functions for module usage
export { 
    openDataOverwriteModal, 
    closeDataOverwriteModal, 
    cancelDataOverwrite, 
    confirmDataOverwrite 
};