/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 



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
    
      
        setCookie("LIABILITIES", LIABILITIES, 365);
          
              setDebtData2();
          setCookie("LIABILITIESNA", LIABILITIESNA, 365);

          setCookie("liabilities_small_business_loan", document.getElementById("liabilities_small_business_loan").value.trim() !== "" ? document.getElementById("liabilities_small_business_loan").value : "0", 365);
          setCookie("liabilities_primary_residence", document.getElementById("liabilities_primary_residence").value.trim() !== "" ? document.getElementById("liabilities_primary_residence").value : "0", 365);
          setCookie("liabilities_investment_properties", document.getElementById("liabilities_investment_properties").value.trim() !== "" ? document.getElementById("liabilities_investment_properties").value : "0", 365);
          setCookie("liabilities_vehicle_loan", document.getElementById("liabilities_vehicle_loan").value.trim() !== "" ? document.getElementById("liabilities_vehicle_loan").value : "0", 365);
          setCookie("liabilities_personal_debt", document.getElementById("liabilities_personal_debt").value.trim() !== "" ? document.getElementById("liabilities_personal_debt").value : "0", 365);
          setCookie("liabilities_student_loan", document.getElementById("liabilities_student_loan").value.trim() !== "" ? document.getElementById("liabilities_student_loan").value : "0", 365);
          setCookie("liabilities_line_of_credit", document.getElementById("liabilities_line_of_credit").value.trim() !== "" ? document.getElementById("liabilities_line_of_credit").value : "0", 365);
          setCookie("liabilities_credit_card", document.getElementById("liabilities_credit_card").value.trim() !== "" ? document.getElementById("liabilities_credit_card").value : "0", 365);
          setCookie("liabilities_tax_arrears", document.getElementById("liabilities_tax_arrears").value.trim() !== "" ? document.getElementById("liabilities_tax_arrears").value : "0", 365);


// Percentages (matching asset percentage style)
setCookie("liabilities_small_business_loan_percent", document.getElementById("liabilities_small_business_loan_percent").value.trim() !== "" ? document.getElementById("liabilities_small_business_loan_percent").value : "100", 365);
setCookie("liabilities_primary_residence_percent", document.getElementById("liabilities_primary_residence_percent").value.trim() !== "" ? document.getElementById("liabilities_primary_residence_percent").value : "100", 365);
setCookie("liabilities_investment_properties_percent", document.getElementById("liabilities_investment_properties_percent").value.trim() !== "" ? document.getElementById("liabilities_investment_properties_percent").value : "100", 365);
setCookie("liabilities_vehicle_loan_percent", document.getElementById("liabilities_vehicle_loan_percent").value.trim() !== "" ? document.getElementById("liabilities_vehicle_loan_percent").value : "100", 365);
setCookie("liabilities_personal_debt_percent", document.getElementById("liabilities_personal_debt_percent").value.trim() !== "" ? document.getElementById("liabilities_personal_debt_percent").value : "100", 365);
setCookie("liabilities_student_loan_percent", document.getElementById("liabilities_student_loan_percent").value.trim() !== "" ? document.getElementById("liabilities_student_loan_percent").value : "100", 365);
setCookie("liabilities_line_of_credit_percent", document.getElementById("liabilities_line_of_credit_percent").value.trim() !== "" ? document.getElementById("liabilities_line_of_credit_percent").value : "100", 365);
setCookie("liabilities_credit_card_percent", document.getElementById("liabilities_credit_card_percent").value.trim() !== "" ? document.getElementById("liabilities_credit_card_percent").value : "100", 365);
setCookie("liabilities_tax_arrears_percent", document.getElementById("liabilities_tax_arrears_percent").value.trim() !== "" ? document.getElementById("liabilities_tax_arrears_percent").value : "100", 365);


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
            
     
