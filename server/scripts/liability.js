/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

console.log('Script loaded');

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';
import { setCookie } from '/server/scripts/setcookie.js';

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;
    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

let LIABILITIES;

function calculateLiabilities() {
    const liabilitiesFields = [
        'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
        'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
        'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears'
    ];

    let liabilities = 0;

    for (let i = 0; i < liabilitiesFields.length; i++) {
        const fieldValue = document.getElementById(liabilitiesFields[i]).value;
        console.log(`Field value for ${liabilitiesFields[i]}: ${fieldValue}`);
        const parsedValue = parseFloat(fieldValue);
        const cookieValue = getLocal('romanticliability');

        if (!isNaN(parsedValue)) {
            let fieldPercentage = parseFloat(document.querySelector(`#${liabilitiesFields[i]}_percent`).value);
            if (!fieldPercentage || isNaN(fieldPercentage)) {
                fieldPercentage = 100;
            }
            liabilities += (parsedValue * fieldPercentage / 100);
        }
    }

    LIABILITIES = liabilities;
    document.getElementById('LIABILITIES').textContent = '$' + LIABILITIES.toFixed(2);
}

let LIABILITIESNA;

function setDebtData2() {
    const isPartner = getLocal('liabilityspousecheckbox') === 'checked';
    const liabilitiesFields = [
        'liabilities_personal_debt', 'liabilities_student_loan', 'liabilities_line_of_credit',
        'liabilities_credit_card', 'liabilities_tax_arrears'
    ];

    let totalDebt = 0;

    liabilitiesFields.forEach(field => {
        const fieldValue = parseFloat(document.getElementById(field).value) || 0;
        let fieldValuePercent = parseFloat(document.getElementById(`${field}_percent`).value);
        if (isNaN(fieldValuePercent) || !isPartner) {
            fieldValuePercent = 100;
        }
        totalDebt += (fieldValue * fieldValuePercent / 100);
    });

    LIABILITIESNA = totalDebt;
}

window.calculateAll = function () {
    calculateLiabilities();
    setLocal("LIABILITIES", LIABILITIES, 365);
    setDebtData2();
    setLocal("LIABILITIESNA", LIABILITIESNA, 365);

    const fields = [
        'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
        'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
        'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears'
    ];

    fields.forEach(field => {
        setLocal(field, document.getElementById(field).value.trim() !== "" ? document.getElementById(field).value : "0", 365);
        setLocal(`${field}_percent`, document.getElementById(`${field}_percent`).value.trim() !== "" ? document.getElementById(`${field}_percent`).value : "100", 365);
    });
};

window.calculateNext = function () {
    window.calculateAll();
    setCookie('summary_reached', Date.now(), 365);
    window.location.href = '/budget/summary.html';
  };

window.calculateBack = function () {
    window.calculateAll();
    window.location.href = 'asset.html';
};

document.addEventListener('DOMContentLoaded', () => {
    // Bind the Next button
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', window.calculateNext);
    } else {
        console.error('Next button not found');
    }

    // Load form values from local storage
    const formElements = [
        'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
        'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
        'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears',
        'liabilities_small_business_loan_percent', 'liabilities_primary_residence_percent', 'liabilities_investment_properties_percent',
        'liabilities_vehicle_loan_percent', 'liabilities_personal_debt_percent', 'liabilities_student_loan_percent',
        'liabilities_line_of_credit_percent', 'liabilities_credit_card_percent', 'liabilities_tax_arrears_percent'
    ];

    formElements.forEach(elementId => {
        const value = getLocal(elementId);
        const element = document.getElementById(elementId);
        if (element && value !== null) {
            element.value = value;
        }
    });

    // Romantic liability logic
    const romanticliabilityCookie = getLocal('romanticliability');
    const percentInputs = document.querySelectorAll('.percent-input');
    if (romanticliabilityCookie === 'checked') {
        percentInputs.forEach(input => input.style.display = 'block');
    } else {
        percentInputs.forEach(input => input.style.display = 'none');
    }


});