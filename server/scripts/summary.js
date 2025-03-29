/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 

import { getCookie } from '/server/scripts/getcookie.js';

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

// Core DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function () {
    const paid = getCookie("authenticated");
    const isPaid = paid === "paid";
    const currentPath = window.location.pathname;

    if (isPaid && currentPath !== "/budget/summary.html") {
        window.location.href = "/budget/summary.html";
        return;
    } else {
        document.body.style.display = 'block';
    }

    updateFreeContent();
    if (isPaid) {
        unlockPremiumContent();
        updatePremiumContent();
    }

    const frequencyDropdown = document.getElementById('frequency');
    frequencyDropdown.addEventListener('change', () => {
        updateFreeContent();
        if (isPaid) {
            updatePremiumContent();
            timeToPay(true); // Update revolving debt time for paid users
        } else {
            timeToPay(false); // Update revolving debt time for free users
        }
        calculateGoal(isPaid); // Update goal calculation
    });

    const goalAmountInput = document.getElementById('goalAmount');
    if (goalAmountInput) {
        goalAmountInput.addEventListener('input', () => calculateGoal(isPaid));
    }
});

// Free content update function
function updateFreeContent() {
    const frequency = document.getElementById('frequency').value;
    const multiplier = getFrequencyMultiplier(frequency);

    // Income & Expenses (free)
    updateElement('annual_income_sum', 'ANNUALINCOME', multiplier);
    updateElement('ANNUALEXPENSESUM', 'ANNUALEXPENSESUM', multiplier);
    updateElement('ESSENTIAL', 'ESSENTIAL', multiplier);
    updateElement('DISCRETIONARY', 'DISCRETIONARY', multiplier);
    updateElement('HOUSING', 'HOUSING', multiplier);
    updateElement('TRANSPORTATION', 'TRANSPORTATION', multiplier);
    updateElement('DEPENDANT', 'DEPENDANT', multiplier);
    updateElement('DEBT', 'DEBT', multiplier);

    // Taxes & Obligations (free)
    updateElement('annualTax', null, multiplier, calculateAnnualTax);
    updateElement('region_tax_sum', 'ANNUALREGIONALTAX', multiplier);
    updateElement('subregion_tax_sum', 'ANNUALSUBREGIONALTAX', multiplier);
    updateElement('TOTALTAXCG', 'TOTALTAXCG', multiplier, null, 'usa-hide');
    updateElement('ANNUALGOVERNMENTOBLIGATIONS', null, multiplier, calculateGovernmentObligations);
    updateElement('cpp_sum', 'ANNUALCPP', multiplier, null, 'can-hide');
    updateElement('ANNUALEI', 'ANNUALEI', multiplier, null, 'can-hide');
    updateElement('annual_cpp_seresult', 'CPPPAYABLESELFEMPLOYED', multiplier, null, 'can-hide');
    updateElement('annual_cpp_eresult', 'CPPPAYABLEEMPLOYED', multiplier, null, 'can-hide');
    updateElement('TOTALSOCIALSECURITY', 'TOTALSOCIALSECURITY', multiplier, null, 'usa-hide');
    updateElement('TOTALSOCIALSECURITYE', 'TOTALSOCIALSECURITYE', multiplier, null, 'usa-hide');
    updateElement('TOTALSOCIALSECURITYSE', 'TOTALSOCIALSECURITYSE', multiplier, null, 'usa-hide');
    updateElement('TOTALMEDICARE', 'TOTALMEDICARE', multiplier, null, 'usa-hide');

    // Net Worth (free) - No frequency adjustment
    updateElement('NETWORTH', null, 1, () => (parseFloat(getCookie('ASSETS')) || 0) - (parseFloat(getCookie('LIABILITIES')) || 0));
    updateElement('ASSETS', 'ASSETS', multiplier);
    updateElement('LIABILITIES', 'LIABILITIES', multiplier);

    // Financial Projections (free)
    timeToPay(false);
    calculateGoal(false);

    // Expense Pie Chart (free)
    updateExpensePieChart();
    // Income Erosion Pie Chart (premium)
    updateIncomeErosionPieChart();
}

// Unlock premium content
function unlockPremiumContent() {
    document.querySelectorAll('.premium-blur').forEach(el => el.classList.remove('premium-blur'));
    document.querySelectorAll('.premium-notice').forEach(el => el.style.display = 'none');
    const goalAmount = document.getElementById('goalAmount');
    if (goalAmount) goalAmount.disabled = false;
}

// Premium content update function
function updatePremiumContent() {
    const frequency = document.getElementById('frequency').value;
    const multiplier = getFrequencyMultiplier(frequency);

    // Disposable Income (premium)
    updateElement('DISPOSABLEINCOME', null, multiplier, calculateDisposableIncome);

    // Premium Subscribers (Ratios) - Only set once, not updated on frequency change
    const debtToIncome = (parseFloat(getCookie('LIABILITIES')) / parseFloat(getCookie('ANNUALINCOME')) || 0);
    document.getElementById('DEBTTOINCOME').textContent = isNaN(debtToIncome) || !isFinite(debtToIncome) ? 'Not Applicable' : debtToIncome.toFixed(2);
    colorChangeDTI();

    const housingToIncome = (parseFloat(getCookie('HOUSING')) / parseFloat(getCookie('ANNUALINCOME')) || 0);
    document.getElementById('HOUSINGTOINCOME').textContent = isNaN(housingToIncome) ? 'Not Applicable' : housingToIncome.toFixed(2);
    colorChangeHTI();

    const savingsToDebt = (parseFloat(getCookie('ASSETS')) / parseFloat(getCookie('LIABILITIES')) || 0);
    document.getElementById('SAVINGSTODEBT').textContent = isNaN(savingsToDebt) || !isFinite(savingsToDebt) ? 'Not Applicable' : savingsToDebt.toFixed(2);
    colorChangeSavingsToDebt(savingsToDebt);

    const fireRatio = (parseFloat(getCookie('PASSIVEINCOME')) / parseFloat(getCookie('ANNUALEXPENSESUM')) || 0);
    document.getElementById('FIRERATIO').textContent = isNaN(fireRatio) ? 'Not Applicable' : fireRatio.toFixed(2);
    colorChangeFIRE();

    // Financial Projections (premium)
    timeToPay(true);
    calculateGoal(true);

    
}

// Helper function to update elements
function updateElement(elementId, cookieName, multiplier, calcFunction = null, regionClass = null) {
    const element = document.getElementById(elementId);
    if (element && (!regionClass || element.closest(`.${regionClass}`))) {
        const value = calcFunction ? calcFunction() : (parseFloat(getCookie(cookieName)) || 0);
        element.textContent = '$' + (value * multiplier).toFixed(2);
    }
}

// Frequency multiplier
function getFrequencyMultiplier(frequency) {
    switch (frequency) {
        case 'monthly': return 1 / 12;
        case 'weekly': return 1 / 52;
        default: return 1; // annual
    }
}

// Calculate Disposable Income (premium)
function calculateDisposableIncome() {
    const region = getCookie('RegionDropdown');
    const income = parseFloat(getCookie('ANNUALINCOME')) || 0;
    const expenses = parseFloat(getCookie('ANNUALEXPENSESUM')) || 0;
    const tax = calculateAnnualTax();

    if (region === 'USA') {
        return income - expenses - (parseFloat(getCookie('TOTALMEDICARE')) || 0) - 
               (parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0) - tax - 
               (parseFloat(getCookie('TOTALTAXCG')) || 0);
    } else if (region === 'CAN') {
        return income - expenses - (parseFloat(getCookie('ANNUALEI')) || 0) - 
               (parseFloat(getCookie('ANNUALCPP')) || 0) - tax;
    }
    return 0;
}

// Calculate Annual Tax (free)
function calculateAnnualTax() {
    const region = getCookie('RegionDropdown') || 'NONE';
    const regionalTax = parseFloat(getCookie('ANNUALREGIONALTAX')) || 0;
    const subregionalTax = parseFloat(getCookie('ANNUALSUBREGIONALTAX')) || 0;
    const cgTax = region === 'USA' ? (parseFloat(getCookie('TOTALTAXCG')) || 0) : 0;

    if (region === 'USA' || region === 'CAN') {
        return regionalTax + subregionalTax + cgTax;
    }
    console.warn('Region not recognized for tax calculation');
    return 0;
}

// Calculate Government Obligations (free)
function calculateGovernmentObligations() {
    const region = getCookie('RegionDropdown');
    if (region === 'USA') {
        return (parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0) + 
               (parseFloat(getCookie('TOTALMEDICARE')) || 0);
    } else if (region === 'CAN') {
        return (parseFloat(getCookie('ANNUALCPP')) || 0) + 
               (parseFloat(getCookie('ANNUALEI')) || 0);
    }
    return 0;
}

// Expense Pie Chart (free)
function updateExpensePieChart() {
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
                    'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 
                    'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 
                    'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)', 'rgb(165, 165, 165)', 
                    'rgb(118, 118, 118)', 'rgb(101, 101, 101)', 
                    'rgb(76, 76, 76)', 'rgb(63, 63, 63)'
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
    // Only destroy if the chart exists
    if (window.myPieChart && typeof window.myPieChart.destroy === 'function') {
        window.myPieChart.destroy();
    }
    window.myPieChart = new Chart(document.getElementById('myPieChart'), config);
}

// Income Erosion Pie Chart (premium)
function updateIncomeErosionPieChart() {
    const region = getCookie('RegionDropdown');
    const income = parseFloat(getCookie('ANNUALINCOME')) || 0;
    const expenses = parseFloat(getCookie('ANNUALEXPENSESUM')) || 0;
    const tax = calculateAnnualTax();
    const disposable = calculateDisposableIncome();

    let data, labels;
    if (region === 'USA') {
        data = [
            disposable, expenses, 
            parseFloat(getCookie('TOTALSOCIALSECURITY')) || 0, 
            parseFloat(getCookie('TOTALMEDICARE')) || 0, 
            tax, parseFloat(getCookie('TOTALTAXCG')) || 0
        ];
        labels = ['Income After Deductions', 'Annual Expenses', 'Social Security', 'Medicare', 'Income Tax', 'Capital Gains Tax'];
    } else {
        data = [
            disposable, expenses, 
            parseFloat(getCookie('ANNUALCPP')) || 0, 
            parseFloat(getCookie('ANNUALEI')) || 0, 
            tax
        ];
        labels = ['Income After Deductions', 'Annual Expenses', 'CPP', 'EI', 'Income Tax'];
    }

    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income Erosion Chart',
                data: data,
                backgroundColor: [
                    'rgba(143, 18, 45, 0.2)', 'rgba(17, 47, 128, 0.2)', 
                    'rgba(14, 14, 14, 0.2)', 'rgba(14, 14, 14, 0.2)', 
                    'rgba(14, 14, 14, 0.2)', 'rgba(14, 14, 14, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)', 'rgb(165, 165, 165)', 
                    'rgb(118, 118, 118)', 'rgb(101, 101, 101)', 
                    'rgb(76, 76, 76)', 'rgb(63, 63, 63)'
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
    // Only destroy if the chart exists
    if (window.myPieChartTax && typeof window.myPieChartTax.destroy === 'function') {
        window.myPieChartTax.destroy();
    }
    window.myPieChartTax = new Chart(document.getElementById('myPieChartTax'), config);
}

// Color change functions (premium)
function colorChangeFIRE() {
    const fire = parseFloat(document.getElementById("FIRERATIO").textContent);
    if (isNaN(fire)) return;
    document.getElementById("FIRERATIO").style.color = 
        fire >= 0.25 ? "green" : fire >= 0.10 ? "orange" : "red";
}

function colorChangeSavingsToDebt(savingsToDebt) {
    if (isNaN(savingsToDebt)) return;
    document.getElementById("SAVINGSTODEBT").style.color = 
        savingsToDebt >= 2 ? "green" : savingsToDebt >= 1 ? "orange" : "red";
}

function colorChangeHTI() {
    const hti = parseFloat(document.getElementById("HOUSINGTOINCOME").textContent);
    if (isNaN(hti)) return;
    document.getElementById("HOUSINGTOINCOME").style.color = 
        hti < 0.25 ? "green" : hti <= 0.35 ? "orange" : "red";
}

function colorChangeDTI() {
    const dti = parseFloat(document.getElementById("DEBTTOINCOME").textContent);
    if (isNaN(dti)) return;
    document.getElementById("DEBTTOINCOME").style.color = 
        dti < 0.20 ? "green" : dti <= 0.36 ? "orange" : "red";
}

// Financial Projections (free with premium enhancement)
function timeToPay(isPaid) {
    const frequency = document.getElementById('frequency').value;
    const disposableIncome = isPaid ? calculateDisposableIncome() : (parseFloat(getCookie('ANNUALINCOME')) || 0) - (parseFloat(getCookie('ANNUALEXPENSESUM')) || 0);
    const revolvingDebt = parseFloat(getCookie('LIABILITIESNA')) || 0;

    let timeToPayDebt = document.getElementById('TIMETOPAYDEBT');
    if (!revolvingDebt || disposableIncome <= 0) {
        timeToPayDebt.textContent = disposableIncome <= 0 ? "RISK OF INSOLVENCY" : "Not Applicable";
    } else {
        let time = revolvingDebt / disposableIncome;
        let unit = 'Years';
        if (frequency === 'monthly') { time *= 12; unit = 'Months'; }
        else if (frequency === 'weekly') { time *= 52; unit = 'Weeks'; }
        timeToPayDebt.textContent = `${time.toFixed(2)} ${unit}`;
    }
}

function calculateGoal(isPaid) {
    const disposableIncome = isPaid ? calculateDisposableIncome() : (parseFloat(getCookie('ANNUALINCOME')) || 0) - (parseFloat(getCookie('ANNUALEXPENSESUM')) || 0);
    const goalAmount = parseFloat(document.getElementById('goalAmount').value) || 0;
    const frequency = document.getElementById('frequency').value;

    if (disposableIncome <= 0 || goalAmount <= 0) {
        document.getElementById('goalResult').textContent = '';
        return;
    }

    let time = goalAmount / disposableIncome;
    let unit = 'Years';
    if (frequency === 'monthly') { time *= 12; unit = 'Months'; }
    else if (frequency === 'weekly') { time *= 52; unit = 'Weeks'; }
    document.getElementById('goalResult').textContent = `${unit} needed: ${time.toFixed(2)}`;
}