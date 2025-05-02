/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 



import { setLocal } from '/utility/setlocal.js'; // Adjust path as needed

// Add a confirmation prompt before overwriting cookies
export function overwriteCookies() {
    if (!confirm("Are you sure you want to overwrite all cookies and clear input fields? This action cannot be undone.")) {
        console.log("User canceled the overwrite action.");
        return; // Exit the function if the user cancels
    }

    const formElements = [
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop',
        'income_investment_property', 'income_capital_gains_losses', 'income_interest',
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension',
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony',
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending',
        'income_venture_capital', 'income_tax_free_income',
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
        'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
        'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
        'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
        'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
        'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
        'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent',
        'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
        'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
        'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears','summary_reached'
    ];

    const value = ''; // Default value to clear cookies

    // First, overwrite all cookies regardless of whether elements exist
    formElements.forEach(function (cookieName) {
        setLocal(cookieName, value, 365); // Set all cookies with a 1-year expiry
    });

    // Then, only clear input fields that exist on the current page
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value; // Only clear the input if it exists on current page
        }
    });

    console.log("All specified cookies have been overwritten and existing input fields cleared.");
}

// Creates a button with the 3D garbage can style
export function createStyledButton(text, onClick, className = '', iconClass = '') {
    // Create button container
    const button = document.createElement('button');
    button.className = `styled-3d-button ${className}`;
    button.title = text; // Add title for accessibility
    
    // Apply 3D tab styling - matching the dataOverwrite.js style
    button.style.backgroundColor = '#f5f5f5';
    button.style.color = '#000';
    button.style.border = '2px solid #000';
    button.style.borderRadius = '8px';
    button.style.boxShadow = '4px 4px 0 #000';
    button.style.padding = '10px 16px';
    button.style.margin = '0 5px';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.cursor = 'pointer';
    button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
    button.style.fontFamily = '"Inter", sans-serif';
    
    // Add text if provided
    if (text && !iconClass) {
        button.textContent = text;
    }
    
    // Add icon if provided
    if (iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.style.fontSize = '18px';
        button.appendChild(icon);
        
        // Add text next to icon if provided
        if (text) {
            const textSpan = document.createElement('span');
            textSpan.textContent = ` ${text}`; // Space before text
            textSpan.style.marginLeft = '5px';
            button.appendChild(textSpan);
        }
    }
    
    // Add hover effect matching the tab style
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#FFFFFF';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#f5f5f5';
    });
    
    // Add active/click effect
    button.addEventListener('mousedown', function() {
        button.style.transform = 'translate(2px, 2px)';
        button.style.boxShadow = '2px 2px 0 #000';
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'translate(0, 0)';
        button.style.boxShadow = '4px 4px 0 #000';
    });
    
    // Add click event
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

// Creates a frequency button row with the 3D tab style
export function createFrequencyButtons(container, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'frequency-button-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.gap = '15px';
    wrapper.style.margin = '15px 0';
    
    const frequencies = [
        { value: 'annual', text: 'Annual' },
        { value: 'monthly', text: 'Monthly' },
        { value: 'weekly', text: 'Weekly' }
    ];
    
    const buttons = [];
    
    frequencies.forEach(freq => {
        const button = createStyledButton(freq.text, () => {
            // Remove active class from all buttons
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = '#f5f5f5';
                btn.style.color = '#000';
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            button.style.backgroundColor = '#333';
            button.style.color = '#fff';
            
            // Call onChange if provided
            if (onChange) {
                onChange(freq.value);
            }
        });
        
        // Set annual as default active
        if (freq.value === 'annual') {
            button.classList.add('active');
            button.style.backgroundColor = '#333';
            button.style.color = '#fff';
        }
        
        buttons.push(button);
        wrapper.appendChild(button);
    });
    
    // Append to container if provided
    if (container) {
        container.appendChild(wrapper);
    }
    
    return { wrapper, buttons };
}

