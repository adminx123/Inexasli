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
// Handles modal functionality for deleting specific local storage data while preserving navigation state

/**
 * Opens a confirmation modal asking if the user wants to delete
 * specific local storage data while preserving navigation state
 */
function openDataOverwriteModal() {
    // Create modal element if it doesn't exist
    let modal = document.querySelector('.data-overwrite-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'data-overwrite-modal';
        document.body.appendChild(modal);
    }

    // Check for stored data
    const lastGridUrl = localStorage.getItem('lastgridurl');

    // Create modal content with copy.js styling - minimal text
    const modalContent = document.createElement('div');
    modalContent.className = 'data-overwrite-modal-content';
    modalContent.style.cssText = `
        background-color: #f2f9f3;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #4a7c59;
        box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
        max-width: 300px;
        width: 90%;
        text-align: center;
        font-family: "Inter", sans-serif;
    `;
    
    modalContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="text-align: center; margin-bottom: 8px; font-size: 13px; color: #666; font-family: 'Inter', sans-serif;">
                Are you sure? This can't be undone.
            </div>
            <button onclick="confirmDataOverwrite()" class="data-overwrite-action-btn" style="
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
            ">
                <i class="bx bx-trash" style="margin-right: 8px; font-size: 14px;"></i>Clear data
            </button>
        </div>
    `;

    // Clear and set new content
    modal.innerHTML = '';
    modal.appendChild(modalContent);

    // Show modal with copy.js styling
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20000;
        font-family: "Inter", sans-serif;
    `;

    // Add hover effects like copy.js
    addButtonHoverEffects();

    // Add modal-open class to disable tooltips
    document.body.classList.add('modal-open');

    // Add event listeners
    addDataOverwriteEventListeners(modal);
}

/**
 * Add hover effects to buttons like copy.js
 */
function addButtonHoverEffects() {
    const modal = document.querySelector('.data-overwrite-modal');
    if (!modal) return;
    
    modal.querySelectorAll('.data-overwrite-action-btn').forEach(btn => {
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
 * Handles the confirm action - deletes specific local storage data while preserving navigation state
 */
function confirmDataOverwrite() {
    try {
        // Remove the specific localStorage items (preserves lastGridItemUrl navigation state)
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
                <p style="color: #555; font-size: 0.95rem; margin: 0;">
                    Cleared
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
                <p style="color: #555; font-size: 0.95rem; margin-bottom: 20px;">
                    Error occurred. Try again.
                </p>
                <button onclick="closeDataOverwriteModal()" 
                        style="padding: 14px 20px; background-color: #f2f9f3; color: #2d5a3d; border: 1px solid #4a7c59; border-radius: 8px; font-family: 'Geist', sans-serif; font-weight: bold; font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);">
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