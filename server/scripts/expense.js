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
import { initializeFrequencyGroups, saveFrequencyGroups } from '/server/scripts/frequency.js';

// Tab navigation handling
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

// Form and frequency handling
document.addEventListener('DOMContentLoaded', function () {
    // List of form element IDs for inputs
    const formElements = [
        'expenses_grocery', 'expenses_grocery_partner',
        'expenses_fitness', 'expenses_fitness_partner',
        'expenses_hygiene', 'expenses_hygiene_partner',
        'expenses_medical_dental', 'expenses_medical_dental_partner',
        'expenses_perscription', 'expenses_perscription_partner',
        'expenses_clothing', 'expenses_clothing_partner',
        'expenses_cellphone_service', 'expenses_cellphone_service_partner',
        'expenses_dining', 'expenses_dining_partner',
        'expenses_entertainment', 'expenses_entertainment_partner',
        'expenses_vacation', 'expenses_vacation_partner',
        'expenses_travel_life_insurance', 'expenses_travel_life_insurance_partner',
        'expenses_subscriptions', 'expenses_subscriptions_partner',
        'expenses_beauty', 'expenses_beauty_partner',
        'housing_mortgage_payment', 'housing_mortgage_payment_partner',
        'housing_rent_payment', 'housing_rent_payment_partner',
        'housing_property_tax', 'housing_property_tax_partner',
        'housing_condo_fee', 'housing_condo_fee_partner',
        'housing_hydro', 'housing_hydro_partner',
        'housing_water', 'housing_water_partner',
        'housing_gas', 'housing_gas_partner',
        'housing_insurance', 'housing_insurance_partner',
        'housing_repairs', 'housing_repairs_partner',
        'housing_internet', 'housing_internet_partner',
        'expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_partner',
        'expenses_student_loan_payment', 'expenses_student_loan_payment_partner',
        'expenses_credit_card_payment', 'expenses_credit_card_payment_partner',
        'expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_partner',
        'expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_partner',
        'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing',
        'dependant_sports_recreation', 'dependant_transportation', 'dependant_tuition',
        'dependant_housing', 'dependant_cellular_service',
        'transportation_car_loan_payment', 'transportation_car_loan_payment_partner',
        'transportation_insurance', 'transportation_insurance_partner',
        'transportation_fuel', 'transportation_fuel_partner',
        'transportation_maintenance', 'transportation_maintenance_partner',
        'transportation_public_transit', 'transportation_public_transit_partner',
        'transportation_ride_hailing', 'transportation_ride_hailing_partner'
    ];

    // List of frequency group IDs
    const frequencyGroups = [
        'expenses_grocery_frequency', 'expenses_grocery_partner_frequency',
        'expenses_fitness_frequency', 'expenses_fitness_partner_frequency',
        'expenses_hygiene_frequency', 'expenses_hygiene_partner_frequency',
        'expenses_medical_dental_frequency', 'expenses_medical_dental_partner_frequency',
        'expenses_perscription_frequency', 'expenses_perscription_partner_frequency',
        'expenses_clothing_frequency', 'expenses_clothing_partner_frequency',
        'expenses_cellphone_service_frequency', 'expenses_cellphone_service_partner_frequency',
        'expenses_dining_frequency', 'expenses_dining_partner_frequency',
        'expenses_entertainment_frequency', 'expenses_entertainment_partner_frequency',
        'expenses_vacation_frequency', 'expenses_vacation_partner_frequency',
        'expenses_travel_life_insurance_frequency', 'expenses_travel_life_insurance_partner_frequency',
        'expenses_subscriptions_frequency', 'expenses_subscriptions_partner_frequency',
        'expenses_beauty_frequency', 'expenses_beauty_partner_frequency',
        'housing_mortgage_payment_frequency', 'housing_mortgage_payment_partner_frequency',
        'housing_rent_payment_frequency', 'housing_rent_payment_partner_frequency',
        'housing_property_tax_frequency', 'housing_property_tax_partner_frequency',
        'housing_condo_fee_frequency', 'housing_condo_fee_partner_frequency',
        'housing_hydro_frequency', 'housing_hydro_partner_frequency',
        'housing_water_frequency', 'housing_water_partner_frequency',
        'housing_gas_frequency', 'housing_gas_partner_frequency',
        'housing_insurance_frequency', 'housing_insurance_partner_frequency',
        'housing_repairs_frequency', 'housing_repairs_partner_frequency',
        'housing_internet_frequency', 'housing_internet_partner_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_line_of_credit_payment_partner_frequency',
        'expenses_student_loan_payment_frequency', 'expenses_student_loan_payment_partner_frequency',
        'expenses_credit_card_payment_frequency', 'expenses_credit_card_payment_partner_frequency',
        'expenses_tax_arrears_payment_frequency', 'expenses_tax_arrears_payment_partner_frequency',
        'expenses_small_business_loan_payment_frequency', 'expenses_small_business_loan_payment_partner_frequency',
        'dependant_day_care_frequency', 'dependant_medical_dental_frequency',
        'dependant_clothing_frequency', 'dependant_sports_recreation_frequency',
        'dependant_transportation_frequency', 'dependant_tuition_frequency',
        'dependant_housing_frequency', 'dependant_cellular_service_frequency',
        'transportation_car_loan_payment_frequency', 'transportation_car_loan_payment_partner_frequency',
        'transportation_insurance_frequency', 'transportation_insurance_partner_frequency',
        'transportation_fuel_frequency', 'transportation_fuel_partner_frequency',
        'transportation_maintenance_frequency', 'transportation_maintenance_partner_frequency',
        'transportation_public_transit_frequency', 'transportation_public_transit_partner_frequency',
        'transportation_ride_hailing_frequency', 'transportation_ride_hailing_partner_frequency'
    ];

    // Restore saved form inputs
    formElements.forEach(function (elementId) {
        const value = getLocal(elementId);
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        } else {
            console.warn(`Element not found: ${elementId}`);
        }
    });

    // Add event listeners for saving inputs
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', function () {
                setLocal(elementId, element.value, 365);
            });
        } else {
            console.warn(`Element not found for event listener: ${elementId}`);
        }
    });

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

// Navigation function
window.calculateNext = function () {
    // Save all user inputs
    const formElements = [
        'expenses_grocery', 'expenses_grocery_partner',
        'expenses_fitness', 'expenses_fitness_partner',
        'expenses_hygiene', 'expenses_hygiene_partner',
        'expenses_medical_dental', 'expenses_medical_dental_partner',
        'expenses_perscription', 'expenses_perscription_partner',
        'expenses_clothing', 'expenses_clothing_partner',
        'expenses_cellphone_service', 'expenses_cellphone_service_partner',
        'expenses_dining', 'expenses_dining_partner',
        'expenses_entertainment', 'expenses_entertainment_partner',
        'expenses_vacation', 'expenses_vacation_partner',
        'expenses_travel_life_insurance', 'expenses_travel_life_insurance_partner',
        'expenses_subscriptions', 'expenses_subscriptions_partner',
        'expenses_beauty', 'expenses_beauty_partner',
        'housing_mortgage_payment', 'housing_mortgage_payment_partner',
        'housing_rent_payment', 'housing_rent_payment_partner',
        'housing_property_tax', 'housing_property_tax_partner',
        'housing_condo_fee', 'housing_condo_fee_partner',
        'housing_hydro', 'housing_hydro_partner',
        'housing_water', 'housing_water_partner',
        'housing_gas', 'housing_gas_partner',
        'housing_insurance', 'housing_insurance_partner',
        'housing_repairs', 'housing_repairs_partner',
        'housing_internet', 'housing_internet_partner',
        'expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_partner',
        'expenses_student_loan_payment', 'expenses_student_loan_payment_partner',
        'expenses_credit_card_payment', 'expenses_credit_card_payment_partner',
        'expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_partner',
        'expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_partner',
        'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing',
        'dependant_sports_recreation', 'dependant_transportation', 'dependant_tuition',
        'dependant_housing', 'dependant_cellular_service',
        'transportation_car_loan_payment', 'transportation_car_loan_payment_partner',
        'transportation_insurance', 'transportation_insurance_partner',
        'transportation_fuel', 'transportation_fuel_partner',
        'transportation_maintenance', 'transportation_maintenance_partner',
        'transportation_public_transit', 'transportation_public_transit_partner',
        'transportation_ride_hailing', 'transportation_ride_hailing_partner'
    ];

    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        } else {
            console.warn(`Element not found: ${elementId}`);
        }
    });

    // Save frequency selections
    const frequencyGroups = [
        'expenses_grocery_frequency', 'expenses_grocery_partner_frequency',
        'expenses_fitness_frequency', 'expenses_fitness_partner_frequency',
        'expenses_hygiene_frequency', 'expenses_hygiene_partner_frequency',
        'expenses_medical_dental_frequency', 'expenses_medical_dental_partner_frequency',
        'expenses_perscription_frequency', 'expenses_perscription_partner_frequency',
        'expenses_clothing_frequency', 'expenses_clothing_partner_frequency',
        'expenses_cellphone_service_frequency', 'expenses_cellphone_service_partner_frequency',
        'expenses_dining_frequency', 'expenses_dining_partner_frequency',
        'expenses_entertainment_frequency', 'expenses_entertainment_partner_frequency',
        'expenses_vacation_frequency', 'expenses_vacation_partner_frequency',
        'expenses_travel_life_insurance_frequency', 'expenses_travel_life_insurance_partner_frequency',
        'expenses_subscriptions_frequency', 'expenses_subscriptions_partner_frequency',
        'expenses_beauty_frequency', 'expenses_beauty_partner_frequency',
        'housing_mortgage_payment_frequency', 'housing_mortgage_payment_partner_frequency',
        'housing_rent_payment_frequency', 'housing_rent_payment_partner_frequency',
        'housing_property_tax_frequency', 'housing_property_tax_partner_frequency',
        'housing_condo_fee_frequency', 'housing_condo_fee_partner_frequency',
        'housing_hydro_frequency', 'housing_hydro_partner_frequency',
        'housing_water_frequency', 'housing_water_partner_frequency',
        'housing_gas_frequency', 'housing_gas_partner_frequency',
        'housing_insurance_frequency', 'housing_insurance_partner_frequency',
        'housing_repairs_frequency', 'housing_repairs_partner_frequency',
        'housing_internet_frequency', 'housing_internet_partner_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_line_of_credit_payment_partner_frequency',
        'expenses_student_loan_payment_frequency', 'expenses_student_loan_payment_partner_frequency',
        'expenses_credit_card_payment_frequency', 'expenses_credit_card_payment_partner_frequency',
        'expenses_tax_arrears_payment_frequency', 'expenses_tax_arrears_payment_partner_frequency',
        'expenses_small_business_loan_payment_frequency', 'expenses_small_business_loan_payment_partner_frequency',
        'dependant_day_care_frequency', 'dependant_medical_dental_frequency',
        'dependant_clothing_frequency', 'dependant_sports_recreation_frequency',
        'dependant_transportation_frequency', 'dependant_tuition_frequency',
        'dependant_housing_frequency', 'dependant_cellular_service_frequency',
        'transportation_car_loan_payment_frequency', 'transportation_car_loan_payment_partner_frequency',
        'transportation_insurance_frequency', 'transportation_insurance_partner_frequency',
        'transportation_fuel_frequency', 'transportation_fuel_partner_frequency',
        'transportation_maintenance_frequency', 'transportation_maintenance_partner_frequency',
        'transportation_public_transit_frequency', 'transportation_public_transit_partner_frequency',
        'transportation_ride_hailing_frequency', 'transportation_ride_hailing_partner_frequency'
    ];

    saveFrequencyGroups(frequencyGroups);

    // Navigate to the next page
    window.location.href = '/budget/asset.html';
    return true;
};

// Calculate all function (for logo click)
window.calculateAll = function () {
    // Save all inputs and frequencies before navigating
    const formElements = [
        'expenses_grocery', 'expenses_grocery_partner',
        'expenses_fitness', 'expenses_fitness_partner',
        'expenses_hygiene', 'expenses_hygiene_partner',
        'expenses_medical_dental', 'expenses_medical_dental_partner',
        'expenses_perscription', 'expenses_perscription_partner',
        'expenses_clothing', 'expenses_clothing_partner',
        'expenses_cellphone_service', 'expenses_cellphone_service_partner',
        'expenses_dining', 'expenses_dining_partner',
        'expenses_entertainment', 'expenses_entertainment_partner',
        'expenses_vacation', 'expenses_vacation_partner',
        'expenses_travel_life_insurance', 'expenses_travel_life_insurance_partner',
        'expenses_subscriptions', 'expenses_subscriptions_partner',
        'expenses_beauty', 'expenses_beauty_partner',
        'housing_mortgage_payment', 'housing_mortgage_payment_partner',
        'housing_rent_payment', 'housing_rent_payment_partner',
        'housing_property_tax', 'housing_property_tax_partner',
        'housing_condo_fee', 'housing_condo_fee_partner',
        'housing_hydro', 'housing_hydro_partner',
        'housing_water', 'housing_water_partner',
        'housing_gas', 'housing_gas_partner',
        'housing_insurance', 'housing_insurance_partner',
        'housing_repairs', 'housing_repairs_partner',
        'housing_internet', 'housing_internet_partner',
        'expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_partner',
        'expenses_student_loan_payment', 'expenses_student_loan_payment_partner',
        'expenses_credit_card_payment', 'expenses_credit_card_payment_partner',
        'expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_partner',
        'expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_partner',
        'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing',
        'dependant_sports_recreation', 'dependant_transportation', 'dependant_tuition',
        'dependant_housing', 'dependant_cellular_service',
        'transportation_car_loan_payment', 'transportation_car_loan_payment_partner',
        'transportation_insurance', 'transportation_insurance_partner',
        'transportation_fuel', 'transportation_fuel_partner',
        'transportation_maintenance', 'transportation_maintenance_partner',
        'transportation_public_transit', 'transportation_public_transit_partner',
        'transportation_ride_hailing', 'transportation_ride_hailing_partner'
    ];

    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            setLocal(elementId, element.value, 365);
        }
    });

    const frequencyGroups = [
        'expenses_grocery_frequency', 'expenses_grocery_partner_frequency',
        'expenses_fitness_frequency', 'expenses_fitness_partner_frequency',
        'expenses_hygiene_frequency', 'expenses_hygiene_partner_frequency',
        'expenses_medical_dental_frequency', 'expenses_medical_dental_partner_frequency',
        'expenses_perscription_frequency', 'expenses_perscription_partner_frequency',
        'expenses_clothing_frequency', 'expenses_clothing_partner_frequency',
        'expenses_cellphone_service_frequency', 'expenses_cellphone_service_partner_frequency',
        'expenses_dining_frequency', 'expenses_dining_partner_frequency',
        'expenses_entertainment_frequency', 'expenses_entertainment_partner_frequency',
        'expenses_vacation_frequency', 'expenses_vacation_partner_frequency',
        'expenses_travel_life_insurance_frequency', 'expenses_travel_life_insurance_partner_frequency',
        'expenses_subscriptions_frequency', 'expenses_subscriptions_partner_frequency',
        'expenses_beauty_frequency', 'expenses_beauty_partner_frequency',
        'housing_mortgage_payment_frequency', 'housing_mortgage_payment_partner_frequency',
        'housing_rent_payment_frequency', 'housing_rent_payment_partner_frequency',
        'housing_property_tax_frequency', 'housing_property_tax_partner_frequency',
        'housing_condo_fee_frequency', 'housing_condo_fee_partner_frequency',
        'housing_hydro_frequency', 'housing_hydro_partner_frequency',
        'housing_water_frequency', 'housing_water_partner_frequency',
        'housing_gas_frequency', 'housing_gas_partner_frequency',
        'housing_insurance_frequency', 'housing_insurance_partner_frequency',
        'housing_repairs_frequency', 'housing_repairs_partner_frequency',
        'housing_internet_frequency', 'housing_internet_partner_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_line_of_credit_payment_partner_frequency',
        'expenses_student_loan_payment_frequency', 'expenses_student_loan_payment_partner_frequency',
        'expenses_credit_card_payment_frequency', 'expenses_credit_card_payment_partner_frequency',
        'expenses_tax_arrears_payment_frequency', 'expenses_tax_arrears_payment_partner_frequency',
        'expenses_small_business_loan_payment_frequency', 'expenses_small_business_loan_payment_partner_frequency',
        'dependant_day_care_frequency', 'dependant_medical_dental_frequency',
        'dependant_clothing_frequency', 'dependant_sports_recreation_frequency',
        'dependant_transportation_frequency', 'dependant_tuition_frequency',
        'dependant_housing_frequency', 'dependant_cellular_service_frequency',
        'transportation_car_loan_payment_frequency', 'transportation_car_loan_payment_partner_frequency',
        'transportation_insurance_frequency', 'transportation_insurance_partner_frequency',
        'transportation_fuel_frequency', 'transportation_fuel_partner_frequency',
        'transportation_maintenance_frequency', 'transportation_maintenance_partner_frequency',
        'transportation_public_transit_frequency', 'transportation_public_transit_partner_frequency',
        'transportation_ride_hailing_frequency', 'transportation_ride_hailing_partner_frequency'
    ];

    saveFrequencyGroups(frequencyGroups);

    window.location.href = '/budget/intro.html';
};