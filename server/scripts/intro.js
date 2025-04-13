/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

document.addEventListener('DOMContentLoaded', () => {
    const countryDropdown = document.getElementById('country');
    const subregionDropdown = document.getElementById('subregion');
    const filingStatusContainer = document.getElementById('filingStatusContainer');
    const subregionContainer = document.getElementById('subregionContainer');
    const filingStatusSection = document.getElementById('filingStatusSection');
    const savedCountry = getLocal('selectedCountry');
    const savedSubregion = getLocal('selectedSubregion');
    const savedStatus = getLocal('fillingStatus');
    const dependantsContainer = document.querySelector('.dependantsContainer');

    const filingOptions = {
        CAN: [
            { value: 'single_no_deps', text: 'Single, No Dependants' },
            { value: 'single_deps', text: 'Single with Dependants' },
            { value: 'single_disabled_deps', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'common_law_no_deps', text: 'Common-Law, No Dependants' },
            { value: 'common_law_deps', text: 'Common-Law with Dependants' },
            { value: 'common_law_disabled_deps', text: 'Common-Law with Disabled Dependants' },
            { value: 'common_law_self_disabled', text: 'Common-Law, Self-Disabled' },
            { value: 'common_law_spouse_disabled', text: 'Common-Law, Spouse-Disabled' },
            { value: 'common_law_caregiver', text: 'Common-Law, Caregiver' },
            { value: 'married_no_deps', text: 'Married, No Dependants' },
            { value: 'married_deps', text: 'Married with Dependants' },
            { value: 'married_disabled_deps', text: 'Married with Disabled Dependants' },
            { value: 'married_self_disabled', text: 'Married, Self-Disabled' },
            { value: 'married_spouse_disabled', text: 'Married, Spouse-Disabled' },
            { value: 'married_caregiver', text: 'Married, Caregiver' },
            { value: 'widowed_no_deps', text: 'Widowed, No Dependants' },
            { value: 'widowed_deps', text: 'Widowed with Dependants' },
            { value: 'widowed_disabled_deps', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_deps', text: 'Separated, No Dependants' },
            { value: 'separated_deps', text: 'Separated with Dependants' },
            { value: 'separated_disabled_deps', text: 'Separated with Disabled Dependants' }
        ],
        USA: [
            { value: 'single_no_deps', text: 'Single, No Dependants' },
            { value: 'single_deps', text: 'Single with Dependants' },
            { value: 'single_disabled_deps', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'mfj_no_deps', text: 'Married Filing Jointly, No Dependants' },
            { value: 'mfj_deps', text: 'Married Filing Jointly with Dependants' },
            { value: 'mfj_disabled_deps', text: 'Married Filing Jointly with Disabled Dependants' },
            { value: 'mfj_self_disabled', text: 'Married Filing Jointly, Self-Disabled' },
            { value: 'mfj_spouse_disabled', text: 'Married Filing Jointly, Spouse-Disabled' },
            { value: 'mfj_caregiver', text: 'Married Filing Jointly, Caregiver' },
            { value: 'mfs_no_deps', text: 'Married Filing Separately, No Dependants' },
            { value: 'mfs_deps', text: 'Married Filing Separately with Dependants' },
            { value: 'mfs_disabled_deps', text: 'Married Filing Separately with Disabled Dependants' },
            { value: 'mfs_self_disabled', text: 'Married Filing Separately, Self-Disabled' },
            { value: 'hoh_no_deps', text: 'Head of Household, No Dependants' },
            { value: 'hoh_deps', text: 'Head of Household with Dependants' },
            { value: 'hoh_disabled_deps', text: 'Head of Household with Disabled Dependants' },
            { value: 'hoh_caregiver', text: 'Head of Household, Caregiver' },
            { value: 'widow_no_deps', text: 'Qualifying Widow(er), No Dependants' },
            { value: 'widow_deps', text: 'Qualifying Widow(er) with Dependants' },
            { value: 'widow_disabled_deps', text: 'Qualifying Widow(er) with Disabled Dependants' }
        ],
        UK: [
            { value: 'single_no_deps', text: 'Single, No Dependants' },
            { value: 'single_deps', text: 'Single with Dependants' },
            { value: 'single_disabled_deps', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'married_no_deps', text: 'Married or Civil Partnership, No Dependants' },
            { value: 'married_deps', text: 'Married or Civil Partnership with Dependants' },
            { value: 'married_disabled_deps', text: 'Married or Civil Partnership with Disabled Dependants' },
            { value: 'married_self_disabled', text: 'Married or Civil Partnership, Self-Disabled' },
            { value: 'married_spouse_disabled', text: 'Married or Civil Partnership, Spouse-Disabled' },
            { value: 'married_caregiver', text: 'Married or Civil Partnership, Caregiver' },
            { value: 'widowed_no_deps', text: 'Widowed, No Dependants' },
            { value: 'widowed_deps', text: 'Widowed with Dependants' },
            { value: 'widowed_disabled_deps', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_deps', text: 'Separated, No Dependants' },
            { value: 'separated_deps', text: 'Separated with Dependants' },
            { value: 'separated_disabled_deps', text: 'Separated with Disabled Dependants' }
        ],
        AUS: [
            { value: 'single_no_deps', text: 'Single, No Dependants' },
            { value: 'single_deps', text: 'Single with Dependants' },
            { value: 'single_disabled_deps', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'married_no_deps', text: 'Married or De Facto, No Dependants' },
            { value: 'married_deps', text: 'Married or De Facto with Dependants' },
            { value: 'married_disabled_deps', text: 'Married or De Facto with Disabled Dependants' },
            { value: 'married_self_disabled', text: 'Married or De Facto, Self-Disabled' },
            { value: 'married_spouse_disabled', text: 'Married or De Facto, Spouse-Disabled' },
            { value: 'married_caregiver', text: 'Married or De Facto, Caregiver' },
            { value: 'widowed_no_deps', text: 'Widowed, No Dependants' },
            { value: 'widowed_deps', text: 'Widowed with Dependants' },
            { value: 'widowed_disabled_deps', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_deps', text: 'Separated, No Dependants' },
            { value: 'separated_deps', text: 'Separated with Dependants' },
            { value: 'separated_disabled_deps', text: 'Separated with Disabled Dependants' }
        ],
        OTHER: [
            { value: 'single_no_deps', text: 'Single, No Dependants' },
            { value: 'single_deps', text: 'Single with Dependants' },
            { value: 'single_disabled_deps', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'coupled_no_deps', text: 'Coupled, No Dependants' },
            { value: 'coupled_deps', text: 'Coupled with Dependants' },
            { value: 'coupled_disabled_deps', text: 'Coupled with Disabled Dependants' },
            { value: 'coupled_self_disabled', text: 'Coupled, Self-Disabled' },
            { value: 'coupled_spouse_disabled', text: 'Coupled, Spouse-Disabled' },
            { value: 'coupled_caregiver', text: 'Coupled, Caregiver' },
            { value: 'widowed_no_deps', text: 'Widowed, No Dependants' },
            { value: 'widowed_deps', text: 'Widowed with Dependants' },
            { value: 'widowed_disabled_deps', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_deps', text: 'Separated, No Dependants' },
            { value: 'separated_deps', text: 'Separated with Dependants' },
            { value: 'separated_disabled_deps', text: 'Separated with Disabled Dependants' }
        ]
    };

    const subregionMap = {
        CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
        USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
        UK: ["England", "Scotland", "Wales", "Northern Ireland", "Greater London", "West Midlands", "South East", "North West", "East of England", "Yorkshire and The Humber", "South West", "East Midlands", "North East"],
        AUS: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"],
        OTHER: ["Province", "State", "Region", "District", "Territory", "Prefecture", "County", "Municipality"]
    };

    if (savedCountry) {
        countryDropdown.value = savedCountry;
        updateSubregionDropdown(savedCountry, savedSubregion);
        updateFilingStatus(savedCountry, savedStatus);
    }

    countryDropdown.addEventListener('change', () => {
        const country = countryDropdown.value;
        setLocal('selectedCountry', country, 365);
        setLocal('selectedSubregion', '', 365);
        updateSubregionDropdown(country);
        updateFilingStatus(country);
        updateFormVisibility();
    });

    subregionDropdown.addEventListener('change', () => {
        const subregion = subregionDropdown.value;
        setLocal('selectedSubregion', subregion, 365);
        updateFormVisibility();
        const country = countryDropdown.value;
        updateFilingStatus(country);
    });

    function updateSubregionDropdown(country, savedSubregion) {
        subregionDropdown.innerHTML = '<option value="">Select Tax Subregion</option>';
        if (country && subregionMap[country]) {
            subregionMap[country].forEach(subregionCode => {
                const option = document.createElement('option');
                option.text = subregionCode;
                option.value = subregionCode;
                if (savedSubregion === subregionCode) option.selected = true;
                subregionDropdown.appendChild(option);
            });
            subregionContainer.style.display = 'block';
            subregionDropdown.style.display = 'block';
        } else {
            subregionContainer.style.display = 'none';
            subregionDropdown.style.display = 'none';
        }
    }

    function updateFilingStatus(country, savedStatus) {
        filingStatusContainer.innerHTML = '';
        if (country && (getLocal('selectedSubregion') || country === 'OTHER') && filingOptions[country]) {
            filingStatusContainer.innerHTML = '';
            filingOptions[country].forEach(option => {
                const div = document.createElement('div');
                div.className = 'grid-item';
                div.dataset.value = option.value;
                div.textContent = option.text;
                div.style.margin = '8.5px';
                if (savedStatus === option.value) div.classList.add('selected');
                div.addEventListener('click', () => {
                    filingStatusContainer.querySelectorAll('.grid-item').forEach(item => item.classList.remove('selected'));
                    div.classList.add('selected');
                    setLocal('fillingStatus', option.value, 365);
                    updateFormVisibility();
                });
                filingStatusContainer.appendChild(div);
            });
            filingStatusSection.style.display = 'block';
        } else {
            filingStatusSection.style.display = 'none';
        }
    }

    function updateFormVisibility() {
        // Removed all show/hide logic for simplicity
    }

    updateFormVisibility();

    const numericInputs = ['numDependants', 'numDisabledDependants', 'numChildrenUnder19', 'numAdultDependants', 'ageSelf', 'ageSpouse'];
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const savedValue = getLocal(id);
            if (savedValue) input.value = savedValue;
            input.addEventListener('change', () => {
                setLocal(id, input.value, 365);
                updateFormVisibility();
            });
        }
    });

    const selectInputs = ['employmentStatus'];
    selectInputs.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const savedValue = getLocal(id);
            if (savedValue) select.value = savedValue;
            select.addEventListener('change', () => {
                setLocal(id, select.value, 365);
                updateFormVisibility();
            });
        }
    });

    const checkboxes = ['dependants']; // Removed 'debt' from the list

    checkboxes.forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            const value = getLocal(id);
            item.checked = value === 'checked';
            item.classList.toggle('selected', value === 'checked');
            if (value !== 'checked') setLocal(id, 'unChecked', 365);
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                setLocal(id, item.checked ? 'checked' : 'unChecked', 365);
                updateFormVisibility();
            });
        }
    });

    window.nextPage = function() {
        const country = getLocal('selectedCountry');
        const subregion = getLocal('selectedSubregion');
        const fillingStatus = getLocal('fillingStatus');

        if (!country) {
            alert('Please select a country.');
            return;
        }
        if (!subregion && country !== 'OTHER') {
            alert('Please select a tax subregion.');
            return;
        }
        if (!fillingStatus) {
            alert('Please select a filing status.');
            return;
        }

        const numDependants = parseInt(getLocal('numDependants') || '0');
        const numDisabledDependants = parseInt(getLocal('numDisabledDependants') || '0');
        const numChildrenUnder19 = parseInt(getLocal('numChildrenUnder19') || '0');
        const numAdultDependants = parseInt(getLocal('numAdultDependants') || '0');

        if (numDependants > 0) {
            if (numDisabledDependants > numDependants) {
                alert('Number of disabled dependants cannot exceed total dependants.');
                return;
            }
            if (numChildrenUnder19 + numAdultDependants > numDependants) {
                alert('Total of children under 19 and adult dependants cannot exceed total dependants.');
                return;
            }
        }

        if (numDisabledDependants > 0 && !/disabled_deps/.test(fillingStatus)) {
            alert('You’ve indicated disabled dependants but selected a filing status without disabled dependants. Please update your filing status.');
            return;
        }
        if (numDisabledDependants === 0 && /disabled_deps/.test(fillingStatus)) {
            alert('You’ve selected a filing status with disabled dependants but indicated zero disabled dependants. Please update your inputs.');
            return;
        }

        window.location.href = './income.html';
    };

    function updateDependantsVisibility() {
        const selectedFilingStatus = filingStatusContainer.querySelector('.grid-item.selected');
        if (selectedFilingStatus && /_deps/.test(selectedFilingStatus.dataset.value) && !/_no_deps/.test(selectedFilingStatus.dataset.value)) {
            dependantsContainer.style.display = 'block';
        } else {
            dependantsContainer.style.display = 'none';
        }
    }

    function updateMaritalStatusVisibility() {
        const selectedFilingStatus = filingStatusContainer.querySelector('.grid-item.selected');
        if (selectedFilingStatus && /married|common_law/.test(selectedFilingStatus.dataset.value)) {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'block');
        } else {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'none');
        }
    }

    filingStatusContainer.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.grid-item');
        if (clickedItem) {
            filingStatusContainer.querySelectorAll('.grid-item').forEach(item => item.classList.remove('selected'));
            clickedItem.classList.add('selected');

            // Set local storage based on filing status
            if (/_deps/.test(clickedItem.dataset.value) && !/_no_deps/.test(clickedItem.dataset.value)) {
                setLocal('dependant', 'dependant', 365);
            } else {
                setLocal('dependant', 'no_dependant', 365);
            }

            updateDependantsVisibility();
            updateMaritalStatusVisibility();
        }
    });

    // Initial visibility update
    updateDependantsVisibility();
    updateMaritalStatusVisibility();
});