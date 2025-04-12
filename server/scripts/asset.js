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

// Tab navigation handling (identical to expense.js)
const tabs = document.querySelectorAll('.tab');

function handleTabClick(e) {
    const dataL = e.currentTarget.getAttribute('data-location');
    const location = document.location.pathname;

    if (location.includes(dataL)) {
        e.currentTarget.removeAttribute('href');
        e.currentTarget.classList.add('active');
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', handleTabClick);

    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

// Form handling (mimics expense.js)
document.addEventListener('DOMContentLoaded', function () {
    // List of asset amount and percent inputs
    const assetElements = [
        'assets_checking_accounts',
        'assets_savings_accounts',
        'assets_other_liquid_accounts',
        'assets_money_lent_out',
        'assets_long_term_investment_accounts',
        'assets_investment_properties',
        'assets_art_jewelry',
        'assets_primary_residence',
        'assets_small_business',
        'assets_vehicles',
        'assets_checking_accounts_percent',
        'assets_savings_accounts_percent',
        'assets_other_liquid_accounts_percent',
        'assets_money_lent_out_percent',
        'assets_long_term_investment_accounts_percent',
        'assets_investment_properties_percent',
        'assets_art_jewelry_percent',
        'assets_primary_residence_percent',
        'assets_small_business_percent',
        'assets_vehicles_percent'
    ];

    // Restore saved form inputs
    assetElements.forEach(function (elementId) {
        const value = getLocal(elementId);
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        }
    });
});

// Navigation function (mimics expense.js)
window.calculateNext = function () {
    // List of asset amount and percent inputs
    const assetElements = [
        'assets_checking_accounts',
        'assets_savings_accounts',
        'assets_other_liquid_accounts',
        'assets_money_lent_out',
        'assets_long_term_investment_accounts',
        'assets_investment_properties',
        'assets_art_jewelry',
        'assets_primary_residence',
        'assets_small_business',
        'assets_vehicles',
        'assets_checking_accounts_percent',
        'assets_savings_accounts_percent',
        'assets_other_liquid_accounts_percent',
        'assets_money_lent_out_percent',
        'assets_long_term_investment_accounts_percent',
        'assets_investment_properties_percent',
        'assets_art_jewelry_percent',
        'assets_primary_residence_percent',
        'assets_small_business_percent',
        'assets_vehicles_percent'
    ];

    // Save all user inputs
    assetElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    // Navigate to the next page
    window.location.href = './liability.html';
    return true;
};