/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 


console.log('Global setCookie exists:', typeof window.setCookie !== 'undefined');
import { displayWarning } from "./utils.js"
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





var LIABILITIES;
 
  
  
    function calculateLiabilities() {
    const liabilitiesFields = [
        'liabilities_small_business_loan',
        'liabilities_primary_residence',
        'liabilities_investment_properties',
        'liabilities_vehicle_loan',
        'liabilities_personal_debt',
        'liabilities_student_loan',
        'liabilities_line_of_credit',
        'liabilities_credit_card',
        'liabilities_tax_arrears'
    ];

    let liabilities = 0;

    for (let i = 0; i < liabilitiesFields.length; i++) {
        const fieldValue = document.getElementById(liabilitiesFields[i]).value;
        console.log(`Field value for ${liabilitiesFields[i]}: ${fieldValue}`);
        const parsedValue = parseFloat(fieldValue);

        const cookieValue = getCookie('romanticliability');
        
        if (!isNaN(parsedValue)) {
            let fieldPercentage = parseFloat(document.querySelector(`#${liabilitiesFields[i]}_percent`).value);

            // Check if the cookie is set to "Checked" or "unChecked"
            if (cookieValue === 'checked') {
                // Use the user's input percentage
                if (!fieldPercentage || isNaN(fieldPercentage)) {
                    fieldPercentage = 100; // Default to 100% if input is invalid
                }
                liabilities += (parsedValue * fieldPercentage / 100);
            } else if (cookieValue === 'unChecked') {
                // Use the number directly from the field
                liabilities += parsedValue;
            } else {
                // Default behavior (if cookie not set or invalid value)
                if (!fieldPercentage || isNaN(fieldPercentage)) {
                    fieldPercentage = 100;
                }
                liabilities += (parsedValue * fieldPercentage / 100);
            }
        } 
    }

    LIABILITIES = liabilities;
    document.getElementById('LIABILITIES').textContent = '$' + LIABILITIES.toFixed(2);
}
    
    
 
    
    

    function setIncomeData() { 
      const liabilitiesFields = [
        'liabilities_small_business_loan',
        'liabilities_primary_residence',
        'liabilities_investment_properties',
        'liabilities_vehicle_loan',
        'liabilities_personal_debt',
        'liabilities_student_loan',
        'liabilities_line_of_credit',
        'liabilities_credit_card',
        'liabilities_tax_arrears'
      ];
    
      for (let i = 0; i < liabilitiesFields.length; i++) {
        const liabilitiesInput = document.getElementById(liabilitiesFields[i]);
        if (liabilitiesInput.value.trim() !== "") {
          const liabilities = liabilitiesInput.value;
          setCookie(liabilitiesFields[i], liabilities, 365); // Set liability value
    
          // Set the cookie for the percentage field as well
          let fieldPercentage = parseFloat(document.querySelector(`#${liabilitiesFields[i]}_percent`).value);
          if (!fieldPercentage || isNaN(fieldPercentage)) {
            // fieldPercentage = 100 (not setting a default here, just skipping as before)
            continue;
          }
          setCookie(`${liabilitiesFields[i]}_percent`, fieldPercentage, 365); // Set percentage
        } else {
          setCookie(liabilitiesFields[i], "0", 365); // Set to 0 if empty
        }
      }
    }
    
    
    let LIABILITIESNA;
    
    function setDebtData2() {
const isPartner = getCookie('liabilityspousecheckbox') == 'checked'

        const liabilitiesFields = [
            'liabilities_personal_debt',
            'liabilities_student_loan',
            'liabilities_line_of_credit',
            'liabilities_credit_card',
            'liabilities_tax_arrears'
        ];
    
        let totalDebt = 0;
        
    
        // Iterate over the fields and sum their values
        liabilitiesFields.forEach(field => {
            const fieldValue = parseFloat(document.getElementById(field).value) || 0;

            let fieldValuePercent = parseFloat(document.getElementById(`${field}_percent`).value)

            if (isNaN(fieldValuePercent) || !isPartner) {
              fieldValuePercent = 100
            }



            totalDebt += (fieldValue * fieldValuePercent / 100);

            // console.log(`second ${fieldValue}, ${fieldValuePercent}, ${(fieldValue * fieldValuePercent / 100)}`)
        });
    
        
        // Assign the total debt value to LIABILITIESNA
        LIABILITIESNA = totalDebt; // Making it a global variable
    }
    
    
    
      
    document.addEventListener('DOMContentLoaded', function () {
      // List of form element IDs you want to set based on cookies
      const formElements = [
          'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
          'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan', 'liabilities_line_of_credit',
          'liabilities_credit_card', 'liabilities_tax_arrears',
          'liabilities_small_business_loan_percent', 'liabilities_primary_residence_percent', 'liabilities_investment_properties_percent',
          'liabilities_vehicle_loan_percent', 'liabilities_personal_debt_percent', 'liabilities_student_loan_percent',
          'liabilities_line_of_credit_percent', 'liabilities_credit_card_percent', 'liabilities_tax_arrears_percent'
      ];
  
      // Loop through each element ID and set the value using getCookie
      formElements.forEach(function (elementId) {
          const value = getCookie(elementId); // Get the value from the cookie
          const element = document.getElementById(elementId);
          if (element) { // Check if the element exists before trying to set its value
              element.value = value;
          }
      });
  });	


      
    
    
    
    
      
      window.calculateNext = function () {
      calculateAll();
      window.location.href = '/budget/summary.html';
    }
    
      window.calculateBack = function () {
      calculateAll();
      window.location.href = 'asset.html';
    }
      
      window.calculateAll =   function () {
            
        calculateLiabilities();
    
    setIncomeData();    
        setCookie("LIABILITIES", LIABILITIES, 365);
          
              setDebtData2();
          setCookie("LIABILITIESNA", LIABILITIESNA, 365);
        }
    
    
    
    
       

document.addEventListener('DOMContentLoaded', () => {
    const romanticliabilityCookie = getCookie('romanticliability');
    const percentInputs = document.querySelectorAll('.percent-input');

    // Check for romantic liability sharing based on cookie value
    if (romanticliabilityCookie === 'checked') {
        displayWarning("You've indicated that you have joint liabilities with your romantic partner. Please enter the current value of the liabilities and your corresponding percentage of responsibility.");

        percentInputs.forEach(input => {
            input.style.display = 'block';
        });
    } else {
        percentInputs.forEach(input => {
            input.style.display = 'none';
        });
    }
});
            
     
