/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

// Tab navigation handling
const tabs = document.querySelectorAll('.tab');

function handleTabClick(e) {
    const dataL = e.currentTarget.getAttribute('data-location');
    const location = document.location.pathname;

    if (dataL && location.includes(dataL)) {
        e.currentTarget.removeAttribute('href');
        e.currentTarget.classList.add('active');
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);

    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    if (dataL && location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

// Form handling
document.addEventListener('DOMContentLoaded', function () {
    // List of all liability inputs
    const liabilityElements = [
        'liabilities_small_business_loan',
        'liabilities_small_business_loan_partner',
        'liabilities_small_business_loan_shared',
        'liabilities_small_business_loan_shared_p1_percent',
        'liabilities_small_business_loan_shared_p2_percent',
        'liabilities_primary_residence',
        'liabilities_primary_residence_partner',
        'liabilities_primary_residence_shared',
        'liabilities_primary_residence_shared_p1_percent',
        'liabilities_primary_residence_shared_p2_percent',
        'liabilities_investment_properties',
        'liabilities_investment_properties_partner',
        'liabilities_investment_properties_shared',
        'liabilities_investment_properties_shared_p1_percent',
        'liabilities_investment_properties_shared_p2_percent',
        'liabilities_vehicle_loan',
        'liabilities_vehicle_loan_partner',
        'liabilities_vehicle_loan_shared',
        'liabilities_vehicle_loan_shared_p1_percent',
        'liabilities_vehicle_loan_shared_p2_percent',
        'liabilities_personal_debt',
        'liabilities_personal_debt_partner',
        'liabilities_personal_debt_shared',
        'liabilities_personal_debt_shared_p1_percent',
        'liabilities_personal_debt_shared_p2_percent',
        'liabilities_student_loan',
        'liabilities_student_loan_partner',
        'liabilities_student_loan_shared',
        'liabilities_student_loan_shared_p1_percent',
        'liabilities_student_loan_shared_p2_percent',
        'liabilities_line_of_credit',
        'liabilities_line_of_credit_partner',
        'liabilities_line_of_credit_shared',
        'liabilities_line_of_credit_shared_p1_percent',
        'liabilities_line_of_credit_shared_p2_percent',
        'liabilities_credit_card',
        'liabilities_credit_card_partner',
        'liabilities_credit_card_shared',
        'liabilities_credit_card_shared_p1_percent',
        'liabilities_credit_card_shared_p2_percent',
        'liabilities_tax_arrears',
        'liabilities_tax_arrears_partner',
        'liabilities_tax_arrears_shared',
        'liabilities_tax_arrears_shared_p1_percent',
        'liabilities_tax_arrears_shared_p2_percent'
    ];

    // Restore saved form inputs
    liabilityElements.forEach(function (elementId) {
        const value = getLocal(elementId);
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        }
    });
});

// Navigation function
window.calculateNext = function () {
    // List of liabilities for validation
    const liabilities = [
        'liabilities_small_business_loan',
        'liabilities_primary_residence',
        'liabilities_investment_properties',
        'liabilities_vehicle_loan',
        'liabilities_personal_debt',
        'liabilities_student_loan',
        'liabilities_line_of_credit',
        'liabilities_credit_card',
        'liabilities_tax_arrears'
    ];

    // Validate shared percentages
    for (const liability of liabilities) {
        const sharedInput = document.getElementById(`${liability}_shared`);
        const p1Percent = document.getElementById(`${liability}_shared_p1_percent`);
        const p2Percent = document.getElementById(`${liability}_shared_p2_percent`);

        if (sharedInput && p1Percent && p2Percent) {
            const sharedValue = parseFloat(sharedInput.value) || 0;
            const p1Value = parseFloat(p1Percent.value) || 0;
            const p2Value = parseFloat(p2Percent.value) || 0;

            if (sharedValue > 0 && (p1Value + p2Value > 100)) {
                alert(`Error: For ${liability.replace('liabilities_', '').replace('_', ' ')}, P1 % + P2 % cannot exceed 100%.`);
                return false;
            }
        }
    }

    // List of all liability inputs
    const liabilityElements = [
        'liabilities_small_business_loan',
        'liabilities_small_business_loan_partner',
        'liabilities_small_business_loan_shared',
        'liabilities_small_business_loan_shared_p1_percent',
        'liabilities_small_business_loan_shared_p2_percent',
        'liabilities_primary_residence',
        'liabilities_primary_residence_partner',
        'liabilities_primary_residence_shared',
        'liabilities_primary_residence_shared_p1_percent',
        'liabilities_primary_residence_shared_p2_percent',
        'liabilities_investment_properties',
        'liabilities_investment_properties_partner',
        'liabilities_investment_properties_shared',
        'liabilities_investment_properties_shared_p1_percent',
        'liabilities_investment_properties_shared_p2_percent',
        'liabilities_vehicle_loan',
        'liabilities_vehicle_loan_partner',
        'liabilities_vehicle_loan_shared',
        'liabilities_vehicle_loan_shared_p1_percent',
        'liabilities_vehicle_loan_shared_p2_percent',
        'liabilities_personal_debt',
        'liabilities_personal_debt_partner',
        'liabilities_personal_debt_shared',
        'liabilities_personal_debt_shared_p1_percent',
        'liabilities_personal_debt_shared_p2_percent',
        'liabilities_student_loan',
        'liabilities_student_loan_partner',
        'liabilities_student_loan_shared',
        'liabilities_student_loan_shared_p1_percent',
        'liabilities_student_loan_shared_p2_percent',
        'liabilities_line_of_credit',
        'liabilities_line_of_credit_partner',
        'liabilities_line_of_credit_shared',
        'liabilities_line_of_credit_shared_p1_percent',
        'liabilities_line_of_credit_shared_p2_percent',
        'liabilities_credit_card',
        'liabilities_credit_card_partner',
        'liabilities_credit_card_shared',
        'liabilities_credit_card_shared_p1_percent',
        'liabilities_credit_card_shared_p2_percent',
        'liabilities_tax_arrears',
        'liabilities_tax_arrears_partner',
        'liabilities_tax_arrears_shared',
        'liabilities_tax_arrears_shared_p1_percent',
        'liabilities_tax_arrears_shared_p2_percent'
    ];

    // Save all user inputs
    liabilityElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    // Navigate to the next page
    window.location.href = '/budget/generate.html';
    return true;
};