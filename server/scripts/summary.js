//
const paid = getCookie("authenticated");


if (paid == "paid") {
    
    document.body.style.display = 'initial'
} else {
    window.location.href = "/client/finance/sumary.html";
}
    
function getCookie1(name) {
    const value1 = `; ${document.cookie}`;
    const parts1 = value1.split(`; ${name}=`);
    let cookieValue1 = parts1.length === 2 ? decodeURIComponent(parts1.pop().split(';').shift()) : '';
    
    return cookieValue1 === '' ? '0' : cookieValue1;
}

    
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    let cookieValue = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
    
    // Get the selected frequency from the dropdown
    const frequencyDropdown = document.getElementById('frequency');
    const selectedFrequency = frequencyDropdown.value;

    // Convert the annual amount based on the selected frequency, if applicable
    if (selectedFrequency !== 'annually' && !isNaN(cookieValue)) {
        if (selectedFrequency === 'monthly') {
            cookieValue /= 12;
        } else if (selectedFrequency === 'weekly') {
            cookieValue /= 52;
        }
    }
    
    return cookieValue === '' ? '0' : cookieValue;
}


document.addEventListener('DOMContentLoaded', function() {
    // Function to retrieve cookie value by name
    
function updateOnChange(){    // Update HTML elements with cookie values
        document.getElementById('RegionDropdown').textContent = "Region: " + getCookie('RegionDropdown');
        document.getElementById('SubregionDropdown').textContent =  "Subregion: " + getCookie('SubregionDropdown');
    
    document.getElementById('taxable_sum').textContent = " $" + getCookie('ANNUALTAXABLEINCOME');
    document.getElementById('region_tax_sum').textContent = " $" + getCookie('ANNUALREGIONALTAX');
    document.getElementById('subregion_tax_sum').textContent = " $" + getCookie('ANNUALSUBREGIONALTAX');
    document.getElementById('tax_sum').textContent = " $" + parseFloat((getCookie('ANNUALTAX'))).toFixed(2);
        
    document.getElementById('annual_income_sum').textContent = " $" + getCookie('ANNUALINCOME');
    document.getElementById('annual_expense_sum').textContent = " $" + getCookie('ANNUALEXPENSESUM');
    document.getElementById('cpp_sum').textContent = " $" + getCookie('ANNUALCPP');
    document.getElementById('ANNUALEI').textContent = " $" + getCookie('ANNUALEI');
    

    document.getElementById('annual_cpp_seresult').textContent = " $" + getCookie('CPPPAYABLESELFEMPLOYED');
    document.getElementById('annual_cpp_eresult').textContent = " $" + getCookie('CPPPAYABLEEMPLOYED');

        document.getElementById('TOTALMEDICARE').textContent = " $" + getCookie('TOTALMEDICARE');
    document.getElementById('TOTALSOCIALSECURITY').textContent = " $" + getCookie('TOTALSOCIALSECURITY');
        document.getElementById('TOTALSOCIALSECURITYE').textContent = " $" + getCookie('TOTALSOCIALSECURITYE');
    document.getElementById('TOTALSOCIALSECURITYSE').textContent = " $" + getCookie('TOTALSOCIALSECURITYSE');

    document.getElementById('TOTALTAXCG').textContent = " $" + getCookie('TOTALTAXCG');

     document.getElementById('ASSETS').textContent = " $" + getCookie1('ASSETS');
     document.getElementById('LIABILITIES').textContent = " $" + getCookie1('LIABILITIES');
     

let ANNUALDISPOSABLEINCOME;

if (getCookie('RegionDropdown') === 'USA') {
    ANNUALDISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
        parseFloat(getCookie('ANNUALEXPENSESUM')) -
        parseFloat(getCookie('TOTALMEDICARE')) -
        parseFloat(getCookie('TOTALSOCIALSECURITY')) -
        parseFloat(getCookie('TOTALTAXCG')) -
        parseFloat(getCookie('ANNUALTAX'));
} else if (getCookie('RegionDropdown') === 'CAN') {
    ANNUALDISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
        parseFloat(getCookie('ANNUALEXPENSESUM')) -
        parseFloat(getCookie('ANNUALEI')) -
        parseFloat(getCookie('ANNUALCPP')) -
        parseFloat(getCookie('ANNUALTAX'));
}

// Update HTML element with the calculated value
document.getElementById('ANNUALDISPOSABLEINCOME').textContent = ' $' + ANNUALDISPOSABLEINCOME.toFixed(2);

    const frequencyDropdown = document.getElementById('frequency');

let TIMETOPAYDEBT;

// Get the revolving debt, checking if the cookie exists and has a value other than '0' or non-numeric
let revolvingDebtValue = getCookie1('LIABILITIESNA');
if (revolvingDebtValue && revolvingDebtValue !== '0' && !isNaN(parseFloat(revolvingDebtValue))) {
    TIMETOPAYDEBT = parseFloat(revolvingDebtValue) / ANNUALDISPOSABLEINCOME;

    let frequencyText = '';
    let insolvencyWarning = '';

    switch (frequencyDropdown.value) {
        case 'annual':
            frequencyText = 'Years';
            break;
        case 'monthly':
            frequencyText = 'Months';
            TIMETOPAYDEBT *= 12; // Convert years to months
            break;
        case 'weekly':
            frequencyText = 'Weeks';
            TIMETOPAYDEBT *= 52; // Convert years to weeks
            break;
        default:
            frequencyText = 'Unknown';
    }

    if (ANNUALDISPOSABLEINCOME <= 0) {
        document.getElementById('TIMETOPAYDEBT').textContent = "RISK OF INSOLVENCY";
    } else {
        document.getElementById('TIMETOPAYDEBT').textContent = TIMETOPAYDEBT.toFixed(2) + ' ' + frequencyText;
    }
} else {
    document.getElementById('TIMETOPAYDEBT').textContent = "Not Applicable";
}
 
     
let ANNUALGOVERNMENTOBLIGATIONS;

    if (getCookie('RegionDropdown') === 'USA') {
    ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('TOTALSOCIALSECURITY')) +
        parseFloat(getCookie('TOTALMEDICARE'));
} else if (getCookie('RegionDropdown') === 'CAN') {
    ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('ANNUALCPP')) +
        parseFloat(getCookie('ANNUALEI'))  ;
}

// Update HTML element with the calculated value
document.getElementById('ANNUALGOVERNMENTOBLIGATIONS').textContent = ' $' + ANNUALGOVERNMENTOBLIGATIONS.toFixed(2);
    
    NETWORTH = parseFloat(getCookie1('ASSETS')) - parseFloat(getCookie1('LIABILITIES'));
    document.getElementById('NETWORTH').textContent = '$' + NETWORTH.toFixed(2);

     
DEBTTOINCOME = parseFloat(getCookie('LIABILITIES')) / parseFloat(getCookie('ANNUALINCOME'));

function colorChangeDTI() {
    // Get the debt-to-income ratio value
    var debtToIncome = parseFloat(document.getElementById("DEBTTOINCOME").textContent);

    // Define the ranges based on your description
    var greatRange = 0.20; // Below 0.20 is great
    var okayMinRange = 0.20; // Okay starts at 0.20
    var okayMaxRange = 0.36; // Okay goes up to 0.36
    
    // Apply color based on the value
    if (debtToIncome < greatRange) {
        document.getElementById("DEBTTOINCOME").style.color = "green";
    } else if (debtToIncome >= okayMinRange && debtToIncome <= okayMaxRange) {
        document.getElementById("DEBTTOINCOME").style.color = "yellow";
    } else {
        document.getElementById("DEBTTOINCOME").style.color = "red";
    }
}
    document.getElementById('DEBTTOINCOME').textContent = DEBTTOINCOME.toFixed(3);
colorChangeDTI(); // After setting the text content, call the function to update the color

    
HOUSINGTOINCOME = parseFloat(getCookie('HOUSING')) / parseFloat(getCookie('ANNUALINCOME')); // Use a descriptive variable name

    function colorChangeHTI() {
    // Get the housing-to-income ratio value
    var htiText = document.getElementById("HOUSINGTOINCOME").textContent;
    var hti = parseFloat(htiText);

    // Define the ranges
    var greatRange = .25;
    var okayMinRange = .25;
    var okayMaxRange = .35;

    // Apply color based on the value
    if (hti < greatRange) {
        document.getElementById("HOUSINGTOINCOME").style.color = "green";
    } else if (hti >= okayMinRange && hti <= okayMaxRange) {
        document.getElementById("HOUSINGTOINCOME").style.color = "yellow";
    } else {
        document.getElementById("HOUSINGTOINCOME").style.color = "red";
    }
}

// Assuming HOUSINGTOINCOME is the ID of the element displaying HTI ratio
document.getElementById('HOUSINGTOINCOME').textContent = HOUSINGTOINCOME.toFixed(3); 
colorChangeHTI(); 

   SAVINGSTODEBT = parseFloat(getCookie('LIQUIDASSETS')) / parseFloat(getCookie('LIABILITIES'));

function colorChangeSavingsToDebt() {
    // Get the savings-to-debt ratio value
    var savingsToDebtText = document.getElementById("SAVINGSTODEBT").textContent;
    var savingsToDebt = parseFloat(savingsToDebtText);

    // Define the ranges
    var greatRange = 2; // Example threshold for "great" savings-to-debt ratio
    var goodMinRange = 1; // Example lower threshold for "good" savings-to-debt ratio
    var goodMaxRange = 2; // Example upper threshold for "good" savings-to-debt ratio

    // Apply color based on the value
    if (savingsToDebt >= greatRange) {
        document.getElementById("SAVINGSTODEBT").style.color = "green";
    } else if (savingsToDebt >= goodMinRange && savingsToDebt <= goodMaxRange) {
        document.getElementById("SAVINGSTODEBT").style.color = "yellow";
    } else {
        document.getElementById("SAVINGSTODEBT").style.color = "red";
    }
}

// Assuming "SAVINGSTODEBT" is the ID of the element displaying the savings-to-debt ratio
document.getElementById('SAVINGSTODEBT').textContent = SAVINGSTODEBT.toFixed(3);
colorChangeSavingsToDebt();



    
  FIRERATIO = parseFloat(getCookie('PASSIVEINCOME')) / parseFloat(getCookie('ANNUALEXPENSESUM')); // Descriptive variable name

function colorChangeFIRE() {
    // Get the FIRE ratio value
    var FIREText = document.getElementById("FIRERATIO").textContent;
    var FIRE = parseFloat(FIREText);

    // Define the ranges for FIRE ratio
    var greatRange = .25; // Example threshold for "great" FIRE ratio
    var okayMinRange = .10; // Example lower threshold for "okay" FIRE ratio
    var okayMaxRange = .25; // Example upper threshold for "okay" FIRE ratio

    // Apply color based on the value
    if (FIRE >= greatRange) {
        document.getElementById("FIRERATIO").style.color = "green";
    } else if (FIRE >= okayMinRange && FIRE <= okayMaxRange) {
        document.getElementById("FIRERATIO").style.color = "yellow";
    } else {
        document.getElementById("FIRERATIO").style.color = "red";
    }
}

// Assuming FIRERATIO is the ID of the element displaying the FIRE ratio
document.getElementById('FIRERATIO').textContent = FIRERATIO.toFixed(3);
colorChangeFIRE();

  } 
  
  updateOnChange();
  
   // Add an event listener to the frequency dropdown
    const frequencyDropdown = document.getElementById('frequency');
    frequencyDropdown.addEventListener('change', function() {
        // Call the update function when the frequency dropdown value changes
        updateOnChange();
    
});


     
});


document.addEventListener('change', function() {
    var usaDiv = document.querySelector('.usa');
    var canDiv = document.querySelector('.can');

    var regionDropdownValue = getCookie('RegionDropdown');

    if (regionDropdownValue === 'USA') {
        usaDiv.style.display = 'block';
        canDiv.style.display = 'hidden';
    } else if (regionDropdownValue === 'CAN') {
        usaDiv.style.display = 'hidden';
        canDiv.style.display = 'block';
    }
    document.getElementById('ASSETS').textContent = " $" + getCookie1('ASSETS');
    document.getElementById('LIABILITIES').textContent = " $" + getCookie1('LIABILITIES');
});

// console.log(getCookie('RegionDropdown'))

const canHide = document.getElementById("can-hide")
const usaHide = document.getElementById("usa-hide")

if ((getCookie('RegionDropdown')) == 'CAN') {
    usaHide.style.display = 'none'

} else if ((getCookie('RegionDropdown')) == 'USA') {
    canHide.style.display = 'none'
}


     
