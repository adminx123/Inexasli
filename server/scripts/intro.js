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
            { value: 'single_no_dependants', text: 'Single, No Dependants' },
            { value: 'single_with_dependants', text: 'Single with Dependants' },
            { value: 'single_with_disabled_dependants', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'common_law_no_dependants', text: 'Common-Law, No Dependants' },
            { value: 'common_law_with_dependants', text: 'Common-Law with Dependants' },
            { value: 'common_law_with_disabled_dependants', text: 'Common-Law with Disabled Dependants' },
            { value: 'common_law_self_disabled', text: 'Common-Law, Self-Disabled' },
            { value: 'common_law_spouse_disabled', text: 'Common-Law, Spouse-Disabled' },
            { value: 'common_law_caregiver', text: 'Common-Law, Caregiver' },
            { value: 'married_no_dependants', text: 'Married, No Dependants' },
            { value: 'married_with_dependants', text: 'Married with Dependants' },
            { value: 'married_with_disabled_dependants', text: 'Married with Disabled Dependants' },
            { value: 'married_self_disabled', text: 'Married, Self-Disabled' },
            { value: 'married_spouse_disabled', text: 'Married, Spouse-Disabled' },
            { value: 'married_caregiver', text: 'Married, Caregiver' },
            { value: 'widowed_no_dependants', text: 'Widowed, No Dependants' },
            { value: 'widowed_with_dependants', text: 'Widowed with Dependants' },
            { value: 'widowed_with_disabled_dependants', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_dependants', text: 'Separated, No Dependants' },
            { value: 'separated_with_dependants', text: 'Separated with Dependants' },
            { value: 'separated_with_disabled_dependants', text: 'Separated with Disabled Dependants' }
        ],
        USA: [
            { value: 'single_no_dependants', text: 'Single, No Dependants' },
            { value: 'single_with_dependants', text: 'Single with Dependants' },
            { value: 'single_with_disabled_dependants', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'married_filing_jointly_no_dependants', text: 'Married Filing Jointly, No Dependants' },
            { value: 'married_filing_jointly_with_dependants', text: 'Married Filing Jointly with Dependants' },
            { value: 'married_filing_jointly_with_disabled_dependants', text: 'Married Filing Jointly with Disabled Dependants' },
            { value: 'married_filing_jointly_self_disabled', text: 'Married Filing Jointly, Self-Disabled' },
            { value: 'married_filing_jointly_spouse_disabled', text: 'Married Filing Jointly, Spouse-Disabled' },
            { value: 'married_filing_jointly_caregiver', text: 'Married Filing Jointly, Caregiver' },
            { value: 'married_filing_separately_no_dependants', text: 'Married Filing Separately, No Dependants' },
            { value: 'married_filing_separately_with_dependants', text: 'Married Filing Separately with Dependants' },
            { value: 'married_filing_separately_with_disabled_dependants', text: 'Married Filing Separately with Disabled Dependants' },
            { value: 'married_filing_separately_self_disabled', text: 'Married Filing Separately, Self-Disabled' },
            { value: 'head_of_household_no_dependants', text: 'Head of Household, No Dependants' },
            { value: 'head_of_household_with_dependants', text: 'Head of Household with Dependants' },
            { value: 'head_of_household_with_disabled_dependants', text: 'Head of Household with Disabled Dependants' },
            { value: 'head_of_household_caregiver', text: 'Head of Household, Caregiver' },
            { value: 'qualifying_widow_no_dependants', text: 'Qualifying Widow(er), No Dependants' },
            { value: 'qualifying_widow_with_dependants', text: 'Qualifying Widow(er) with Dependants' },
            { value: 'qualifying_widow_with_disabled_dependants', text: 'Qualifying Widow(er) with Disabled Dependants' }
        ],
        UK: [
            { value: 'single_no_dependants', text: 'Single, No Dependants' },
            { value: 'single_with_dependants', text: 'Single with Dependants' },
            { value: 'single_with_disabled_dependants', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'married_or_civil_partnership_no_dependants', text: 'Married or Civil Partnership, No Dependants' },
            { value: 'married_or_civil_partnership_with_dependants', text: 'Married or Civil Partnership with Dependants' },
            { value: 'married_or_civil_partnership_with_disabled_dependants', text: 'Married or Civil Partnership with Disabled Dependants' },
            { value: 'married_or_civil_partnership_self_disabled', text: 'Married or Civil Partnership, Self-Disabled' },
            { value: 'married_or_civil_partnership_spouse_disabled', text: 'Married or Civil Partnership, Spouse-Disabled' },
            { value: 'married_or_civil_partnership_caregiver', text: 'Married or Civil Partnership, Caregiver' },
            { value: 'widowed_no_dependants', text: 'Widowed, No Dependants' },
            { value: 'widowed_with_dependants', text: 'Widowed with Dependants' },
            { value: 'widowed_with_disabled_dependants', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_dependants', text: 'Separated, No Dependants' },
            { value: 'separated_with_dependants', text: 'Separated with Dependants' },
            { value: 'separated_with_disabled_dependants', text: 'Separated with Disabled Dependants' }
        ],
        AUS: [
            { value: 'single_no_dependants', text: 'Single, No Dependants' },
            { value: 'single_with_dependants', text: 'Single with Dependants' },
            { value: 'single_with_disabled_dependants', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'married_or_de_facto_no_dependants', text: 'Married or De Facto, No Dependants' },
            { value: 'married_or_de_facto_with_dependants', text: 'Married or De Facto with Dependants' },
            { value: 'married_or_de_facto_with_disabled_dependants', text: 'Married or De Facto with Disabled Dependants' },
            { value: 'married_or_de_facto_self_disabled', text: 'Married or De Facto, Self-Disabled' },
            { value: 'married_or_de_facto_spouse_disabled', text: 'Married or De Facto, Spouse-Disabled' },
            { value: 'married_or_de_facto_caregiver', text: 'Married or De Facto, Caregiver' },
            { value: 'widowed_no_dependants', text: 'Widowed, No Dependants' },
            { value: 'widowed_with_dependants', text: 'Widowed with Dependants' },
            { value: 'widowed_with_disabled_dependants', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_dependants', text: 'Separated, No Dependants' },
            { value: 'separated_with_dependants', text: 'Separated with Dependants' },
            { value: 'separated_with_disabled_dependants', text: 'Separated with Disabled Dependants' }
        ],
        OTHER: [
            { value: 'single_no_dependants', text: 'Single, No Dependants' },
            { value: 'single_with_dependants', text: 'Single with Dependants' },
            { value: 'single_with_disabled_dependants', text: 'Single with Disabled Dependants' },
            { value: 'single_self_disabled', text: 'Single, Self-Disabled' },
            { value: 'single_caregiver', text: 'Single, Caregiver' },
            { value: 'coupled_no_dependants', text: 'Coupled, No Dependants' },
            { value: 'coupled_with_dependants', text: 'Coupled with Dependants' },
            { value: 'coupled_with_disabled_dependants', text: 'Coupled with Disabled Dependants' },
            { value: 'coupled_self_disabled', text: 'Coupled, Self-Disabled' },
            { value: 'coupled_spouse_disabled', text: 'Coupled, Spouse-Disabled' },
            { value: 'coupled_caregiver', text: 'Coupled, Caregiver' },
            { value: 'widowed_no_dependants', text: 'Widowed, No Dependants' },
            { value: 'widowed_with_dependants', text: 'Widowed with Dependants' },
            { value: 'widowed_with_disabled_dependants', text: 'Widowed with Disabled Dependants' },
            { value: 'separated_no_dependants', text: 'Separated, No Dependants' },
            { value: 'separated_with_dependants', text: 'Separated with Dependants' },
            { value: 'separated_with_disabled_dependants', text: 'Separated with Disabled Dependants' }
        ]
    };

    const subregionMap = {
        CAN: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Northwest Territories", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
        USA: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
        UK: ["England", "Scotland", "Wales", "Northern Ireland", "Greater London", "West Midlands", "South East", "North West", "East of England", "Yorkshire and The Humber", "South West", "East Midlands", "North East"],
        AUS: ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
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
            const filingStatusDropdown = document.createElement('select');
            filingStatusDropdown.id = 'filingStatus';
            filingStatusDropdown.innerHTML = '<option value="">Select Filing Status</option>';
            filingStatusContainer.appendChild(filingStatusDropdown);

            filingOptions[country].forEach(option => {
                const statusOption = document.createElement('option');
                statusOption.value = option.value;
                statusOption.text = option.text;
                filingStatusDropdown.appendChild(statusOption);
            });

            filingStatusDropdown.addEventListener('change', () => {
                const selectedStatus = filingStatusDropdown.value;
                setLocal('fillingStatus', selectedStatus, 365);
                updateDependantsVisibility();
                updateMaritalStatusVisibility();
                updateSpecificsVisibility();
            });

            if (savedStatus) {
                filingStatusDropdown.value = savedStatus;
                filingStatusDropdown.dispatchEvent(new Event('change'));
            }

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

        const ageSelf = document.getElementById('ageSelf').value;
        const ageSpouse = document.getElementById('ageSpouse').value;
        const employmentStatus = document.getElementById('employmentStatus').value;

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
        if (!ageSelf) {
            alert('Please enter your age.');
            return;
        }
        if (!ageSpouse && [
            'married_with_dependants',
            'married_with_disabled_dependants',
            'common_law_with_dependants',
            'common_law_with_disabled_dependants',
            'married_filing_jointly_with_dependants',
            'married_filing_jointly_with_disabled_dependants',
            'married_filing_separately_with_dependants',
            'married_filing_separately_with_disabled_dependants'
        ].includes(fillingStatus)) {
            alert('Please enter your spouse’s age.');
            return;
        }
        if (!employmentStatus) {
            alert('Please select an employment status.');
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

        if (numDisabledDependants > 0 && ![
            'single_with_disabled_dependants',
            'widowed_with_disabled_dependants',
            'separated_with_disabled_dependants',
            'married_with_disabled_dependants',
            'common_law_with_disabled_dependants',
            'coupled_with_disabled_dependants',
            'qualifying_widow_with_disabled_dependants',
            'married_filing_jointly_with_disabled_dependants',
            'married_filing_separately_with_disabled_dependants',
            'head_of_household_with_disabled_dependants'
        ].includes(fillingStatus)) {
            alert('You’ve indicated disabled dependants but selected a filing status without disabled dependants. Please update your filing status.');
            return;
        }
        if (numDisabledDependants === 0 && [
            'single_with_disabled_dependants',
            'widowed_with_disabled_dependants',
            'separated_with_disabled_dependants',
            'married_with_disabled_dependants',
            'common_law_with_disabled_dependants',
            'coupled_with_disabled_dependants',
            'qualifying_widow_with_disabled_dependants',
            'married_filing_jointly_with_disabled_dependants',
            'married_filing_separately_with_disabled_dependants',
            'head_of_household_with_disabled_dependants'
        ].includes(fillingStatus)) {
            alert('You’ve selected a filing status with disabled dependants but indicated zero disabled dependants. Please update your inputs.');
            return;
        }

        window.location.href = './income.html';
    };

    function updateDependantsVisibility() {
        const filingStatusDropdown = document.getElementById('filingStatus');
        const selectedFilingStatus = filingStatusDropdown.value;

        // Explicitly check for filing statuses that indicate dependants
        const statusesWithDependants = [
            'single_with_dependants',
            'single_with_disabled_dependants',
            'widowed_with_dependants',
            'widowed_with_disabled_dependants',
            'separated_with_dependants',
            'separated_with_disabled_dependants',
            'married_with_dependants',
            'married_with_disabled_dependants',
            'common_law_with_dependants',
            'common_law_with_disabled_dependants',
            'coupled_with_dependants',
            'coupled_with_disabled_dependants',
            'qualifying_widow_with_dependants',
            'qualifying_widow_with_disabled_dependants',
            'married_filing_jointly_with_dependants',
            'married_filing_jointly_with_disabled_dependants',
            'married_filing_separately_with_dependants',
            'married_filing_separately_with_disabled_dependants',
            'head_of_household_with_dependants',
            'head_of_household_with_disabled_dependants'
        ];

        if (statusesWithDependants.includes(selectedFilingStatus)) {
            dependantsContainer.style.display = 'block';
        } else {
            dependantsContainer.style.display = 'none';
        }
    }

    function updateMaritalStatusVisibility() {
        const filingStatusDropdown = document.getElementById('filingStatus');
        const selectedFilingStatus = filingStatusDropdown.value;

        if (selectedFilingStatus && /married|common_law/.test(selectedFilingStatus)) {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'block');
        } else {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'none');
        }
    
        // Explicitly hide spouse fields for "Single" or "Single, No Dependants"
        if (selectedFilingStatus === 'single' || selectedFilingStatus === 'single_no_deps') {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'none');
        }
    }

    function updateSpecificsVisibility() {
        const filingStatusDropdown = document.getElementById('filingStatus');
        const specificsDiv = document.querySelector('.specifics');

        if (filingStatusDropdown && filingStatusDropdown.value) {
            specificsDiv.style.display = 'block';
        } else {
            specificsDiv.style.display = 'none';
        }
    }

    // Attach event listener to filing status dropdown
    const filingStatusDropdown = document.getElementById('filingStatus');
    if (filingStatusDropdown) {
        filingStatusDropdown.addEventListener('change', updateSpecificsVisibility);
    }

    // Initial visibility update
    updateSpecificsVisibility();

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