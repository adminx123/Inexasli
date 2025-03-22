/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */

import { displayWarning, hideShowClass } from "./utils.js"
import { setCookie } from '/server/scripts/setcookie.js'; // Adjust path as needed
import { getCookie } from '/server/scripts/getcookie.js'; // Adjust path as needed




function getTermsCookie(name) {
    const now = Date.now()
    const status = JSON.parse(window.localStorage.getItem(name))

    if (status && now > status.time) {
        localStorage.removeItem(name)
        return false

    }

    if (status && status.accepted) {
        return true
    } else if (status && !status.accepted) {
        return false
    }

    return false



}
function setTermsCookie(name, value) {
    const date = new Date()
    window.localStorage.setItem(name, JSON.stringify({
        accepted: value,
        time: date.setTime(date.getTime() + 30 * 60 * 1000)
    }))
}

const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location')
    const location = document.location.pathname

    tab.addEventListener('click', (e) => {
        const checkbox1 = document.querySelector('#termscheckbox')
        const checkbox2 = document.querySelector('#notintended')

        const isChecked1 = getTermsCookie('term1')
        const isChecked2 = getTermsCookie('term2')

        if (!isChecked1 || !isChecked2) {
            e.preventDefault()
            alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contribtuions");
        }
    })


    if (location.includes(dataL)) {
        tab.removeAttribute('href')

        tab.classList.add('active')
    }
})


const checkbox1 = document.querySelector('#termscheckbox')
const checkbox2 = document.querySelector('#notintended')

checkbox1.addEventListener('click', () => {
    if (checkbox1.checked) {
        setTermsCookie('term1', true)
    } else {
        setTermsCookie('term1', false)

    }
})


checkbox2.addEventListener('click', () => {
    if (checkbox2.checked) {
        setTermsCookie('term2', true)
    } else {
        setTermsCookie('term2', false)
    }
})


window.addEventListener('DOMContentLoaded', () => {
    const checkbox1 = document.querySelector('#termscheckbox')
    const checkbox2 = document.querySelector('#notintended')


    const isChecked1 = getTermsCookie('term1')
    const isChecked2 = getTermsCookie('term2')

    // console.log(typeof isChecked1)
    // console.log(typeof isChecked2)

    if (isChecked1 == true) {
        checkbox1.checked = true
    }

    if (isChecked2 == true) {
        checkbox2.checked = true
    }


})


var ANNUALTAXABLEINCOME;
var ANNUALTAXABLEINCOMESUB;
var ANNUALREGIONALTAX;
var ANNUALSUBREGIONALTAX;
var TOTALTAXCG;

var ANNUALEMPLOYMENTINCOME;
var ANNUALINCOME;
var ANNUALCPP;
var CPPPAYABLESELFEMPLOYED;
var CPPPAYABLEEMPLOYED;
var ANNUALEI;
var BPA = 15705;
var SD = 14600;
var PASSIVEINCOME;
var TOTALMEDICARE;
var TOTALSOCIALSECURITY;
var TOTALSOCIALSECURITYSE;
var TOTALSOCIALSECURITYE;


document.addEventListener('DOMContentLoaded', function () {

    function handleRegionChange() {

        if (this.value === 'USA') {

            setCookie("RegionDropdown", this.value, 365)
            hideShowClass('usa-hide', 'show')

        } else if (this.value === 'CAN') {
            setCookie("RegionDropdown", this.value, 365)
            hideShowClass('usa-hide', 'hide')

        }

        const isIncomeUsa = getCookie('RegionDropdown') == 'USA'


        if (this.value === 'USA' || this.value === '' || this.value === "NONE" || isIncomeUsa) { // Check for USA or empty value
            hideShowClass('USAHIDE', 'show')

            // console.log('is block')
        } else {
            hideShowClass('USAHIDE', 'hide')
            // console.log('is none')
        }
    }

    function handleSubRegionChange() {
        setCookie('SubregionDropdown', document.getElementById('SubregionDropdown').value, 365)
    }
    // Call handleRegionChange function to handle initial state
    handleRegionChange.call(document.getElementById('RegionDropdown'));

    // Add event listener to the dropdown for change in value
    document.getElementById('RegionDropdown').addEventListener('change', handleRegionChange);
    document.getElementById('SubregionDropdown').addEventListener('change', handleSubRegionChange);
});



window.validatecheckbox = function () {
    var termscheckbox = document.getElementById("termscheckbox");
    var notintended = document.getElementById("notintended");
    var regionDropdown = document.getElementById("RegionDropdown");

    // Check if a valid region is selected
    if (regionDropdown.value === "" || regionDropdown.value === "NONE") {
        alert("Please select a region from the dropdown.");
        return;
    }

    // Check if checkboxes are checked
    if (termscheckbox.checked && notintended.checked) {
        // Perform calculations
        calculateNext();
    } else {
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contribtuions");
    }
}



const regionDropdown = document.getElementById("RegionDropdown");
const subregionDropdown = document.getElementById("SubregionDropdown");

const subregionMap = {
    CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
};

function updateSubregionDropdown() {
    const selectedRegion = regionDropdown.value;

    subregionDropdown.innerHTML = ""; // Clear existing options

    if (selectedRegion in subregionMap) {
        subregionMap[selectedRegion].forEach(subregionCode => {
            const subregionOption = document.createElement("option");
            subregionOption.text = subregionCode;
            subregionOption.value = subregionCode;
            subregionDropdown.appendChild(subregionOption);
        });
    }

}

regionDropdown.addEventListener("change", updateSubregionDropdown);

function calculateAnnual(inputId, frequency) { // Change frequencyId to frequency
    let input = parseFloat(document.getElementById(inputId).value) || 0;

    if (inputId === 'income_sole_prop') {
        console.log('we are here');
        const calculatedFromWorksheet = getCookie("calculated_from_worksheet");

        if (calculatedFromWorksheet === true) {
            const totalRevenue = getCookie("totalRevenue");
            console.log(totalRevenue);
            console.log('calculatedFromWorksheet');

            if (totalRevenue && totalRevenue !== 'annually' && !isNaN(parseFloat(totalRevenue))) {
                if (input != totalRevenue) {
                    console.log(input);
                    input = parseFloat(totalRevenue);
                    console.log('changed to', input);
                }
            }
        }
    }

    switch (frequency) {
        case 'annually':
            return input;
        case 'quarterly':
            return input * 4;
        case 'monthly':
            return input * 12;
        case 'weekly':
            return input * 52;
        default:
            return 0;
    }
}



function calculateNormalizedSum() {
    // Define all income fields with their corresponding frequency fields
    const incomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'],
        ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency'],
        ['income_sole_prop', 'income_sole_prop_frequency'],
        ['income_investment_property', 'income_investment_property_frequency'],
        ['income_capital_gains_losses', 'income_capital_gains_losses_frequency'],
        ['income_interest', 'income_interest_frequency'],
        ['income_owner_dividend', 'income_owner_dividend_frequency'],
        ['income_public_dividend', 'income_public_dividend_frequency'],
        ['income_trust', 'income_trust_frequency'],
        ['income_federal_pension', 'income_federal_pension_frequency'],
        ['income_work_pension', 'income_work_pension_frequency'],
        ['income_social_security', 'income_social_security_frequency'],
        ['income_employment_insurance', 'income_employment_insurance_frequency'],
        ['income_alimony', 'income_alimony_frequency'],
        ['income_scholarships_grants', 'income_scholarships_grants_frequency'],
        ['income_royalties', 'income_royalties_frequency'],
        ['income_gambling_winnings', 'income_gambling_winnings_frequency'], // This is included here
        ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
        ['income_venture_capital', 'income_venture_capital_frequency'],
        ['income_tax_free_income', 'income_tax_free_income_frequency']
    ];

    let annualIncomeSum = 0;

    incomeFields.forEach(field => {
        const [inputId, frequencyGroupId] = field;
        const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
        const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually'; // Default to annually if none checked
        annualIncomeSum += calculateAnnual(inputId, frequency);
    });

    ANNUALINCOME = annualIncomeSum;

    let annualTaxableSum = annualIncomeSum;

    incomeFields.forEach(field => {
        const [inputId, frequencyGroupId] = field;
        const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
        const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
        let income = calculateAnnual(inputId, frequency);

        // Exclude gambling winnings for Canada
        if (document.getElementById('RegionDropdown').value === 'CAN' && inputId === 'income_gambling_winnings') {
            annualTaxableSum -= income; // Exclude from taxable sum for Canada
            return; // Skip this iteration for Canada
        }

        // Exclude tax-free income
        if (inputId === 'income_tax_free_income') {
            annualTaxableSum -= income; // Exclude from taxable sum
            return; // Skip this iteration for tax-free income
        }

        // Handle capital gains/losses based on region
        if (inputId === 'income_capital_gains_losses') {
            if (document.getElementById('RegionDropdown').value === 'CAN') {
                annualTaxableSum -= income * 0.5; // Only half are taxable in Canada
            } else if (document.getElementById('RegionDropdown').value !== 'USA') {
                // For non-USA regions (excluding Canada), you might want to handle differently if needed
                annualTaxableSum -= income; // Assuming not taxable in other regions
            }
            // For USA, no adjustment needed here since capital gains are included by default in annualIncomeSum
        }

        // Exclude alimony from taxable income for USA
        if (document.getElementById('RegionDropdown').value === 'USA' && inputId === 'income_alimony') {
            annualTaxableSum -= income; // Exclude alimony from taxable income
            return; // Skip this iteration for USA alimony
        }
    });

    // Get the subregion-specific BPA or SD
    const subregion = document.getElementById('SubregionDropdown').value;
    const bpaOrSD = getBPAorSD(subregion);

    // Calculate ANNUALTAXABLEINCOMESUB (before federal deductions)
    ANNUALTAXABLEINCOMESUB = Math.max(annualTaxableSum - bpaOrSD, 0);

    // Apply standard deduction for USA or BPA for other regions
    if (document.getElementById('RegionDropdown').value === 'USA') {
        annualTaxableSum -= SD;
    } else {
        annualTaxableSum -= BPA;
    }

    // Ensure result is not less than 0
    annualTaxableSum = Math.max(annualTaxableSum, 0);

    // Set ANNUALTAXABLEINCOME
    ANNUALTAXABLEINCOME = annualTaxableSum;

    // Display the results
    document.getElementById('annual_income_sum').textContent = `$${annualIncomeSum.toFixed(2)}`;
    document.getElementById('taxable_sum').textContent = `$${ANNUALTAXABLEINCOME.toFixed(2)}`;
}

function getBPAorSD(subregion) {

    /* Usage would be like this:
const subregion = document.getElementById('SubregionDropdown').value;
const bpaOrSD = getBPAorSD(subregion);
*/

    const amount = {
        // Canadian provinces
        'AB': 21003, 'BC': 12580, 'MB': 11132, 'NB': 12644, 'NL': 10382,
        'NS': 11481, 'ON': 12399, 'PE': 13500, 'QC': 18056, 'SK': 18491,
        'NT': 17373, 'NU': 18718, 'YT': 15705,

        // American states
        'AL': 3000, 'AK': 0, 'AZ': 12750, 'AR': 2270, 'CA': 4700,
        'CO': 12750, 'CT': 15000, 'DC': 12750, 'DE': 3250, 'FL': 0,
        'GA': 3000, 'HI': 2200, 'ID': 12760, 'IL': 2325, 'IN': 1000,
        'IA': 2180, 'KS': 3500, 'KY': 0, 'LA': 4500, 'ME': 12750,
        'MD': 2200, 'MA': 4400, 'MI': 4750, 'MN': 12750, 'MS': 2300,
        'MO': 12750, 'MT': 5000, 'NC': 10000, 'ND': 4200, 'NH': 0,
        'NJ': 1000, 'NM': 12750, 'NY': 8000, 'NE': 7300, 'NV': 0,
        'OH': 2400, 'OK': 1000, 'OR': 2315, 'PA': 0, 'RI': 8500,
        'SC': 4010, 'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0,
        'VA': 8000, 'VT': 4350, 'WV': 0, 'WA': 0, 'WI': 11150,
        'WY': 0
    };

    // Check if the subregion matches any key in the amount object
    if (subregion in amount) {
        return amount[subregion];
    } else {
        // If the subregion isn't found, return a default value or handle the error
        console.error("Subregion not found:", subregion);
        return 0; // Default or error handling
    }
}




function calculateEmploymentIncome() {
    const employmentIncomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'],
        ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency']
    ];
    let annualEmploymentIncome = 0;

    employmentIncomeFields.forEach(field => {
        const [inputId, frequencyGroupId] = field;
        const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
        const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
        annualEmploymentIncome += calculateAnnual(inputId, frequency);
    });

    ANNUALEMPLOYMENTINCOME = annualEmploymentIncome;
    document.getElementById('ANNUALEMPLOYMENTINCOME').textContent = `$${ANNUALEMPLOYMENTINCOME.toFixed(2)}`;
}

function getCppPayable() {
    var annualIncomeSelfEmployed = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');

    // Define CPP rates and maximums
    var cppRateEmployed = 0.0595;
    var cppRateSelfEmployed = 0.1190;
    var cppMaxEmployed = 4034.10;
    var cppMaxEmployer = 8068.20;
    var cppExemptionAmount = 3500;

    // Calculate left over contribution room employed
    var LCR;
    if (ANNUALEMPLOYMENTINCOME <= cppExemptionAmount) {
        LCR = cppMaxEmployed;
    } else {
        LCR = cppMaxEmployed - ((ANNUALEMPLOYMENTINCOME - cppExemptionAmount) * cppRateEmployed);
    }

    // Calculate left over exemption amount
    var LEA;
    if ((ANNUALEMPLOYMENTINCOME - cppExemptionAmount) <= 0) {
        LEA = Math.abs(ANNUALEMPLOYMENTINCOME - cppExemptionAmount);
    } else {
        LEA = 0;
    }

    // Calculate CPP payable for employed
    var cppPayableEmployed;
    if (ANNUALEMPLOYMENTINCOME <= cppExemptionAmount) {
        cppPayableEmployed = 0;
    } else {
        cppPayableEmployed = (ANNUALEMPLOYMENTINCOME - cppExemptionAmount) * cppRateEmployed;
    }

    // Check if cppPayableEmployed exceeds cppMaxEmployed
    if (cppPayableEmployed > cppMaxEmployed) {
        cppPayableEmployed = cppMaxEmployed;
    }

    // Calculate CPP payable for self-employed individuals
    var cppPayableSelfEmployed;
    if (LCR <= 0) {
        cppPayableSelfEmployed = 0;
    } else {
        // Ensure non-negative income after LEA subtraction
        var adjustedIncome = Math.max(annualIncomeSelfEmployed - LEA, 0);
        cppPayableSelfEmployed = adjustedIncome * cppRateSelfEmployed;

        // Check if cppPayableSelfEmployed exceeds LCR
        if (cppPayableSelfEmployed > LCR) {
            cppPayableSelfEmployed = LCR * 2;
        }
    }

    ANNUALCPP = cppPayableEmployed + cppPayableSelfEmployed;
    CPPPAYABLEEMPLOYED = cppPayableEmployed;
    CPPPAYABLESELFEMPLOYED = cppPayableSelfEmployed;

    // Display the results
    document.getElementById('ANNUALCPP').textContent = '$' + (ANNUALCPP).toFixed(2);
    document.getElementById('annual_cpp_eresult').textContent = '$' + (cppPayableEmployed).toFixed(2);
    document.getElementById('annual_cpp_seresult').textContent = '$' + (cppPayableSelfEmployed).toFixed(2);
}


function getEIPayable() {
    const employmentIncomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'],
        ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency']
    ];

    const selfEmploymentIncomeField = ['income_sole_prop', 'income_sole_prop_frequency'];

    // Calculate normalized annual employment income
    var annualEmployedIncome = 0;

    employmentIncomeFields.forEach(function (incomeField) {
        var annualIncome = calculateAnnual(incomeField[0], incomeField[1]);
        annualEmployedIncome += annualIncome;
    });

    // Calculate normalized annual self-employment income
    var annualSelfEmployedIncome = calculateAnnual(selfEmploymentIncomeField[0], selfEmploymentIncomeField[1]);

    // Define EI rates and maximums
    var eiRateEmployed = 0.0164;
    var eiRateSelfEmployed = 0.0164;
    var eiEmployeePremiumMax = 1077.48;
    var eiEmployerPremiumMax = 1508.47;

    // Calculate EI payable for employed and self-employed individuals
    var eiPayableEmployed = Math.min(eiEmployeePremiumMax, annualEmployedIncome * eiRateEmployed);
    var eiPayableSelfEmployed = Math.min(eiEmployerPremiumMax, annualSelfEmployedIncome * eiRateSelfEmployed);

    ANNUALEI = eiPayableEmployed + eiPayableSelfEmployed;

    // Display the results
    document.getElementById('ANNUALEI').textContent = '$' + ANNUALEI.toFixed(2);
}

function getSocialSecurity() {
    // Normalize annual employment income
    const annualSalaryWages = calculateAnnual('income_salary_wages', 'income_salary_wages_frequency');
    const annualTips = calculateAnnual('income_tips', 'income_tips_frequency');
    const annualBonuses = calculateAnnual('income_bonuses', 'income_bonuses_frequency');
    const annualEmployedIncome = annualSalaryWages + annualTips + annualBonuses;

    // Normalize annual self-employment income
    const annualSoleProp = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    const annualSelfEmployedIncome = annualSoleProp;

    // Total normalized annual income
    const totalAnnualIncome = annualEmployedIncome + annualSelfEmployedIncome;

    // Social Security tax rate and maximum taxable earnings
    const socialSecurityRate = 0.0765; // 6.2%
    const socialSecurityMaxTaxable = 176100; // Maximum taxable earnings for Social Security

    // Calculate Social Security tax for employed income (up to the maximum taxable earnings)
    let employmentSocialSecurityTax = Math.min(annualEmployedIncome, socialSecurityMaxTaxable) * socialSecurityRate;

    // Calculate Social Security tax for self-employed income (up to the maximum taxable earnings)
    let selfEmploymentSocialSecurityTax = Math.min(annualSelfEmployedIncome * 0.9235, socialSecurityMaxTaxable) * socialSecurityRate * 2;

    // Total US equivalent Social Security tax
    let totalSocialSecurityTax = employmentSocialSecurityTax + selfEmploymentSocialSecurityTax;

    // Total US equivalent tax
    TOTALSOCIALSECURITY = totalSocialSecurityTax;
    TOTALSOCIALSECURITYSE = selfEmploymentSocialSecurityTax;
    TOTALSOCIALSECURITYE = employmentSocialSecurityTax;


    // Update the DOM element with the calculated value
    document.getElementById('TOTALSOCIALSECURITY').textContent = '$' + TOTALSOCIALSECURITY.toFixed(2);
}



function getMedicare() {
    // Normalize annual employment income
    const annualSalaryWages = calculateAnnual('income_salary_wages', 'income_salary_wages_frequency');
    const annualTips = calculateAnnual('income_tips', 'income_tips_frequency');
    const annualBonuses = calculateAnnual('income_bonuses', 'income_bonuses_frequency');
    const annualEmployedIncome = annualSalaryWages + annualTips + annualBonuses;

    // Normalize annual self-employment income
    const annualSoleProp = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    const annualSelfEmployedIncome = annualSoleProp;

    // Total normalized annual income
    const totalAnnualIncome = annualEmployedIncome + annualSelfEmployedIncome;

    // Medicare tax rates and thresholds
    const medicareRate = 0.0145; // 1.45% for employee portion
    const medicareSelfEmploymentRate = 0.029; // 2.9% for self-employed (employee + employer)
    const medicareAdditionalRate = 0.009; // Additional 0.9% for high earners
    const medicareThreshold = 200000; // Threshold for additional Medicare tax

    // Initialize total Medicare tax
    let totalMedicareTax = 0;

    // Calculate Medicare tax for employed income (1.45% - employee portion)
    let employmentMedicareTax = annualEmployedIncome * medicareRate;

    // Calculate Medicare tax for self-employed income (2.9% - employee + employer portion)
    let selfEmploymentMedicareTax = annualSelfEmployedIncome * medicareSelfEmploymentRate;

    // Combine both taxes
    totalMedicareTax = employmentMedicareTax + selfEmploymentMedicareTax;

    // If total income exceeds the Medicare threshold, apply the additional 0.9%
    if (totalAnnualIncome > medicareThreshold) {
        totalMedicareTax += (totalAnnualIncome - medicareThreshold) * medicareAdditionalRate;
    }

    // Total US equivalent Medicare tax
    TOTALMEDICARE = totalMedicareTax;

    // Update the DOM element with the calculated value
    document.getElementById('TOTALMEDICARE').textContent = '$' + TOTALMEDICARE.toFixed(2);
}



// Define the federal tax brackets for Canada for 2025
const REGIONALTAXBRACKETSCAN = [
    { limit: 57375, rate: 0.15 },   // on the portion of taxable income that is $57,375 or less, plus
    { limit: 114750, rate: 0.205 }, // on the portion of taxable income over $57,375 up to $114,750, plus
    { limit: 177882, rate: 0.26 },  // on the portion of taxable income over $114,750 up to $177,882, plus
    { limit: 253414, rate: 0.29 },  // on the portion of taxable income over $177,882 up to $253,414, plus
    { limit: 0, rate: 0.33 }        // on the portion of taxable income over $253,414
];


// Define the federal tax brackets for USA for 2025
const REGIONALTAXBRACKETSUSA = [
    { limit: 250525, rate: 0.35 },  // on the portion of taxable income over $250,525
    { limit: 197300, rate: 0.32 },  // on the portion of taxable income over $197,300 up to $250,525
    { limit: 103350, rate: 0.24 },  // on the portion of taxable income over $103,350 up to $197,300
    { limit: 48475, rate: 0.22 },   // on the portion of taxable income over $48,475 up to $103,350
    { limit: 11925, rate: 0.12 },   // on the portion of taxable income over $11,925 up to $48,475
    { limit: 0, rate: 0.10 }        // on the portion of taxable income that is $11,925 or less
];

// Define the SUBREGIONAL tax brackets
const SUBREGIONALTAXBRACKETS = {
    //Canada Provinces
    'AB': [
        { limit: 151234, rate: 0.10 }, // on the portion of taxable income that is $151,234 or less, plus
        { limit: 181481, rate: 0.12 }, // on the portion of taxable income over $151,234 up to $181,481, plus
        { limit: 241974, rate: 0.13 }, // on the portion of taxable income over $181,481 up to $241,974, plus
        { limit: 362961, rate: 0.14 }, // on the portion of taxable income over $241,974 up to $362,961, plus
        { limit: 0, rate: 0.15 }       // on the portion of taxable income over $362,961
    ],

    'BC': [
        { limit: 49279, rate: 0.0506 }, // on the portion of taxable income that is $49,279 or less, plus
        { limit: 98560, rate: 0.077 },  // on the portion of taxable income over $49,279 up to $98,560, plus
        { limit: 113158, rate: 0.105 }, // on the portion of taxable income over $98,560 up to $113,158, plus
        { limit: 137407, rate: 0.1229 },// on the portion of taxable income over $113,158 up to $137,407, plus
        { limit: 186306, rate: 0.147 }, // on the portion of taxable income over $137,407 up to $186,306, plus
        { limit: 259829, rate: 0.168 }, // on the portion of taxable income over $186,306 up to $259,829, plus
        { limit: 0, rate: 0.205 }       // on the portion of taxable income over $259,829
    ],

    'MB': [
        { limit: 47564, rate: 0.108 },  // on the portion of taxable income that is $47,564 or less, plus
        { limit: 101200, rate: 0.1275 },// on the portion of taxable income over $47,564 up to $101,200, plus
        { limit: 0, rate: 0.174 }       // on the portion of taxable income over $101,200
    ],

    'NB': [
        { limit: 51306, rate: 0.094 },  // on the portion of taxable income that is $51,306 or less, plus
        { limit: 102614, rate: 0.14 },  // on the portion of taxable income over $51,306 up to $102,614, plus
        { limit: 190060, rate: 0.16 },  // on the portion of taxable income over $102,614 up to $190,060, plus
        { limit: 0, rate: 0.195 }       // on the portion of taxable income over $190,060
    ],

    'NL': [
        { limit: 44192, rate: 0.087 },  // on the portion of taxable income that is $44,192 or less, plus
        { limit: 88382, rate: 0.145 },  // on the portion of taxable income over $44,192 up to $88,382, plus
        { limit: 157792, rate: 0.158 }, // on the portion of taxable income over $88,382 up to $157,792, plus
        { limit: 220910, rate: 0.178 }, // on the portion of taxable income over $157,792 up to $220,910, plus
        { limit: 282214, rate: 0.198 }, // on the portion of taxable income over $220,910 up to $282,214, plus
        { limit: 564429, rate: 0.208 }, // on the portion of taxable income over $282,214 up to $564,429, plus
        { limit: 1128858, rate: 0.213 },// on the portion of taxable income over $564,429 up to $1,128,858, plus
        { limit: 0, rate: 0.218 }       // on the portion of taxable income over $1,128,858
    ],

    'NT': [
        { limit: 51964, rate: 0.059 },  // on the portion of taxable income that is $51,964 or less, plus
        { limit: 103930, rate: 0.086 }, // on the portion of taxable income over $51,964 up to $103,930, plus
        { limit: 168967, rate: 0.122 }, // on the portion of taxable income over $103,930 up to $168,967, plus
        { limit: 0, rate: 0.1405 }      // on the portion of taxable income over $168,967
    ],

    'NS': [
        { limit: 30507, rate: 0.0879 }, // on the portion of taxable income that is $30,507 or less, plus
        { limit: 61015, rate: 0.1495 }, // on the portion of taxable income over $30,507 up to $61,015, plus
        { limit: 95883, rate: 0.1667 }, // on the portion of taxable income over $61,015 up to $95,883, plus
        { limit: 154650, rate: 0.175 }, // on the portion of taxable income over $95,883 up to $154,650, plus
        { limit: 0, rate: 0.21 }        // on the portion of taxable income over $154,650
    ],

    'NU': [
        { limit: 54707, rate: 0.04 },   // on the portion of taxable income that is $54,707 or less, plus
        { limit: 109413, rate: 0.07 },  // on the portion of taxable income over $54,707 up to $109,413, plus
        { limit: 177881, rate: 0.09 },  // on the portion of taxable income over $109,413 up to $177,881, plus
        { limit: 0, rate: 0.115 }       // on the portion of taxable income over $177,881
    ],

    'ON': [
        { limit: 52886, rate: 0.0505 }, // on the portion of taxable income that is $52,886 or less, plus
        { limit: 105775, rate: 0.0915 },// on the portion of taxable income over $52,886 up to $105,775, plus
        { limit: 150000, rate: 0.1116 },// on the portion of taxable income over $105,775 up to $150,000, plus
        { limit: 220000, rate: 0.1216 },// on the portion of taxable income over $150,000 up to $220,000, plus
        { limit: 0, rate: 0.1316 }      // on the portion of taxable income over $220,000
    ],

    'PE': [
        { limit: 33328, rate: 0.095 },  // on the portion of taxable income that is $33,328 or less, plus
        { limit: 64656, rate: 0.1347 }, // on the portion of taxable income over $33,328 up to $64,656, plus
        { limit: 105000, rate: 0.166 }, // on the portion of taxable income over $64,656 up to $105,000, plus
        { limit: 140000, rate: 0.1762 },// on the portion of taxable income over $105,000 up to $140,000, plus
        { limit: 0, rate: 0.19 }        // on the portion of taxable income over $140,000
    ],

    'QC': [
        // See Revenu Québec's income tax rates for specific brackets and rates
    ],

    'SK': [
        { limit: 53463, rate: 0.105 },  // on the portion of taxable income that is $53,463 or less, plus
        { limit: 152750, rate: 0.125 }, // on the portion of taxable income over $53,463 up to $152,750, plus
        { limit: 0, rate: 0.145 }       // on the portion of taxable income over $152,750
    ],

    'YT': [
        { limit: 57375, rate: 0.064 },  // on the portion of taxable income that is $57,375 or less, plus
        { limit: 114750, rate: 0.09 },  // on the portion of taxable income over $57,375 up to $114,750, plus
        { limit: 177882, rate: 0.109 }, // on the portion of taxable income over $114,750 up to $177,882, plus
        { limit: 500000, rate: 0.128 }, // on the portion of taxable income over $177,882 up to $500,000, plus
        { limit: 0, rate: 0.15 }        // on the portion of taxable income over $500,000
    ],

    //US STATES
    // US STATES

    "AL": [
        { "limit": 3000, "rate": 0.05 }, // No change
        { "limit": 500, "rate": 0.04 },  // No change
        { "limit": 0, "rate": 0.02 }     // No change
    ],

    "AK": [],
    // No state income tax

    "AZ": [
        { "limit": 0, "rate": 0.025 }    // No change, flat rate
    ],

    "AR": [
        { "limit": 8500, "rate": 0.049 }, // No change
        { "limit": 4300, "rate": 0.04 },  // No change
        { "limit": 0, "rate": 0.02 }      // No change
    ],

    "CA": [
        { "limit": 1162000, "rate": 0.133 }, // Increased from 1000000 due to inflation adjustment
        { "limit": 788800, "rate": 0.123 },  // Increased from 677275
        { "limit": 473300, "rate": 0.113 },  // Increased from 406364
        { "limit": 394000, "rate": 0.103 },  // Increased from 338639
        { "limit": 77000, "rate": 0.093 },   // Increased from 66295
        { "limit": 61000, "rate": 0.08 },    // Increased from 52455
        { "limit": 44000, "rate": 0.06 },    // Increased from 37788
        { "limit": 27800, "rate": 0.04 },    // Increased from 23942
        { "limit": 11700, "rate": 0.02 },    // Increased from 10099
        { "limit": 0, "rate": 0.01 }
    ],

    "CO": [
        { "limit": 0, "rate": 0.044 }    // No change, flat rate
    ],

    "CT": [
        { "limit": 500000, "rate": 0.0699 }, // No change
        { "limit": 250000, "rate": 0.069 },  // No change
        { "limit": 200000, "rate": 0.065 },  // No change
        { "limit": 100000, "rate": 0.06 },   // No change
        { "limit": 50000, "rate": 0.055 },   // No change
        { "limit": 10000, "rate": 0.05 },    // No change
        { "limit": 0, "rate": 0.03 }
    ],

    "DC": [
        { "limit": 1000000, "rate": 0.1075 }, // No change
        { "limit": 500000, "rate": 0.0975 },  // No change
        { "limit": 250000, "rate": 0.0925 },  // No change
        { "limit": 60000, "rate": 0.085 },    // No change
        { "limit": 40000, "rate": 0.065 },    // No change
        { "limit": 10000, "rate": 0.06 },     // No change
        { "limit": 0, "rate": 0.04 }
    ],

    "DE": [
        { "limit": 60000, "rate": 0.066 }, // No change
        { "limit": 25000, "rate": 0.0555 }, // No change
        { "limit": 20000, "rate": 0.052 },  // No change
        { "limit": 10000, "rate": 0.048 },  // No change
        { "limit": 5000, "rate": 0.039 },   // No change
        { "limit": 2000, "rate": 0.022 }
    ],

    "FL": [],
    // No state income tax

    "GA": [
        { "limit": 7000, "rate": 0.0575 }, // No change
        { "limit": 5250, "rate": 0.05 },   // No change
        { "limit": 3750, "rate": 0.04 },   // No change
        { "limit": 2250, "rate": 0.03 },   // No change
        { "limit": 750, "rate": 0.02 },    // No change
        { "limit": 0, "rate": 0.01 }
    ],

    "HI": [
        { "limit": 325000, "rate": 0.11 }, // Increased from 200000, brackets widened
        { "limit": 280000, "rate": 0.1 },  // Increased from 175000
        { "limit": 240000, "rate": 0.09 }, // Increased from 150000
        { "limit": 77000, "rate": 0.0825 },// Increased from 48000
        { "limit": 58000, "rate": 0.079 }, // Increased from 36000
        { "limit": 39000, "rate": 0.076 }, // Increased from 24000
        { "limit": 31000, "rate": 0.072 }, // Increased from 19200
        { "limit": 23000, "rate": 0.068 }, // Increased from 14400
        { "limit": 15000, "rate": 0.064 }, // Increased from 9600
        { "limit": 7700, "rate": 0.055 },  // Increased from 4800
        { "limit": 3900, "rate": 0.032 },  // Increased from 2400
        { "limit": 0, "rate": 0.014 }
    ],

    "ID": [
        { "limit": 0, "rate": 0.058 }    // No change, flat rate
    ],

    "IL": [
        { "limit": 0, "rate": 0.0495 }    // No change, flat rate
    ],

    "IN": [
        { "limit": 0, "rate": 0.030 }     // Reduced from 0.0315 to 0.03
    ],

    "IA": [
        { "limit": 75000, "rate": 0.06 },  // No change, moving towards flat rate in future years
        { "limit": 30000, "rate": 0.057 }, // No change
        { "limit": 6000, "rate": 0.0482 }, // No change
        { "limit": 0, "rate": 0.044 }
    ],

    "KS": [
        { "limit": 30000, "rate": 0.057 }, // No change
        { "limit": 15000, "rate": 0.0525 },// No change
        { "limit": 0, "rate": 0.031 }
    ],

    "KY": [
        { "limit": 0, "rate": 0.040 }     // Reduced from 0.045 to 0.04
    ],

    "LA": [
        { "limit": 50000, "rate": 0.030 }, // Reduced from 0.0425 to 0.03, new flat rate
    ],

    "ME": [
        { "limit": 58050, "rate": 0.0715 }, // No change
        { "limit": 24500, "rate": 0.0675 }, // No change
        { "limit": 0, "rate": 0.058 }
    ],

    "MD": [
        { "limit": 250000, "rate": 0.0575 }, // No change
        { "limit": 150000, "rate": 0.055 },  // No change
        { "limit": 125000, "rate": 0.0525 }, // No change
        { "limit": 100000, "rate": 0.05 },   // No change
        { "limit": 3000, "rate": 0.0475 },   // No change
        { "limit": 2000, "rate": 0.04 },     // No change
        { "limit": 1000, "rate": 0.03 },     // No change
        { "limit": 0, "rate": 0.02 }
    ],

    "MA": [
        { "limit": 1000000, "rate": 0.09 }, // No change
        { "limit": 0, "rate": 0.05 }        // No change
    ],

    "MI": [
        { "limit": 0, "rate": 0.0405 }     // Reduced from 0.0425 to 0.0405
    ],

    "MN": [
        { "limit": 183340, "rate": 0.0985 }, // No change
        { "limit": 98760, "rate": 0.0785 },  // No change
        { "limit": 30070, "rate": 0.068 },   // No change
        { "limit": 0, "rate": 0.0535 }
    ],

    "MS": [
        { "limit": 10000, "rate": 0.044 }  // Reduced from 0.05 to 0.044
    ],

    "MO": [
        { "limit": 7847, "rate": 0.0495 }, // No change
        { "limit": 6726, "rate": 0.045 },  // No change
        { "limit": 5605, "rate": 0.04 },   // No change
        { "limit": 4484, "rate": 0.035 },  // No change
        { "limit": 3363, "rate": 0.03 },   // No change
        { "limit": 2242, "rate": 0.025 },  // No change
        { "limit": 1121, "rate": 0.02 }
    ],

    "MT": [
        { "limit": 21600, "rate": 0.0675 }, // No change
        { "limit": 16800, "rate": 0.06 },   // No change
        { "limit": 13000, "rate": 0.05 },   // No change
        { "limit": 9700, "rate": 0.04 },    // No change
        { "limit": 6300, "rate": 0.03 },    // No change
        { "limit": 3600, "rate": 0.02 },    // No change
        { "limit": 0, "rate": 0.01 }
    ],

    "NC": [
        { "limit": 0, "rate": 0.045 }     // Reduced from 0.0475 to 0.045
    ],

    "ND": [
        { "limit": 458350, "rate": 0.029 }, // No change
        { "limit": 210825, "rate": 0.0264 },// No change
        { "limit": 101050, "rate": 0.0227 },// No change
        { "limit": 41775, "rate": 0.0204 }, // No change
        { "limit": 0, "rate": 0.011 }
    ],

    "NH": [],
    // Interest and dividends tax repealed

    "NJ": [
        { "limit": 1000000, "rate": 0.1075 }, // No change
        { "limit": 500000, "rate": 0.0897 },  // No change
        { "limit": 75000, "rate": 0.0637 },   // No change
        { "limit": 40000, "rate": 0.05525 },  // No change
        { "limit": 35000, "rate": 0.035 },    // No change
        { "limit": 20000, "rate": 0.0175 },   // No change
        { "limit": 0, "rate": 0.014 }
    ],

    "NM": [
        { "limit": 210000, "rate": 0.059 }, // No change
        { "limit": 16000, "rate": 0.049 },  // No change
        { "limit": 11000, "rate": 0.047 },  // No change
        { "limit": 5500, "rate": 0.032 },   // No change
        { "limit": 0, "rate": 0.017 }
    ],

    "NY": [
        { "limit": 25000000, "rate": 0.109 }, // No change
        { "limit": 5000000, "rate": 0.103 },  // No change
        { "limit": 1077550, "rate": 0.0965 }, // No change
        { "limit": 215400, "rate": 0.0685 },  // No change
        { "limit": 80650, "rate": 0.06 },     // No change
        { "limit": 13900, "rate": 0.055 },    // No change
        { "limit": 11700, "rate": 0.0525 },   // No change
        { "limit": 8500, "rate": 0.045 },     // No change
        { "limit": 0, "rate": 0.04 }
    ],

    "NE": [
        { "limit": 35730, "rate": 0.0664 }, // No change
        { "limit": 22170, "rate": 0.0501 }, // No change
        { "limit": 3700, "rate": 0.0351 },  // No change
        { "limit": 0, "rate": 0.0246 }
    ],

    "NV": [],
    // No state income tax

    "OH": [
        { "limit": 115300, "rate": 0.0399 }, // No change
        { "limit": 92150, "rate": 0.03688 }, // No change
        { "limit": 46100, "rate": 0.03226 }, // No change
        { "limit": 26050, "rate": 0.02765 }
    ],

    "OK": [
        { "limit": 7200, "rate": 0.0475 }, // No change
        { "limit": 4900, "rate": 0.0375 }, // No change
        { "limit": 3750, "rate": 0.0275 }, // No change
        { "limit": 2500, "rate": 0.0175 }, // No change
        { "limit": 1000, "rate": 0.0075 }, // No change
        { "limit": 0, "rate": 0.0025 }
    ],

    "OR": [
        { "limit": 125000, "rate": 0.099 }, // No change
        { "limit": 10200, "rate": 0.0875 }, // No change
        { "limit": 4050, "rate": 0.0675 },  // No change
        { "limit": 0, "rate": 0.0475 }
    ],

    "PA": [
        { "limit": 0, "rate": 0.0307 }     // No change, flat rate
    ],

    "RI": [
        { "limit": 155050, "rate": 0.0599 }, // No change
        { "limit": 68200, "rate": 0.0475 },  // No change
        { "limit": 0, "rate": 0.0375 }
    ],

    "SC": [
        { "limit": 16040, "rate": 0.064 }, // Reduced from 0.065 to 0.064
        { "limit": 3200, "rate": 0.03 },   // No change
        { "limit": 0, "rate": 0.00 }
    ],

    "SD": [],
    // No state income tax

    "TN": [],
    // No state income tax

    "TX": [],
    // No state income tax

    "UT": [
        { "limit": 0, "rate": 0.0465 }     // Reduced from 0.0485 to 0.0465
    ],

    "VA": [
        { "limit": 17000, "rate": 0.0575 }, // No change
        { "limit": 5000, "rate": 0.05 },    // No change
        { "limit": 3000, "rate": 0.03 },    // No change
        { "limit": 0, "rate": 0.02 }
    ],

    "VT": [
        { "limit": 213150, "rate": 0.0875 }, // No change
        { "limit": 102200, "rate": 0.076 },  // No change
        { "limit": 42150, "rate": 0.066 },   // No change
        { "limit": 0, "rate": 0.0335 }
    ],

    "WV": [
        { "limit": 60000, "rate": 0.065 }, // No change
        { "limit": 40000, "rate": 0.06 },  // No change
        { "limit": 25000, "rate": 0.045 }, // No change
        { "limit": 10000, "rate": 0.04 },  // No change
        { "limit": 0, "rate": 0.03 }
    ],

    "WA": [],
    // No state income tax

    "WI": [
        { "limit": 304170, "rate": 0.0765 }, // No change
        { "limit": 27630, "rate": 0.053 },   // No change
        { "limit": 13810, "rate": 0.0465 },  // No change
        { "limit": 0, "rate": 0.0354 }
    ],

    "WY": []
    // No state income tax
};



function calculateTax(taxBrackets) {
    let tax = 0;
    let taxableIncome = ANNUALTAXABLEINCOME;

    // Sort brackets in ascending order of limit (if not already sorted)
    taxBrackets.sort((a, b) => a.limit - b.limit);

    let previousLimit = 0; // Track the lower limit of the current bracket

    for (const bracket of taxBrackets) {
        if (taxableIncome > previousLimit) {
            // Calculate the portion of income in this bracket
            let bracketIncome = Math.min(taxableIncome, bracket.limit) - previousLimit;
            // Apply the tax rate to this portion
            let bracketTax = bracketIncome * bracket.rate;
            tax += parseFloat(bracketTax.toFixed(2)); // Round to two decimal places and add to total tax
            // Update the previous limit for the next bracket
            previousLimit = bracket.limit;
        }
    }

    return tax;
}

function calculateTaxSub(taxBrackets) {
    let tax = 0;
    let taxableIncome = ANNUALTAXABLEINCOMESUB;

    // Sort brackets in ascending order of limit (if not already sorted)
    taxBrackets.sort((a, b) => a.limit - b.limit);

    let previousLimit = 0; // Track the lower limit of the current bracket

    for (const bracket of taxBrackets) {
        if (taxableIncome > previousLimit) {
            // Calculate the portion of income in this bracket
            let bracketIncome = Math.min(taxableIncome, bracket.limit) - previousLimit;
            // Apply the tax rate to this portion
            let bracketTax = bracketIncome * bracket.rate;
            tax += parseFloat(bracketTax.toFixed(2)); // Round to two decimal places and add to total tax
            // Update the previous limit for the next bracket
            previousLimit = bracket.limit;
        }
    }

    return tax;
}

// Function to calculate regional tax based on selected region
function calculateRegionalTax() {
    var regionDropdown = document.getElementById("RegionDropdown");
    let selectedRegion = regionDropdown.value;
    let taxBrackets = selectedRegion === "CAN" ? REGIONALTAXBRACKETSCAN : REGIONALTAXBRACKETSUSA;

    ANNUALREGIONALTAX = calculateTax(taxBrackets);

    document.getElementById('ANNUALREGIONALTAX').textContent = '$' + ANNUALREGIONALTAX.toFixed(2);
}

// Assuming you have an event listener for the dropdown change, if not, you might want to add one:
document.getElementById("RegionDropdown").addEventListener('change', calculateRegionalTax);


// Define the calculateSubregionalTax function
function calculateSubregionalTax(Subregion, taxBrackets) {
    ANNUALSUBREGIONALTAX = calculateTaxSub(taxBrackets[Subregion]);
    document.getElementById('ANNUALSUBREGIONALTAX').textContent = '$' + (ANNUALSUBREGIONALTAX).toFixed(2);
}



function calculateCapitalGainsTax() {



    // Get user inputs
    const capitalGain = calculateAnnual('income_capital_gains_losses', 'income_capital_gains_losses_frequency');

    // Calculate annual income sum
    let annualIncomeSum = 0;
    calculateNormalizedSum(); // This function call updates ANNUALINCOME
    annualIncomeSum = ANNUALINCOME; // Assuming ANNUALINCOME is globally accessible after being set by calculateNormalizedSum

    const stateRateInput = document.getElementById('income_capital_gain_state_rate').value;
    let stateRate = 0;

    // Check if state rate input is empty or 0, then set state rate to 0
    if (stateRateInput !== '' && parseFloat(stateRateInput) !== 0) {
        stateRate = parseFloat(stateRateInput) / 100;
    }

    // Determine federal capital gains tax rate based on total income
    let federalRate;
    if (annualIncomeSum <= 48350) { // 2025 single filer threshold for 0% rate
        federalRate = 0;
    } else if (annualIncomeSum <= 533400) { // 2025 single filer threshold for 15% rate
        federalRate = 0.15;
    } else {
        federalRate = 0.20;
    }

    // Calculate federal capital gains tax
    const federalTaxCG = capitalGain * federalRate;

    // Calculate state capital gains tax
    const stateTaxCG = capitalGain * stateRate;

    // Display the result
    const totalTaxCG = federalTaxCG + stateTaxCG;
    TOTALTAXCG = totalTaxCG;

    document.getElementById('TOTALTAXCG').textContent = '$' + (TOTALTAXCG).toFixed(2);
}









function passiveincome() {
    const fireFields = [
        ['income_investment_property', 'income_investment_property_frequency'],
        ['income_interest', 'income_interest_frequency'],
        ['income_public_dividend', 'income_public_dividend_frequency'],
        ['income_trust', 'income_trust_frequency'],
        ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
        ['income_royalties', 'income_royalties_frequency'],
    ];

    let income = 0;

    for (const [incomeField, frequencyField] of fireFields) {
        const incomeValue = calculateAnnual(incomeField, frequencyField);
        income += incomeValue;
    }

    PASSIVEINCOME = income;
}






document.querySelector('#ROI_MODAL_OPEN').addEventListener('click', () => {
    document.querySelector('#ROI-modal').style.display = 'block'
    // 

    const tooltips = document.querySelectorAll(".tooltip");

    tooltips.forEach(tooltip => {
        tooltip.classList.add("show");
    })
})



document.addEventListener('DOMContentLoaded', function () {
    // List of form element IDs you want to set based on cookies
    const formElements = [
        'RegionDropdown', 'SubregionDropdown',
        'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop', 
        'income_investment_property', 'income_capital_gains_losses', 'income_interest', 
        'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension', 
        'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony', 
        'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending', 
        'income_venture_capital', 'income_tax_free_income',
        
    ];

 // Get elements
 const regionDropdown = document.getElementById('RegionDropdown');
 const subregionDropdown = document.getElementById('SubregionDropdown');

 // Set RegionDropdown first
 const regionValue = getCookie('RegionDropdown');
 regionDropdown.value = regionValue; // 'NONE', 'CAN', or 'USA'

 // Populate SubregionDropdown options based on RegionDropdown
 updateSubregionDropdown(); // Ensure options are available

 // Set all other form elements, including SubregionDropdown
 formElements.forEach(function (elementId) {
     if (elementId !== 'RegionDropdown') { // Already set
         const value = getCookie(elementId);
         const element = document.getElementById(elementId);
         if (element) {
             element.value = value;
         }
     }
 });

 // Adjust SubregionDropdown if invalid
 const subregionValue = subregionDropdown.value;
 if (regionValue === 'USA' && subregionMap.USA && !subregionMap.USA.includes(subregionValue)) {
     subregionDropdown.value = subregionMap.USA[0]; // e.g., 'AL'
 } else if (regionValue === 'CAN' && subregionMap.CAN && !subregionMap.CAN.includes(subregionValue)) {
     subregionDropdown.value = subregionMap.CAN[0]; // e.g., 'AB'
 }

 // Ensure initial state is handled
 handleRegionChange.call(regionDropdown);
});


function handleUSAResident() {
    var regionDropdown = document.getElementById('RegionDropdown').value; // Assuming 'RegionDropdown' is the ID of your dropdown element
    if (regionDropdown === "USA") {
        calculateCapitalGainsTax();
        getMedicare();
        getSocialSecurity();
    }
}




window.calculateNext = function () {
    calculateAll();
    window.location.href = './expense.html';
}

window.calculateAll = function () {
    calculateNormalizedSum();
    calculateRegionalTax();
    const SubregionDropdown = document.getElementById('SubregionDropdown');
    const Subregion = SubregionDropdown.value;
    calculateSubregionalTax(Subregion, SUBREGIONALTAXBRACKETS);
    calculateEmploymentIncome();
    getCppPayable();
    getEIPayable();
    passiveincome();
    handleUSAResident();

    // Helper function to get the checked frequency value
    function getCheckedFrequency(id) {
        const checkedCheckbox = document.querySelector(`#${id} input[type="checkbox"]:checked`);
        return checkedCheckbox ? checkedCheckbox.value : "0";
    }


    // Income fields (unchanged)
    setCookie("income_salary_wages", document.getElementById("income_salary_wages").value.trim() !== "" ? document.getElementById("income_salary_wages").value : "0", 365);
    setCookie("income_tips", document.getElementById("income_tips").value.trim() !== "" ? document.getElementById("income_tips").value : "0", 365);
    setCookie("income_bonuses", document.getElementById("income_bonuses").value.trim() !== "" ? document.getElementById("income_bonuses").value : "0", 365);
    setCookie("income_sole_prop", document.getElementById("income_sole_prop").value.trim() !== "" ? document.getElementById("income_sole_prop").value : "0", 365);
    setCookie("income_investment_property", document.getElementById("income_investment_property").value.trim() !== "" ? document.getElementById("income_investment_property").value : "0", 365);
    setCookie("income_capital_gains_losses", document.getElementById("income_capital_gains_losses").value.trim() !== "" ? document.getElementById("income_capital_gains_losses").value : "0", 365);
    setCookie("income_interest", document.getElementById("income_interest").value.trim() !== "" ? document.getElementById("income_interest").value : "0", 365);
    setCookie("income_owner_dividend", document.getElementById("income_owner_dividend").value.trim() !== "" ? document.getElementById("income_owner_dividend").value : "0", 365);
    setCookie("income_public_dividend", document.getElementById("income_public_dividend").value.trim() !== "" ? document.getElementById("income_public_dividend").value : "0", 365);
    setCookie("income_trust", document.getElementById("income_trust").value.trim() !== "" ? document.getElementById("income_trust").value : "0", 365);
    setCookie("income_federal_pension", document.getElementById("income_federal_pension").value.trim() !== "" ? document.getElementById("income_federal_pension").value : "0", 365);
    setCookie("income_work_pension", document.getElementById("income_work_pension").value.trim() !== "" ? document.getElementById("income_work_pension").value : "0", 365);
    setCookie("income_social_security", document.getElementById("income_social_security").value.trim() !== "" ? document.getElementById("income_social_security").value : "0", 365);
    setCookie("income_employment_insurance", document.getElementById("income_employment_insurance").value.trim() !== "" ? document.getElementById("income_employment_insurance").value : "0", 365);
    setCookie("income_alimony", document.getElementById("income_alimony").value.trim() !== "" ? document.getElementById("income_alimony").value : "0", 365);
    setCookie("income_scholarships_grants", document.getElementById("income_scholarships_grants").value.trim() !== "" ? document.getElementById("income_scholarships_grants").value : "0", 365);
    setCookie("income_royalties", document.getElementById("income_royalties").value.trim() !== "" ? document.getElementById("income_royalties").value : "0", 365);
    setCookie("income_gambling_winnings", document.getElementById("income_gambling_winnings").value.trim() !== "" ? document.getElementById("income_gambling_winnings").value : "0", 365);
    setCookie("income_peer_to_peer_lending", document.getElementById("income_peer_to_peer_lending").value.trim() !== "" ? document.getElementById("income_peer_to_peer_lending").value : "0", 365);
    setCookie("income_venture_capital", document.getElementById("income_venture_capital").value.trim() !== "" ? document.getElementById("income_venture_capital").value : "0", 365);
    setCookie("income_tax_free_income", document.getElementById("income_tax_free_income").value.trim() !== "" ? document.getElementById("income_tax_free_income").value : "0", 365);

    // Existing setCookie calls (unchanged)
    const regionDropdown = document.getElementById("RegionDropdown");
    const subregionDropdown = document.getElementById("SubregionDropdown");
    setCookie("RegionDropdown", regionDropdown.value, 365);
    setCookie("SubregionDropdown", subregionDropdown.value, 365);

    setCookie("ANNUALINCOME", ANNUALINCOME, 365);
    setCookie("ANNUALEMPLOYMENTINCOME", ANNUALEMPLOYMENTINCOME, 365);
    setCookie("PASSIVEINCOME", PASSIVEINCOME, 365);
    setCookie("BPA", BPA, 365);
    setCookie("SD", SD, 365);
    setCookie("ANNUALTAXABLEINCOME", ANNUALTAXABLEINCOME, 365);
    setCookie("ANNUALREGIONALTAX", ANNUALREGIONALTAX, 365);
    setCookie("ANNUALSUBREGIONALTAX", ANNUALSUBREGIONALTAX, 365);
    setCookie("ANNUALCPP", ANNUALCPP, 365);
    setCookie("CPPPAYABLEEMPLOYED", CPPPAYABLEEMPLOYED, 365);
    setCookie("CPPPAYABLESELFEMPLOYED", CPPPAYABLESELFEMPLOYED, 365);
    setCookie("ANNUALEI", ANNUALEI, 365);
    setCookie("TOTALTAXCG", TOTALTAXCG, 365);
    setCookie("TOTALMEDICARE", TOTALMEDICARE, 365);
    setCookie("TOTALSOCIALSECURITY", TOTALSOCIALSECURITY, 365);
    setCookie("TOTALSOCIALSECURITYE", TOTALSOCIALSECURITYE, 365);
    setCookie("TOTALSOCIALSECURITYSE", TOTALSOCIALSECURITYSE, 365);
};





window.addEventListener("message", (event) => {
    if (event.data === "close-modal") {
        // console.log('message recieved')
        document.querySelector("#ROI-modal").style.display = "none";

        const selfEmploymentIncomeField =
            document.querySelector("#income_sole_prop");
        const totalRevenue = getCookie("totalRevenue");
        const paid = getCookie("authenticated") == "paid";

        //   console.log(selfEmploymentIncomeField);
        //   console.log(totalRevenue);
        //   console.log(paid);

        if (totalRevenue && totalRevenue != "annually" && totalRevenue != "") {
            if (paid) {
                selfEmploymentIncomeField.value = totalRevenue;
                setCookie("income_sole_prop", totalRevenue, 365);
                selfEmploymentIncomeField.placeholder = "";
                //   console.log('everything done since user paid')
            } else {
                selfEmploymentIncomeField.value = "";
                //   setCookie("income_sole_prop", totalRevenue, 365);

                setCookie("calculated_from_worksheet", true, 365);
                selfEmploymentIncomeField.placeholder = "payment required";
                //   console.log('everything postponsed since user not paid')
            }
        }

        return;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const paid = getCookie("authenticated") == "paid";
    const calculatedFromWorksheet = getCookie("calculated_from_worksheet");

    if (calculatedFromWorksheet == 'true' && paid) {
        const totalRevenue = getCookie("totalRevenue");
        const selfEmploymentIncomeField =
            document.querySelector("#income_sole_prop");

        selfEmploymentIncomeField.value = totalRevenue;
        setCookie("income_sole_prop", totalRevenue, 365);
        setCookie('calculated_from_worksheet', 'resolved', 365)
        selfEmploymentIncomeField.placeholder = "";
        //   console.log('now user has paid and everything is finally resolved')
    } else if (calculatedFromWorksheet == 'true' && !paid) {
        const selfEmploymentIncomeField =
            document.querySelector("#income_sole_prop");

        selfEmploymentIncomeField.placeholder = "payment required";
        //   selfEmploymentIncomeField.value = ''
        //   console.log('user has still not paid so everything is still postponsed')
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const romanticincomeCookie = getCookie('romanticincome');


    if (romanticincomeCookie === 'checked') {

        displayWarning("You have indicated that you share one or more sources of income. Include only your portion of personal income here.");
    }
});

import { overwriteCookies } from '/server/scripts/cookieoverwrite.js'; // Adjust path as needed

document.addEventListener('DOMContentLoaded', () => {
    const overwriteLink = document.getElementById('cookie-overwrite-link');
    if (overwriteLink) {
        overwriteLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior
            overwriteCookies(); // Call the function to overwrite cookies
        });
    }
});



document.addEventListener('DOMContentLoaded', () => {
    console.log('Total checkbox groups found:', document.querySelectorAll('.checkbox-button-group').length);
  
    document.querySelectorAll('.checkbox-button-group').forEach((group, index) => {
        try {
            console.log(`Processing group ${index + 1}: ${group.id || 'no-id'}`);
  
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            if (!checkboxes.length) {
                console.warn(`No checkboxes found in group ${group.id || 'no-id'}`);
                return;
            }
  
            // Single-selection logic with save
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    try {
                        if (this.checked) {
                            checkboxes.forEach(cb => {
                                if (cb !== this) cb.checked = false;
                            });
                            // Fix: Use .checkboxrow instead of .row
                            const input = group.closest('.checkboxrow').querySelector('input[type="number"]');
                            const inputId = input ? input.id : null;
                            if (inputId && typeof calculateAnnual === 'function') {
                                calculateAnnual(inputId, this.value);
                            }
                            setCookie(`frequency_${group.id}`, this.value, 365);
                            console.log(`Saved ${this.value} to cookie for ${group.id}`);
                        }
                    } catch (error) {
                        console.error(`Error in checkbox change for ${group.id}:`, error);
                    }
                });
            });
  
            // Load saved selection or default to "annually"
            const savedFrequency = getCookie(`frequency_${group.id}`);
            const checkboxToCheck = group.querySelector(`input[value="${savedFrequency}"]`) || 
                                   group.querySelector('input[value="annually"]');
            if (checkboxToCheck) {
                checkboxes.forEach(cb => {
                    if (cb !== checkboxToCheck) cb.checked = false;
                });
                checkboxToCheck.checked = true;
                console.log(`Set ${checkboxToCheck.value} as checked for ${group.id} (saved: ${savedFrequency})`);
  
                // Fix: Use .checkboxrow instead of .row here too
                const input = group.closest('.checkboxrow').querySelector('input[type="number"]');
                const inputId = input ? input.id : null;
                if (inputId && typeof calculateAnnual === 'function') {
                    calculateAnnual(inputId, checkboxToCheck.value);
                }
            } else {
                console.warn(`No valid checkbox for saved value '${savedFrequency}' in ${group.id}`);
            }
        } catch (error) {
            console.error(`Error processing group ${group.id || 'no-id'}:`, error);
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const interactiveElements = document.querySelectorAll(
      ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
    );
  
    // Initialize tooltip content for .checkboxrow
    const tooltips = document.querySelectorAll(".checkboxrow .tooltip");
    tooltips.forEach((tooltip) => {
      const content = tooltip.querySelector(".tooltip-content");
      const message = tooltip.getAttribute("data-tooltip");
      content.textContent = message;
    });
  
    interactiveElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        const row = element.closest(".checkboxrow");
        const tooltip = row.querySelector(".tooltip");
        const content = tooltip ? tooltip.querySelector(".tooltip-content") : null;
  
        document.querySelectorAll(".checkboxrow").forEach(r => {
          r.classList.remove("active");
          const otherTooltip = r.querySelector(".tooltip");
          if (otherTooltip) otherTooltip.classList.remove("show");
        });
  
        row.classList.add("active");
  
        if (tooltip && content) {
          tooltip.classList.add("show");
          const contentRect = content.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
  
          if (contentRect.left < 0) {
            content.style.left = '0';
            content.style.transform = 'translateX(0)';
          } else if (contentRect.right > viewportWidth) {
            content.style.left = '100%';
            content.style.transform = 'translateX(-100%)';
          } else {
            content.style.left = '50%';
            content.style.transform = 'translateX(-50%)';
          }
        }
  
        e.stopPropagation();
      });
    });
  
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".checkboxrow")) {
        document.querySelectorAll(".checkboxrow").forEach(r => {
          r.classList.remove("active");
          const tooltip = r.querySelector(".tooltip");
          if (tooltip) tooltip.classList.remove("show");
        });
      }
    });
  });