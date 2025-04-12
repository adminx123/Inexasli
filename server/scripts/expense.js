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
    // No checkbox validation since expense.html has no terms checkboxes
    // Allow tab navigation freely
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

// Form and frequency handling
document.addEventListener('DOMContentLoaded', function () {
    // List of form element IDs for inputs
    const formElements = [
        'expenses_grocery', 'expenses_fitness', 'expenses_hygiene', 'expenses_medical_dental',
        'expenses_perscription', 'expenses_clothing', 'expenses_cellphone_service',
        'expenses_dining', 'expenses_entertainment', 'expenses_vacation',
        'expenses_travel_life_insurance', 'expenses_subscriptions', 'expenses_beauty',
        'housing_mortgage_payment', 'housing_rent_payment', 'housing_property_tax',
        'housing_condo_fee', 'housing_hydro', 'housing_water', 'housing_gas',
        'housing_insurance', 'housing_repairs', 'housing_internet',
        'expenses_line_of_credit_payment', 'expenses_student_loan_payment',
        'expenses_credit_card_payment', 'expenses_tax_arrears_payment',
        'expenses_small_business_loan_payment', 'dependant_day_care',
        'dependant_medical_dental', 'dependant_clothing', 'dependant_sports_recreation',
        'dependant_transportation', 'dependant_tuition', 'dependant_housing',
        'dependant_cellular_service', 'transportation_car_loan_payment',
        'transportation_insurance', 'transportation_fuel', 'transportation_maintenance',
        'transportation_public_transit', 'transportation_ride_hailing'
    ];

    // List of frequency group IDs
    const frequencyGroups = [
        'expenses_grocery_frequency', 'expenses_fitness_frequency', 'expenses_hygiene_frequency',
        'expenses_medical_dental_frequency', 'expenses_perscription_frequency',
        'expenses_clothing_frequency', 'expenses_cellphone_service_frequency',
        'expenses_dining_frequency', 'expenses_entertainment_frequency',
        'expenses_vacation_frequency', 'expenses_travel_life_insurance_frequency',
        'expenses_subscriptions_frequency', 'expenses_beauty_frequency',
        'housing_mortgage_payment_frequency', 'housing_rent_payment_frequency',
        'housing_property_tax_frequency', 'housing_condo_fee_frequency',
        'housing_hydro_frequency', 'housing_water_frequency', 'housing_gas_frequency',
        'housing_insurance_frequency', 'housing_repairs_frequency', 'housing_internet_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_student_loan_payment_frequency',
        'expenses_credit_card_payment_frequency', 'expenses_tax_arrears_payment_frequency',
        'expenses_small_business_loan_payment_frequency', 'dependant_day_care_frequency',
        'dependant_medical_dental_frequency', 'dependant_clothing_frequency',
        'dependant_sports_recreation_frequency', 'dependant_transportation_frequency',
        'dependant_tuition_frequency', 'dependant_housing_frequency',
        'dependant_cellular_service_frequency', 'transportation_car_loan_payment_frequency',
        'transportation_insurance_frequency', 'transportation_fuel_frequency',
        'transportation_maintenance_frequency', 'transportation_public_transit_frequency',
        'transportation_ride_hailing_frequency'
    ];

    // Restore saved form inputs
    formElements.forEach(function (elementId) {
        const value = getLocal(elementId);
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        }
    });

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

// Navigation function
window.calculateNext = function () {
    // Save all user inputs
    const formElements = [
        'expenses_grocery', 'expenses_fitness', 'expenses_hygiene', 'expenses_medical_dental',
        'expenses_perscription', 'expenses_clothing', 'expenses_cellphone_service',
        'expenses_dining', 'expenses_entertainment', 'expenses_vacation',
        'expenses_travel_life_insurance', 'expenses_subscriptions', 'expenses_beauty',
        'housing_mortgage_payment', 'housing_rent_payment', 'housing_property_tax',
        'housing_condo_fee', 'housing_hydro', 'housing_water', 'housing_gas',
        'housing_insurance', 'housing_repairs', 'housing_internet',
        'expenses_line_of_credit_payment', 'expenses_student_loan_payment',
        'expenses_credit_card_payment', 'expenses_tax_arrears_payment',
        'expenses_small_business_loan_payment', 'dependant_day_care',
        'dependant_medical_dental', 'dependant_clothing', 'dependant_sports_recreation',
        'dependant_transportation', 'dependant_tuition', 'dependant_housing',
        'dependant_cellular_service', 'transportation_car_loan_payment',
        'transportation_insurance', 'transportation_fuel', 'transportation_maintenance',
        'transportation_public_transit', 'transportation_ride_hailing'
    ];

    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    // Save frequency selections
    const frequencyGroups = [
        'expenses_grocery_frequency', 'expenses_fitness_frequency', 'expenses_hygiene_frequency',
        'expenses_medical_dental_frequency', 'expenses_perscription_frequency',
        'expenses_clothing_frequency', 'expenses_cellphone_service_frequency',
        'expenses_dining_frequency', 'expenses_entertainment_frequency',
        'expenses_vacation_frequency', 'expenses_travel_life_insurance_frequency',
        'expenses_subscriptions_frequency', 'expenses_beauty_frequency',
        'housing_mortgage_payment_frequency', 'housing_rent_payment_frequency',
        'housing_property_tax_frequency', 'housing_condo_fee_frequency',
        'housing_hydro_frequency', 'housing_water_frequency', 'housing_gas_frequency',
        'housing_insurance_frequency', 'housing_repairs_frequency', 'housing_internet_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_student_loan_payment_frequency',
        'expenses_credit_card_payment_frequency', 'expenses_tax_arrears_payment_frequency',
        'expenses_small_business_loan_payment_frequency', 'dependant_day_care_frequency',
        'dependant_medical_dental_frequency', 'dependant_clothing_frequency',
        'dependant_sports_recreation_frequency', 'dependant_transportation_frequency',
        'dependant_tuition_frequency', 'dependant_housing_frequency',
        'dependant_cellular_service_frequency', 'transportation_car_loan_payment_frequency',
        'transportation_insurance_frequency', 'transportation_fuel_frequency',
        'transportation_maintenance_frequency', 'transportation_public_transit_frequency',
        'transportation_ride_hailing_frequency'
    ];

    frequencyGroups.forEach(function (groupId) {
        const checkedCheckbox = document.querySelector(`#${groupId} input[type="checkbox"]:checked`);
        const value = checkedCheckbox ? checkedCheckbox.value : '';
        setLocal(`frequency_${groupId}`, value, 365);
    });

    // Navigate to the next page
    window.location.href = '/budget/asset.html';
    return true;
};