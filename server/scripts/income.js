/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

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

const regionDropdown = document.getElementById("RegionDropdown");
const subregionDropdown = document.getElementById("SubregionDropdown");

const subregionMap = {
    CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
};

function updateSubregionDropdown() {
    const selectedRegion = regionDropdown.value;
    subregionDropdown.innerHTML = "";
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

    if (regionDropdown.value === "" || regionDropdown.value === "NONE") {
        alert("Please select a region from the dropdown.");
        return false;
    }

    if (!termscheckbox.checked || !notintended.checked) {
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

    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

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

    frequencyGroups.forEach(function (groupId) {
        const checkedCheckbox = document.querySelector(`#${groupId} input[type="checkbox"]:checked`);
        const value = checkedCheckbox ? checkedCheckbox.value : '';
        setLocal(`frequency_${groupId}`, value, 365);
    });

    window.location.href = '/budget/expense.html';
    return true;
}

function initializeCheckboxes() {
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

    frequencyGroups.forEach(function (groupId) {
        const groupElement = document.getElementById(groupId);
        if (!groupElement) {
            console.warn(`Group element not found: ${groupId}`);
            return;
        }

        const checkboxes = groupElement.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length === 0) {
            console.warn(`No checkboxes found for group: ${groupId}`);
            return;
        }

        const isPartnerGroup = groupId.includes('_partner');
        const savedFrequency = getLocal(`frequency_${groupId}`);
        const defaultFrequency = 'annually';
        const frequencyToSet = isPartnerGroup ? (savedFrequency || 'annually') : (savedFrequency || 'annually');

        let checkedCount = 0;
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.value === frequencyToSet;
            if (checkbox.checked) checkedCount++;
        });

        if (checkedCount > 1) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = checkbox.value === defaultFrequency;
            });
            setLocal(`frequency_${groupId}`, defaultFrequency, 365);
            console.log(`Corrected multiple selections in ${groupId}, set to ${defaultFrequency}`);
        } else if (checkedCount === 0) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = checkbox.value === frequencyToSet;
            });
            setLocal(`frequency_${groupId}`, frequencyToSet, 365);
        }

        setLocal(`frequency_${groupId}`, frequencyToSet, 365);

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    checkboxes.forEach(otherCheckbox => {
                        if (otherCheckbox !== this) {
                            otherCheckbox.checked = false;
                        }
                    });
                    setLocal(`frequency_${groupId}`, this.value, 365);
                    console.log(`Set frequency for ${groupId} to ${this.value}`);
                } else {
                    this.checked = true;
                    setLocal(`frequency_${groupId}`, this.value, 365);
                }
            });
        });

        console.log(`Initialized group: ${groupId}, set to: ${frequencyToSet}`);
    });

    const partnerRows = document.querySelectorAll('.partner-clone');
    partnerRows.forEach(row => {
        console.log(`Partner row visibility: ${row.id || row.className}, display: ${getComputedStyle(row).display}`);
        const inputs = row.querySelectorAll('input[type="number"], .checkbox-button-group');
        inputs.forEach(input => {
            console.log(`Partner input style: ${input.id || input.className}, display: ${getComputedStyle(input).display}, width: ${getComputedStyle(input).width}`);
        });
    });
    const nonPartnerRows = document.querySelectorAll('.checkboxrow:not(.partner-clone)');
    nonPartnerRows.forEach(row => {
        const inputs = row.querySelectorAll('input[type="number"], .checkbox-button-group');
        inputs.forEach(input => {
            console.log(`Non-partner input style: ${input.id || input.className}, display: ${getComputedStyle(input).display}, width: ${getComputedStyle(input).width}`);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Restore terms checkboxes state
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');
    checkbox1.checked = isChecked1;
    checkbox2.checked = isChecked2;
    console.log('Restored termscheckbox:', isChecked1, 'notintended:', isChecked2);

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

    const regionValue = getLocal('RegionDropdown');
    regionDropdown.value = regionValue || 'NONE';

    updateSubregionDropdown();

    formElements.forEach(function (elementId) {
        if (elementId !== 'RegionDropdown') {
            const value = getLocal(elementId);
            const element = document.getElementById(elementId);
            if (element) {
                element.value = value || '';
            }
        }
    });

    const subregionValue = subregionDropdown.value;
    if (regionValue === 'USA' && subregionMap.USA && !subregionMap.USA.includes(subregionValue)) {
        subregionDropdown.value = subregionMap.USA[0] || '';
    } else if (regionValue === 'CAN' && subregionMap.CAN && !subregionMap.CAN.includes(subregionValue)) {
        subregionDropdown.value = subregionMap.CAN[0] || '';
    }

    document.addEventListener('hideShowUpdated', initializeCheckboxes);
    setTimeout(initializeCheckboxes, 200);
});