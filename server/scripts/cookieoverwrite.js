import { setCookie } from '/server/scripts/setcookie.js'; // Adjust path as needed



// Function to overwrite cookies and clear input fields
export function overwriteCookies() {
    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending', 
        'income_venture_capital', 'income_tax_free_income',
        // Add all other cookie names you want to overwrite
        'expenses_grocery', 'expenses_dining', 'expenses_fitness', 'expenses_hygiene', 
        'expenses_subscriptions', 'expenses_entertainment', 'expenses_clothing', 
        'expenses_vacation', 'expenses_beauty', 'expenses_travel_life_insurance', 
        'expenses_cellphone_service', 'expenses_medical_dental', 'expenses_perscription', 
        'expenses_line_of_credit_payment', 'expenses_student_loan_payment', 'expenses_credit_card_payment',
        'expenses_tax_arrears_payment', 'expenses_small_business_loan_payment', 'housing_mortgage_payment', 
        'housing_rent_payment', 'housing_property_tax', 'housing_condo_fee', 'housing_hydro', 'housing_insurance', 
        'housing_repairs', 'housing_water', 'housing_gas', 'housing_internet', 'transportation_car_loan_payment', 
        'transportation_insurance', 'transportation_fuel', 'transportation_maintenance', 'transportation_public_transit',
        'transportation_ride_hailing', 'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing',
        'dependant_sports_recreation', 'dependant_transportation', 'dependant_tuition', 'dependant_housing',
        'dependant_cellular_service', 'expenses_grocery_frequency', 'expenses_dining_frequency', 'expenses_fitness_frequency',
        'expenses_hygiene_frequency', 'expenses_subscriptions_frequency', 'expenses_entertainment_frequency', 
        'expenses_clothing_frequency', 'expenses_vacation_frequency', 'expenses_beauty_frequency', 
        'expenses_travel_life_insurance_frequency', 'expenses_cellphone_service_frequency', 'expenses_medical_dental_frequency',
        'expenses_line_of_credit_payment_frequency', 'expenses_student_loan_payment_frequency', 
        'expenses_credit_card_payment_frequency', 'expenses_tax_arrears_payment_frequency', 
        'expenses_small_business_loan_payment_frequency', 'housing_mortgage_payment_frequency', 'housing_rent_payment_frequency',
        'housing_property_tax_frequency', 'housing_condo_fee_frequency', 'housing_hydro_frequency', 'housing_insurance_frequency', 
        'housing_repairs_frequency', 'housing_water_frequency', 'housing_gas_frequency', 'housing_internet_frequency', 
        'transportation_car_loan_payment_frequency', 'transportation_insurance_frequency', 'transportation_fuel_frequency', 
        'transportation_maintenance_frequency', 'transportation_public_transit_frequency', 'transportation_ride_hailing_frequency',
        'dependant_day_care_frequency', 'dependant_medical_dental_frequency', 'dependant_clothing_frequency', 
        'dependant_sports_recreation_frequency', 'dependant_transportation_frequency', 'dependant_tuition_frequency', 
        'dependant_housing_frequency', 'dependant_cellular_service_frequency',
        'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
        'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
        'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
        'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
        'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
        'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent'
    ];

    // Loop through each element ID, overwrite the cookies, and reset the input fields
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        const value = ''; // Clear the value for now

        if (element) {
            // Overwrite the cookie with an empty value (or a default value like '0')
            setCookie(elementId, value, 365); // Set cookie with a 1-year expiry

            // Clear the input field value
            element.value = value; 
        }
    });

    console.log("Cookies have been overwritten and input fields cleared.");
}
