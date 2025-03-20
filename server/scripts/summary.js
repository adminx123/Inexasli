/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 

import { getCookie } from '/server/scripts/getcookie.js'; // Adjust path as needed

const tabs = document.querySelectorAll('.tab');

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

/* const paid = getCookie("authenticated");
if (paid == "paid") {
    document.body.style.display = 'initial';
} else {
    window.location.href = "./sumary.html";
} */

function updateOnLoad() {
    // Update HTML elements with cookie values
    document.getElementById('RegionDropdown').textContent = "Region: " + (getCookie('RegionDropdown').trim() !== "" ? getCookie('RegionDropdown') : "NONE");
    document.getElementById('SubregionDropdown').textContent = "Subregion: " + (getCookie('SubregionDropdown').trim() !== "" ? getCookie('SubregionDropdown') : "");
    
    calculateAnnualTax();
    
    document.getElementById('ANNUALTAXABLEINCOME').textContent = " $" + (parseFloat(getCookie('ANNUALTAXABLEINCOME')) || 0).toFixed(2);
    document.getElementById('region_tax_sum').textContent = " $" + (parseFloat(getCookie('ANNUALREGIONALTAX')) || 0).toFixed(2);
    document.getElementById('subregion_tax_sum').textContent = " $" + (parseFloat(getCookie('ANNUALSUBREGIONALTAX')) || 0).toFixed(2);
    
    document.getElementById('SD').textContent = " $" + (parseFloat(getCookie('SD')) || 0).toFixed(2);
    document.getElementById('BPA').textContent = " $" + (parseFloat(getCookie('BPA')) || 0).toFixed(2);
    
    document.getElementById('annual_income_sum').textContent = " $" + (parseFloat(getCookie('ANNUALINCOME')) || 0).toFixed(2);
    document.getElementById('ANNUALEXPENSESUM').textContent = " $" + (parseFloat(getCookie('ANNUALEXPENSESUM')) || 0).toFixed(2);
    document.getElementById('cpp_sum').textContent = " $" + (parseFloat(getCookie('ANNUALCPP')) || 0).toFixed(2);
    document.getElementById('ANNUALEI').textContent = " $" + (parseFloat(getCookie('ANNUALEI')) || 0).toFixed(2);
    
    document.getElementById('HOUSING').textContent = " $" + (parseFloat(getCookie('HOUSING')) || 0).toFixed(2);
    document.getElementById('TRANSPORTATION').textContent = " $" + (parseFloat(getCookie('TRANSPORTATION')) || 0).toFixed(2);
    document.getElementById('DEPENDANT').textContent = " $" + (parseFloat(getCookie('DEPENDANT')) || 0).toFixed(2);
    document.getElementById('DEBT').textContent = " $" + (parseFloat(getCookie('DEBT')) || 0).toFixed(2);
    document.getElementById('DISCRETIONARY').textContent = " $" + (parseFloat(getCookie('DISCRETIONARY')) || 0).toFixed(2);
    document.getElementById('ESSENTIAL').textContent = " $" + (parseFloat(getCookie('ESSENTIAL')) || 0).toFixed(2);
    
    document.getElementById('annual_cpp_seresult').textContent = " $" + (parseFloat(getCookie('CPPPAYABLESELFEMPLOYED')) || 0).toFixed(2);
    document.getElementById('annual_cpp_eresult').textContent = " $" + (parseFloat(getCookie('CPPPAYABLEEMPLOYED')) || 0).toFixed(2);
    
    document.getElementById('TOTALMEDICARE').textContent = " $" + (parseFloat(getCookie('TOTALMEDICARE')) || 0).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITY').textContent = " $" + (parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITYE').textContent = " $" + (parseFloat(getCookie('TOTALSOCIALSECURITYE')) || 0).toFixed(2);
    document.getElementById('TOTALSOCIALSECURITYSE').textContent = " $" + (parseFloat(getCookie('TOTALSOCIALSECURITYSE')) || 0).toFixed(2);
    
    document.getElementById('TOTALTAXCG').textContent = " $" + (parseFloat(getCookie('TOTALTAXCG')) || 0).toFixed(2);
    
    document.getElementById('ASSETS').textContent = " $" + (parseFloat(getCookie('ASSETS')) || 0).toFixed(2);
    document.getElementById('LIABILITIES').textContent = " $" + (parseFloat(getCookie('LIABILITIES')) || 0).toFixed(2);
    
    document.getElementById('debtcheckbox').textContent = getCookie('debtcheckbox').trim() !== "" ? getCookie('debtcheckbox') : "";
    document.getElementById('dependantcheckbox').textContent = getCookie('dependantcheckbox').trim() !== "" ? getCookie('dependantcheckbox') : "";
    document.getElementById('romanticasset').textContent = getCookie('romanticasset').trim() !== "" ? getCookie('romanticasset') : "";
    document.getElementById('romanticexpense').textContent = getCookie('romanticexpense').trim() !== "" ? getCookie('romanticexpense') : "";
    document.getElementById('romanticincome').textContent = getCookie('romanticincome').trim() !== "" ? getCookie('romanticincome') : "";
    document.getElementById('romanticliability').textContent = getCookie('romanticliability').trim() !== "" ? getCookie('romanticliability') : "";
    
    let NETWORTH = (parseFloat(getCookie('ASSETS')) || 0) - (parseFloat(getCookie('LIABILITIES')) || 0);
    document.getElementById('NETWORTH').textContent = ' $' + NETWORTH.toFixed(2);
}

function calculateAnnualTax() {
    const regionValue = getCookie('RegionDropdown') || 'NONE';
    let annualTax = 0;

    const annualRegionalTax = Number(getCookie('ANNUALREGIONALTAX')) || 0;
    const annualSubregionalTax = Number(getCookie('ANNUALSUBREGIONALTAX')) || 0;

    if (regionValue === 'USA' || regionValue === 'CAN') {
        annualTax = annualRegionalTax + annualSubregionalTax;
    } else {
        console.warn('Region not recognized for tax calculation');
    }

    const annualTaxElement = document.getElementById('annualTax');
    if (annualTaxElement) {
        annualTaxElement.textContent = '$' + annualTax.toFixed(2);
    }

    return annualTax;
}

// Pie Chart (Expense Distribution)
document.addEventListener('DOMContentLoaded', function () {
    const cookieNames = ['ESSENTIAL', 'DEBT', 'DEPENDANT', 'DISCRETIONARY', 'HOUSING', 'TRANSPORTATION'];
    const data = cookieNames.map(name => parseFloat(getCookie(name)) || 0);

    const config = {
        type: 'pie',
        data: {
            labels: cookieNames,
            datasets: [{
                label: 'Expense Distribution',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)',
                    'rgb(165, 165, 165)',
                    'rgb(118, 118, 118)',
                    'rgb(101, 101, 101)',
                    'rgb(76, 76, 76)',
                    'rgb(63, 63, 63)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Expense Distribution' }
            }
        }
    };

    const myPieChart = new Chart(document.getElementById('myPieChart'), config);
});

// FIRERATIO
let FIRERATIO = parseFloat(getCookie('PASSIVEINCOME')) / parseFloat(getCookie('ANNUALEXPENSESUM')) || 0;

function colorChangeFIRE() {
    const FIRE = parseFloat(document.getElementById("FIRERATIO").textContent);
    const greatRange = 0.25;
    const okayMinRange = 0.10;
    const okayMaxRange = 0.25;

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
    document.getElementById('FIRERATIO').textContent = FIRERATIO.toFixed(2);
    colorChangeFIRE();
}

// SAVINGSTODEBT
let ASSETS = parseFloat(getCookie('ASSETS')) || 0;
let LIABILITIES = parseFloat(getCookie('LIABILITIES')) || 0;
let SAVINGSTODEBT = LIABILITIES === 0 ? NaN : ASSETS / LIABILITIES; // Avoid division by 0

function colorChangeSavingsToDebt(savingsToDebt) {
  if (isNaN(savingsToDebt)) return; // Skip coloring if NaN
  const greatRange = 2;
  const goodMinRange = 1;
  const goodMaxRange = 2;

  if (savingsToDebt >= greatRange) {
    document.getElementById("SAVINGSTODEBT").style.color = "green";
  } else if (savingsToDebt >= goodMinRange && savingsToDebt <= goodMaxRange) {
    document.getElementById("SAVINGSTODEBT").style.color = "orange";
  } else {
    document.getElementById("SAVINGSTODEBT").style.color = "red";
  }
}

// Display logic
if (isNaN(SAVINGSTODEBT)) {
  document.getElementById('SAVINGSTODEBT').textContent = 'Not Applicable';
} else {
  document.getElementById('SAVINGSTODEBT').textContent = SAVINGSTODEBT.toFixed(2);
  colorChangeSavingsToDebt(SAVINGSTODEBT);
}

// HOUSINGTOINCOME
let HOUSINGTOINCOME = parseFloat(getCookie('HOUSING')) / parseFloat(getCookie('ANNUALINCOME')) || 0;

function colorChangeHTI() {
    const hti = parseFloat(document.getElementById("HOUSINGTOINCOME").textContent);
    const greatRange = 0.25;
    const okayMinRange = 0.25;
    const okayMaxRange = 0.35;

    if (hti < greatRange) {
        document.getElementById("HOUSINGTOINCOME").style.color = "green";
    } else if (hti >= okayMinRange && hti <= okayMaxRange) {
        document.getElementById("HOUSINGTOINCOME").style.color = "orange";
    } else {
        document.getElementById("HOUSINGTOINCOME").style.color = "red";
    }
}

if (isNaN(HOUSINGTOINCOME)) {
    document.getElementById('HOUSINGTOINCOME').textContent = 'Not Applicable';
} else {
    document.getElementById('HOUSINGTOINCOME').textContent = HOUSINGTOINCOME.toFixed(2);
    colorChangeHTI();
}

// DEBTTOINCOME
let DEBTTOINCOME = parseFloat(getCookie('LIABILITIES')) / parseFloat(getCookie('ANNUALINCOME')) || 0;

function colorChangeDTI() {
    const debtToIncome = parseFloat(document.getElementById("DEBTTOINCOME").textContent);
    const greatRange = 0.20;
    const okayMinRange = 0.20;
    const okayMaxRange = 0.36;

    if (debtToIncome < greatRange) {
        document.getElementById("DEBTTOINCOME").style.color = "green";
    } else if (debtToIncome >= okayMinRange && debtToIncome <= okayMaxRange) {
        document.getElementById("DEBTTOINCOME").style.color = "orange";
    } else {
        document.getElementById("DEBTTOINCOME").style.color = "red";
    }
}

if (isNaN(DEBTTOINCOME) || !isFinite(DEBTTOINCOME)) {
    document.getElementById('DEBTTOINCOME').textContent = 'Not Applicable';
} else {
    document.getElementById('DEBTTOINCOME').textContent = DEBTTOINCOME.toFixed(2);
    colorChangeDTI();
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

        switch (selectedFrequency) {
            case 'annual':
                timeNeeded = parsedGoalAmount / DISPOSABLEINCOME;
                timeUnit = "Years";
                break;
            case 'monthly':
                timeNeeded = parsedGoalAmount / (DISPOSABLEINCOME / 12);
                timeUnit = "Months";
                break;
            case 'weekly':
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

        const disposableIncomeText = document.getElementById('DISPOSABLEINCOME').textContent;
        const DISPOSABLEINCOME = parseFloat(disposableIncomeText.replace(/[^0-9.]/g, ''));

        let revolvingDebtValue = getCookie('LIABILITIESNA');
        if (revolvingDebtValue && revolvingDebtValue !== '0' && !isNaN(parseFloat(revolvingDebtValue))) {
            let TIMETOPAYDEBT = parseFloat(revolvingDebtValue) / DISPOSABLEINCOME;
            if (DISPOSABLEINCOME <= 0) {
                timeToPayDebtElement.textContent = "RISK OF INSOLVENCY";
            } else {
                switch (frequencyDropdown.value) {
                    case 'annual':
                        break;
                    case 'monthly':
                        TIMETOPAYDEBT *= 12;
                        break;
                    case 'weekly':
                        TIMETOPAYDEBT *= 52;
                        break;
                }
                timeToPayDebtElement.textContent = TIMETOPAYDEBT.toFixed(2) + ' ' + frequencyText;
            }
        } else {
            timeToPayDebtElement.textContent = "Not Applicable";
        }
    }

    frequencyDropdown.addEventListener('change', updateFrequencyText);
    updateFrequencyText();
}

function calculateIncomeAfterTaxAndObligations() {
    let annualIncome = parseFloat(getCookie('ANNUALINCOME')) || 0;
    let annualTax = calculateAnnualTax();
    let annualGovernmentObligations = parseFloat(getCookie('ANNUALGOVERNMENTOBLIGATIONS')) || 0;
    let capitalGainsTax = getCookie('RegionDropdown') === 'USA' ? (parseFloat(getCookie('TOTALTAXCG')) || 0) : 0;

    return annualIncome - annualTax - annualGovernmentObligations - capitalGainsTax;
}

// Pie Chart (Income Erosion)
document.addEventListener('DOMContentLoaded', function () {
    let cookieNames = getCookie('RegionDropdown') === 'USA' 
        ? ['ANNUALEXPENSESUM', 'TOTALSOCIALSECURITY', 'TOTALMEDICARE', 'TOTALTAXCG']
        : ['ANNUALEXPENSESUM', 'ANNUALCPP', 'ANNUALEI'];

    let incomeAfterTaxAndObligations = calculateIncomeAfterTaxAndObligations();
    let annualTax = calculateAnnualTax();

    const newLabels = {
        'USA': ['Income After Deductions', 'Annual Expenses', 'Social Security', 'Medicare', 'Income Tax', 'Capital Gains Tax'],
        'CAN': ['Income After Deductions', 'Annual Expenses', 'CPP', 'EI', 'Income Tax']
    };

    let data = [];
    let labels = [];

    if (getCookie('RegionDropdown') === 'USA') {
        data = [
            incomeAfterTaxAndObligations,
            parseFloat(getCookie('ANNUALEXPENSESUM')) || 0,
            parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0,
            parseFloat(getCookie('TOTALMEDICARE')) || 0,
            annualTax,
            parseFloat(getCookie('TOTALTAXCG')) || 0
        ];
        labels = newLabels['USA'];
    } else {
        data = [
            incomeAfterTaxAndObligations,
            parseFloat(getCookie('ANNUALEXPENSESUM')) || 0,
            parseFloat(getCookie('ANNUALCPP')) || 0,
            parseFloat(getCookie('ANNUALEI')) || 0,
            annualTax
        ];
        labels = newLabels['CAN'];
    }

    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income Erosion Chart',
                data: data,
                backgroundColor: [
                    'rgba(143, 18, 45, 0.2)',
                    'rgba(17, 47, 128, 0.2)',
                    'rgba(14, 14, 14, 0.2)',
                    'rgba(14, 14, 14, 0.2)',
                    'rgba(14, 14, 14, 0.2)',
                    'rgba(14, 14, 14, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)',
                    'rgb(165, 165, 165)',
                    'rgb(118, 118, 118)',
                    'rgb(101, 101, 101)',
                    'rgb(76, 76, 76)',
                    'rgb(63, 63, 63)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Income Erosion Chart' }
            }
        }
    };

    const myPieChart = new Chart(document.getElementById('myPieChartTax'), config);
});

function updateOnChange() {
    const frequencySelect = document.getElementById('frequency');
    let multiplier = 1;

    switch (frequencySelect.value) {
        case 'monthly':
            multiplier = 1 / 12;
            break;
        case 'weekly':
            multiplier = 1 / 52;
            break;
    }

    function updateElementText(elementId, cookieName) {
        const element = document.getElementById(elementId);
        if (element) {
            let value = (parseFloat(getCookie(cookieName)) || 0) * multiplier;
            element.textContent = " $" + value.toFixed(2);
        }
    }

    function calculateAndUpdate(elementId, calculationFunction) {
        const element = document.getElementById(elementId);
        if (element) {
            let value = calculationFunction() * multiplier;
            element.textContent = " $" + value.toFixed(2);
        }
    }

    updateElementText('ANNUALTAXABLEINCOME', 'ANNUALTAXABLEINCOME');
    updateElementText('region_tax_sum', 'ANNUALREGIONALTAX');
    updateElementText('subregion_tax_sum', 'ANNUALSUBREGIONALTAX');
    updateElementText('TOTALTAXCG', 'TOTALTAXCG');
    updateElementText('annual_income_sum', 'ANNUALINCOME');
    updateElementText('ANNUALEXPENSESUM', 'ANNUALEXPENSESUM');
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

    calculateAndUpdate('DISPOSABLEINCOME', function () {
        if (getCookie('RegionDropdown') === 'USA') {
            return (parseFloat(getCookie('ANNUALINCOME')) || 0) -
                   (parseFloat(getCookie('ANNUALEXPENSESUM')) || 0) -
                   (parseFloat(getCookie('TOTALMEDICARE')) || 0) -
                   (parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0) -
                   calculateAnnualTax();
        } else if (getCookie('RegionDropdown') === 'CAN') {
            return (parseFloat(getCookie('ANNUALINCOME')) || 0) -
                   (parseFloat(getCookie('ANNUALEXPENSESUM')) || 0) -
                   (parseFloat(getCookie('ANNUALEI')) || 0) -
                   (parseFloat(getCookie('ANNUALCPP')) || 0) -
                   calculateAnnualTax();
        }
        return 0;
    });

    calculateAndUpdate('ANNUALGOVERNMENTOBLIGATIONS', function () {
        if (getCookie('RegionDropdown') === 'USA') {
            return (parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0) +
                   (parseFloat(getCookie('TOTALMEDICARE')) || 0);
        } else if (getCookie('RegionDropdown') === 'CAN') {
            return (parseFloat(getCookie('ANNUALCPP')) || 0) +
                   (parseFloat(getCookie('ANNUALEI')) || 0);
        }
        return 0;
    });

    calculateAndUpdate('annualTax', function () {
        const regionValue = getCookie('RegionDropdown') || 'NONE';
        let annualTax = 0;
        const annualRegionalTax = Number(getCookie('ANNUALREGIONALTAX')) || 0;
        const annualSubregionalTax = Number(getCookie('ANNUALSUBREGIONALTAX')) || 0;
        const annualCGTax = Number(getCookie('TOTALTAXCG')) || 0;

        if (regionValue === 'USA') {
            annualTax = annualRegionalTax + annualSubregionalTax + annualCGTax;
        } else if (regionValue === 'CAN') {
            annualTax = annualRegionalTax + annualSubregionalTax;
        } else {
            console.warn('Region not recognized for tax calculation');
        }
        return annualTax;
    });
}

// DOM Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    updateOnLoad();
    updateOnChange();
    document.getElementById('goalAmount').addEventListener('input', calculateGoal);

    colorChangeFIRE();
    colorChangeSavingsToDebt();
    colorChangeHTI();
    colorChangeDTI();
    timeToPay();
    calculateGoal();
    calculateIncomeAfterTaxAndObligations();
});

const frequencyDropdown = document.getElementById('frequency');
frequencyDropdown.addEventListener('change', function () {
    updateOnChange();
    colorChangeFIRE();
    colorChangeSavingsToDebt();
    colorChangeHTI();
    colorChangeDTI();
    timeToPay();
    calculateGoal();
});