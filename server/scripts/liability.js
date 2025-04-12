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

// Tab navigation handling (mimics asset.js/expense.js)
const tabs = document.querySelectorAll('.tab:not([data-location="liability"])'); // Skip Liability tab

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

// Form handling (mimics asset.js/expense.js)
document.addEventListener('DOMContentLoaded', function () {
    // List of liability amount and percent inputs
    const liabilityElements = [
        'liabilities_small_business_loan',
        'liabilities_primary_residence',
        'liabilities_investment_properties',
        'liabilities_vehicle_loan',
        'liabilities_personal_debt',
        'liabilities_student_loan',
        'liabilities_line_of_credit',
        'liabilities_credit_card',
        'liabilities_tax_arrears',
        'liabilities_small_business_loan_percent',
        'liabilities_primary_residence_percent',
        'liabilities_investment_properties_percent',
        'liabilities_vehicle_loan_percent',
        'liabilities_personal_debt_percent',
        'liabilities_student_loan_percent',
        'liabilities_line_of_credit_percent',
        'liabilities_credit_card_percent',
        'liabilities_tax_arrears_percent'
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

// Navigation function (mimics asset.js/expense.js)
window.calculateNext = function () {
    // List of liability amount and percent inputs
    const liabilityElements = [
        'liabilities_small_business_loan',
        'liabilities_primary_residence',
        'liabilities_investment_properties',
        'liabilities_vehicle_loan',
        'liabilities_personal_debt',
        'liabilities_student_loan',
        'liabilities_line_of_credit',
        'liabilities_credit_card',
        'liabilities_tax_arrears',
        'liabilities_small_business_loan_percent',
        'liabilities_primary_residence_percent',
        'liabilities_investment_properties_percent',
        'liabilities_vehicle_loan_percent',
        'liabilities_personal_debt_percent',
        'liabilities_student_loan_percent',
        'liabilities_line_of_credit_percent',
        'liabilities_credit_card_percent',
        'liabilities_tax_arrears_percent'
    ];

    // Save all user inputs
    liabilityElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    // Navigate to the next page
    window.location.href = './intro.html';
    return true;
};