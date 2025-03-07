/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 


import { displayWarning, hideShow } from "./utils.js"
import { setCookie } from '/server/scripts/setcookie.js'; // Adjust path as needed
import { getCookie } from '/server/scripts/getcookie.js'; // Adjust path as needed



const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
  const dataL = tab.getAttribute('data-location')
  const location = document.location.pathname


  if (location.includes(dataL)) {
    tab.removeAttribute('href')

    tab.classList.add('active')
  }
})


var ANNUALEXPENSESUM;
var HOUSING;
var TRANSPORTATION;
var ESSENTIAL;
var DISCRETIONARY;
var DEBT;
var DEPENDANT;

;


function calculateAnnual(inputId, frequencyId) {
  const input = parseFloat(document.getElementById(inputId).value) || 0;
  const frequency = document.getElementById(frequencyId).value;

  switch (frequency) {
    case 'annually':
      return input;
    case 'quarterly':
      return input * 4;
    case 'monthly':
      return input * 12;
    case 'weekly':
      return input * 52;
    default:
      return 0;
  }
}


function calculateNormalizedSum() {
  // Define all expense fields with their corresponding frequency fields
  const expenseFields = [
    ['expenses_grocery', 'expenses_grocery_frequency'],
    ['expenses_fitness', 'expenses_fitness_frequency'],
    ['expenses_hygiene', 'expenses_hygiene_frequency'],
    ['expenses_clothing', 'expenses_clothing_frequency'],
    ['expenses_cellphone_service', 'expenses_cellphone_service_frequency'],
    ['expenses_medical_dental', 'expenses_medical_dental_frequency'],
    ['expenses_perscription', 'expenses_perscription_frequency'],

    ['expenses_dining', 'expenses_dining_frequency'],
    ['expenses_subscriptions', 'expenses_subscriptions_frequency'],
    ['expenses_vacation', 'expenses_vacation_frequency'],

    ['expenses_beauty', 'expenses_beauty_frequency'],

    ['expenses_travel_life_insurance', 'expenses_travel_life_insurance_frequency'],
    ['expenses_entertainment', 'expenses_entertainment_frequency'],
    ['expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_frequency'],
    ['expenses_student_loan_payment', 'expenses_student_loan_payment_frequency'],
    ['expenses_credit_card_payment', 'expenses_credit_card_payment_frequency'],
    ['expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_frequency'],
    ['expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_frequency'],
    ['housing_mortgage_payment', 'housing_mortgage_payment_frequency'],
    ['housing_rent_payment', 'housing_rent_payment_frequency'],
    ['housing_property_tax', 'housing_property_tax_frequency'],
    ['housing_condo_fee', 'housing_condo_fee_frequency'],
    ['housing_hydro', 'housing_hydro_frequency'],
    ['housing_insurance', 'housing_insurance_frequency'],
    ['housing_repairs', 'housing_repairs_frequency'],
    ['housing_water', 'housing_water_frequency'],
    ['housing_gas', 'housing_gas_frequency'],
    ['housing_internet', 'housing_internet_frequency'],
    ['transportation_car_loan_payment', 'transportation_car_loan_payment_frequency'],
    ['transportation_insurance', 'transportation_insurance_frequency'],
    ['transportation_fuel', 'transportation_fuel_frequency'],
    ['transportation_maintenance', 'transportation_maintenance_frequency'],
    ['transportation_public_transit', 'transportation_public_transit_frequency'],
    ['transportation_ride_hailing', 'transportation_ride_hailing_frequency'],
    ['dependant_day_care', 'dependant_day_care_frequency'],
    ['dependant_medical_dental', 'dependant_medical_dental_frequency'],
    ['dependant_clothing', 'dependant_clothing_frequency'],
    ['dependant_sports_recreation', 'dependant_sports_recreation_frequency'],
    ['dependant_transportation', 'dependant_transportation_frequency'],
    ['dependant_tuition', 'dependant_tuition_frequency'],
    ['dependant_housing', 'dependant_housing_frequency'],
    ['dependant_cellular_service', 'dependant_cellular_service_frequency']
    // Add more expense fields here
  ];
  let annualExpenseSum = 0;

  // Calculate annual expense sum
  expenseFields.forEach(field => {
    const [inputId, frequencyId] = field;
    annualExpenseSum += calculateAnnual(inputId, frequencyId);
  });

  ANNUALEXPENSESUM = annualExpenseSum;

  // Display the results
  document.getElementById('ANNUALEXPENSESUM').textContent = `$${ANNUALEXPENSESUM.toFixed(2)}`;


}





function essentialExpenses() {
  const essentialFields = [
    ['expenses_grocery', 'expenses_grocery_frequency'],
    ['expenses_fitness', 'expenses_fitness_frequency'],
    ['expenses_hygiene', 'expenses_hygiene_frequency'],
    ['expenses_clothing', 'expenses_clothing_frequency'],
    ['expenses_cellphone_service', 'expenses_cellphone_service_frequency'],
    ['expenses_medical_dental', 'expenses_medical_dental_frequency'],
    ['expenses_perscription', 'expenses_perscription_frequency']
  ];

  let essential = 0;

  for (const [expenseField, frequencyField] of essentialFields) {
    essential += calculateAnnual(expenseField, frequencyField);
  }

  ESSENTIAL = essential;

  document.getElementById('ESSENTIAL').textContent = `$${ESSENTIAL.toFixed(2)}`;


}

function discretionaryExpenses() {
  const discretionaryFields = [
    ['expenses_dining', 'expenses_dining_frequency'],
    ['expenses_subscriptions', 'expenses_subscriptions_frequency'],

    ['expenses_vacation', 'expenses_vacation_frequency'],
    ['expenses_beauty', 'expenses_beauty_frequency'],

    ['expenses_travel_life_insurance', 'expenses_travel_life_insurance_frequency'],
    ['expenses_entertainment', 'expenses_entertainment_frequency']
  ];

  let discretionary = 0;

  for (const [expenseField, frequencyField] of discretionaryFields) {
    discretionary += calculateAnnual(expenseField, frequencyField);
  }

  DISCRETIONARY = discretionary;

  document.getElementById('DISCRETIONARY').textContent = `$${DISCRETIONARY.toFixed(2)}`;


}


function housingExpenses() {
  const housingFields = [
    ['housing_mortgage_payment', 'housing_mortgage_payment_frequency'],
    ['housing_rent_payment', 'housing_rent_payment_frequency'],
    ['housing_property_tax', 'housing_property_tax_frequency'],
    ['housing_condo_fee', 'housing_condo_fee_frequency'],
    ['housing_hydro', 'housing_hydro_frequency'],
    ['housing_insurance', 'housing_insurance_frequency'],
    ['housing_repairs', 'housing_repairs_frequency'],
    ['housing_water', 'housing_water_frequency'],
    ['housing_gas', 'housing_gas_frequency'],
    ['housing_internet', 'housing_internet_frequency']
  ];

  let housing = 0;

  for (const [expenseField, frequencyField] of housingFields) {
    housing += calculateAnnual(expenseField, frequencyField);
  }

  HOUSING = housing;

  document.getElementById('HOUSING').textContent = `$${HOUSING.toFixed(2)}`;


}

function transportationExpenses() {
  const transportationFields = [
    ['transportation_car_loan_payment', 'transportation_car_loan_payment_frequency'],
    ['transportation_insurance', 'transportation_insurance_frequency'],
    ['transportation_fuel', 'transportation_fuel_frequency'],
    ['transportation_maintenance', 'transportation_maintenance_frequency'],
    ['transportation_public_transit', 'transportation_public_transit_frequency'],
    ['transportation_ride_hailing', 'transportation_ride_hailing_frequency']

  ];

  let transportation = 0;

  for (const [expenseField, frequencyField] of transportationFields) {
    transportation += calculateAnnual(expenseField, frequencyField);
  }

  TRANSPORTATION = transportation;

  document.getElementById('TRANSPORTATION').textContent = `$${TRANSPORTATION.toFixed(2)}`;


}

function dependantExpenses() {
  const dependantFields = [
    ['dependant_day_care', 'dependant_day_care_frequency'],
    ['dependant_medical_dental', 'dependant_medical_dental_frequency'],
    ['dependant_clothing', 'dependant_clothing_frequency'],
    ['dependant_sports_recreation', 'dependant_sports_recreation_frequency'],
    ['dependant_transportation', 'dependant_transportation_frequency'],
    ['dependant_tuition', 'dependant_tuition_frequency'],
    ['dependant_housing', 'dependant_housing_frequency'],
    ['dependant_cellular_service', 'dependant_cellular_service_frequency']

  ];

  let dependant = 0;

  for (const [expenseField, frequencyField] of dependantFields) {
    dependant += calculateAnnual(expenseField, frequencyField);
  }

  DEPENDANT = dependant;

  document.getElementById('DEPENDANT').textContent = `$${DEPENDANT.toFixed(2)}`;


}

function debtExpenses() {
  const debtFields = [
    ['expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_frequency'],
    ['expenses_student_loan_payment', 'expenses_student_loan_payment_frequency'],
    ['expenses_credit_card_payment', 'expenses_credit_card_payment_frequency'],
    ['expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_frequency'],
    ['expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_frequency']
  ];

  let debt = 0;

  for (const [expenseField, frequencyField] of debtFields) {
    debt += calculateAnnual(expenseField, frequencyField);
  }

  DEBT = debt;

  document.getElementById('DEBT').textContent = `$${DEBT.toFixed(2)}`;


}


function setIncomeData() {
  const expensesFields = [
    'expenses_grocery',
    'expenses_dining',
    'expenses_fitness',
    'expenses_hygiene',
    'expenses_subscriptions',
    'expenses_entertainment',
    'expenses_clothing',
    'expenses_beauty',
    'expenses_vacation',
    'expenses_travel_life_insurance',
    'expenses_cellphone_service',
    'expenses_medical_dental',
    'expenses_perscription',
    'expenses_line_of_credit_payment',
    'expenses_student_loan_payment',
    'expenses_credit_card_payment',
    'expenses_tax_arrears_payment',
    'expenses_small_business_loan_payment',
    'housing_mortgage_payment',
    'housing_rent_payment',
    'housing_property_tax',
    'housing_condo_fee',
    'housing_hydro',
    'housing_insurance',
    'housing_repairs',
    'housing_water',
    'housing_gas',
    'housing_internet',
    'transportation_car_loan_payment',
    'transportation_insurance',
    'transportation_fuel',
    'transportation_maintenance',
    'transportation_public_transit',
    'transportation_ride_hailing',
    'dependant_day_care',
    'dependant_medical_dental',
    'dependant_clothing',
    'dependant_sports_recreation',
    'dependant_transportation',
    'dependant_tuition',
    'dependant_housing',
    'dependant_cellular_service'
  ];

  const frequencyFields = [
    'expenses_grocery_frequency',
    'expenses_dining_frequency',
    'expenses_fitness_frequency',
    'expenses_hygiene_frequency',
    'expenses_subscriptions_frequency',
    'expenses_entertainment_frequency',
    'expenses_clothing_frequency',
    'expenses_vacation_frequency',
    'expenses_beauty_frequency',
    'expenses_travel_life_insurance_frequency',
    'expenses_cellphone_service_frequency',
    'expenses_medical_dental_frequency',
    'expenses_perscription_frequency',

    
    'expenses_line_of_credit_payment_frequency',
    'expenses_student_loan_payment_frequency',
    'expenses_credit_card_payment_frequency',
    'expenses_tax_arrears_payment_frequency',
    'expenses_small_business_loan_payment_frequency',
    'housing_mortgage_payment_frequency',
    'housing_rent_payment_frequency',
    'housing_property_tax_frequency',
    'housing_condo_fee_frequency',
    'housing_hydro_frequency',
    'housing_insurance_frequency',
    'housing_repairs_frequency',
    'housing_water_frequency',
    'housing_gas_frequency',
    'housing_internet_frequency',
    'transportation_car_loan_payment_frequency',
    'transportation_insurance_frequency',
    'transportation_fuel_frequency',
    'transportation_maintenance_frequency',
    'transportation_public_transit_frequency',
    'transportation_ride_hailing_frequency',
    'dependant_day_care_frequency',
    'dependant_medical_dental_frequency',
    'dependant_clothing_frequency',
    'dependant_sports_recreation_frequency',
    'dependant_transportation_frequency',
    'dependant_tuition_frequency',
    'dependant_housing_frequency',
    'dependant_cellular_service_frequency'
  ];

  for (let i = 0; i < frequencyFields.length; i++) {
    const frequencyInput = document.getElementById(frequencyFields[i]);
    if (frequencyInput.value.trim() !== "") {
      const frequency = frequencyInput.value;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);
      document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}; path=/;  SameSite=Strict; Secure`;
    } else {
      const frequency = "";
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);
      document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}; path=/;  SameSite=Strict; Secure`;
    }
  }

  for (let i = 0; i < expensesFields.length; i++) {
    const expensesInput = document.getElementById(expensesFields[i]);
    if (expensesInput.value.trim() !== "") {
      const expenses = expensesInput.value;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);
      document.cookie = `${expensesFields[i]}=${expenses}; expires=${expirationDate.toUTCString()}; path=/;  SameSite=Strict; Secure`;
    } else {
      const expenses = "0";
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);
      document.cookie = `${expensesFields[i]}=${expenses}; expires=${expirationDate.toUTCString()}; path=/;  SameSite=Strict; Secure`;
    }
  }
}



document.addEventListener('DOMContentLoaded', function () {
  // List of form element IDs you want to set based on cookies
  const formElements = [
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
    'dependant_housing_frequency', 'dependant_cellular_service_frequency'
  ];

  // Loop through each element ID and set the value using getCookie
  formElements.forEach(function(elementId) {
    const value = getCookie(elementId); // Get the value from the cookie
    const element = document.getElementById(elementId);
    if (element) { // Check if the element exists before trying to set its value
      element.value = value;
    }
  });
});

window.calculateNext = function () {
  calculateAll();
  window.location.href = '/budget/asset.html';
}



window.calculateAll = function () {

  calculateNormalizedSum();

  housingExpenses();
  transportationExpenses();
  dependantExpenses();
  debtExpenses();
  essentialExpenses();
  discretionaryExpenses();

  setCookie("ANNUALEXPENSESUM", ANNUALEXPENSESUM, 365);
  setCookie("HOUSING", HOUSING, 365);
  setCookie("TRANSPORTATION", TRANSPORTATION, 365);
  setCookie("DEPENDANT", DEPENDANT, 365);
  setCookie("DEBT", DEBT, 365);
  setCookie("ESSENTIAL", ESSENTIAL, 365);
  setCookie("DISCRETIONARY", DISCRETIONARY, 365);
  setIncomeData();
}





document.addEventListener('DOMContentLoaded', () => {
  const romanticexpenseCookie = getCookie('romanticexpense');
  const debtcheckboxCookie = getCookie('debtcheckbox');
  const dependantcheckboxCookie = getCookie('dependantcheckbox');

  // Check for romantic expense sharing
  if (romanticexpenseCookie === 'checked') {
    displayWarning("You've indicated that you share expenses with your romantic partner. Include only your portion of the expenditures here.");
    // Assuming there's no specific action for showing elements related to this checkbox
  }

  // Check for dependants/pets
  if (dependantcheckboxCookie === 'checked') {
    hideShow('depandant-parent', 'show');
  } else if (dependantcheckboxCookie === 'unChecked') {
    hideShow('depandant-parent', 'hide');
  }

  // Check for debt payments
  if (debtcheckboxCookie === 'checked') {
    hideShow('debt-parent', 'show');
  } else if (debtcheckboxCookie === 'unChecked') {
    hideShow('debt-parent', 'hide');
  }
});
