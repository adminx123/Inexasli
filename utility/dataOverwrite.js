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
 * dataOverwrite.js
 * A utility script for clearing all localStorage data and cookies.
 * Can be used with a button placed in the center of the screen or any other trigger.
 */

// Define the field names to clear specifically
const DATA_FIELDS = [
    // Income fields
    'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop',
    'income_investment_property', 'income_capital_gains_losses', 'income_interest',
    'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension',
    'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony',
    'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending',
    'income_venture_capital', 'income_tax_free_income',
    
    // Frequency fields
    'frequency_income_salary_wages_frequency', 'frequency_income_tips_frequency', 
    'frequency_income_bonuses_frequency', 'frequency_income_sole_prop_frequency',
    'frequency_income_investment_property_frequency', 'frequency_income_capital_gains_losses_frequency', 
    'frequency_income_interest_frequency', 'frequency_income_owner_dividend_frequency', 
    'frequency_income_public_dividend_frequency', 'frequency_income_trust_frequency', 
    'frequency_income_federal_pension_frequency', 'frequency_income_work_pension_frequency', 
    'frequency_income_social_security_frequency', 'frequency_income_employment_insurance_frequency', 
    'frequency_income_alimony_frequency', 'frequency_income_scholarships_grants_frequency', 
    'frequency_income_royalties_frequency', 'frequency_income_gambling_winnings_frequency', 
    'frequency_income_peer_to_peer_lending_frequency', 'frequency_income_venture_capital_frequency', 
    'frequency_income_tax_free_income_frequency',
    
    // Expense fields
    'expenses_grocery', 'expenses_dining', 'expenses_fitness', 'expenses_hygiene',
    'expenses_subscriptions', 'expenses_entertainment', 'expenses_clothing',
    'expenses_vacation', 'expenses_beauty', 'expenses_travel_life_insurance',
    'expenses_cellphone_service', 'expenses_medical_dental', 'expenses_perscription',
    'expenses_line_of_credit_payment', 'expenses_student_loan_payment', 'expenses_credit_card_payment',
    'expenses_tax_arrears_payment', 'expenses_small_business_loan_payment', 'housing_mortgage_payment',
    'housing_rent_payment', 'housing_property_tax', 'housing_condo_fee', 'housing_hydro', 'housing_insurance',
    'housing_repairs', 'housing_water', 'housing_gas', 'housing_internet', 'transportation_car_loan_payment',
    'transportation_insurance', 'transportation_fuel', 'transportation_maintenance', 'transportation_public_transit',
    'transportation_ride_hailing', 'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing',
    'dependant_sports_recreation', 'dependant_transportation', 'dependant_tuition', 'dependant_housing',
    'dependant_cellular_service',
    
    // Asset fields
    'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
    'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
    'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
    'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
    'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
    'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent',
    
    // Liability fields
    'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
    'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
    'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears',
    
    // Summary field
    'summary_reached',
    
    // Other calculated values
    'ANNUALINCOME', 'ANNUALEMPLOYMENTINCOME', 'totalRevenue', 'calculated_from_worksheet',
    
    // User preferences and consents
    'data_storage_consent', 'dataStorageConsent', 'terms_accepted', 'termsAccepted',
    'term1', 'term2', 'visited', 'RegionDropdown', 'SubregionDropdown'
];

/**
 * Create and display a floating button tucked into the top left corner of the screen
 * that triggers data overwrite when clicked
 */
function createOverwriteButton() {
    // Button is now integrated into datain.js - skip external creation
    console.log('[DataOverwrite] Button creation skipped - integrated into datain.js');
    return;
    
    // Create the button with the 3D tab styling
    const button = document.createElement('button');
    button.id = 'overwriteButton';
    button.title = 'Clear All Data'; // Add title for accessibility
    
    // Apply 3D tab styling - matching the bottom left corner style
    button.style.backgroundColor = 'transparent';
    button.style.color = '#000';
    button.style.border = 'none';
    button.style.borderRadius = '0';
    button.style.boxShadow = 'none';
    button.style.padding = '0'; // Reduced padding
    button.style.width = '36px'; // Changed from 50px to 36px
    button.style.height = '36px'; // Changed from 50px to 36px
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.cursor = 'pointer';
    button.style.margin = '0'; // Remove any margin
    button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
    button.style.position = 'relative'; // Add position relative
    button.style.top = '0'; // Ensure it's at the very top
    button.style.left = '0'; // Ensure it's at the very left
    
    // Create just an icon (no text)
    const icon = document.createElement('i');
    icon.className = 'bx bx-trash';
    icon.style.fontSize = '18px'; // Reduced from 24px to match new container size
    button.appendChild(icon);
    
    // Add hover effect matching the tab style
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = 'transparent';
    });
    
    // Add active/click effect - adjusted for bottom left position
    button.addEventListener('mousedown', function() {
        button.style.transform = 'scale(0.9)'; // Scale down when pressed
        button.style.opacity = '0.7';
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'scale(1)';
        button.style.opacity = '1';
    });
    
    // Add click event to open the modal
    button.addEventListener('click', openDataOverwriteModal);
    
    // Append button to container, and container to body
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    // Add media query for mobile devices
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const adjustForMobile = (query) => {
        if (query.matches) { // If media query matches (mobile)
            button.style.width = '28px'; // Match mobile tab width
            button.style.height = '28px'; // Match mobile tab height
            icon.style.fontSize = '14px'; // Smaller icon for mobile
        } else {
            button.style.width = '36px'; // Desktop size
            button.style.height = '36px'; // Desktop size
            icon.style.fontSize = '18px'; // Desktop icon size
        }
    };
    
    // Initial check
    adjustForMobile(mobileQuery);
    
    // Listen for changes (like rotation)
    mobileQuery.addListener(adjustForMobile);
    
    return buttonContainer;
}

/**
 * Create or get the data overwrite modal container
 */
function getDataOverwriteModal() {
    let modal = document.getElementById('data-overwrite-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-overwrite-modal';
        modal.className = 'data-overwrite-modal';
        
        // Add click handler to close when clicking outside the content
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeDataOverwriteModal();
            }
        });
        
        // Add keydown handler to close on escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                closeDataOverwriteModal();
            }
        });
        
        // Create and append modal content
        const modalContent = createDataOverwriteModalContent();
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Add modal styles
        addDataOverwriteModalStyles();
    }
    return modal;
}

/**
 * Function to open the data overwrite modal
 */
function openDataOverwriteModal() {
    const modal = getDataOverwriteModal();
    modal.style.display = 'flex';
}

/**
 * Function to close the data overwrite modal
 */
function closeDataOverwriteModal() {
    const modal = document.getElementById('data-overwrite-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Add CSS styles for the data overwrite modal
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
 * Create the content for the data overwrite modal
 */
function createDataOverwriteModalContent() {
    const modalContent = document.createElement('div');
    modalContent.className = 'data-overwrite-modal-content';
    
    // Add title
    const title = document.createElement('h2');
    title.className = 'data-overwrite-modal-title';
    title.textContent = 'Clear All Data';
    modalContent.appendChild(title);
    
    // Add description
    const description = document.createElement('p');
    description.className = 'data-overwrite-modal-description';
    description.textContent = 'Are you sure you want to clear ALL stored data? This will reset all fields and your preferences. This action cannot be undone.';
    modalContent.appendChild(description);
    
    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'data-overwrite-modal-buttons';
    
    // Add confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'data-overwrite-modal-button confirm';
    confirmButton.textContent = 'Yes, Clear All Data';
    confirmButton.addEventListener('click', executeDataOverwrite);
    buttonsContainer.appendChild(confirmButton);
    
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'data-overwrite-modal-button cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', closeDataOverwriteModal);
    buttonsContainer.appendChild(cancelButton);
    
    modalContent.appendChild(buttonsContainer);
    
    return modalContent;
}

/**
 * Execute the data overwrite process after confirmation
 */
function executeDataOverwrite() {
    try {
        // First clear specific fields in localStorage
        DATA_FIELDS.forEach(field => {
            localStorage.removeItem(field);
        });
        
        // Then clear all localStorage (in case we missed any fields)
        localStorage.clear();
        
        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        }
        
        // Clear form fields on the current page
        const inputElements = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], textarea, select');
        inputElements.forEach(input => {
            input.value = '';
        });
        
        // Also clear checkboxes and radio buttons
        const checkboxRadioElements = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        checkboxRadioElements.forEach(element => {
            element.checked = false;
        });
        
        // Show success message by updating modal content
        showSuccessMessage();
        
        // Reload the page after a delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (e) {
        console.error("Error clearing data:", e);
        showErrorMessage(e.message);
    }
}

/**
 * Show a success message in the modal
 */
function showSuccessMessage() {
    const modal = document.getElementById('data-overwrite-modal');
    if (modal) {
        const modalContent = modal.querySelector('.data-overwrite-modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <h2 class="data-overwrite-modal-title">Success!</h2>
                <p class="data-overwrite-modal-description">All data has been successfully cleared. The page will now reload.</p>
            `;
        }
    }
}

/**
 * Show an error message in the modal
 */
function showErrorMessage(errorMessage) {
    const modal = document.getElementById('data-overwrite-modal');
    if (modal) {
        const modalContent = modal.querySelector('.data-overwrite-modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <h2 class="data-overwrite-modal-title">Error</h2>
                <p class="data-overwrite-modal-description">There was an error clearing your data: ${errorMessage}</p>
                <div class="data-overwrite-modal-buttons">
                    <button class="data-overwrite-modal-button cancel">Close</button>
                </div>
            `;
            
            // Add click handler for the close button
            const closeButton = modalContent.querySelector('.data-overwrite-modal-button');
            if (closeButton) {
                closeButton.addEventListener('click', closeDataOverwriteModal);
            }
        }
    }
}

/**
 * Clear all localStorage data and cookies
 * This is a more aggressive approach than the previous implementation
 * and will clear ALL data, not just specific fields
 */
function overwriteAllData() {
    openDataOverwriteModal();
}

/**
 * Initialize the data overwrite functionality
 * @param {boolean} showButton - Whether to show the floating button
 * @returns {HTMLElement|null} - The button container element if created
 */
function initDataOverwrite(showButton = false) {
    if (showButton) {
        return createOverwriteButton();
    }
    return null;
}

// Export functions for use in other files
window.dataOverwrite = {
    initButton: initDataOverwrite,
    clearAll: overwriteAllData,
    openModal: openDataOverwriteModal,
    closeModal: closeDataOverwriteModal
};