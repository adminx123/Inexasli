/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { getLocal } from '/server/scripts/getlocal.js';
import { setCookie } from '/server/scripts/setcookie.js';
import { setLocal } from '/server/scripts/setlocal.js';

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
    setCookie("summary", Date.now(), 32);

    const paid = getLocal("authenticated");
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
            timeToPay(true);
        } else {
            timeToPay(false);
        }
        calculateGoal(isPaid);
    });

    const goalAmountInput = document.getElementById('goalAmount');
    if (goalAmountInput) {
        goalAmountInput.addEventListener('input', () => calculateGoal(isPaid));
    }

    // Add input event listeners for Taxes & Obligations
    const inputs = ['REGIONALTAXANNUAL', 'SUBREGIONTAXANNUAL', 'OTHERTAXANNUAL', 'OTHEROBLIGATIONANNUAL'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const value = input.value || '0';
                setLocal(id, value); // Store in local storage
                updateFreeContent(); // Update calculated fields

                const allInputsHaveValue = inputs.every(inputId => {
                    const value = document.getElementById(inputId)?.value;
                    return value && value.trim() !== '';
                });
            });
        }
    });

    // Show summary-container on generate button click
    document.querySelector('.generate-btn').addEventListener('click', function() {
        document.querySelector('.summary-container').style.display = 'block';
    });
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



    // Update calculated fields
    updateElement('TOTALTAXANNUAL', null, multiplier, calculateAnnualTax);

    // Net Worth (free) - No frequency adjustment
    updateElement('NETWORTH', null, 1, () => (parseFloat(getLocal('ASSETS')) || 0) - (parseFloat(getLocal('LIABILITIES')) || 0));
    updateElement('ASSETS', 'ASSETS', multiplier);
    updateElement('LIABILITIES', 'LIABILITIES', multiplier);

    // Other fields
    updateElement('ANNUALTAXABLEINCOME', 'ANNUALTAXABLEINCOME', multiplier);
    updateElement('SD', 'SD', multiplier, null, 'usa-hide');
    updateElement('BPA', 'BPA', multiplier, null, 'can-hide');
    const regionElement = document.getElementById('RegionDropdown');
    if (regionElement) {
        regionElement.textContent = getLocal('RegionDropdown').trim() !== "" ? getLocal('RegionDropdown') : "NONE";
    }
    const subregionElement = document.getElementById('SubregionDropdown');
    if (subregionElement) {
        subregionElement.textContent = getLocal('SubregionDropdown').trim() !== "" ? getLocal('SubregionDropdown') : "";
    }

    // Financial Projections (free)
    timeToPay(false);
    calculateGoal(false);

    // Charts
    updateExpensePieChart();
    updateIncomeErosionPieChart();
}

function unlockPremiumContent() {
    document.querySelectorAll('.premium-blur').forEach(el => {
        el.classList.remove('premium-blur');
        if (el.textContent === '[Locked]') {
            el.textContent = '';
        }
    });
    document.querySelectorAll('.premium-notice').forEach(el => el.style.display = 'none');
    const goalAmount = document.getElementById('goalAmount');
    if (goalAmount) goalAmount.disabled = false;
}

// Premium content update function
function updatePremiumContent() {
    const frequency = document.getElementById('frequency').value;
    const multiplier = getFrequencyMultiplier(frequency);

    updateElement('DISPOSABLEINCOME', null, multiplier, calculateDisposableIncome);

    const debtToIncome = (parseFloat(getLocal('LIABILITIES')) / parseFloat(getLocal('ANNUALINCOME')) || 0);
    document.getElementById('DEBTTOINCOME').textContent = isNaN(debtToIncome) || !isFinite(debtToIncome) ? 'Not Applicable' : debtToIncome.toFixed(2);
    colorChangeDTI();

    const housingToIncome = (parseFloat(getLocal('HOUSING')) / parseFloat(getLocal('ANNUALINCOME')) || 0);
    document.getElementById('HOUSINGTOINCOME').textContent = isNaN(housingToIncome) ? 'Not Applicable' : housingToIncome.toFixed(2);
    colorChangeHTI();

    const savingsToDebt = (parseFloat(getLocal('ASSETS')) / parseFloat(getLocal('LIABILITIES')) || 0);
    document.getElementById('SAVINGSTODEBT').textContent = isNaN(savingsToDebt) || !isFinite(savingsToDebt) ? 'Not Applicable' : savingsToDebt.toFixed(2);
    colorChangeSavingsToDebt(savingsToDebt);

    const fireRatio = (parseFloat(getLocal('PASSIVEINCOME')) / parseFloat(getLocal('ANNUALEXPENSESUM')) || 0);
    document.getElementById('FIRERATIO').textContent = isNaN(fireRatio) ? 'Not Applicable' : fireRatio.toFixed(2);
    colorChangeFIRE();

    timeToPay(true);
    calculateGoal(true);
}

// Helper function to update elements
function updateElement(elementId, cookieName, multiplier, calcFunction = null, regionClass = null) {
    const element = document.getElementById(elementId);
    if (element && (!regionClass || element.closest(`.${regionClass}`))) {
        const value = calcFunction ? calcFunction() : (parseFloat(getLocal(cookieName)) || 0);
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
    const income = parseFloat(getLocal('ANNUALINCOME')) || 0;
    const expenses = parseFloat(getLocal('ANNUALEXPENSESUM')) || 0;
    const regionalTax = parseFloat(getLocal('REGIONALTAXANNUAL')) || 0;
    const subregionalTax = parseFloat(getLocal('SUBREGIONTAXANNUAL')) || 0;
    const otherTax = parseFloat(getLocal('OTHERTAXANNUAL')) || 0;
    const obligations = parseFloat(getLocal('OTHEROBLIGATIONANNUAL')) || 0;

    return income - expenses - regionalTax - subregionalTax - otherTax - obligations;
}

// Calculate Annual Tax (free)
function calculateAnnualTax() {
    const regionalTax = parseFloat(getLocal('REGIONALTAXANNUAL')) || 0;
    const subregionalTax = parseFloat(getLocal('SUBREGIONTAXANNUAL')) || 0;
    const otherTax = parseFloat(getLocal('OTHERTAXANNUAL')) || 0;

    return regionalTax + subregionalTax + otherTax;
}

// Calculate Government Obligations (free)
function calculateGovernmentObligations() {
    return parseFloat(getLocal('OTHEROBLIGATIONANNUAL')) || 0;
}

// Expense Pie Chart (free)
function updateExpensePieChart() {
    const cookieNames = ['ESSENTIAL', 'DEBT', 'DEPENDANT', 'DISCRETIONARY', 'HOUSING', 'TRANSPORTATION'];
    const data = cookieNames.map(name => parseFloat(getLocal(name)) || 0);
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
    if (window.myPieChart && typeof window.myPieChart.destroy === 'function') {
        window.myPieChart.destroy();
    }
    window.myPieChart = new Chart(document.getElementById('myPieChart'), config);
}

// Income Erosion Pie Chart (premium)
function updateIncomeErosionPieChart() {
    const income = parseFloat(getLocal('ANNUALINCOME')) || 0;
    const expenses = parseFloat(getLocal('ANNUALEXPENSESUM')) || 0;
    const tax = calculateAnnualTax();
    const obligations = calculateGovernmentObligations();
    const disposable = calculateDisposableIncome();

    const data = [disposable, expenses, tax, obligations];
    const labels = ['Income After Deductions', 'Annual Expenses', 'Taxes', 'Obligations'];

    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income Erosion Chart',
                data: data,
                backgroundColor: [
                    'rgba(143, 18, 45, 0.2)', 'rgba(17, 47, 128, 0.2)', 
                    'rgba(14, 14, 14, 0.2)', 'rgba(14, 14, 14, 0.2)'
                ],
                borderColor: [
                    'rgb(194, 194, 194)', 'rgb(165, 165, 165)', 
                    'rgb(118, 118, 118)', 'rgb(101, 101, 101)'
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
        fire >= 1.0 ? "green" : fire >= 0.25 ? "orange" : "red";
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
        hti < 0.28 ? "green" : hti <= 0.35 ? "orange" : "red";
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
    const disposableIncome = isPaid ? calculateDisposableIncome() : (parseFloat(getLocal('ANNUALINCOME')) || 0) - (parseFloat(getLocal('ANNUALEXPENSESUM')) || 0);
    const revolvingDebt = parseFloat(getLocal('LIABILITIESNA')) || 0;

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
    const disposableIncome = isPaid ? calculateDisposableIncome() : (parseFloat(getLocal('ANNUALINCOME')) || 0) - (parseFloat(getLocal('ANNUALEXPENSESUM')) || 0);
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

document.getElementById('close-sidebar').addEventListener('click', function() {
    document.getElementById('subscribe-sidebar').style.display = 'none';
});