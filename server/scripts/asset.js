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

// Tab navigation handling (unchanged)
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

// Form handling
document.addEventListener('DOMContentLoaded', function () {
    // List of all asset inputs
    const assetElements = [
        'assets_checking_accounts',
        'assets_checking_accounts_partner',
        'assets_checking_accounts_shared',
        'assets_checking_accounts_shared_p1_percent',
        'assets_checking_accounts_shared_p2_percent',
        'assets_savings_accounts',
        'assets_savings_accounts_partner',
        'assets_savings_accounts_shared',
        'assets_savings_accounts_shared_p1_percent',
        'assets_savings_accounts_shared_p2_percent',
        'assets_other_liquid_accounts',
        'assets_other_liquid_accounts_partner',
        'assets_other_liquid_accounts_shared',
        'assets_other_liquid_accounts_shared_p1_percent',
        'assets_other_liquid_accounts_shared_p2_percent',
        'assets_money_lent_out',
        'assets_money_lent_out_partner',
        'assets_money_lent_out_shared',
        'assets_money_lent_out_shared_p1_percent',
        'assets_money_lent_out_shared_p2_percent',
        'assets_long_term_investment_accounts',
        'assets_long_term_investment_accounts_partner',
        'assets_long_term_investment_accounts_shared',
        'assets_long_term_investment_accounts_shared_p1_percent',
        'assets_long_term_investment_accounts_shared_p2_percent',
        'assets_investment_properties',
        'assets_investment_properties_partner',
        'assets_investment_properties_shared',
        'assets_investment_properties_shared_p1_percent',
        'assets_investment_properties_shared_p2_percent',
        'assets_art_jewelry',
        'assets_art_jewelry_partner',
        'assets_art_jewelry_shared',
        'assets_art_jewelry_shared_p1_percent',
        'assets_art_jewelry_shared_p2_percent',
        'assets_primary_residence',
        'assets_primary_residence_partner',
        'assets_primary_residence_shared',
        'assets_primary_residence_shared_p1_percent',
        'assets_primary_residence_shared_p2_percent',
        'assets_small_business',
        'assets_small_business_partner',
        'assets_small_business_shared',
        'assets_small_business_shared_p1_percent',
        'assets_small_business_shared_p2_percent',
        'assets_vehicles',
        'assets_vehicles_partner',
        'assets_vehicles_shared',
        'assets_vehicles_shared_p1_percent',
        'assets_vehicles_shared_p2_percent'
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

// Navigation function
window.calculateNext = function () {
    // List of assets for validation
    const assets = [
        'assets_checking_accounts',
        'assets_savings_accounts',
        'assets_other_liquid_accounts',
        'assets_money_lent_out',
        'assets_long_term_investment_accounts',
        'assets_investment_properties',
        'assets_art_jewelry',
        'assets_primary_residence',
        'assets_small_business',
        'assets_vehicles'
    ];

    // Validate shared percentages
    for (const asset of assets) {
        const sharedInput = document.getElementById(`${asset}_shared`);
        const p1Percent = document.getElementById(`${asset}_shared_p1_percent`);
        const p2Percent = document.getElementById(`${asset}_shared_p2_percent`);

        if (sharedInput && p1Percent && p2Percent) {
            const sharedValue = parseFloat(sharedInput.value) || 0;
            const p1Value = parseFloat(p1Percent.value) || 0;
            const p2Value = parseFloat(p2Percent.value) || 0;

            if (sharedValue > 0 && (p1Value + p2Value > 100)) {
                alert(`Error: For ${asset.replace('assets_', '').replace('_', ' ')}, P1 % + P2 % cannot exceed 100%.`);
                return false;
            }
        }
    }

    // List of all asset inputs
    const assetElements = [
        'assets_checking_accounts',
        'assets_checking_accounts_partner',
        'assets_checking_accounts_shared',
        'assets_checking_accounts_shared_p1_percent',
        'assets_checking_accounts_shared_p2_percent',
        'assets_savings_accounts',
        'assets_savings_accounts_partner',
        'assets_savings_accounts_shared',
        'assets_savings_accounts_shared_p1_percent',
        'assets_savings_accounts_shared_p2_percent',
        'assets_other_liquid_accounts',
        'assets_other_liquid_accounts_partner',
        'assets_other_liquid_accounts_shared',
        'assets_other_liquid_accounts_shared_p1_percent',
        'assets_other_liquid_accounts_shared_p2_percent',
        'assets_money_lent_out',
        'assets_money_lent_out_partner',
        'assets_money_lent_out_shared',
        'assets_money_lent_out_shared_p1_percent',
        'assets_money_lent_out_shared_p2_percent',
        'assets_long_term_investment_accounts',
        'assets_long_term_investment_accounts_partner',
        'assets_long_term_investment_accounts_shared',
        'assets_long_term_investment_accounts_shared_p1_percent',
        'assets_long_term_investment_accounts_shared_p2_percent',
        'assets_investment_properties',
        'assets_investment_properties_partner',
        'assets_investment_properties_shared',
        'assets_investment_properties_shared_p1_percent',
        'assets_investment_properties_shared_p2_percent',
        'assets_art_jewelry',
        'assets_art_jewelry_partner',
        'assets_art_jewelry_shared',
        'assets_art_jewelry_shared_p1_percent',
        'assets_art_jewelry_shared_p2_percent',
        'assets_primary_residence',
        'assets_primary_residence_partner',
        'assets_primary_residence_shared',
        'assets_primary_residence_shared_p1_percent',
        'assets_primary_residence_shared_p2_percent',
        'assets_small_business',
        'assets_small_business_partner',
        'assets_small_business_shared',
        'assets_small_business_shared_p1_percent',
        'assets_small_business_shared_p2_percent',
        'assets_vehicles',
        'assets_vehicles_partner',
        'assets_vehicles_shared',
        'assets_vehicles_shared_p1_percent',
        'assets_vehicles_shared_p2_percent'
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