import { displayWarning } from "./utils.js"

const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location')
    const location = document.location.pathname
   
    if (location.includes(dataL)) {
      tab.removeAttribute('href')
        tab.classList.add('active')
    }
})

  // Function to retrieve cookie value by name
  function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  const val = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
  return val == 0 || val == '0'? '': val

}



var LIABILITIES;
 
  
  
    function calculateLiabilities() {
      // console.log('calculate liabilities called')
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


            const isPartner = getCookie('liabilityspousecheckbox') == 'checked'


            if (!isNaN(parsedValue)) {
               let fieldPercentage = parseFloat(document.querySelector(`#${liabilitiesFields[i]}_percent`).value)

                if (!fieldPercentage || isNaN(fieldPercentage) ||!isPartner) {
                    fieldPercentage = 100
                }
                // console.log(fieldPercentage)



                liabilities += (parsedValue * fieldPercentage / 100);
                // console.log(`${parsedValue}, ${fieldPercentage}, ${parsedValue * fieldPercentage / 100}`)
            } else {
                console.error(`Invalid value for ${liabilities[i]}: ${fieldValue}`);
            }
        }
    
        LIABILITIES = liabilities;
        document.getElementById('LIABILITIES').textContent = '$' + LIABILITIES.toFixed(2);
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
    
    
    function setIncomeData(){ 
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
    
    
    //for (let i = 0; i < frequencyFields.length; i++) {
      //const frequencyInput = document.getElementById(frequencyFields[i]);
     // if (frequencyInput.value.trim() !== "") {
     //   const frequency = frequencyInput.value;
     //   const expirationDate = new Date();
     //   expirationDate.setDate(expirationDate.getDate() + 365);
     //   document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
     // } else {
    //    const frequency = "0";
     //   const expirationDate = new Date();
      //  expirationDate.setDate(expirationDate.getDate() + 365);
      //  document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
     // }
    //}
    
    for (let i = 0; i < liabilitiesFields.length; i++) {
      // console.log('working')
      const liabilitiesInput = document.getElementById(liabilitiesFields[i]);
      if (liabilitiesInput.value.trim() !== "") {
        const liabilities = liabilitiesInput.value;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        document.cookie = `${liabilitiesFields[i]}=${liabilities}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;

        // Set the cookie for the percentage field as well

        let fieldPercentage = parseFloat(document.querySelector(`#${liabilitiesFields[i]}_percent`).value)

        if (!fieldPercentage || isNaN(fieldPercentage)) {
          // fieldPercentage = 100
          continue
        }

        document.cookie = `${liabilitiesFields[i]}_percent=${fieldPercentage}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;
      } else {
        const liabilities = "0";
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        document.cookie = `${liabilitiesFields[i]}=${liabilities}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;
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
    
    
    
      
      document.addEventListener('DOMContentLoaded', function() {
        // Function to retrieve cookie value by name
        function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        const val = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
        return val == 0 || val == '0'? '': val

    }
       
        
    document.getElementById('liabilities_small_business_loan').value = getCookie('liabilities_small_business_loan');
    document.getElementById('liabilities_primary_residence').value = getCookie('liabilities_primary_residence');
    document.getElementById('liabilities_investment_properties').value = getCookie('liabilities_investment_properties');
    document.getElementById('liabilities_vehicle_loan').value = getCookie('liabilities_vehicle_loan');
          document.getElementById('liabilities_personal_debt').value = getCookie('liabilities_personal_debt');
    document.getElementById('liabilities_student_loan').value = getCookie('liabilities_student_loan');
    document.getElementById('liabilities_line_of_credit').value = getCookie('liabilities_line_of_credit');
    document.getElementById('liabilities_credit_card').value = getCookie('liabilities_credit_card');
    document.getElementById('liabilities_tax_arrears').value = getCookie('liabilities_tax_arrears');

    document.getElementById('liabilities_small_business_loan_percent').value = getCookie('liabilities_small_business_loan_percent');
    document.getElementById('liabilities_primary_residence_percent').value = getCookie('liabilities_primary_residence_percent');
    document.getElementById('liabilities_investment_properties_percent').value = getCookie('liabilities_investment_properties_percent');
    document.getElementById('liabilities_vehicle_loan_percent').value = getCookie('liabilities_vehicle_loan_percent');
          document.getElementById('liabilities_personal_debt_percent').value = getCookie('liabilities_personal_debt_percent');
    document.getElementById('liabilities_student_loan_percent').value = getCookie('liabilities_student_loan_percent');
    document.getElementById('liabilities_line_of_credit_percent').value = getCookie('liabilities_line_of_credit_percent');
    document.getElementById('liabilities_credit_card_percent').value = getCookie('liabilities_credit_card_percent');
    document.getElementById('liabilities_tax_arrears_percent').value = getCookie('liabilities_tax_arrears_percent');
      })	


      
    
    
    
    
      
      window.calculateNext = function () {
      calculateAll();
      window.location.href = 'summary.html';
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
    
    
    
    
        const spousecheckbox = document.querySelector('#spousecheckbox')

        spousecheckbox.addEventListener('change', function() {
      const percentInputs = document.querySelectorAll('.percent-input')

          if (spousecheckbox.checked) {
              setCookie('liabilityspousecheckbox', 'checked', 365)
    
              displayWarning("this is the text for the liability page, can simply change it from somewhere arround line 191 of liability script this is the text for the liability page, can simply change it from somewhere arround line 191 of liability script ")

              percentInputs.forEach( input => {
                input.style.display = 'block'
              })

          } else {
              setCookie('liabilityspousecheckbox', 'unChecked', 365)
              percentInputs.forEach(input => {
                input.style.display = 'none'
              })
    
          }
    
        })

        document.addEventListener('DOMContentLoaded', () => {
          const isPartner = getCookie('liabilityspousecheckbox') == 'checked'
        const percentInputs = document.querySelectorAll('.percent-input')
  
  
          if (isPartner) {
              spousecheckbox.checked = true
              percentInputs.forEach(input => {
                  input.style.display = 'block'
              })
          }
  
      })