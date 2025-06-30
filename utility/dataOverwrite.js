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
    // Check for stored data
    const lastGridUrl = localStorage.getItem('lastgridurl');

    const htmlContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <div style="text-align: center; margin-bottom: 8px; font-size: 13px; color: #666; font-family: 'Inter', sans-serif;">
                Delete all stored data? This can't be undone.
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="confirmDataOverwrite()" style="
                    padding: 14px 20px;
                    background: rgba(45, 90, 61, 0.9);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Geist', sans-serif;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
                ">
                    <i class="bx bx-trash" style="margin-right: 8px; font-size: 14px;"></i>Clear all data
                </button>
            </div>
        </div>
    `;

    window.openCustomModal(htmlContent, {
        maxWidth: '300px'
    });
}

/**
 * Handles the confirm action - deletes specific local storage data while preserving navigation state
 */
function confirmDataOverwrite() {
    try {
        // Define all the localStorage keys that should be cleared
        const keysToRemove = [
            // Navigation/grid state
            'lastgridurl',
            'lastgridurl_input', 
            'lastgridurl_response',
            'lastGridItemUrl',
            'categoriesPageSelection',
            
            // AI module inputs and responses
            'calorieIqInput',
            'calorieIqResponse',
            'decisionIqInput',
            'decisionIqResponse',
            'enneagramIqInput',
            'enneagramIqResponse',
            'eventIqInput',
            'eventIqResponse',
            'fashionIQInput',
            'fashionIQResponse',
            'incomeIqinput1',
            'incomeIqInput2',
            'incomeIqExpense',
            'incomeIqAssets',
            'incomeIqLiabilities',
            'incomeIqResponse',
            'philosophyIqInput',
            'philosophyIqResponse',
            'quizIqInput',
            'quizIqResponse',
            'researchIqInput',
            'researchIqResponse',
            'socialIqInput',
            'socialIqResponse',
            
            // Future modules
            'adventureIqInput',
            'adventureIqResponse',
            'speculationIqInput',
            'speculationIqResponse',
            'symptomIqInput',
            'symptomIqResponse',
            
            // Income-specific data
            'taxCalculationsStale',
            'taxCalculationsStaleTimestamp',
            'frequencySettings',
            'currencySymbol',
            
            // UI preferences that should be cleared
            'inexasli_global_swipe_hint_seen',
            
            // Authentication
            'authenticated'
        ];

        // Remove all specified localStorage items
        let removedCount = 0;
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                removedCount++;
            }
        });

        console.log(`Data overwrite completed: removed ${removedCount} localStorage items`);

        // Show success message and close modal
        showDataOverwriteSuccess();
        
    } catch (error) {
        console.error('Error deleting local storage data:', error);
        showDataOverwriteError();
    }
}

/**
 * Shows success message after data deletion
 */
function showDataOverwriteSuccess() {
    const successContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
            <p style="color: #555; font-size: 0.95rem; margin: 0;">
                All data cleared successfully
            </p>
        </div>
    `;
    
    // Update current modal content
    const modal = document.querySelector('.modal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = successContent;
            
            // Close modal after brief delay
            setTimeout(() => {
                window.closeModal();
            }, 1500);
        }
    }
}

/**
 * Shows error message if deletion fails
 */
function showDataOverwriteError() {
    const errorContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <div style="color: #dc3545; font-size: 48px; margin-bottom: 20px;">✗</div>
            <p style="color: #555; font-size: 0.95rem; margin-bottom: 20px;">
                Error occurred. Try again.
            </p>
            <button onclick="window.closeModal()" style="margin: 0;">
                Close
            </button>
        </div>
    `;
    
    // Update current modal content
    const modal = document.querySelector('.modal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = errorContent;
        }
    }
}

// Make functions globally accessible
window.openDataOverwriteModal = openDataOverwriteModal;
window.confirmDataOverwrite = confirmDataOverwrite;

// Export functions for module usage
export { 
    openDataOverwriteModal, 
    confirmDataOverwrite 
};