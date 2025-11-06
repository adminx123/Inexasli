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
    const htmlContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif;">
            <div style="margin-bottom: 1.5em; font-size: 14px; color: #555; line-height: 1.4;">
                Delete all stored data? This can't be undone.
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.5em;">
                <button onclick="clearCurrentFormData()" style="
                    padding: 12px 20px;
                    background: #4a7c59;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bx bx-trash-alt"></i>Clear current form
                </button>
                <button onclick="confirmDataOverwrite()" style="
                    padding: 12px 20px;
                    background: #dc2626;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    <i class="bx bx-trash"></i>Clear all data
                </button>
            </div>
            <button onclick="window.closeModal()" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                font-family: 'Inter', sans-serif;
            ">Cancel</button>
        </div>
    `;

    window.openCustomModal(htmlContent, {
        maxWidth: '350px'
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
            'fashionIqInput', // correct key for fashion input
            'fashionIqResponse', // correct key for fashion response
            'incomeIqInput', // correct key for income input
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
        window.closeModal();
        
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
            <p style="color: #555; font-size: 0.95rem; margin: 0;">
                Error occurred. Try again.
            </p>
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

/**
 * Clear current form data for the active module based on lastGridItemUrl
 */
function clearCurrentFormData() {
    try {
        const lastGridItemUrl = localStorage.getItem('lastGridItemUrl');
        
        if (!lastGridItemUrl) {
            showClearFormError('No active form found');
            return;
        }

        // Extract module name from URL pattern like /app/calorie/calorieiq.html
        const moduleMatch = lastGridItemUrl.match(/\/app\/([^\/]+)\//);
        if (!moduleMatch || !moduleMatch[1]) {
            showClearFormError('Could not identify current module');
            return;
        }

        const moduleName = moduleMatch[1].toLowerCase();
        
        // Define storage keys for each module (including special cases like income)
        const moduleStorageKeys = {
            'calorie': ['calorieIqInput', 'calorieIqResponse'],
            'decision': ['decisionIqInput', 'decisionIqResponse'],
            'enneagram': ['enneagramIqInput', 'enneagramIqResponse'],
            'event': ['eventIqInput', 'eventIqResponse'],
            'fashion': ['fashionIqInput', 'fashionIqResponse'],
            'income': ['incomeIqInput', 'incomeIqResponse', 'incomeIqinput1', 'incomeIqInput2', 'incomeIqExpense', 'incomeIqAssets', 'incomeIqLiabilities'],
            'philosophy': ['philosophyIqInput', 'philosophyIqResponse'],
            'quiz': ['quizIqInput', 'quizIqResponse'],
            'categories': ['categoriesIqInput', 'categoriesIqResponse']
        };

        const keysToRemove = moduleStorageKeys[moduleName];
        
        if (!keysToRemove) {
            showClearFormError(`Module '${moduleName}' not supported`);
            return;
        }

        // Remove the specified keys
        let removedCount = 0;
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                removedCount++;
            }
        });

        console.log(`Clear current form completed: removed ${removedCount} items for ${moduleName} module`);
        showClearFormSuccess(moduleName, removedCount);
        window.closeModal();
        
    } catch (error) {
        console.error('Error clearing current form data:', error);
        showClearFormError('Error occurred while clearing form data');
    }
}

/**
 * Show success message after clearing current form data
 */
function showClearFormSuccess(moduleName, removedCount) {
    const successContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <div style="color: #28a745; font-size: 48px; margin-bottom: 20px;">✓</div>
            <p style="color: #555; font-size: 0.95rem; margin: 0;">
                Cleared ${removedCount} items for ${moduleName} module
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
 * Show error message if clearing current form fails
 */
function showClearFormError(message) {
    const errorContent = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <div style="color: #dc3545; font-size: 48px; margin-bottom: 20px;">✗</div>
            <p style="color: #555; font-size: 0.95rem; margin: 0;">
                ${message}
            </p>
        </div>
    `;
    
    // Update current modal content
    const modal = document.querySelector('.modal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = errorContent;
            
            // Close modal after brief delay
            setTimeout(() => {
                window.closeModal();
            }, 2000);
        }
    }
}

// Make functions globally accessible
window.openDataOverwriteModal = openDataOverwriteModal;
window.confirmDataOverwrite = confirmDataOverwrite;
window.clearCurrentFormData = clearCurrentFormData;

// Export functions for module usage
export { 
    openDataOverwriteModal, 
    confirmDataOverwrite,
    clearCurrentFormData
};