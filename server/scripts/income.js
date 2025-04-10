/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */

import { setLocal } from '/server/scripts/setlocal.js'; // Adjust path as needed
import { getLocal } from '/server/scripts/getlocal.js'; // Adjust path as needed




function getTermsCookie(name) {
    const now = Date.now();
    const status = JSON.parse(window.localStorage.getItem(name));

    if (status && now > status.time) {
        localStorage.removeItem(name);
        return false;
    }

    return status ? status.accepted : false;
}

function setTermsCookie(name, value) {
    const date = new Date();
    window.localStorage.setItem(name, JSON.stringify({
        accepted: value,
        time: date.setTime(date.getTime() + 30 * 60 * 1000)
    }));
}

const tabs = document.querySelectorAll('.tab');
const checkbox1 = document.querySelector('#termscheckbox');
const checkbox2 = document.querySelector('#notintended');

function handleCheckboxChange() {
    setTermsCookie('term1', checkbox1.checked);
    setTermsCookie('term2', checkbox2.checked);
}

function handleTabClick(e) {
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');

    if (!isChecked1 || !isChecked2) {
        e.preventDefault();
        alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
    }
}

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    tab.addEventListener('click', handleTabClick);

    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

checkbox1.addEventListener('click', handleCheckboxChange);
checkbox2.addEventListener('click', handleCheckboxChange);

window.addEventListener('DOMContentLoaded', () => {
    const isChecked1 = getTermsCookie('term1');
    const isChecked2 = getTermsCookie('term2');

    checkbox1.checked = isChecked1;
    checkbox2.checked = isChecked2;
});



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
    const regionDropdown = document.getElementById('RegionDropdown');
    const subregionDropdown = document.getElementById('SubregionDropdown');

    function handleRegionChange() {
        const value = this.value || 'NONE'; // Fallback if empty
        setLocal("RegionDropdown", value, 365);
        console.log('RegionDropdown saved:', value); // Debug
    }

    function handleSubRegionChange() {
        const value = this.value || '';
        setLocal('SubregionDropdown', value, 365);
        console.log('SubregionDropdown saved:', value); // Debug
    }

    // Add event listeners
    regionDropdown.addEventListener('change', handleRegionChange);
    subregionDropdown.addEventListener('change', handleSubRegionChange);

    // Ensure other listeners don’t interfere
    regionDropdown.addEventListener('change', updateSubregionDropdown);
    regionDropdown.addEventListener('change', calculateRegionalTax);
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

function calculateAnnual(inputId, frequencyGroupId) {
    let input = parseFloat(document.getElementById(inputId).value) || 0;

    if (inputId === 'income_sole_prop') {
        const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
        if (calculatedFromWorksheet === true) {
            const totalRevenue = getLocal("totalRevenue");
            if (totalRevenue && totalRevenue !== 'annually' && !isNaN(parseFloat(totalRevenue))) {
                if (input != totalRevenue) {
                    input = parseFloat(totalRevenue);
                }
            }
        }
    }

    // Get the checked frequency from the checkbox group
    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${frequencyGroupId}`) || 'annually';

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
        ['income_gambling_winnings', 'income_gambling_winnings_frequency'],
        ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
        ['income_venture_capital', 'income_venture_capital_frequency'],
        ['income_tax_free_income', 'income_tax_free_income_frequency']
    ];

    let annualIncomeSum = 0;

    incomeFields.forEach(field => {
        annualIncomeSum += calculateAnnual(field[0], field[1]);
    });

    ANNUALINCOME = annualIncomeSum;

    let annualTaxableSum = annualIncomeSum;

    incomeFields.forEach(field => {
        const [inputId, frequencyGroupId] = field;
        const income = calculateAnnual(inputId, frequencyGroupId);

        if (document.getElementById('RegionDropdown').value === 'CAN' && inputId === 'income_gambling_winnings') {
            annualTaxableSum -= income;
            return;
        }

        if (inputId === 'income_tax_free_income') {
            annualTaxableSum -= income;
            return;
        }

        if (inputId === 'income_capital_gains_losses') {
            if (document.getElementById('RegionDropdown').value === 'CAN') {
                annualTaxableSum -= income * 0.5;
            } else if (document.getElementById('RegionDropdown').value !== 'USA') {
                annualTaxableSum -= income;
            }
        }

        if (document.getElementById('RegionDropdown').value === 'USA' && inputId === 'income_alimony') {
            annualTaxableSum -= income;
            return;
        }
    });

    const subregion = document.getElementById('SubregionDropdown').value;
    const bpaOrSD = getBPAorSD(subregion);

    ANNUALTAXABLEINCOMESUB = Math.max(annualTaxableSum - bpaOrSD, 0);

    if (document.getElementById('RegionDropdown').value === 'USA') {
        annualTaxableSum -= SD;
    } else {
        annualTaxableSum -= BPA;
    }

    annualTaxableSum = Math.max(annualTaxableSum, 0);

    ANNUALTAXABLEINCOME = annualTaxableSum;

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
        annualEmploymentIncome += calculateAnnual(field[0], field[1]);
    });

    ANNUALEMPLOYMENTINCOME = annualEmploymentIncome;
    document.getElementById('ANNUALEMPLOYMENTINCOME').textContent = `$${ANNUALEMPLOYMENTINCOME.toFixed(2)}`;
}

function getCppPayable() {
    // Get income values
    var annualIncomeSelfEmployed = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    var annualEmployedIncome = ANNUALEMPLOYMENTINCOME; // Assumes this is set elsewhere

    // Define CPP constants for 2025
    const cppRateEmployed = 0.0595; // 5.95% employee portion
    const cppRateSelfEmployed = 0.1190; // 11.9% total for self-employed
    const cppMaxEmployed = 3867.50; // Max employee contribution
    const cppMaxSelfEmployed = 7735; // Max self-employed contribution (total max)
    const cppExemptionAmount = 3500; // Basic exemption
    const cppYMPE = 68500; // 2025 YMPE

    // Calculate total pensionable earnings and apply YMPE cap
    const totalPensionableIncome = annualEmployedIncome + annualIncomeSelfEmployed;
    const cappedPensionableIncome = Math.min(cppYMPE, totalPensionableIncome);
    const taxableIncome = Math.max(cappedPensionableIncome - cppExemptionAmount, 0);

    let cppPayableEmployed = 0;
    let cppPayableSelfEmployed = 0;

    if (taxableIncome > 0) {
        // Proportions of total income (before cap)
        const employedFraction = annualEmployedIncome / totalPensionableIncome;
        const selfEmployedFraction = annualIncomeSelfEmployed / totalPensionableIncome;

        // Employed contribution
        const employedTaxable = taxableIncome * employedFraction;
        cppPayableEmployed = Math.min(employedTaxable * cppRateEmployed, cppMaxEmployed);

        // Self-employed contribution: Fill to max if mixed income exceeds YMPE
        if (totalPensionableIncome > cppYMPE && annualIncomeSelfEmployed > 0) {
            cppPayableSelfEmployed = cppMaxSelfEmployed - cppPayableEmployed;
        } else if (annualEmployedIncome === 0) {
            // Pure self-employed case
            cppPayableSelfEmployed = Math.min(taxableIncome * cppRateSelfEmployed, cppMaxSelfEmployed);
        } else {
            // Proportionate self-employed contribution if below YMPE
            const selfEmployedTaxable = taxableIncome * selfEmployedFraction;
            cppPayableSelfEmployed = selfEmployedTaxable * cppRateSelfEmployed;
        }
    }

    // Set global variables
    ANNUALCPP = cppPayableEmployed + cppPayableSelfEmployed;
    CPPPAYABLEEMPLOYED = cppPayableEmployed;
    CPPPAYABLESELFEMPLOYED = cppPayableSelfEmployed;

    // Display results
    document.getElementById('ANNUALCPP').textContent = '$' + ANNUALCPP.toFixed(2);
    document.getElementById('annual_cpp_eresult').textContent = '$' + cppPayableEmployed.toFixed(2);
    document.getElementById('annual_cpp_seresult').textContent = '$' + cppPayableSelfEmployed.toFixed(2);
}



function getEIPayable() {
    // Check region
    if (document.getElementById('RegionDropdown').value !== 'CAN') {
        ANNUALEI = 0;
        document.getElementById('ANNUALEI').textContent = '$0.00';
        return;
    }

    const employmentIncomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'],
        ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency']
    ];
    const selfEmploymentIncomeField = ['income_sole_prop', 'income_sole_prop_frequency'];

    var annualEmployedIncome = 0;
    employmentIncomeFields.forEach(function (incomeField) {
        annualEmployedIncome += calculateAnnual(incomeField[0], incomeField[1]);
    });

    var annualSelfEmployedIncome = calculateAnnual(selfEmploymentIncomeField[0], selfEmploymentIncomeField[1]);

    const eiRate = 0.0164; // Same rate for both
    const eiMaxPremium = 1077.48; // Max for 2025
    const eiMIE = 65700; // Maximum Insurable Earnings for 2025

    // Combine and cap insurable earnings
    const totalInsurableIncome = annualEmployedIncome + annualSelfEmployedIncome;
    const cappedInsurableIncome = Math.min(eiMIE, totalInsurableIncome);

    // Calculate total EI premium
    const totalEiPayable = cappedInsurableIncome * eiRate;

    // Proportionally allocate if needed (optional breakdown)
    let eiPayableEmployed = 0;
    let eiPayableSelfEmployed = 0;
    if (totalInsurableIncome > 0) {
        const employedFraction = annualEmployedIncome / totalInsurableIncome;
        const selfEmployedFraction = annualSelfEmployedIncome / totalInsurableIncome;
        eiPayableEmployed = Math.min(totalEiPayable * employedFraction, eiMaxPremium);
        eiPayableSelfEmployed = Math.min(totalEiPayable * selfEmployedFraction, eiMaxPremium);
    }

    // Total should not exceed max
    ANNUALEI = Math.min(totalEiPayable, eiMaxPremium);

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

    // Social Security tax rate and maximum taxable earnings
    const socialSecurityRate = 0.062; // 6.2% employee rate
    const socialSecurityMaxTaxable = 142800; // Update to 2025 value (e.g., $168,600 for 2024)

    // Total taxable income (before cap)
    const taxableEmploymentIncome = annualEmployedIncome;
    const taxableSelfEmploymentIncome = annualSelfEmployedIncome * 0.9235; // 92.35% factor
    const totalTaxableIncome = taxableEmploymentIncome + taxableSelfEmploymentIncome;

    // Cap total taxable income at the maximum
    const cappedTaxableIncome = Math.min(totalTaxableIncome, socialSecurityMaxTaxable);

    // Allocate the capped amount proportionally
    let employmentSocialSecurityTax = 0;
    let selfEmploymentSocialSecurityTax = 0;
    if (totalTaxableIncome > 0) {
        const employmentFraction = taxableEmploymentIncome / totalTaxableIncome;
        const selfEmploymentFraction = taxableSelfEmploymentIncome / totalTaxableIncome;
        const cappedEmploymentIncome = cappedTaxableIncome * employmentFraction;
        const cappedSelfEmploymentIncome = cappedTaxableIncome * selfEmploymentFraction;

        employmentSocialSecurityTax = cappedEmploymentIncome * socialSecurityRate;
        selfEmploymentSocialSecurityTax = cappedSelfEmploymentIncome * socialSecurityRate * 2; // 12.4%
    }

    // Total Social Security tax
    const totalSocialSecurityTax = employmentSocialSecurityTax + selfEmploymentSocialSecurityTax;

    // Store and display
    TOTALSOCIALSECURITY = totalSocialSecurityTax;
    TOTALSOCIALSECURITYSE = selfEmploymentSocialSecurityTax;
    TOTALSOCIALSECURITYE = employmentSocialSecurityTax;

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
    const medicareEmployeeRate = 0.0145; // 1.45% for employees
    const medicareSelfEmployedRate = 0.029; // 2.9% for self-employed
    const medicareAdditionalRate = 0.009; // Additional 0.9%
    const medicareThreshold = 200000; // Single filer threshold (adjust for filing status)

    // Calculate base Medicare tax
    const employmentMedicareTax = annualEmployedIncome * medicareEmployeeRate;
    const selfEmploymentMedicareTax = annualSelfEmployedIncome * medicareSelfEmployedRate;

    // Calculate additional Medicare tax
    let additionalMedicareTax = 0;
    if (totalAnnualIncome > medicareThreshold) {
        additionalMedicareTax = (totalAnnualIncome - medicareThreshold) * medicareAdditionalRate;
    }

    // Total Medicare tax
    const totalMedicareTax = employmentMedicareTax + selfEmploymentMedicareTax + additionalMedicareTax;

    // Store and display
    TOTALMEDICARE = totalMedicareTax;
    document.getElementById('TOTALMEDICARE').textContent = '$' + TOTALMEDICARE.toFixed(2);
}



const REGIONALTAXBRACKETSCAN = [
    { limit: 57375, rate: 0.15 },
    { limit: 114750, rate: 0.205 },
    { limit: 177882, rate: 0.26 },
    { limit: 253414, rate: 0.29 },
    { limit: Infinity, rate: 0.33 } // Use Infinity for top bracket
];


const REGIONALTAXBRACKETSUSA = [
    { limit: 11925, rate: 0.10 },   // on the portion of taxable income that is $11,925 or less
    { limit: 48475, rate: 0.12 },   // on the portion of taxable income over $11,925 up to $48,475
    { limit: 103350, rate: 0.22 },  // on the portion of taxable income over $48,475 up to $103,350
    { limit: 197300, rate: 0.24 },  // on the portion of taxable income over $103,350 up to $197,300
    { limit: 250525, rate: 0.32 },  // on the portion of taxable income over $197,300 up to $250,525
    { limit: Infinity, rate: 0.35 } // on the portion of taxable income over $250,525
];

const SUBREGIONALTAXBRACKETS = {
    // Canada Provinces
    'AB': [
        { limit: 151234, rate: 0.10 }, // on the portion of taxable income that is $151,234 or less, plus
        { limit: 181481, rate: 0.12 }, // on the portion of taxable income over $151,234 up to $181,481, plus
        { limit: 241974, rate: 0.13 }, // on the portion of taxable income over $181,481 up to $241,974, plus
        { limit: 362961, rate: 0.14 }, // on the portion of taxable income over $241,974 up to $362,961, plus
        { limit: Infinity, rate: 0.15 } // on the portion of taxable income over $362,961
    ],
    'BC': [
        { limit: 49279, rate: 0.0506 }, // on the portion of taxable income that is $49,279 or less, plus
        { limit: 98560, rate: 0.077 },  // on the portion of taxable income over $49,279 up to $98,560, plus
        { limit: 113158, rate: 0.105 }, // on the portion of taxable income over $98,560 up to $113,158, plus
        { limit: 137407, rate: 0.1229 },// on the portion of taxable income over $113,158 up to $137,407, plus
        { limit: 186306, rate: 0.147 }, // on the portion of taxable income over $137,407 up to $186,306, plus
        { limit: 259829, rate: 0.168 }, // on the portion of taxable income over $186,306 up to $259,829, plus
        { limit: Infinity, rate: 0.205 } // on the portion of taxable income over $259,829
    ],
    'MB': [
        { limit: 47564, rate: 0.108 },  // on the portion of taxable income that is $47,564 or less, plus
        { limit: 101200, rate: 0.1275 },// on the portion of taxable income over $47,564 up to $101,200, plus
        { limit: Infinity, rate: 0.174 } // on the portion of taxable income over $101,200
    ],
    'NB': [
        { limit: 51306, rate: 0.094 },  // on the portion of taxable income that is $51,306 or less, plus
        { limit: 102614, rate: 0.14 },  // on the portion of taxable income over $51,306 up to $102,614, plus
        { limit: 190060, rate: 0.16 },  // on the portion of taxable income over $102,614 up to $190,060, plus
        { limit: Infinity, rate: 0.195 } // on the portion of taxable income over $190,060
    ],
    'NL': [
        { limit: 44192, rate: 0.087 },  // on the portion of taxable income that is $44,192 or less, plus
        { limit: 88382, rate: 0.145 },  // on the portion of taxable income over $44,192 up to $88,382, plus
        { limit: 157792, rate: 0.158 }, // on the portion of taxable income over $88,382 up to $157,792, plus
        { limit: 220910, rate: 0.178 }, // on the portion of taxable income over $157,792 up to $220,910, plus
        { limit: 282214, rate: 0.198 }, // on the portion of taxable income over $220,910 up to $282,214, plus
        { limit: 564429, rate: 0.208 }, // on the portion of taxable income over $282,214 up to $564,429, plus
        { limit: 1128858, rate: 0.213 },// on the portion of taxable income over $564,429 up to $1,128,858, plus
        { limit: Infinity, rate: 0.218 } // on the portion of taxable income over $1,128,858
    ],
    'NT': [
        { limit: 51964, rate: 0.059 },  // on the portion of taxable income that is $51,964 or less, plus
        { limit: 103930, rate: 0.086 }, // on the portion of taxable income over $51,964 up to $103,930, plus
        { limit: 168967, rate: 0.122 }, // on the portion of taxable income over $103,930 up to $168,967, plus
        { limit: Infinity, rate: 0.1405 } // on the portion of taxable income over $168,967
    ],
    'NS': [
        { limit: 30507, rate: 0.0879 }, // on the portion of taxable income that is $30,507 or less, plus
        { limit: 61015, rate: 0.1495 }, // on the portion of taxable income over $30,507 up to $61,015, plus
        { limit: 95883, rate: 0.1667 }, // on the portion of taxable income over $61,015 up to $95,883, plus
        { limit: 154650, rate: 0.175 }, // on the portion of taxable income over $95,883 up to $154,650, plus
        { limit: Infinity, rate: 0.21 }  // on the portion of taxable income over $154,650
    ],
    'NU': [
        { limit: 54707, rate: 0.04 },   // on the portion of taxable income that is $54,707 or less, plus
        { limit: 109413, rate: 0.07 },  // on the portion of taxable income over $54,707 up to $109,413, plus
        { limit: 177881, rate: 0.09 },  // on the portion of taxable income over $109,413 up to $177,881, plus
        { limit: Infinity, rate: 0.115 } // on the portion of taxable income over $177,881
    ],
    'ON': [
        { limit: 52886, rate: 0.0505 }, // on the portion of taxable income that is $52,886 or less, plus
        { limit: 105775, rate: 0.0915 },// on the portion of taxable income over $52,886 up to $105,775, plus
        { limit: 150000, rate: 0.1116 },// on the portion of taxable income over $105,775 up to $150,000, plus
        { limit: 220000, rate: 0.1216 },// on the portion of taxable income over $150,000 up to $220,000, plus
        { limit: Infinity, rate: 0.1316 } // on the portion of taxable income over $220,000
    ],
    'PE': [
        { limit: 33328, rate: 0.095 },  // on the portion of taxable income that is $33,328 or less, plus
        { limit: 64656, rate: 0.1347 }, // on the portion of taxable income over $33,328 up to $64,656, plus
        { limit: 105000, rate: 0.166 }, // on the portion of taxable income over $64,656 up to $105,000, plus
        { limit: 140000, rate: 0.1762 },// on the portion of taxable income over $105,000 up to $140,000, plus
        { limit: Infinity, rate: 0.19 }  // on the portion of taxable income over $140,000
    ],
    'QC': [
        // See Revenu Québec's income tax rates for specific brackets and rates
    ],
    'SK': [
        { limit: 53463, rate: 0.105 },  // on the portion of taxable income that is $53,463 or less, plus
        { limit: 152750, rate: 0.125 }, // on the portion of taxable income over $53,463 up to $152,750, plus
        { limit: Infinity, rate: 0.145 } // on the portion of taxable income over $152,750
    ],
    'YT': [
        { limit: 57375, rate: 0.064 },  // on the portion of taxable income that is $57,375 or less, plus
        { limit: 114750, rate: 0.09 },  // on the portion of taxable income over $57,375 up to $114,750, plus
        { limit: 177882, rate: 0.109 }, // on the portion of taxable income over $114,750 up to $177,882, plus
        { limit: 500000, rate: 0.128 }, // on the portion of taxable income over $177,882 up to $500,000, plus
        { limit: Infinity, rate: 0.15 }  // on the portion of taxable income over $500,000
    ],
    // US States
    "AL": [
        { limit: 500, rate: 0.02 },     // on the portion of taxable income that is $500 or less
        { limit: 3000, rate: 0.04 },    // on the portion of taxable income over $500 up to $3,000
        { limit: Infinity, rate: 0.05 }  // on the portion of taxable income over $3,000
    ],
    "AK": [],
    "AZ": [
        { limit: Infinity, rate: 0.025 } // flat rate
    ],
    "AR": [
        { limit: 4300, rate: 0.02 },    // on the portion of taxable income that is $4,300 or less
        { limit: 8500, rate: 0.04 },    // on the portion of taxable income over $4,300 up to $8,500
        { limit: Infinity, rate: 0.049 } // on the portion of taxable income over $8,500
    ],
    "CA": [
        { limit: 11700, rate: 0.01 },   // on the portion of taxable income that is $11,700 or less
        { limit: 27800, rate: 0.02 },   // on the portion of taxable income over $11,700 up to $27,800
        { limit: 44000, rate: 0.04 },   // on the portion of taxable income over $27,800 up to $44,000
        { limit: 61000, rate: 0.06 },   // on the portion of taxable income over $44,000 up to $61,000
        { limit: 77000, rate: 0.08 },   // on the portion of taxable income over $61,000 up to $77,000
        { limit: 394000, rate: 0.093 }, // on the portion of taxable income over $77,000 up to $394,000
        { limit: 473300, rate: 0.103 }, // on the portion of taxable income over $394,000 up to $473,300
        { limit: 788800, rate: 0.113 }, // on the portion of taxable income over $473,300 up to $788,800
        { limit: 1162000, rate: 0.123 },// on the portion of taxable income over $788,800 up to $1,162,000
        { limit: Infinity, rate: 0.133 } // on the portion of taxable income over $1,162,000
    ],
    "CO": [
        { limit: Infinity, rate: 0.044 } // flat rate
    ],
    "CT": [
        { limit: 10000, rate: 0.03 },   // on the portion of taxable income that is $10,000 or less
        { limit: 50000, rate: 0.05 },   // on the portion of taxable income over $10,000 up to $50,000
        { limit: 100000, rate: 0.055 }, // on the portion of taxable income over $50,000 up to $100,000
        { limit: 200000, rate: 0.06 },  // on the portion of taxable income over $100,000 up to $200,000
        { limit: 250000, rate: 0.065 }, // on the portion of taxable income over $200,000 up to $250,000
        { limit: 500000, rate: 0.069 }, // on the portion of taxable income over $250,000 up to $500,000
        { limit: Infinity, rate: 0.0699 } // on the portion of taxable income over $500,000
    ],
    "DC": [
        { limit: 10000, rate: 0.04 },   // on the portion of taxable income that is $10,000 or less
        { limit: 40000, rate: 0.06 },   // on the portion of taxable income over $10,000 up to $40,000
        { limit: 60000, rate: 0.065 },  // on the portion of taxable income over $40,000 up to $60,000
        { limit: 250000, rate: 0.085 }, // on the portion of taxable income over $60,000 up to $250,000
        { limit: 500000, rate: 0.0925 },// on the portion of taxable income over $250,000 up to $500,000
        { limit: 1000000, rate: 0.0975 },// on the portion of taxable income over $500,000 up to $1,000,000
        { limit: Infinity, rate: 0.1075 } // on the portion of taxable income over $1,000,000
    ],
    "DE": [
        { limit: 2000, rate: 0.022 },   // on the portion of taxable income that is $2,000 or less
        { limit: 5000, rate: 0.039 },   // on the portion of taxable income over $2,000 up to $5,000
        { limit: 10000, rate: 0.048 },  // on the portion of taxable income over $5,000 up to $10,000
        { limit: 20000, rate: 0.052 },  // on the portion of taxable income over $10,000 up to $20,000
        { limit: 25000, rate: 0.0555 }, // on the portion of taxable income over $20,000 up to $25,000
        { limit: 60000, rate: 0.066 },  // on the portion of taxable income over $25,000 up to $60,000
        { limit: Infinity, rate: 0.066 } // on the portion of taxable income over $60,000
    ],
    "FL": [],
    "GA": [
        { limit: 750, rate: 0.01 },     // on the portion of taxable income that is $750 or less
        { limit: 2250, rate: 0.02 },    // on the portion of taxable income over $750 up to $2,250
        { limit: 3750, rate: 0.03 },    // on the portion of taxable income over $2,250 up to $3,750
        { limit: 5250, rate: 0.04 },    // on the portion of taxable income over $3,750 up to $5,250
        { limit: 7000, rate: 0.05 },    // on the portion of taxable income over $5,250 up to $7,000
        { limit: Infinity, rate: 0.0575 } // on the portion of taxable income over $7,000
    ],
    "HI": [
        { limit: 3900, rate: 0.014 },   // on the portion of taxable income that is $3,900 or less
        { limit: 7700, rate: 0.032 },   // on the portion of taxable income over $3,900 up to $7,700
        { limit: 15000, rate: 0.055 },  // on the portion of taxable income over $7,700 up to $15,000
        { limit: 23000, rate: 0.064 },  // on the portion of taxable income over $15,000 up to $23,000
        { limit: 31000, rate: 0.068 },  // on the portion of taxable income over $23,000 up to $31,000
        { limit: 39000, rate: 0.072 },  // on the portion of taxable income over $31,000 up to $39,000
        { limit: 58000, rate: 0.076 },  // on the portion of taxable income over $39,000 up to $58,000
        { limit: 77000, rate: 0.079 },  // on the portion of taxable income over $58,000 up to $77,000
        { limit: 240000, rate: 0.0825 },// on the portion of taxable income over $77,000 up to $240,000
        { limit: 280000, rate: 0.09 },  // on the portion of taxable income over $240,000 up to $280,000
        { limit: 325000, rate: 0.10 },  // on the portion of taxable income over $280,000 up to $325,000
        { limit: Infinity, rate: 0.11 }  // on the portion of taxable income over $325,000
    ],
    "ID": [
        { limit: Infinity, rate: 0.058 } // flat rate
    ],
    "IL": [
        { limit: Infinity, rate: 0.0495 } // flat rate
    ],
    "IN": [
        { limit: Infinity, rate: 0.030 }  // flat rate
    ],
    "IA": [
        { limit: 6000, rate: 0.044 },   // on the portion of taxable income that is $6,000 or less
        { limit: 30000, rate: 0.0482 }, // on the portion of taxable income over $6,000 up to $30,000
        { limit: 75000, rate: 0.057 },  // on the portion of taxable income over $30,000 up to $75,000
        { limit: Infinity, rate: 0.06 }  // on the portion of taxable income over $75,000
    ],
    "KS": [
        { limit: 15000, rate: 0.031 },  // on the portion of taxable income that is $15,000 or less
        { limit: 30000, rate: 0.0525 }, // on the portion of taxable income over $15,000 up to $30,000
        { limit: Infinity, rate: 0.057 } // on the portion of taxable income over $30,000
    ],
    "KY": [
        { limit: Infinity, rate: 0.040 } // flat rate
    ],
    "LA": [
        { limit: Infinity, rate: 0.030 } // flat rate
    ],
    "ME": [
        { limit: 24500, rate: 0.058 },  // on the portion of taxable income that is $24,500 or less
        { limit: 58050, rate: 0.0675 }, // on the portion of taxable income over $24,500 up to $58,050
        { limit: Infinity, rate: 0.0715 } // on the portion of taxable income over $58,050
    ],
    "MD": [
        { limit: 1000, rate: 0.02 },    // on the portion of taxable income that is $1,000 or less
        { limit: 2000, rate: 0.03 },    // on the portion of taxable income over $1,000 up to $2,000
        { limit: 3000, rate: 0.04 },    // on the portion of taxable income over $2,000 up to $3,000
        { limit: 100000, rate: 0.0475 },// on the portion of taxable income over $3,000 up to $100,000
        { limit: 125000, rate: 0.05 },  // on the portion of taxable income over $100,000 up to $125,000
        { limit: 150000, rate: 0.0525 },// on the portion of taxable income over $125,000 up to $150,000
        { limit: 250000, rate: 0.055 }, // on the portion of taxable income over $150,000 up to $250,000
        { limit: Infinity, rate: 0.0575 } // on the portion of taxable income over $250,000
    ],
    "MA": [
        { limit: 1000000, rate: 0.05 }, // on the portion of taxable income that is $1,000,000 or less
        { limit: Infinity, rate: 0.09 }  // on the portion of taxable income over $1,000,000
    ],
    "MI": [
        { limit: Infinity, rate: 0.0405 } // flat rate
    ],
    "MN": [
        { limit: 30070, rate: 0.0535 }, // on the portion of taxable income that is $30,070 or less
        { limit: 98760, rate: 0.068 },  // on the portion of taxable income over $30,070 up to $98,760
        { limit: 183340, rate: 0.0785 },// on the portion of taxable income over $98,760 up to $183,340
        { limit: Infinity, rate: 0.0985 } // on the portion of taxable income over $183,340
    ],
    "MS": [
        { limit: 10000, rate: 0.00 },   // on the portion of taxable income that is $10,000 or less
        { limit: Infinity, rate: 0.044 } // on the portion of taxable income over $10,000
    ],
    "MO": [
        { limit: 1121, rate: 0.015 },   // on the portion of taxable income that is $1,121 or less
        { limit: 2242, rate: 0.02 },    // on the portion of taxable income over $1,121 up to $2,242
        { limit: 3363, rate: 0.025 },   // on the portion of taxable income over $2,242 up to $3,363
        { limit: 4484, rate: 0.03 },    // on the portion of taxable income over $3,363 up to $4,484
        { limit: 5605, rate: 0.035 },   // on the portion of taxable income over $4,484 up to $5,605
        { limit: 6726, rate: 0.04 },    // on the portion of taxable income over $5,605 up to $6,726
        { limit: 7847, rate: 0.045 },   // on the portion of taxable income over $6,726 up to $7,847
        { limit: Infinity, rate: 0.0495 } // on the portion of taxable income over $7,847
    ],
    "MT": [
        { limit: 3600, rate: 0.01 },    // on the portion of taxable income that is $3,600 or less
        { limit: 6300, rate: 0.02 },    // on the portion of taxable income over $3,600 up to $6,300
        { limit: 9700, rate: 0.03 },    // on the portion of taxable income over $6,300 up to $9,700
        { limit: 13000, rate: 0.04 },   // on the portion of taxable income over $9,700 up to $13,000
        { limit: 16800, rate: 0.05 },   // on the portion of taxable income over $13,000 up to $16,800
        { limit: 21600, rate: 0.06 },   // on the portion of taxable income over $16,800 up to $21,600
        { limit: Infinity, rate: 0.0675 } // on the portion of taxable income over $21,600
    ],
    "NC": [
        { limit: Infinity, rate: 0.045 } // flat rate
    ],
    "ND": [
        { limit: 41775, rate: 0.011 },  // on the portion of taxable income that is $41,775 or less
        { limit: 101050, rate: 0.0204 },// on the portion of taxable income over $41,775 up to $101,050
        { limit: 210825, rate: 0.0227 },// on the portion of taxable income over $101,050 up to $210,825
        { limit: 458350, rate: 0.0264 },// on the portion of taxable income over $210,825 up to $458,350
        { limit: Infinity, rate: 0.029 } // on the portion of taxable income over $458,350
    ],
    "NH": [],
    "NJ": [
        { limit: 20000, rate: 0.014 },  // on the portion of taxable income that is $20,000 or less
        { limit: 35000, rate: 0.0175 }, // on the portion of taxable income over $20,000 up to $35,000
        { limit: 40000, rate: 0.035 },  // on the portion of taxable income over $35,000 up to $40,000
        { limit: 75000, rate: 0.05525 },// on the portion of taxable income over $40,000 up to $75,000
        { limit: 500000, rate: 0.0637 },// on the portion of taxable income over $75,000 up to $500,000
        { limit: 1000000, rate: 0.0897 },// on the portion of taxable income over $500,000 up to $1,000,000
        { limit: Infinity, rate: 0.1075 } // on the portion of taxable income over $1,000,000
    ],
    "NM": [
        { limit: 5500, rate: 0.017 },   // on the portion of taxable income that is $5,500 or less
        { limit: 11000, rate: 0.032 },  // on the portion of taxable income over $5,500 up to $11,000
        { limit: 16000, rate: 0.047 },  // on the portion of taxable income over $11,000 up to $16,000
        { limit: 210000, rate: 0.049 }, // on the portion of taxable income over $16,000 up to $210,000
        { limit: Infinity, rate: 0.059 } // on the portion of taxable income over $210,000
    ],
    "NY": [
        { limit: 8500, rate: 0.04 },    // on the portion of taxable income that is $8,500 or less
        { limit: 11700, rate: 0.045 },  // on the portion of taxable income over $8,500 up to $11,700
        { limit: 13900, rate: 0.0525 }, // on the portion of taxable income over $11,700 up to $13,900
        { limit: 80650, rate: 0.055 },  // on the portion of taxable income over $13,900 up to $80,650
        { limit: 215400, rate: 0.06 },  // on the portion of taxable income over $80,650 up to $215,400
        { limit: 1077550, rate: 0.0685 },// on the portion of taxable income over $215,400 up to $1,077,550
        { limit: 5000000, rate: 0.0965 },// on the portion of taxable income over $1,077,550 up to $5,000,000
        { limit: 25000000, rate: 0.103 },// on the portion of taxable income over $5,000,000 up to $25,000,000
        { limit: Infinity, rate: 0.109 } // on the portion of taxable income over $25,000,000
    ],
    "NE": [
        { limit: 3700, rate: 0.0246 },  // on the portion of taxable income that is $3,700 or less
        { limit: 22170, rate: 0.0351 }, // on the portion of taxable income over $3,700 up to $22,170
        { limit: 35730, rate: 0.0501 }, // on the portion of taxable income over $22,170 up to $35,730
        { limit: Infinity, rate: 0.0664 } // on the portion of taxable income over $35,730
    ],
    "NV": [],
    "OH": [
        { limit: 26050, rate: 0.00 },   // on the portion of taxable income that is $26,050 or less
        { limit: 46100, rate: 0.02765 },// on the portion of taxable income over $26,050 up to $46,100
        { limit: 92150, rate: 0.03226 },// on the portion of taxable income over $46,100 up to $92,150
        { limit: 115300, rate: 0.03688 },// on the portion of taxable income over $92,150 up to $115,300
        { limit: Infinity, rate: 0.0399 } // on the portion of taxable income over $115,300
    ],
    "OK": [
        { limit: 1000, rate: 0.0025 },  // on the portion of taxable income that is $1,000 or less
        { limit: 2500, rate: 0.0075 },  // on the portion of taxable income over $1,000 up to $2,500
        { limit: 3750, rate: 0.0175 },  // on the portion of taxable income over $2,500 up to $3,750
        { limit: 4900, rate: 0.0275 },  // on the portion of taxable income over $3,750 up to $4,900
        { limit: 7200, rate: 0.0375 },  // on the portion of taxable income over $4,900 up to $7,200
        { limit: Infinity, rate: 0.0475 } // on the portion of taxable income over $7,200
    ],
    "OR": [
        { limit: 4050, rate: 0.0475 },  // on the portion of taxable income that is $4,050 or less
        { limit: 10200, rate: 0.0675 }, // on the portion of taxable income over $4,050 up to $10,200
        { limit: 125000, rate: 0.0875 },// on the portion of taxable income over $10,200 up to $125,000
        { limit: Infinity, rate: 0.099 } // on the portion of taxable income over $125,000
    ],
    "PA": [
        { limit: Infinity, rate: 0.0307 } // flat rate
    ],
    "RI": [
        { limit: 68200, rate: 0.0375 }, // on the portion of taxable income that is $68,200 or less
        { limit: 155050, rate: 0.0475 },// on the portion of taxable income over $68,200 up to $155,050
        { limit: Infinity, rate: 0.0599 } // on the portion of taxable income over $155,050
    ],
    "SC": [
        { limit: 3200, rate: 0.00 },    // on the portion of taxable income that is $3,200 or less
        { limit: 16040, rate: 0.03 },   // on the portion of taxable income over $3,200 up to $16,040
        { limit: Infinity, rate: 0.064 } // on the portion of taxable income over $16,040
    ],
    "SD": [],
    "TN": [],
    "TX": [],
    "UT": [
        { limit: Infinity, rate: 0.0465 } // flat rate
    ],
    "VA": [
        { limit: 3000, rate: 0.02 },    // on the portion of taxable income that is $3,000 or less
        { limit: 5000, rate: 0.03 },    // on the portion of taxable income over $3,000 up to $5,000
        { limit: 17000, rate: 0.05 },   // on the portion of taxable income over $5,000 up to $17,000
        { limit: Infinity, rate: 0.0575 } // on the portion of taxable income over $17,000
    ],
    "VT": [
        { limit: 42150, rate: 0.0335 }, // on the portion of taxable income that is $42,150 or less
        { limit: 102200, rate: 0.066 }, // on the portion of taxable income over $42,150 up to $102,200
        { limit: 213150, rate: 0.076 }, // on the portion of taxable income over $102,200 up to $213,150
        { limit: Infinity, rate: 0.0875 } // on the portion of taxable income over $213,150
    ],
    "WV": [
        { limit: 10000, rate: 0.03 },   // on the portion of taxable income that is $10,000 or less
        { limit: 25000, rate: 0.04 },   // on the portion of taxable income over $10,000 up to $25,000
        { limit: 40000, rate: 0.045 },  // on the portion of taxable income over $25,000 up to $40,000
        { limit: 60000, rate: 0.06 },   // on the portion of taxable income over $40,000 up to $60,000
        { limit: Infinity, rate: 0.065 } // on the portion of taxable income over $60,000
    ],
    "WA": [],
    "WI": [
        { limit: 13810, rate: 0.0354 }, // on the portion of taxable income that is $13,810 or less
        { limit: 27630, rate: 0.0465 }, // on the portion of taxable income over $13,810 up to $27,630
        { limit: 304170, rate: 0.053 }, // on the portion of taxable income over $27,630 up to $304,170
        { limit: Infinity, rate: 0.0765 } // on the portion of taxable income over $304,170
    ],
    "WY": []
};



function calculateTax(taxBrackets) {
    console.log('Running updated calculateTax'); // Add this
    let tax = 0;
    let taxableIncome = ANNUALTAXABLEINCOME;
    taxBrackets.sort((a, b) => a.limit - b.limit);
    let previousLimit = 0;
    for (const bracket of taxBrackets) {
        if (taxableIncome > previousLimit) {
            let bracketIncome = bracket.limit === Infinity ? taxableIncome - previousLimit : Math.min(taxableIncome, bracket.limit) - previousLimit;
            if (bracketIncome > 0) {
                tax += bracketIncome * bracket.rate;
            }
            previousLimit = bracket.limit;
        }
    }
    return tax;
}

function calculateTaxSub(taxBrackets) {
    console.log('Running updated calculateTaxSub'); // Add this
    let tax = 0;
    let taxableIncome = ANNUALTAXABLEINCOMESUB;
    taxBrackets.sort((a, b) => a.limit - b.limit);
    let previousLimit = 0;
    for (const bracket of taxBrackets) {
        if (taxableIncome > previousLimit) {
            let bracketIncome = bracket.limit === Infinity ? taxableIncome - previousLimit : Math.min(taxableIncome, bracket.limit) - previousLimit;
            if (bracketIncome > 0) {
                tax += bracketIncome * bracket.rate;
            }
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
 const regionValue = getLocal('RegionDropdown');
 regionDropdown.value = regionValue; // 'NONE', 'CAN', or 'USA'

 // Populate SubregionDropdown options based on RegionDropdown
 updateSubregionDropdown(); // Ensure options are available

 // Set all other form elements, including SubregionDropdown
 formElements.forEach(function (elementId) {
     if (elementId !== 'RegionDropdown') { // Already set
         const value = getLocal(elementId);
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

    // Add these logs
    console.log('Federal Taxable Income:', ANNUALTAXABLEINCOME); // Should be 984295
    console.log('Alberta Taxable Income:', ANNUALTAXABLEINCOMESUB); // Should be 978997
    console.log('Federal Tax (Raw):', ANNUALREGIONALTAX); // Should be 305142.66
    console.log('Alberta Tax (Raw):', ANNUALSUBREGIONALTAX); // Should be 138700.30
    console.log('Federal Tax (Displayed):', document.getElementById('ANNUALREGIONALTAX').textContent); // Should be $305142.66
    console.log('Alberta Tax (Displayed):', document.getElementById('ANNUALSUBREGIONALTAX').textContent); // Should be $138700.30

    // Rest of your code...

    // Helper function to get the checked frequency value
    function getCheckedFrequency(id) {
        const checkedCheckbox = document.querySelector(`#${id} input[type="checkbox"]:checked`);
        return checkedCheckbox ? checkedCheckbox.value : "0";
    }


    // Income fields (unchanged)
    setLocal("income_salary_wages", document.getElementById("income_salary_wages").value.trim() !== "" ? document.getElementById("income_salary_wages").value : "0", 365);
    setLocal("income_tips", document.getElementById("income_tips").value.trim() !== "" ? document.getElementById("income_tips").value : "0", 365);
    setLocal("income_bonuses", document.getElementById("income_bonuses").value.trim() !== "" ? document.getElementById("income_bonuses").value : "0", 365);
    setLocal("income_sole_prop", document.getElementById("income_sole_prop").value.trim() !== "" ? document.getElementById("income_sole_prop").value : "0", 365);
    setLocal("income_investment_property", document.getElementById("income_investment_property").value.trim() !== "" ? document.getElementById("income_investment_property").value : "0", 365);
    setLocal("income_capital_gains_losses", document.getElementById("income_capital_gains_losses").value.trim() !== "" ? document.getElementById("income_capital_gains_losses").value : "0", 365);
    setLocal("income_interest", document.getElementById("income_interest").value.trim() !== "" ? document.getElementById("income_interest").value : "0", 365);
    setLocal("income_owner_dividend", document.getElementById("income_owner_dividend").value.trim() !== "" ? document.getElementById("income_owner_dividend").value : "0", 365);
    setLocal("income_public_dividend", document.getElementById("income_public_dividend").value.trim() !== "" ? document.getElementById("income_public_dividend").value : "0", 365);
    setLocal("income_trust", document.getElementById("income_trust").value.trim() !== "" ? document.getElementById("income_trust").value : "0", 365);
    setLocal("income_federal_pension", document.getElementById("income_federal_pension").value.trim() !== "" ? document.getElementById("income_federal_pension").value : "0", 365);
    setLocal("income_work_pension", document.getElementById("income_work_pension").value.trim() !== "" ? document.getElementById("income_work_pension").value : "0", 365);
    setLocal("income_social_security", document.getElementById("income_social_security").value.trim() !== "" ? document.getElementById("income_social_security").value : "0", 365);
    setLocal("income_employment_insurance", document.getElementById("income_employment_insurance").value.trim() !== "" ? document.getElementById("income_employment_insurance").value : "0", 365);
    setLocal("income_alimony", document.getElementById("income_alimony").value.trim() !== "" ? document.getElementById("income_alimony").value : "0", 365);
    setLocal("income_scholarships_grants", document.getElementById("income_scholarships_grants").value.trim() !== "" ? document.getElementById("income_scholarships_grants").value : "0", 365);
    setLocal("income_royalties", document.getElementById("income_royalties").value.trim() !== "" ? document.getElementById("income_royalties").value : "0", 365);
    setLocal("income_gambling_winnings", document.getElementById("income_gambling_winnings").value.trim() !== "" ? document.getElementById("income_gambling_winnings").value : "0", 365);
    setLocal("income_peer_to_peer_lending", document.getElementById("income_peer_to_peer_lending").value.trim() !== "" ? document.getElementById("income_peer_to_peer_lending").value : "0", 365);
    setLocal("income_venture_capital", document.getElementById("income_venture_capital").value.trim() !== "" ? document.getElementById("income_venture_capital").value : "0", 365);
    setLocal("income_tax_free_income", document.getElementById("income_tax_free_income").value.trim() !== "" ? document.getElementById("income_tax_free_income").value : "0", 365);

    // Existing setLocal calls (unchanged)
    const regionDropdown = document.getElementById("RegionDropdown");
    const subregionDropdown = document.getElementById("SubregionDropdown");
    setLocal("RegionDropdown", regionDropdown.value, 365);
    setLocal("SubregionDropdown", subregionDropdown.value, 365);

    setLocal("ANNUALINCOME", ANNUALINCOME, 365);
    setLocal("ANNUALEMPLOYMENTINCOME", ANNUALEMPLOYMENTINCOME, 365);
    setLocal("PASSIVEINCOME", PASSIVEINCOME, 365);
    setLocal("BPA", BPA, 365);
    setLocal("SD", SD, 365);
    setLocal("ANNUALTAXABLEINCOME", ANNUALTAXABLEINCOME, 365);
    setLocal("ANNUALREGIONALTAX", ANNUALREGIONALTAX, 365);
    setLocal("ANNUALSUBREGIONALTAX", ANNUALSUBREGIONALTAX, 365);
    setLocal("ANNUALCPP", ANNUALCPP, 365);
    setLocal("CPPPAYABLEEMPLOYED", CPPPAYABLEEMPLOYED, 365);
    setLocal("CPPPAYABLESELFEMPLOYED", CPPPAYABLESELFEMPLOYED, 365);
    setLocal("ANNUALEI", ANNUALEI, 365);
    setLocal("TOTALTAXCG", TOTALTAXCG, 365);
    setLocal("TOTALMEDICARE", TOTALMEDICARE, 365);
    setLocal("TOTALSOCIALSECURITY", TOTALSOCIALSECURITY, 365);
    setLocal("TOTALSOCIALSECURITYE", TOTALSOCIALSECURITYE, 365);
    setLocal("TOTALSOCIALSECURITYSE", TOTALSOCIALSECURITYSE, 365);
};







document.addEventListener("DOMContentLoaded", () => {
    const paid = getLocal("authenticated") == "paid";
    const calculatedFromWorksheet = getLocal("calculated_from_worksheet");

    if (calculatedFromWorksheet == 'true' && paid) {
        const totalRevenue = getLocal("totalRevenue");
        const selfEmploymentIncomeField =
            document.querySelector("#income_sole_prop");

        selfEmploymentIncomeField.value = totalRevenue;
        setLocal("income_sole_prop", totalRevenue, 365);
        setLocal('calculated_from_worksheet', 'resolved', 365)
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
    const romanticincomeCookie = getLocal('romanticincome');


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
                            setLocal(`frequency_${group.id}`, this.value, 365);
                            console.log(`Saved ${this.value} to cookie for ${group.id}`);
                        }
                    } catch (error) {
                        console.error(`Error in checkbox change for ${group.id}:`, error);
                    }
                });
            });
  
            // Load saved selection or default to "annually"
            const savedFrequency = getLocal(`frequency_${group.id}`);
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

