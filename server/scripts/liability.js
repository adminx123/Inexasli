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
            if (!isNaN(parsedValue)) {
                liabilities += parsedValue;
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
      const liabilitiesInput = document.getElementById(liabilitiesFields[i]);
      if (liabilitiesInput.value.trim() !== "") {
        const liabilities = liabilitiesInput.value;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        document.cookie = `${liabilitiesFields[i]}=${liabilities}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;
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
            totalDebt += fieldValue;
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
      })	
    
    
    
    
      
    function calculateNext() {
      calculateAll();
      window.location.href = 'summary.html';
    }
    
      function calculateBack() {
      calculateAll();
      window.location.href = 'asset.html';
    }
      
        function calculateAll() {
            
        calculateLiabilities();
    
    setIncomeData();    
        setCookie("LIABILITIES", LIABILITIES, 365);
          
              setDebtData2();
          setCookie("LIABILITIESNA", LIABILITIESNA, 365);
        }
    
    
    
    
