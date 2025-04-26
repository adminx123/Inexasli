/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';

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
    const residencyStatus = document.getElementById('residencyStatus');

    const residency = document.getElementById('residency');
    if (residency) {
        const savedResidency = getLocal('residency');
        if (savedResidency) {
            residency.value = savedResidency; // Restore saved value
        }

        residency.addEventListener('change', () => {
            setLocal('residency', residency.value, 365); // Save to local storage
        });

        residency.style.display = 'block'; // Ensure visibility on page load
    }

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

        if (residencyStatus) {
            residencyStatus.style.display = 'block'; // Ensure visibility when country changes
        }
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
                updateDependantsVisibility();
                updateMaritalStatusVisibility();
                updateSpecificsVisibility();
            }

            filingStatusSection.style.display = 'block';
        } else {
            filingStatusSection.style.display = 'none';
            updateMaritalStatusVisibility(); // Hide spouse fields if no filing status
        }
    }

    function updateFormVisibility() {
        // Placeholder for additional visibility logic if needed
    }

    const numericInputs = ['ageSelf', 'ageSpouse']; // Removed unused inputs
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

    const employmentStatusSpouse = document.getElementById('employmentStatusSpouse');
    if (employmentStatusSpouse) {
        const savedEmploymentStatusSpouse = getLocal('employmentStatusSpouse');
        if (savedEmploymentStatusSpouse) {
            employmentStatusSpouse.value = savedEmploymentStatusSpouse; // Restore saved value
        }

        employmentStatusSpouse.addEventListener('change', () => {
            setLocal('employmentStatusSpouse', employmentStatusSpouse.value, 365); // Save to local storage
        });
    }

    const textAreas = ['birthYearDisabledDependants'];
    textAreas.forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            const savedValue = getLocal(id);
            if (savedValue) textarea.value = savedValue;
            textarea.addEventListener('change', () => {
                setLocal(id, textarea.value, 365);
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
            'married_filing_separately_with_disabled_dependants',
            'married_no_dependants',
            'common_law_no_dependants',
            'married_filing_jointly_no_dependants',
            'married_filing_separately_no_dependants',
            'married_or_civil_partnership_no_dependants',
            'married_or_civil_partnership_with_dependants',
            'married_or_de_facto_no_dependants',
            'married_or_de_facto_with_dependants',
            'coupled_no_dependants',
            'coupled_with_dependants'
        ].includes(fillingStatus)) {
            alert('Please enter your spouse’s age.');
            return;
        }
        if (!employmentStatus) {
            alert('Please select an employment status.');
            return;
        }
    
        // Use global DOM context to avoid intro tab overrides
        const originalQuerySelector = document.querySelector.bind(document);
    
        // Close the intro tab
        const introContainer = originalQuerySelector('.data-container-intro');
        if (introContainer && introContainer.dataset.state === 'expanded') {
            const introClose = introContainer.querySelector('.close-data-container');
            if (introClose) {
                introClose.click(); // Simulate click to close the intro tab
                console.log('Intro tab closed (intro.js)');
            } else {
                console.error('Intro close button not found (intro.js)');
            }
        } else {
            console.log('Intro tab already closed or not found (intro.js)');
        }
    
        // Open the income tab
        const incomeContainer = originalQuerySelector('.data-container-income');
        if (incomeContainer) {
            const incomeLabel = incomeContainer.querySelector('.data-label');
            if (incomeLabel) {
                setTimeout(() => {
                    incomeLabel.click(); // Simulate click to open the income tab
                    console.log('Income tab triggered to open (intro.js)');
                }, 300); // Delay to ensure intro tab closes first
            } else {
                console.error('Income data label not found (intro.js)');
            }
        } else {
            console.error('Income data container not found. Ensure income.js is loaded (intro.js)');
        }
    };
    function updateDependantsVisibility() {
        const filingStatusDropdown = document.getElementById('filingStatus');
        const selectedFilingStatus = filingStatusDropdown ? filingStatusDropdown.value : '';

        const statusesWithDisabledDependants = [
            'single_with_disabled_dependants',
            'widowed_with_disabled_dependants',
            'separated_with_disabled_dependants',
            'married_with_disabled_dependants',
            'common_law_with_disabled_dependants',
            'coupled_with_disabled_dependants',
            'qualifying_widow_with_disabled_dependants',
            'married_filing_jointly_with_disabled_dependants',
            'married_filing_separately_with_disabled_dependants',
            'head_of_household_with_disabled_dependants',
            
        ];

        if (statusesWithDisabledDependants.includes(selectedFilingStatus)) {
            dependantsContainer.style.display = 'block';
            const birthYearField = document.getElementById('birthYearDisabledDependants');
            const birthYearLabel = document.querySelector('label[for="birthYearDisabledDependants"]');
            if (birthYearField && birthYearLabel) {
                birthYearField.style.display = 'block';
                birthYearLabel.style.display = 'block';
            }
        } else {
            dependantsContainer.style.display = 'none';
            const birthYearField = document.getElementById('birthYearDisabledDependants');
            const birthYearLabel = document.querySelector('label[for="birthYearDisabledDependants"]');
            if (birthYearField && birthYearLabel) {
                birthYearField.style.display = 'none';
                birthYearLabel.style.display = 'none';
            }
        }
    }

    function updateMaritalStatusVisibility() {
        const filingStatusDropdown = document.getElementById('filingStatus');
        const selectedFilingStatus = filingStatusDropdown ? filingStatusDropdown.value : '';

        const singleStatuses = [
            'single_no_dependants',
            'single_with_dependants',
            'single_with_disabled_dependants',
            'single_self_disabled',
            'single_caregiver',
            'widowed_no_dependants',
            'widowed_with_dependants',
            'widowed_with_disabled_dependants',
            'separated_no_dependants',
            'separated_with_dependants',
            'separated_with_disabled_dependants',
            'head_of_household_no_dependants',
            'head_of_household_with_dependants',
            'head_of_household_with_disabled_dependants',
            'head_of_household_caregiver',
            'qualifying_widow_no_dependants',
            'qualifying_widow_with_dependants',
            'qualifying_widow_with_disabled_dependants'
        ];

        if (singleStatuses.includes(selectedFilingStatus) || !selectedFilingStatus) {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'none');
        } else {
            document.querySelectorAll('.spouseFields').forEach(field => field.style.display = 'block');
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

    function toggleFilingStatusVisibility() {
        const residencyDropdown = document.getElementById('residency');
        const filingStatusDiv = document.querySelector('.filingStatus');

        if (residencyDropdown && filingStatusDiv) {
            if (residencyDropdown.value) {
                filingStatusDiv.style.display = 'block';
            } else {
                filingStatusDiv.style.display = 'none';
            }
        }
    }

    // Add event listener to toggle visibility on change
    const residencyDropdown = document.getElementById('residency');
    if (residencyDropdown) {
        residencyDropdown.addEventListener('change', toggleFilingStatusVisibility);
    }

    // Initial check on page load
    toggleFilingStatusVisibility();

    // Initial visibility updates
    updateDependantsVisibility();
    updateMaritalStatusVisibility();
    updateSpecificsVisibility();
});