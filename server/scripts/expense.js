/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { displayWarning } from "./utils.js";
import { setCookie } from '/server/scripts/setcookie.js';
import { getCookie } from '/server/scripts/getcookie.js';
import { hideShowClass } from "./hideShow.js";

// Tab highlighting
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  const dataL = tab.getAttribute('data-location');
  const location = document.location.pathname;
  if (location.includes(dataL)) {
    tab.removeAttribute('href');
    tab.classList.add('active');
  }
});

// Global variables for totals
let ANNUALEXPENSESUM = 0;
let HOUSING = 0;
let TRANSPORTATION = 0;
let ESSENTIAL = 0;
let DISCRETIONARY = 0;
let DEBT = 0;
let DEPENDANT = 0;

// Calculate annual amount based on frequency
function calculateAnnual(inputId, frequency) {
  const input = document.getElementById(inputId);
  if (!input || !input.value) return 0;
  const amount = parseFloat(input.value) || 0;
  switch (frequency) {
    case 'annually': return amount;
    case 'quarterly': return amount * 4;
    case 'monthly': return amount * 12;
    case 'weekly': return amount * 52;
    default: return 0;
  }
}

// Calculate total annual expenses
function calculateNormalizedSum() {
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
  ];

  let annualExpenseSum = 0;
  expenseFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    annualExpenseSum += calculateAnnual(inputId, frequency);
  });

  ANNUALEXPENSESUM = annualExpenseSum;
  document.getElementById('ANNUALEXPENSESUM').textContent = `$${ANNUALEXPENSESUM.toFixed(2)}`;
}

// Category-specific calculations
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
  essentialFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    essential += calculateAnnual(inputId, frequency);
  });

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
  discretionaryFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    discretionary += calculateAnnual(inputId, frequency);
  });

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
  housingFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    housing += calculateAnnual(inputId, frequency);
  });

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
  transportationFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    transportation += calculateAnnual(inputId, frequency);
  });

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
  dependantFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    dependant += calculateAnnual(inputId, frequency);
  });

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
  debtFields.forEach(([inputId, frequencyGroupId]) => {
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
    debt += calculateAnnual(inputId, frequency);
  });

  DEBT = debt;
  document.getElementById('DEBT').textContent = `$${DEBT.toFixed(2)}`;
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
  const formElements = [
    'expenses_grocery', 'expenses_dining', 'expenses_fitness', 'expenses_hygiene', 'expenses_subscriptions',
    'expenses_entertainment', 'expenses_clothing', 'expenses_vacation', 'expenses_beauty',
    'expenses_travel_life_insurance', 'expenses_cellphone_service', 'expenses_medical_dental',
    'expenses_perscription', 'expenses_line_of_credit_payment', 'expenses_student_loan_payment',
    'expenses_credit_card_payment', 'expenses_tax_arrears_payment', 'expenses_small_business_loan_payment',
    'housing_mortgage_payment', 'housing_rent_payment', 'housing_property_tax', 'housing_condo_fee',
    'housing_hydro', 'housing_insurance', 'housing_repairs', 'housing_water', 'housing_gas',
    'housing_internet', 'transportation_car_loan_payment', 'transportation_insurance', 'transportation_fuel',
    'transportation_maintenance', 'transportation_public_transit', 'transportation_ride_hailing',
    'dependant_day_care', 'dependant_medical_dental', 'dependant_clothing', 'dependant_sports_recreation',
    'dependant_transportation', 'dependant_tuition', 'dependant_housing', 'dependant_cellular_service'
  ];

  // Load saved input values and attach listeners
  formElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const savedValue = getCookie(elementId);
    if (savedValue) element.value = savedValue;

    element.addEventListener('input', () => {
      setCookie(elementId, element.value, 365);
      calculateAll();
    });
  });

  // Setup checkbox groups
  document.querySelectorAll('.checkbox-button-group').forEach(group => {
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    if (!checkboxes.length) return;

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          checkboxes.forEach(cb => {
            if (cb !== this) cb.checked = false;
          });
          setCookie(`frequency_${group.id}`, this.value, 365);
          calculateAll();
        }
      });
    });

    const savedFrequency = getCookie(`frequency_${group.id}`);
    const checkboxToCheck = group.querySelector(`input[value="${savedFrequency}"]`) || 
                           group.querySelector('input[value="annually"]');
    if (checkboxToCheck) {
      checkboxes.forEach(cb => {
        if (cb !== checkboxToCheck) cb.checked = false;
      });
      checkboxToCheck.checked = true;
    }
  });

  // Initial calculations
  calculateAll();

  // Conditional UI updates
  const romanticexpenseCookie = getCookie('romanticexpense');
  const debtcheckboxCookie = getCookie('debtcheckbox');
  const dependantcheckboxCookie = getCookie('dependantcheckbox');

  if (romanticexpenseCookie === 'checked') {
    displayWarning("You've indicated that you share expenses with your romantic partner. Include only your portion of the expenditures here.");
  }

  if (dependantcheckboxCookie === 'checked') {
    hideShowClass('depandant-parent', 'show');
  } else if (dependantcheckboxCookie === 'unChecked') {
    hideShowClass('depandant-parent', 'hide');
  }

  if (debtcheckboxCookie === 'checked') {
    hideShowClass('debt-parent', 'show');
  } else if (debtcheckboxCookie === 'unChecked') {
    hideShowClass('debt-parent', 'hide');
  }
});

// Navigation and calculation functions
window.calculateNext = function() {
  calculateAll();
  window.location.href = '/budget/asset.html';
};

window.calculateAll = function() {
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
};

document.addEventListener("DOMContentLoaded", () => {
  // Select all interactive elements within .checkboxrow
  const interactiveElements = document.querySelectorAll(
    ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      const row = element.closest(".checkboxrow");
      const tooltip = row.querySelector(".tooltip");
      const content = tooltip ? tooltip.querySelector(".tooltip-content") : null;

      // Remove .active and hide tooltips from all rows
      document.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const otherTooltip = r.querySelector(".tooltip");
        if (otherTooltip) otherTooltip.classList.remove("show");
      });

      // Add .active to the clicked row
      row.classList.add("active");

      // Show the tooltip if it exists
      if (tooltip && content) {
        tooltip.classList.add("show");

        const contentRect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (contentRect.left < 0) {
          content.style.left = '0';
          content.style.transform = 'translateX(0)';
        } else if (contentRect.right > viewportWidth) {
          content.style.left = '100%';
          content.style.transform = 'translateX(-100%)';
        } else {
          content.style.left = '50%';
          content.style.transform = 'translateX(-50%)';
        }
      }

      // Prevent event from bubbling up to document click handler
      e.stopPropagation();
    });
  });

  // Clear .active and hide tooltips when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".checkboxrow")) {
      document.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const tooltip = r.querySelector(".tooltip");
        if (tooltip) tooltip.classList.remove("show");
      });
    }
  });
});