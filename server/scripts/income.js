/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';
import { initializeFrequencyGroups, saveFrequencyGroups } from '/server/scripts/frequency.js';

function getTermsCookie(name) {
    try {
        const now = Date.now();
        const status = JSON.parse(window.localStorage.getItem(name));
        if (status && now > status.time) {
            localStorage.removeItem(name);
            return false;
        }
        return status ? status.accepted : false;
    } catch (e) {
        console.error(`Error reading cookie ${name}:`, e);
        return false;
    }
}

function setTermsCookie(name, value) {
    try {
        const date = new Date();
        window.localStorage.setItem(name, JSON.stringify({
            accepted: value,
            time: date.setTime(date.getTime() + 30 * 60 * 1000)
        }));
    } catch (e) {
        console.error(`Error setting cookie ${name}:`, e);
    }
}

function handleTabClick(e) {
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');
    if (!isChecked1 || !isChecked2) {
        e.preventDefault();
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
    }
}

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;
    tab.addEventListener('click', handleTabClick);
    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

const checkbox1 = document.querySelector('#termscheckbox');
const checkbox2 = document.querySelector('#notintended');

function handleCheckboxChange() {
    if (checkbox1) setTermsCookie('term1', checkbox1.checked);
    if (checkbox2) setTermsCookie('term2', checkbox2.checked);
}

if (checkbox1) checkbox1.addEventListener('click', handleCheckboxChange);
if (checkbox2) checkbox2.addEventListener('click', handleCheckboxChange);

const regionDropdown = document.getElementById("RegionDropdown");
const subregionDropdown = document.getElementById("SubregionDropdown");

const subregionMap = {
    CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
};

function updateSubregionDropdown() {
    if (!subregionDropdown || !regionDropdown) return;
    subregionDropdown.innerHTML = '<option value="">Select Tax Subregion</option>';
    const selectedRegion = regionDropdown.value;
    if (selectedRegion in subregionMap) {
        subregionMap[selectedRegion].forEach(subregionCode => {
            const subregionOption = document.createElement("option");
            subregionOption.text = subregionCode;
            subregionOption.value = subregionCode;
            subregionDropdown.appendChild(subregionOption);
        });
    }
}

if (regionDropdown) regionDropdown.addEventListener("change", updateSubregionDropdown);

const frequencyGroups = [
    'income_salary_wages_frequency', 'income_tips_frequency', 'income_bonuses_frequency', 
    'income_sole_prop_frequency', 'income_investment_property_frequency', 
    'income_capital_gains_losses_frequency', 'income_interest_frequency', 
    'income_owner_dividend_frequency', 'income_public_dividend_frequency', 
    'income_trust_frequency', 'income_federal_pension_frequency', 
    'income_work_pension_frequency', 'income_social_security_frequency', 
    'income_employment_insurance_frequency', 'income_alimony_frequency', 
    'income_scholarships_grants_frequency', 'income_royalties_frequency', 
    'income_gambling_winnings_frequency', 'income_peer_to_peer_lending_frequency', 
    'income_venture_capital_frequency', 'income_tax_free_income_frequency',
    'income_salary_wages_partner_frequency', 'income_tips_partner_frequency', 'income_bonuses_partner_frequency', 
    'income_sole_prop_partner_frequency', 'income_investment_property_partner_frequency', 
    'income_capital_gains_losses_partner_frequency', 'income_interest_partner_frequency', 
    'income_owner_dividend_partner_frequency', 'income_public_dividend_partner_frequency', 
    'income_trust_partner_frequency', 'income_federal_pension_partner_frequency', 
    'income_work_pension_partner_frequency', 'income_social_security_partner_frequency', 
    'income_employment_insurance_partner_frequency', 'income_alimony_partner_frequency', 
    'income_scholarships_grants_partner_frequency', 'income_royalties_partner_frequency', 
    'income_gambling_winnings_partner_frequency', 'income_peer_to_peer_lending_partner_frequency', 
    'income_venture_capital_partner_frequency', 'income_tax_free_income_partner_frequency'
];

window.validatecheckbox = function () {
    if (!regionDropdown || !subregionDropdown || !checkbox1 || !checkbox2) {
        console.error('Required form elements are missing');
        alert('Form initialization error. Please try refreshing the page.');
        return false;
    }

    if (regionDropdown.value === "" || regionDropdown.value === "NONE") {
        alert("Please select a region from the dropdown.");
        return false;
    }

    if (!checkbox1.checked || !checkbox2.checked) {
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
        return false;
    }

    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 
        'income_peer_to_peer_lending', 'income_venture_capital', 'income_tax_free_income',
        'income_salary_wages_partner', 'income_tips_partner', 'income_bonuses_partner', 'income_sole_prop_partner', 
        'income_investment_property_partner', 'income_capital_gains_losses_partner', 'income_interest_partner', 
        'income_owner_dividend_partner', 'income_public_dividend_partner', 'income_trust_partner', 
        'income_federal_pension_partner', 'income_work_pension_partner', 'income_social_security_partner', 
        'income_employment_insurance_partner', 'income_alimony_partner', 'income_scholarships_grants_partner', 
        'income_royalties_partner', 'income_gambling_winnings_partner', 'income_peer_to_peer_lending_partner', 
        'income_venture_capital_partner', 'income_tax_free_income_partner'
    ];

    formElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        } else {
            console.warn(`Element not found: ${elementId}`);
        }
    });

    saveFrequencyGroups(frequencyGroups);

    window.location.href = '/budget/expense.html';
    return true;
};

document.addEventListener('DOMContentLoaded', function () {
    if (!checkbox1 || !checkbox2) {
        console.warn('Terms checkboxes not found');
    } else {
        const isChecked1 = getTermsCookie('term1');
        const isChecked2 = getTermsCookie('term2');
        checkbox1.checked = isChecked1;
        checkbox2.checked = isChecked2;
        console.log('Restored termscheckbox:', isChecked1, 'notintended:', isChecked2);
    }

    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 
        'income_peer_to_peer_lending', 'income_venture_capital', 'income_tax_free_income',
        'income_salary_wages_partner', 'income_tips_partner', 'income_bonuses_partner', 'income_sole_prop_partner', 
        'income_investment_property_partner', 'income_capital_gains_losses_partner', 'income_interest_partner', 
        'income_owner_dividend_partner', 'income_public_dividend_partner', 'income_trust_partner', 
        'income_federal_pension_partner', 'income_work_pension_partner', 'income_social_security_partner', 
        'income_employment_insurance_partner', 'income_alimony_partner', 'income_scholarships_grants_partner', 
        'income_royalties_partner', 'income_gambling_winnings_partner', 'income_peer_to_peer_lending_partner', 
        'income_venture_capital_partner', 'income_tax_free_income_partner'
    ];

    if (regionDropdown) {
        const regionValue = getLocal('RegionDropdown');
        regionDropdown.value = regionValue || 'NONE';
        updateSubregionDropdown();

        formElements.forEach(elementId => {
            if (elementId !== 'RegionDropdown') {
                const value = getLocal(elementId);
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = value || '';
                } else {
                    console.warn(`Element not found for restoring value: ${elementId}`);
                }
            }
        });

        if (subregionDropdown) {
            const subregionValue = subregionDropdown.value;
            if (regionValue === 'USA' && subregionMap.USA && !subregionMap.USA.includes(subregionValue)) {
                subregionDropdown.value = subregionMap.USA[0] || '';
            } else if (regionValue === 'CAN' && subregionMap.CAN && !subregionMap.CAN.includes(subregionValue)) {
                subregionDropdown.value = subregionMap.CAN[0] || '';
            }
        }
    } else {
        console.warn('RegionDropdown not found');
    }

    // Initialize frequency groups after DOM and hideShow updates
    document.addEventListener('hideShowUpdated', () => {
        console.log('hideShowUpdated triggered, initializing frequency groups');
        initializeFrequencyGroups(frequencyGroups);
    });


    setTimeout(() => {
        console.log('Initializing frequency groups after timeout');
        initializeFrequencyGroups(frequencyGroups);
    }, 200);


});