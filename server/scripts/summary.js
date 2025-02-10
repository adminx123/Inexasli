


const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location')
    const location = document.location.pathname


    if (location.includes(dataL)) {
        tab.removeAttribute('href')

        tab.classList.add('active')
    }
})

/* const paid = getCookie("authenticated");


if (paid == "paid") {

    document.body.style.display = 'initial'
} else {
    window.location.href = "./sumary.html";
} */


// net worth doesnt want the cookies to be effected by freuncy feild
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        let cookieValue = decodeURIComponent(parts.pop().split(';').shift());
        // Check if the cookie value is empty or null
        if(cookieValue === '' || cookieValue == null) {
            return '0'; // or return 0 if you want it as a number, not string
        }
        return cookieValue;
    }
    
    // If the cookie doesn't exist or is empty, return '0'
    return '0'; // or return 0 if you want it as a number
}

 function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
        let cookieValue = decodeURIComponent(parts.pop().split(';').shift());
        // Check if the cookie value is empty or null
        if(cookieValue === '' || cookieValue == null) {
            return '0'; // or return 0 if you want it as a number, not string
        }
        return cookieValue;
    }
    
    // If the cookie doesn't exist or is empty, return '0'
    return '0'; // or return 0 if you want it as a number
}

function calculateAnnualTax() {
    const regionValue = getCookie('RegionDropdown') || 'NONE'; // Default to 'NONE' if cookie not found
    
    let annualTax = 0;

    // Fetch values from cookies
    const annualRegionalTax = Number(getCookie('ANNUALREGIONALTAX')) || 0;
    const annualSubregionalTax = Number(getCookie('ANNUALSUBREGIONALTAX')) || 0;
    

    if (regionValue === 'USA') {
        annualTax = annualRegionalTax + annualSubregionalTax;
    } else if (regionValue === 'CAN') {
        annualTax = annualRegionalTax + annualSubregionalTax;
    } else {
        // Optionally log a warning or handle unrecognized regions here
        console.warn('Region not recognized for tax calculation');
    }

    return annualTax;
}

// Assuming you want to update the DOM with the calculated tax
const annualTax = calculateAnnualTax();
document.getElementById('annualTax').textContent = '$' + annualTax.toFixed(2);


function updateOnLoad() {    // Update HTML elements with cookie values
    document.getElementById('RegionDropdown').textContent = "Region: " + getCookie('RegionDropdown');
    document.getElementById('SubregionDropdown').textContent = "Subregion: " + getCookie('SubregionDropdown');

    calculateAnnualTax();

    document.getElementById('ANNUALTAXABLEINCOME').textContent = " $" + parseFloat(getCookie('ANNUALTAXABLEINCOME')).toFixed(2);
    document.getElementById('region_tax_sum').textContent = " $" + parseFloat(getCookie('ANNUALREGIONALTAX')).toFixed(2);
    document.getElementById('subregion_tax_sum').textContent = " $" + parseFloat(getCookie('ANNUALSUBREGIONALTAX')).toFixed(2);
    
    document.getElementById('SD').textContent = " $" + parseFloat(getCookie('SD')).toFixed(2);
    document.getElementById('BPA').textContent = " $" + parseFloat(getCookie('BPA')).toFixed(2);

    
    document.getElementById('annual_income_sum').textContent = " $" + parseFloat(getCookie('ANNUALINCOME')).toFixed(2);
    document.getElementById('annual_expense_sum').textContent = " $" + parseFloat(getCookie('ANNUALEXPENSESUM')).toFixed(2);
    document.getElementById('cpp_sum').textContent = " $" + parseFloat(getCookie('ANNUALCPP')).toFixed(2);
    document.getElementById('ANNUALEI').textContent = " $" + parseFloat(getCookie('ANNUALEI')).toFixed(2);

    document.getElementById('HOUSING').textContent = " $" + parseFloat(getCookie('HOUSING')).toFixed(2);
    document.getElementById('TRANSPORTATION').textContent = " $" + parseFloat(getCookie('TRANSPORTATION')).toFixed(2);
    document.getElementById('DEPENDANT').textContent = " $" + parseFloat(getCookie('DEPENDANT')).toFixed(2);
    document.getElementById('DEBT').textContent = " $" + parseFloat(getCookie('DEBT')).toFixed(2);
    document.getElementById('DISCRETIONARY').textContent = " $" + parseFloat(getCookie('DISCRETIONARY')).toFixed(2);
    document.getElementById('ESSENTIAL').textContent = " $" + parseFloat(getCookie('ESSENTIAL')).toFixed(2);

    document.getElementById('annual_cpp_seresult').textContent = " $" + parseFloat(getCookie('CPPPAYABLESELFEMPLOYED')).toFixed(2);
    document.getElementById('annual_cpp_eresult').textContent = " $" + parseFloat(getCookie('CPPPAYABLEEMPLOYED')).toFixed(2);

    document.getElementById('TOTALMEDICARE').textContent = " $" + parseFloat(getCookie('TOTALMEDICARE')).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITY').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITY')).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITYE').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITYE')).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITYSE').textContent = " $" + parseFloat(getCookie('TOTALSOCIALSECURITYSE')).toFixed(2);

    document.getElementById('TOTALTAXCG').textContent = " $" + parseFloat(getCookie('TOTALTAXCG')).toFixed(2);

    document.getElementById('ASSETS').textContent = " $" + parseFloat(getCookie('ASSETS')).toFixed(2);
    document.getElementById('LIABILITIES').textContent = " $" + parseFloat(getCookie('LIABILITIES')).toFixed(2);

    document.getElementById('debtcheckbox').textContent = getCookie('debtcheckbox');
    document.getElementById('dependantcheckbox').textContent = getCookie('dependantcheckbox');
    document.getElementById('romanticasset').textContent = getCookie('romanticasset');
    document.getElementById('romanticexpense').textContent = getCookie('romanticexpense');
    document.getElementById('romanticincome').textContent = getCookie('romanticincome');
    document.getElementById('romanticliability').textContent = getCookie('romanticliability');


    NETWORTH = parseFloat(getCookie('ASSETS')) - parseFloat(getCookie('LIABILITIES'));
    document.getElementById('NETWORTH').textContent = ' $' + NETWORTH.toFixed(2);

    

}



// Start Pie
document.addEventListener('DOMContentLoaded', function () {
    const cookieNames = ['ESSENTIAL', 'DEBT', 'DEPENDANT', 'DISCRETIONARY', 'HOUSING', 'TRANSPORTATION'];

    // Get data from cookies
    const data = cookieNames.map(name => {
        const value = parseFloat(getCookie(name).replace('$', '').trim());
        return isNaN(value) ? 0 : value; // Return 0 if not a number to avoid NaN in chart data
    });

    // Configuration for the pie chart
    const config = {
        type: 'pie',
        data: {
            labels: cookieNames, // Use the cookie names as labels
            datasets: [{
                label: 'Expense Distribution',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(201, 203, 207, 0.2)',
                    'rgba(100, 100, 100, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)',
                    'rgb(165, 165, 165)',
                    'rgb(118, 118, 118)',
                    'rgb(101, 101, 101)',
                    'rgb(76, 76, 76)',
                    'rgb(63, 63, 63)',
                    'rgb(36, 36, 36)',
                    'rgb(3, 3, 3)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Distribution'
                }
            }
        }
    };

    // Create the pie chart
    const myPieChart = new Chart(
        document.getElementById('myPieChart'),
        config
    );
});



function governmentObligations() {
    let ANNUALGOVERNMENTOBLIGATIONS;

    if (getCookie('RegionDropdown') === 'USA') {
        ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('TOTALSOCIALSECURITY')) +
            parseFloat(getCookie('TOTALMEDICARE'));
    } else if (getCookie('RegionDropdown') === 'CAN') {
        ANNUALGOVERNMENTOBLIGATIONS = parseFloat(getCookie('ANNUALCPP')) +
            parseFloat(getCookie('ANNUALEI'));
    } else {
        ANNUALGOVERNMENTOBLIGATIONS = 0
    }

    // Update HTML element with the calculated value
    document.getElementById('ANNUALGOVERNMENTOBLIGATIONS').textContent = ' $' + ANNUALGOVERNMENTOBLIGATIONS.toFixed(2);
}

function disposableIncome() {

    let DISPOSABLEINCOME;

    if (getCookie('RegionDropdown') === 'USA') {
        DISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
            parseFloat(getCookie('ANNUALEXPENSESUM')) -
            parseFloat(getCookie('TOTALMEDICARE')) -
            parseFloat(getCookie('TOTALSOCIALSECURITY')) -
            parseFloat(getCookie('TOTALTAXCG')) -
            parseFloat(getCookie('annualTax'));
    } else if (getCookie('RegionDropdown') === 'CAN') {
        DISPOSABLEINCOME = parseFloat(getCookie('ANNUALINCOME')) -
            parseFloat(getCookie('ANNUALEXPENSESUM')) -
            parseFloat(getCookie('ANNUALEI')) -
            parseFloat(getCookie('ANNUALCPP')) -
            parseFloat(getCookie('annualTax'));
    } else {
        DISPOSABLEINCOME = 0;
    }

    // Update HTML element with the calculated value
    document.getElementById('DISPOSABLEINCOME').textContent = ' $' + DISPOSABLEINCOME.toFixed(2);

    return DISPOSABLEINCOME; // returns for use elsewhere
}



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
        document.getElementById("FIRERATIO").style.color = "orange";
    } else {
        document.getElementById("FIRERATIO").style.color = "red";
    }
}

if (isNaN(FIRERATIO)) {

    document.getElementById('FIRERATIO').textContent = 'Not Applicable';
} else {

    // Assuming FIRERATIO is the ID of the element displaying the FIRE ratio
    document.getElementById('FIRERATIO').textContent = FIRERATIO.toFixed(2);
    colorChangeFIRE();
}



// Calculate the savings-to-debt ratio
var SAVINGSTODEBT = parseFloat(getCookie('LIQUIDASSETS')) / parseFloat(getCookie('LIABILITIES'));

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
        document.getElementById("SAVINGSTODEBT").style.color = "orange";
    } else {
        document.getElementById("SAVINGSTODEBT").style.color = "red";
    }
}

if (isNaN(SAVINGSTODEBT)) {
    document.getElementById('SAVINGSTODEBT').textContent = 'Not Applicable';
} else if (SAVINGSTODEBT === 0) {
    document.getElementById('SAVINGSTODEBT').textContent = 'RISK OF INSOLVENCY';
    document.getElementById('SAVINGSTODEBT').style.color = "red"; // Set color to red for insolvency risk
} else {
    // Assuming "SAVINGSTODEBT" is the ID of the element displaying the savings-to-debt ratio
    document.getElementById('SAVINGSTODEBT').textContent = SAVINGSTODEBT.toFixed(2);
    colorChangeSavingsToDebt();
}



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
        document.getElementById("HOUSINGTOINCOME").style.color = "orange";
    } else {
        document.getElementById("HOUSINGTOINCOME").style.color = "red";
    }
}


if (isNaN(HOUSINGTOINCOME)) {
    document.getElementById('HOUSINGTOINCOME').textContent = ' Not Applicable';

} else {

    // Assuming HOUSINGTOINCOME is the ID of the element displaying HTI ratio
    document.getElementById('HOUSINGTOINCOME').textContent = HOUSINGTOINCOME.toFixed(2);
    colorChangeHTI();
}



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
        document.getElementById("DEBTTOINCOME").style.color = "orange";
    } else {
        document.getElementById("DEBTTOINCOME").style.color = "red";
    }
}
if (isNaN(DEBTTOINCOME) || !isFinite(DEBTTOINCOME)) {
    document.getElementById('DEBTTOINCOME').textContent = ' Not Applicable'
} else {

    document.getElementById('DEBTTOINCOME').textContent = DEBTTOINCOME.toFixed(2);
    colorChangeDTI(); // After setting the text content, call the function to update the color
}


function calculateGoal() {
    const disposableIncomeElement = document.getElementById('DISPOSABLEINCOME');
    let DISPOSABLEINCOME = parseFloat(disposableIncomeElement.textContent.replace('$', '').trim());

    if (isNaN(DISPOSABLEINCOME) || DISPOSABLEINCOME <= 0) {
        console.error("DISPOSABLEINCOME is not a valid number or is not positive.");
        return;
    }

    const goalAmount = document.getElementById('goalAmount').value;
    const parsedGoalAmount = parseFloat(goalAmount);

    if (!isNaN(parsedGoalAmount) && parsedGoalAmount > 0) {
        const frequencyDropdown = document.getElementById('frequency');
        const selectedFrequency = frequencyDropdown.value;
        let timeNeeded, timeUnit;

        // Convert annual disposable income to the selected frequency for calculation
        switch (selectedFrequency) {
            case 'annual':
                timeNeeded = parsedGoalAmount / DISPOSABLEINCOME;
                timeUnit = "Years";
                break;
            case 'monthly':
                // Monthly disposable income is annual income divided by 12
                timeNeeded = parsedGoalAmount / (DISPOSABLEINCOME / 12);
                timeUnit = "Months";
                break;
            case 'weekly':
                // Weekly disposable income is annual income divided by 52
                timeNeeded = parsedGoalAmount / (DISPOSABLEINCOME / 52);
                timeUnit = "Weeks";
                break;
            default:
                timeNeeded = 0;
                timeUnit = "Unknown";
        }

        const resultElement = document.getElementById('goalResult');
        if (resultElement) {
            resultElement.textContent = `${timeUnit} needed: ${timeNeeded.toFixed(2)}`;
        }
    } else {
        document.getElementById('goalResult').textContent = '';
    }
}


function timeToPay() {
    const frequencyDropdown = document.getElementById('frequency');
    const timeToPayDebtElement = document.getElementById('TIMETOPAYDEBT');

    function updateFrequencyText() {
        let frequencyText = '';
        switch (frequencyDropdown.value) {
            case 'annual':
                frequencyText = 'Years';
                break;
            case 'monthly':
                frequencyText = 'Months';
                break;
            case 'weekly':
                frequencyText = 'Weeks';
                break;
            default:
                frequencyText = 'Unknown';
        }

        // Retrieve disposable income from the DOM element
        const disposableIncomeText = document.getElementById('DISPOSABLEINCOME').textContent;
        const DISPOSABLEINCOME = parseFloat(disposableIncomeText.replace(/[^0-9.]/g, ''));

        let revolvingDebtValue = getCookie('LIABILITIESNA');
        if (revolvingDebtValue && revolvingDebtValue !== '0' && !isNaN(parseFloat(revolvingDebtValue))) {
            let TIMETOPAYDEBT = parseFloat(revolvingDebtValue) / DISPOSABLEINCOME;
            if (DISPOSABLEINCOME <= 0) {
                timeToPayDebtElement.textContent = "RISK OF INSOLVENCY";
            } else {
                // Convert time based on frequency
                switch (frequencyDropdown.value) {
                    case 'annual':
                        break; // No conversion needed
                    case 'monthly':
                        TIMETOPAYDEBT *= 12; // Convert years to months
                        break;
                    case 'weekly':
                        TIMETOPAYDEBT *= 52; // Convert years to weeks
                        break;
                }
                timeToPayDebtElement.textContent = TIMETOPAYDEBT.toFixed(2) + ' ' + frequencyText;
            }
        } else {
            timeToPayDebtElement.textContent = "Not Applicable";
        }
    }

    frequencyDropdown.addEventListener('change', updateFrequencyText);
    updateFrequencyText(); // Initial call
}




function calculateIncomeAfterTaxAndObligations() {
    // Retrieve annual income from cookie
    let annualIncome = parseFloat(getCookie('ANNUALINCOME')) || 0;

    // Retrieve annual tax from cookie
    let annualTax = calculateAnnualTax();

    // Calculate annual government obligations from the function on the current page
    let annualGovernmentObligations = parseFloat(getCookie('ANNUALGOVERNMENTOBLIGATIONS')) || 0;

    // Additional tax for USA
    let capitalGainsTax = 0;
    if (getCookie('RegionDropdown') === 'USA') {
        capitalGainsTax = parseFloat(getCookie('TOTALTAXCG')) || 0;
    }

    // Calculate income after tax and obligations
    let incomeAfterTaxAndObligations = annualIncome - annualTax - annualGovernmentObligations - capitalGainsTax;

    
    // Return the calculated value for use elsewhere if needed
    return incomeAfterTaxAndObligations;
}


// Start Pie Tax
document.addEventListener('DOMContentLoaded', function () {
    let cookieNames = [];

    // Check if the region is USA or CAN
    if (getCookie('RegionDropdown') === 'USA') {
        cookieNames = ['TOTALSOCIALSECURITY', 'TOTALMEDICARE', 'TOTALTAXCG'];
    } else if (getCookie('RegionDropdown') === 'CAN') {
        cookieNames = ['ANNUALCPP', 'ANNUALEI'];
    }

    // Calculate income after tax and obligations directly
    let incomeAfterTaxAndObligations = calculateIncomeAfterTaxAndObligations();
    let annualTax = calculateAnnualTax();

    // Get data from cookies for other variables
    const data = [incomeAfterTaxAndObligations, annualTax, ...cookieNames.map(name => {
        const value = parseFloat(getCookie(name).replace('$', '').trim());
        return isNaN(value) ? 0 : value; // Return 0 if not a number to avoid NaN in chart data
    })];

    // Configuration for the pie chart
    const config = {
        type: 'pie',
        data: {
            labels: ['INCOME, AFTER TAX & OBLIGATIONS', 'Annual Tax', ...cookieNames], // Use descriptive labels
            datasets: [{
                label: 'Income Erosion Chart',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)' // Add more colors if needed for more categories
                ],
                borderColor: [
                    'rgb(194, 194, 194)',
                    'rgb(165, 165, 165)',
                    'rgb(118, 118, 118)',
                    'rgb(101, 101, 101)',
                    'rgb(76, 76, 76)',
                    'rgb(63, 63, 63)' // Add more colors if needed for more categories
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Income Erosion Chart'
                }
            }
        }
    };

    // Create the pie chart
    const myPieChart = new Chart(
        document.getElementById('myPieChartTax'),
        config
    );
});


function updateOnChange() {
    const frequencySelect = document.getElementById('frequency');
    let frequency = frequencySelect.value;
    let multiplier = 1; // Default for annual

    switch(frequency) {
        case 'monthly':
            multiplier = 1/12;
            break;
        case 'weekly':
            multiplier = 1/52;
            break;
        // 'annual' is already the base case (multiplier = 1)
    }

    function updateElementText(elementId, cookieName) {
        const element = document.getElementById(elementId);
        if (element) {
            let value = parseFloat(getCookie(cookieName)) * multiplier;
            element.textContent = " $" + value.toFixed(2);
        }
    }

    // Update elements based on frequency
    updateElementText('ANNUALTAXABLEINCOME', 'ANNUALTAXABLEINCOME');

     updateElementText('annualTax', 'annualTax');
    updateElementText('region_tax_sum', 'ANNUALREGIONALTAX');
    updateElementText('subregion_tax_sum', 'ANNUALSUBREGIONALTAX');

    updateElementText('annual_income_sum', 'ANNUALINCOME');
    updateElementText('annual_expense_sum', 'ANNUALEXPENSESUM');
    updateElementText('cpp_sum', 'ANNUALCPP');
    updateElementText('ANNUALEI', 'ANNUALEI');
    updateElementText('HOUSING', 'HOUSING');
    updateElementText('TRANSPORTATION', 'TRANSPORTATION');
    updateElementText('DEPENDANT', 'DEPENDANT');
    updateElementText('DEBT', 'DEBT');
    updateElementText('DISCRETIONARY', 'DISCRETIONARY');
    updateElementText('ESSENTIAL', 'ESSENTIAL');
    updateElementText('annual_cpp_seresult', 'CPPPAYABLESELFEMPLOYED');
    updateElementText('annual_cpp_eresult', 'CPPPAYABLEEMPLOYED');
    updateElementText('TOTALMEDICARE', 'TOTALMEDICARE');
    updateElementText('TOTALSOCIALSECURITY', 'TOTALSOCIALSECURITY');
    updateElementText('TOTALSOCIALSECURITYE', 'TOTALSOCIALSECURITYE');
    updateElementText('TOTALSOCIALSECURITYSE', 'TOTALSOCIALSECURITYSE');
    updateElementText('TOTALTAXCG', 'TOTALTAXCG');
}

// DOM Event Listener
document.addEventListener('DOMContentLoaded', function () {
    // Function to retrieve cookie value by name
    updateOnLoad();
   
    document.getElementById('goalAmount').addEventListener('input', calculateGoal);

    governmentObligations();
    disposableIncome();
    colorChangeFIRE();
    colorChangeSavingsToDebt();
    colorChangeHTI();
    colorChangeDTI();
    timeToPay();
    calculateGoal();
    calculateIncomeAfterTaxAndObligations();
});





// Change Event Listenter
const frequencyDropdown = document.getElementById('frequency');
frequencyDropdown.addEventListener('change', function () {
    // Call the update function when the frequency dropdown value changes
   updateOnChange(); 
    
    governmentObligations();
    disposableIncome();
    colorChangeFIRE();
    colorChangeSavingsToDebt();
    colorChangeHTI();
    colorChangeDTI();

    timeToPay();
    calculateGoal();
});


