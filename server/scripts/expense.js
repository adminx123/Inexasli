import { displayWarning, hideShow } from "./utils.js"

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


function setCookie(name, value, days) {
  var expires = "";
  if (value === undefined || value === null || value === '') {
    value = '0';
  }
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict; Secure";
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


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    // Decode the cookie value
    const decodedValue = decodeURIComponent(parts.pop().split(';').shift());
    // If the value is empty and it's a frequency field, set it to 'annually'
    if (decodedValue === '' && name.includes('_frequency')) {
      return 'annually';
    }
    return decodedValue == 0 || decodedValue == '0' ? '' : decodedValue;
  } else {
    return 'annually';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Function to retrieve cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      // Decode the cookie value
      const decodedValue = decodeURIComponent(parts.pop().split(';').shift());
      // If the value is empty and it's a frequency field, set it to 'annually'
      if (decodedValue === '' && name.includes('_frequency')) {
        return 'annually';
      }
      return decodedValue == 0 || decodedValue == '0' ? '' : decodedValue;
    } else {
      return 'annually';
    }
  }



  document.getElementById('expenses_grocery').value = getCookie('expenses_grocery');
  document.getElementById('expenses_dining').value = getCookie('expenses_dining');
  document.getElementById('expenses_fitness').value = getCookie('expenses_fitness');
  document.getElementById('expenses_hygiene').value = getCookie('expenses_hygiene');
  document.getElementById('expenses_subscriptions').value = getCookie('expenses_subscriptions');
  document.getElementById('expenses_entertainment').value = getCookie('expenses_entertainment');
  document.getElementById('expenses_clothing').value = getCookie('expenses_clothing');
  document.getElementById('expenses_vacation').value = getCookie('expenses_vacation');
  document.getElementById('expenses_beauty').value = getCookie('expenses_beauty');

  document.getElementById('expenses_travel_life_insurance').value = getCookie('expenses_travel_life_insurance');
  document.getElementById('expenses_cellphone_service').value = getCookie('expenses_cellphone_service');
  document.getElementById('expenses_medical_dental').value = getCookie('expenses_medical_dental');
  document.getElementById('expenses_perscription').value = getCookie('expenses_perscription');

  document.getElementById('expenses_line_of_credit_payment').value = getCookie('expenses_line_of_credit_payment');
  document.getElementById('expenses_student_loan_payment').value = getCookie('expenses_student_loan_payment');
  document.getElementById('expenses_credit_card_payment').value = getCookie('expenses_credit_card_payment');
  document.getElementById('expenses_tax_arrears_payment').value = getCookie('expenses_tax_arrears_payment');
  document.getElementById('expenses_small_business_loan_payment').value = getCookie('expenses_small_business_loan_payment');
  document.getElementById('housing_mortgage_payment').value = getCookie('housing_mortgage_payment');
  document.getElementById('housing_rent_payment').value = getCookie('housing_rent_payment');
  document.getElementById('housing_property_tax').value = getCookie('housing_property_tax');
  document.getElementById('housing_condo_fee').value = getCookie('housing_condo_fee');
  document.getElementById('housing_hydro').value = getCookie('housing_hydro');
  document.getElementById('housing_insurance').value = getCookie('housing_insurance');
  document.getElementById('housing_repairs').value = getCookie('housing_repairs');
  document.getElementById('housing_water').value = getCookie('housing_water');
  document.getElementById('housing_gas').value = getCookie('housing_gas');
  document.getElementById('housing_internet').value = getCookie('housing_internet');
  document.getElementById('transportation_car_loan_payment').value = getCookie('transportation_car_loan_payment');
  document.getElementById('transportation_insurance').value = getCookie('transportation_insurance');
  document.getElementById('transportation_fuel').value = getCookie('transportation_fuel');
  document.getElementById('transportation_maintenance').value = getCookie('transportation_maintenance');
  document.getElementById('transportation_public_transit').value = getCookie('transportation_public_transit');
  document.getElementById('transportation_ride_hailing').value = getCookie('transportation_ride_hailing');
  document.getElementById('dependant_day_care').value = getCookie('dependant_day_care');
  document.getElementById('dependant_medical_dental').value = getCookie('dependant_medical_dental');
  document.getElementById('dependant_clothing').value = getCookie('dependant_clothing');
  document.getElementById('dependant_sports_recreation').value = getCookie('dependant_sports_recreation');
  document.getElementById('dependant_transportation').value = getCookie('dependant_transportation');
  document.getElementById('dependant_tuition').value = getCookie('dependant_tuition');
  document.getElementById('dependant_housing').value = getCookie('dependant_housing');
  document.getElementById('dependant_cellular_service').value = getCookie('dependant_cellular_service');

  document.getElementById('expenses_grocery_frequency').value = getCookie('expenses_grocery_frequency');
  document.getElementById('expenses_dining_frequency').value = getCookie('expenses_dining_frequency');
  document.getElementById('expenses_fitness_frequency').value = getCookie('expenses_fitness_frequency');
  document.getElementById('expenses_hygiene_frequency').value = getCookie('expenses_hygiene_frequency');
  document.getElementById('expenses_subscriptions_frequency').value = getCookie('expenses_subscriptions_frequency');
  document.getElementById('expenses_entertainment_frequency').value = getCookie('expenses_entertainment_frequency');
  document.getElementById('expenses_clothing_frequency').value = getCookie('expenses_clothing_frequency');
  document.getElementById('expenses_vacation_frequency').value = getCookie('expenses_vacation_frequency');
  document.getElementById('expenses_beauty_frequency').value = getCookie('expenses_beauty_frequency');


  document.getElementById('expenses_travel_life_insurance_frequency').value = getCookie('expenses_travel_life_insurance_frequency');
  document.getElementById('expenses_cellphone_service_frequency').value = getCookie('expenses_cellphone_service_frequency');
  document.getElementById('expenses_medical_dental_frequency').value = getCookie('expenses_medical_dental_frequency');
  document.getElementById('expenses_line_of_credit_payment_frequency').value = getCookie('expenses_line_of_credit_payment_frequency');
  document.getElementById('expenses_student_loan_payment_frequency').value = getCookie('expenses_student_loan_payment_frequency');
  document.getElementById('expenses_credit_card_payment_frequency').value = getCookie('expenses_credit_card_payment_frequency');
  document.getElementById('expenses_tax_arrears_payment_frequency').value = getCookie('expenses_tax_arrears_payment_frequency');
  document.getElementById('expenses_small_business_loan_payment_frequency').value = getCookie('expenses_small_business_loan_payment_frequency');
  document.getElementById('housing_mortgage_payment_frequency').value = getCookie('housing_mortgage_payment_frequency');
  document.getElementById('housing_rent_payment_frequency').value = getCookie('housing_rent_payment_frequency');
  document.getElementById('housing_property_tax_frequency').value = getCookie('housing_property_tax_frequency');
  document.getElementById('housing_condo_fee_frequency').value = getCookie('housing_condo_fee_frequency');
  document.getElementById('housing_hydro_frequency').value = getCookie('housing_hydro_frequency');
  document.getElementById('housing_insurance_frequency').value = getCookie('housing_insurance_frequency');
  document.getElementById('housing_repairs_frequency').value = getCookie('housing_repairs_frequency');
  document.getElementById('housing_water_frequency').value = getCookie('housing_water_frequency');
  document.getElementById('housing_gas_frequency').value = getCookie('housing_gas_frequency');
  document.getElementById('housing_internet_frequency').value = getCookie('housing_internet_frequency');
  document.getElementById('transportation_car_loan_payment_frequency').value = getCookie('transportation_car_loan_payment_frequency');
  document.getElementById('transportation_insurance_frequency').value = getCookie('transportation_insurance_frequency');
  document.getElementById('transportation_fuel_frequency').value = getCookie('transportation_fuel_frequency');
  document.getElementById('transportation_maintenance_frequency').value = getCookie('transportation_maintenance_frequency');
  document.getElementById('transportation_public_transit_frequency').value = getCookie('transportation_public_transit_frequency');
  document.getElementById('transportation_ride_hailing_frequency').value = getCookie('transportation_ride_hailing_frequency');
  document.getElementById('dependant_day_care_frequency').value = getCookie('dependant_day_care_frequency');
  document.getElementById('dependant_medical_dental_frequency').value = getCookie('dependant_medical_dental_frequency');
  document.getElementById('dependant_clothing_frequency').value = getCookie('dependant_clothing_frequency');
  document.getElementById('dependant_sports_recreation_frequency').value = getCookie('dependant_sports_recreation_frequency');
  document.getElementById('dependant_transportation_frequency').value = getCookie('dependant_transportation_frequency');
  document.getElementById('dependant_tuition_frequency').value = getCookie('dependant_tuition_frequency');
  document.getElementById('dependant_housing_frequency').value = getCookie('dependant_housing_frequency');
  document.getElementById('dependant_cellular_service_frequency').value = getCookie('dependant_cellular_service_frequency');
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
