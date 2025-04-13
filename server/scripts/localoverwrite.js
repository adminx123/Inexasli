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

export function localOverwrite() {
    // Confirm user wants to clear data
    if (!confirm('Are you sure you want to overwrite all saved data? This will clear all inputs and settings.')) {
        return;
    }

    const formElements = [
        // Income fields (from income.js)
        'income_salary_wages', 'income_salary_wages_partner', 'income_salary_wages_shared', 
        'income_salary_wages_shared_p1_percent', 'income_salary_wages_shared_p2_percent',
        'income_tips', 'income_tips_partner', 'income_tips_shared', 
        'income_tips_shared_p1_percent', 'income_tips_shared_p2_percent',
        'income_bonuses', 'income_bonuses_partner', 'income_bonuses_shared', 
        'income_bonuses_shared_p1_percent', 'income_bonuses_shared_p2_percent',
        'income_sole_prop', 'income_sole_prop_partner', 'income_sole_prop_shared', 
        'income_sole_prop_shared_p1_percent', 'income_sole_prop_shared_p2_percent',
        'income_investment_property', 'income_investment_property_partner', 'income_investment_property_shared', 
        'income_investment_property_shared_p1_percent', 'income_investment_property_shared_p2_percent',
        'income_capital_gains_losses', 'income_capital_gains_losses_partner', 'income_capital_gains_losses_shared', 
        'income_capital_gains_losses_shared_p1_percent', 'income_capital_gains_losses_shared_p2_percent',
        'income_interest', 'income_interest_partner', 'income_interest_shared', 
        'income_interest_shared_p1_percent', 'income_interest_shared_p2_percent',
        'income_owner_dividend', 'income_owner_dividend_partner', 'income_owner_dividend_shared', 
        'income_owner_dividend_shared_p1_percent', 'income_owner_dividend_shared_p2_percent',
        'income_public_dividend', 'income_public_dividend_partner', 'income_public_dividend_shared', 
        'income_public_dividend_shared_p1_percent', 'income_public_dividend_shared_p2_percent',
        'income_trust', 'income_trust_partner', 'income_trust_shared', 
        'income_trust_shared_p1_percent', 'income_trust_shared_p2_percent',
        'income_federal_pension', 'income_federal_pension_partner', 'income_federal_pension_shared', 
        'income_federal_pension_shared_p1_percent', 'income_federal_pension_shared_p2_percent',
        'income_work_pension', 'income_work_pension_partner', 'income_work_pension_shared', 
        'income_work_pension_shared_p1_percent', 'income_work_pension_shared_p2_percent',
        'income_social_security', 'income_social_security_partner', 'income_social_security_shared', 
        'income_social_security_shared_p1_percent', 'income_social_security_shared_p2_percent',
        'income_employment_insurance', 'income_employment_insurance_partner', 'income_employment_insurance_shared', 
        'income_employment_insurance_shared_p1_percent', 'income_employment_insurance_shared_p2_percent',
        'income_alimony', 'income_alimony_partner', 'income_alimony_shared', 
        'income_alimony_shared_p1_percent', 'income_alimony_shared_p2_percent',
        'income_scholarships_grants', 'income_scholarships_grants_partner', 'income_scholarships_grants_shared', 
        'income_scholarships_grants_shared_p1_percent', 'income_scholarships_grants_shared_p2_percent',
        'income_royalties', 'income_royalties_partner', 'income_royalties_shared', 
        'income_royalties_shared_p1_percent', 'income_royalties_shared_p2_percent',
        'income_gambling_winnings', 'income_gambling_winnings_partner', 'income_gambling_winnings_shared', 
        'income_gambling_winnings_shared_p1_percent', 'income_gambling_winnings_shared_p2_percent',
        'income_peer_to_peer_lending', 'income_peer_to_peer_lending_partner', 'income_peer_to_peer_lending_shared', 
        'income_peer_to_peer_lending_shared_p1_percent', 'income_peer_to_peer_lending_shared_p2_percent',
        'income_venture_capital', 'income_venture_capital_partner', 'income_venture_capital_shared', 
        'income_venture_capital_shared_p1_percent', 'income_venture_capital_shared_p2_percent',
        'income_tax_free_income', 'income_tax_free_income_partner', 'income_tax_free_income_shared', 
        'income_tax_free_income_shared_p1_percent', 'income_tax_free_income_shared_p2_percent',

        // Income frequency fields
        'income_salary_wages_frequency', 'income_salary_wages_partner_frequency',
        'income_tips_frequency', 'income_tips_partner_frequency',
        'income_bonuses_frequency', 'income_bonuses_partner_frequency',
        'income_sole_prop_frequency', 'income_sole_prop_partner_frequency',
        'income_investment_property_frequency', 'income_investment_property_partner_frequency',
        'income_capital_gains_losses_frequency', 'income_capital_gains_losses_partner_frequency',
        'income_interest_frequency', 'income_interest_partner_frequency',
        'income_owner_dividend_frequency', 'income_owner_dividend_partner_frequency',
        'income_public_dividend_frequency', 'income_public_dividend_partner_frequency',
        'income_trust_frequency', 'income_trust_partner_frequency',
        'income_federal_pension_frequency', 'income_federal_pension_partner_frequency',
        'income_work_pension_frequency', 'income_work_pension_partner_frequency',
        'income_social_security_frequency', 'income_social_security_partner_frequency',
        'income_employment_insurance_frequency', 'income_employment_insurance_partner_frequency',
        'income_alimony_frequency', 'income_alimony_partner_frequency',
        'income_scholarships_grants_frequency', 'income_scholarships_grants_partner_frequency',
        'income_royalties_frequency', 'income_royalties_partner_frequency',
        'income_gambling_winnings_frequency', 'income_gambling_winnings_partner_frequency',
        'income_peer_to_peer_lending_frequency', 'income_peer_to_peer_lending_partner_frequency',
        'income_venture_capital_frequency', 'income_venture_capital_partner_frequency',
        'income_tax_free_income_frequency', 'income_tax_free_income_partner_frequency',

        // Expense fields (from expense.js)
        'expenses_grocery', 'expenses_grocery_partner', 'expenses_grocery_shared', 
        'expenses_grocery_shared_p1_percent', 'expenses_grocery_shared_p2_percent',
        'expenses_fitness', 'expenses_fitness_partner', 'expenses_fitness_shared', 
        'expenses_fitness_shared_p1_percent', 'expenses_fitness_shared_p2_percent',
        'expenses_hygiene', 'expenses_hygiene_partner', 'expenses_hygiene_shared', 
        'expenses_hygiene_shared_p1_percent', 'expenses_hygiene_shared_p2_percent',
        'expenses_medical_dental', 'expenses_medical_dental_partner', 'expenses_medical_dental_shared', 
        'expenses_medical_dental_shared_p1_percent', 'expenses_medical_dental_shared_p2_percent',
        'expenses_perscription', 'expenses_perscription_partner', 'expenses_perscription_shared', 
        'expenses_perscription_shared_p1_percent', 'expenses_perscription_shared_p2_percent',
        'expenses_clothing', 'expenses_clothing_partner', 'expenses_clothing_shared', 
        'expenses_clothing_shared_p1_percent', 'expenses_clothing_shared_p2_percent',
        'expenses_cellphone_service', 'expenses_cellphone_service_partner', 'expenses_cellphone_service_shared', 
        'expenses_cellphone_service_shared_p1_percent', 'expenses_cellphone_service_shared_p2_percent',
        'expenses_dining', 'expenses_dining_partner', 'expenses_dining_shared', 
        'expenses_dining_shared_p1_percent', 'expenses_dining_shared_p2_percent',
        'expenses_entertainment', 'expenses_entertainment_partner', 'expenses_entertainment_shared', 
        'expenses_entertainment_shared_p1_percent', 'expenses_entertainment_shared_p2_percent',
        'expenses_vacation', 'expenses_vacation_partner', 'expenses_vacation_shared', 
        'expenses_vacation_shared_p1_percent', 'expenses_vacation_shared_p2_percent',
        'expenses_travel_life_insurance', 'expenses_travel_life_insurance_partner', 'expenses_travel_life_insurance_shared', 
        'expenses_travel_life_insurance_shared_p1_percent', 'expenses_travel_life_insurance_shared_p2_percent',
        'expenses_subscriptions', 'expenses_subscriptions_partner', 'expenses_subscriptions_shared', 
        'expenses_subscriptions_shared_p1_percent', 'expenses_subscriptions_shared_p2_percent',
        'expenses_beauty', 'expenses_beauty_partner', 'expenses_beauty_shared', 
        'expenses_beauty_shared_p1_percent', 'expenses_beauty_shared_p2_percent',
        'expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_partner', 'expenses_line_of_credit_payment_shared', 
        'expenses_line_of_credit_payment_shared_p1_percent', 'expenses_line_of_credit_payment_shared_p2_percent',
        'expenses_student_loan_payment', 'expenses_student_loan_payment_partner', 'expenses_student_loan_payment_shared', 
        'expenses_student_loan_payment_shared_p1_percent', 'expenses_student_loan_payment_shared_p2_percent',
        'expenses_credit_card_payment', 'expenses_credit_card_payment_partner', 'expenses_credit_card_payment_shared', 
        'expenses_credit_card_payment_shared_p1_percent', 'expenses_credit_card_payment_shared_p2_percent',
        'expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_partner', 'expenses_tax_arrears_payment_shared', 
        'expenses_tax_arrears_payment_shared_p1_percent', 'expenses_tax_arrears_payment_shared_p2_percent',
        'expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_partner', 'expenses_small_business_loan_payment_shared', 
        'expenses_small_business_loan_payment_shared_p1_percent', 'expenses_small_business_loan_payment_shared_p2_percent',

        // Housing fields
        'housing_mortgage_payment', 'housing_mortgage_payment_partner', 'housing_mortgage_payment_shared', 
        'housing_mortgage_payment_shared_p1_percent', 'housing_mortgage_payment_shared_p2_percent',
        'housing_rent_payment', 'housing_rent_payment_partner', 'housing_rent_payment_shared', 
        'housing_rent_payment_shared_p1_percent', 'housing_rent_payment_shared_p2_percent',
        'housing_property_tax', 'housing_property_tax_partner', 'housing_property_tax_shared', 
        'housing_property_tax_shared_p1_percent', 'housing_property_tax_shared_p2_percent',
        'housing_condo_fee', 'housing_condo_fee_partner', 'housing_condo_fee_shared', 
        'housing_condo_fee_shared_p1_percent', 'housing_condo_fee_shared_p2_percent',
        'housing_hydro', 'housing_hydro_partner', 'housing_hydro_shared', 
        'housing_hydro_shared_p1_percent', 'housing_hydro_shared_p2_percent',
        'housing_water', 'housing_water_partner', 'housing_water_shared', 
        'housing_water_shared_p1_percent', 'housing_water_shared_p2_percent',
        'housing_gas', 'housing_gas_partner', 'housing_gas_shared', 
        'housing_gas_shared_p1_percent', 'housing_gas_shared_p2_percent',
        'housing_insurance', 'housing_insurance_partner', 'housing_insurance_shared', 
        'housing_insurance_shared_p1_percent', 'housing_insurance_shared_p2_percent',
        'housing_repairs', 'housing_repairs_partner', 'housing_repairs_shared', 
        'housing_repairs_shared_p1_percent', 'housing_repairs_shared_p2_percent',
        'housing_internet', 'housing_internet_partner', 'housing_internet_shared', 
        'housing_internet_shared_p1_percent', 'housing_internet_shared_p2_percent',

        // Transportation fields
        'transportation_car_loan_payment', 'transportation_car_loan_payment_partner', 'transportation_car_loan_payment_shared', 
        'transportation_car_loan_payment_shared_p1_percent', 'transportation_car_loan_payment_shared_p2_percent',
        'transportation_insurance', 'transportation_insurance_partner', 'transportation_insurance_shared', 
        'transportation_insurance_shared_p1_percent', 'transportation_insurance_shared_p2_percent',
        'transportation_fuel', 'transportation_fuel_partner', 'transportation_fuel_shared', 
        'transportation_fuel_shared_p1_percent', 'transportation_fuel_shared_p2_percent',
        'transportation_maintenance', 'transportation_maintenance_partner', 'transportation_maintenance_shared', 
        'transportation_maintenance_shared_p1_percent', 'transportation_maintenance_shared_p2_percent',
        'transportation_public_transit', 'transportation_public_transit_partner', 'transportation_public_transit_shared', 
        'transportation_public_transit_shared_p1_percent', 'transportation_public_transit_shared_p2_percent',
        'transportation_ride_hailing', 'transportation_ride_hailing_partner', 'transportation_ride_hailing_shared', 
        'transportation_ride_hailing_shared_p1_percent', 'transportation_ride_hailing_shared_p2_percent',

        // Dependant fields
        'dependant_day_care', 'dependant_day_care_shared', 'dependant_day_care_shared_p1_percent', 'dependant_day_care_shared_p2_percent',
        'dependant_medical_dental', 'dependant_medical_dental_shared', 'dependant_medical_dental_shared_p1_percent', 'dependant_medical_dental_shared_p2_percent',
        'dependant_clothing', 'dependant_clothing_shared', 'dependant_clothing_shared_p1_percent', 'dependant_clothing_shared_p2_percent',
        'dependant_sports_recreation', 'dependant_sports_recreation_shared', 'dependant_sports_recreation_shared_p1_percent', 'dependant_sports_recreation_shared_p2_percent',
        'dependant_transportation', 'dependant_transportation_shared', 'dependant_transportation_shared_p1_percent', 'dependant_transportation_shared_p2_percent',
        'dependant_tuition', 'dependant_tuition_shared', 'dependant_tuition_shared_p1_percent', 'dependant_tuition_shared_p2_percent',
        'dependant_housing', 'dependant_housing_shared', 'dependant_housing_shared_p1_percent', 'dependant_housing_shared_p2_percent',
        'dependant_cellular_service', 'dependant_cellular_service_shared', 'dependant_cellular_service_shared_p1_percent', 'dependant_cellular_service_shared_p2_percent',

        // Expense frequency fields
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
        'transportation_ride_hailing_frequency', 'transportation_ride_hailing_partner_frequency',

        // Asset fields (from asset.js)
        'assets_checking_accounts', 'assets_checking_accounts_partner', 'assets_checking_accounts_shared', 
        'assets_checking_accounts_shared_p1_percent', 'assets_checking_accounts_shared_p2_percent',
        'assets_savings_accounts', 'assets_savings_accounts_partner', 'assets_savings_accounts_shared', 
        'assets_savings_accounts_shared_p1_percent', 'assets_savings_accounts_shared_p2_percent',
        'assets_other_liquid_accounts', 'assets_other_liquid_accounts_partner', 'assets_other_liquid_accounts_shared', 
        'assets_other_liquid_accounts_shared_p1_percent', 'assets_other_liquid_accounts_shared_p2_percent',
        'assets_money_lent_out', 'assets_money_lent_out_partner', 'assets_money_lent_out_shared', 
        'assets_money_lent_out_shared_p1_percent', 'assets_money_lent_out_shared_p2_percent',
        'assets_long_term_investment_accounts', 'assets_long_term_investment_accounts_partner', 'assets_long_term_investment_accounts_shared', 
        'assets_long_term_investment_accounts_shared_p1_percent', 'assets_long_term_investment_accounts_shared_p2_percent',
        'assets_investment_properties', 'assets_investment_properties_partner', 'assets_investment_properties_shared', 
        'assets_investment_properties_shared_p1_percent', 'assets_investment_properties_shared_p2_percent',
        'assets_art_jewelry', 'assets_art_jewelry_partner', 'assets_art_jewelry_shared', 
        'assets_art_jewelry_shared_p1_percent', 'assets_art_jewelry_shared_p2_percent',
        'assets_primary_residence', 'assets_primary_residence_partner', 'assets_primary_residence_shared', 
        'assets_primary_residence_shared_p1_percent', 'assets_primary_residence_shared_p2_percent',
        'assets_small_business', 'assets_small_business_partner', 'assets_small_business_shared', 
        'assets_small_business_shared_p1_percent', 'assets_small_business_shared_p2_percent',
        'assets_vehicles', 'assets_vehicles_partner', 'assets_vehicles_shared', 
        'assets_vehicles_shared_p1_percent', 'assets_vehicles_shared_p2_percent',

        // Liability fields (from liability.js)
        'liabilities_small_business_loan', 'liabilities_small_business_loan_partner', 'liabilities_small_business_loan_shared', 
        'liabilities_small_business_loan_shared_p1_percent', 'liabilities_small_business_loan_shared_p2_percent',
        'liabilities_primary_residence', 'liabilities_primary_residence_partner', 'liabilities_primary_residence_shared', 
        'liabilities_primary_residence_shared_p1_percent', 'liabilities_primary_residence_shared_p2_percent',
        'liabilities_investment_properties', 'liabilities_investment_properties_partner', 'liabilities_investment_properties_shared', 
        'liabilities_investment_properties_shared_p1_percent', 'liabilities_investment_properties_shared_p2_percent',
        'liabilities_vehicle_loan', 'liabilities_vehicle_loan_partner', 'liabilities_vehicle_loan_shared', 
        'liabilities_vehicle_loan_shared_p1_percent', 'liabilities_vehicle_loan_shared_p2_percent',
        'liabilities_personal_debt', 'liabilities_personal_debt_partner', 'liabilities_personal_debt_shared', 
        'liabilities_personal_debt_shared_p1_percent', 'liabilities_personal_debt_shared_p2_percent',
        'liabilities_student_loan', 'liabilities_student_loan_partner', 'liabilities_student_loan_shared', 
        'liabilities_student_loan_shared_p1_percent', 'liabilities_student_loan_shared_p2_percent',
        'liabilities_line_of_credit', 'liabilities_line_of_credit_partner', 'liabilities_line_of_credit_shared', 
        'liabilities_line_of_credit_shared_p1_percent', 'liabilities_line_of_credit_shared_p2_percent',
        'liabilities_credit_card', 'liabilities_credit_card_partner', 'liabilities_credit_card_shared', 
        'liabilities_credit_card_shared_p1_percent', 'liabilities_credit_card_shared_p2_percent',
        'liabilities_tax_arrears', 'liabilities_tax_arrears_partner', 'liabilities_tax_arrears_shared', 
        'liabilities_tax_arrears_shared_p1_percent', 'liabilities_tax_arrears_shared_p2_percent',

        // Terms and dropdowns (from income.js)
        'term1', 'term2', 'RegionDropdown', 'SubregionDropdown',

        // Summary
        'summary_reached',

        // Additional settings
        'fillingStatus' // For hideShow.js partner toggle
    ];

    const value = ''; // Default value to clear cookies

    // Overwrite all localStorage keys
    formElements.forEach(function (cookieName) {
        setLocal(cookieName, value, 365); // Set with 1-year expiry
    });

    // Clear input fields that exist on the current page
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element && element.type !== 'checkbox' && element.tagName !== 'SELECT') {
            element.value = value;
        }
    });

    // Reset checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset dropdowns
    const regionDropdown = document.getElementById('RegionDropdown');
    const subregionDropdown = document.getElementById('SubregionDropdown');
    if (regionDropdown) regionDropdown.value = 'NONE';
    if (subregionDropdown) subregionDropdown.value = '';

    console.log("All specified localStorage keys have been overwritten, inputs and UI elements cleared.");
    alert("All data has been cleared successfully.");
}

// Attach event listener to the overwrite link
document.addEventListener('DOMContentLoaded', () => {
    const overwriteLink = document.getElementById('cookie-overwrite-link');
    if (overwriteLink) {
        overwriteLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            localOverwrite();
        });
    }
});