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
 * Create and display a floating button in the center of the screen
 * that triggers data overwrite when clicked
 */
function createOverwriteButton() {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '50%';
    buttonContainer.style.left = '50%';
    buttonContainer.style.transform = 'translate(-50%, -50%)';
    buttonContainer.style.zIndex = '9997'; // Below data consent but above most content
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.alignItems = 'center';
    
    // Create the button
    const button = document.createElement('button');
    button.id = 'overwriteButton';
    button.textContent = 'Clear All Data';
    button.style.backgroundColor = '#f44336';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '10px 15px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    button.style.transition = 'all 0.3s';
    
    // Add icon if boxicons is available
    if (typeof window.boxicons !== 'undefined' || document.querySelector('link[href*="boxicons"]')) {
        const icon = document.createElement('i');
        icon.className = 'bx bx-trash';
        icon.style.marginRight = '5px';
        button.prepend(icon);
    }
    
    // Add hover effect
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#d32f2f';
        button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#f44336';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    });
    
    // Add click event
    button.addEventListener('click', overwriteAllData);
    
    // Append button to container, and container to body
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    return buttonContainer;
}

/**
 * Clear all localStorage data and cookies
 * This is a more aggressive approach than the previous implementation
 * and will clear ALL data, not just specific fields
 */
function overwriteAllData() {
    if (!confirm("Are you sure you want to clear ALL stored data? This will reset all fields and your preferences. This action cannot be undone.")) {
        return; // Exit if user cancels
    }
    
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
        
        // Alert the user
        alert("All data has been successfully cleared. The page will now reload.");
        
        // Reload the page to apply changes
        window.location.reload();
        
    } catch (e) {
        console.error("Error clearing data:", e);
        alert("There was an error clearing your data: " + e.message);
    }
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
    clearAll: overwriteAllData
};