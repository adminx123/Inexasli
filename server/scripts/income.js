/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js'; // Adjust path as needed
import { getLocal } from '/server/scripts/getlocal.js'; // Adjust path as needed

function getTermsCookie(name) {
    const now = Date.now();
    const status = JSON.parse(window.localStorage.getItem(name));

    if (status && now > status.time) {
        localStorage.removeItem(name);
        return false;
    }

    return status ? status.accepted : false;
}

function setTermsCookie(name, value) {
    const date = new Date();
    window.localStorage.setItem(name, JSON.stringify({
        accepted: value,
        time: date.setTime(date.getTime() + 30 * 60 * 1000)
    }));
}

const tabs = document.querySelectorAll('.tab');
const checkbox1 = document.querySelector('#termscheckbox');
const checkbox2 = document.querySelector('#notintended');

function handleCheckboxChange() {
    setTermsCookie('term1', checkbox1.checked);
    setTermsCookie('term2', checkbox2.checked);
}

function handleTabClick(e) {
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');

    if (!isChecked1 || !isChecked2) {
        e.preventDefault();
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
    }
}

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    tab.addEventListener('click', handleTabClick);

    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

checkbox1.addEventListener('click', handleCheckboxChange);
checkbox2.addEventListener('click', handleCheckboxChange);

window.addEventListener('DOMContentLoaded', () => {
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');

    checkbox1.checked = isChecked1;
    checkbox2.checked = isChecked2;
});

const regionDropdown = document.getElementById("RegionDropdown");
const subregionDropdown = document.getElementById("SubregionDropdown");

const subregionMap = {
    CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
};

function updateSubregionDropdown() {
    const selectedRegion = regionDropdown.value;

    subregionDropdown.innerHTML = ""; // Clear existing options

    if (selectedRegion in subregionMap) {
        subregionMap[selectedRegion].forEach(subregionCode => {
            const subregionOption = document.createElement("option");
            subregionOption.text = subregionCode;
            subregionOption.value = subregionCode;
            subregionDropdown.appendChild(subregionOption);
        });
    }
}

regionDropdown.addEventListener("change", updateSubregionDropdown);

window.validatecheckbox = function () {
    const termscheckbox = document.getElementById("termscheckbox");
    const notintended = document.getElementById("notintended");
    const regionDropdown = document.getElementById("RegionDropdown");

    // Check if a valid region is selected
    if (regionDropdown.value === "" || regionDropdown.value === "NONE") {
        alert("Please select a region from the dropdown.");
        return false;
    }

    // Check if checkboxes are checked
    if (!termscheckbox.checked || !notintended.checked) {
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
        return false;
    }

    // Save all user inputs
    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 
        'income_peer_to_peer_lending', 'income_venture_capital', 'income_tax_free_income'
    ];

    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    // Save frequency selections
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
        'income_venture_capital_frequency', 'income_tax_free_income_frequency'
    ];

    frequencyGroups.forEach(function (groupId) {
        const checkedCheckbox = document.querySelector(`#${groupId} input[type="checkbox"]:checked`);
        const value = checkedCheckbox ? checkedCheckbox.value : '';
        setLocal(`frequency_${groupId}`, value, 365);
    });

    // Navigate to the next page
    window.location.href = '/budget/expense.html';
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    // List of form element IDs for inputs
    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 
        'income_peer_to_peer_lending', 'income_venture_capital', 'income_tax_free_income'
    ];

    // List of frequency group IDs
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
        'income_venture_capital_frequency', 'income_tax_free_income_frequency'
    ];

    // Set RegionDropdown first
    const regionValue = getLocal('RegionDropdown');
    regionDropdown.value = regionValue || 'NONE';

    // Populate SubregionDropdown options
    updateSubregionDropdown();

    // Set all other form elements
    formElements.forEach(function (elementId) {
        if (elementId !== 'RegionDropdown') {
            const value = getLocal(elementId);
            const element = document.getElementById(elementId);
            if (element) {
                element.value = value || '';
            }
        }
    });

    // Adjust SubregionDropdown if invalid
    const subregionValue = subregionDropdown.value;
    if (regionValue === 'USA' && subregionMap.USA && !subregionMap.USA.includes(subregionValue)) {
        subregionDropdown.value = subregionMap.USA[0] || '';
    } else if (regionValue === 'CAN' && subregionMap.CAN && !subregionMap.CAN.includes(subregionValue)) {
        subregionDropdown.value = subregionMap.CAN[0] || '';
    }

    // Restore saved frequency selections
    frequencyGroups.forEach(function (groupId) {
        const savedFrequency = getLocal(`frequency_${groupId}`);
        if (savedFrequency) {
            const checkbox = document.querySelector(`#${groupId} input[value="${savedFrequency}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    });

    // Add event listeners for saving inputs
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', function () {
                setLocal(elementId, element.value, 365);
            });
        }
    });

    // Add event listeners for frequency checkboxes
    frequencyGroups.forEach(function (groupId) {
        const checkboxes = document.querySelectorAll(`#${groupId} input[type="checkbox"]`);
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                // Uncheck other checkboxes in the same group
                checkboxes.forEach(function (otherCheckbox) {
                    if (otherCheckbox !== checkbox) {
                        otherCheckbox.checked = false;
                    }
                });
                // Save the selected frequency
                if (checkbox.checked) {
                    setLocal(`frequency_${groupId}`, checkbox.value, 365);
                } else {
                    setLocal(`frequency_${groupId}`, '', 365);
                }
            });
        });
    });
});

