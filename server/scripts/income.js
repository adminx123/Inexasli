/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { updateHideShow } from "/server/scripts/hideShow.js";
import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

console.log("income.js: Script starting");

// Cookie management
function getTermsCookie(name) {
    const now = Date.now();
    const status = JSON.parse(window.localStorage.getItem(name) || '{}');
    if (status.time && now > status.time) {
        localStorage.removeItem(name);
        return false;
    }
    return status.accepted || false;
}

function setTermsCookie(name, value) {
    const date = new Date();
    window.localStorage.setItem(name, JSON.stringify({
        accepted: value,
        time: date.setTime(date.getTime() + 30 * 60 * 1000)
    }));
}

// Global variables
let ANNUALTAXABLEINCOME, ANNUALTAXABLEINCOMESUB, ANNUALREGIONALTAX, ANNUALSUBREGIONALTAX, TOTALTAXCG,
    ANNUALEMPLOYMENTINCOME, ANNUALINCOME, ANNUALCPP, CPPPAYABLESELFEMPLOYED, CPPPAYABLEEMPLOYED, ANNUALEI,
    BPA = 15705, SD = 14600, PASSIVEINCOME, TOTALMEDICARE, TOTALSOCIALSECURITY, TOTALSOCIALSECURITYSE, TOTALSOCIALSECURITYE;

// Subregion mapping
const subregionMap = {
    CAN: ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"],
    USA: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
};

// Tax brackets
const REGIONALTAXBRACKETSCAN = [
    { limit: 57375, rate: 0.15 }, { limit: 114750, rate: 0.205 }, { limit: 177882, rate: 0.26 },
    { limit: 253414, rate: 0.29 }, { limit: 0, rate: 0.33 }
];
const REGIONALTAXBRACKETSUSA = [
    { limit: 250525, rate: 0.35 }, { limit: 197300, rate: 0.32 }, { limit: 103350, rate: 0.24 },
    { limit: 48475, rate: 0.22 }, { limit: 11925, rate: 0.12 }, { limit: 0, rate: 0.10 }
];
const SUBREGIONALTAXBRACKETS = {
    'AB': [{ limit: 151234, rate: 0.10 }, { limit: 181481, rate: 0.12 }, { limit: 241974, rate: 0.13 }, { limit: 362961, rate: 0.14 }, { limit: 0, rate: 0.15 }],
    'BC': [{ limit: 49279, rate: 0.0506 }, { limit: 98560, rate: 0.077 }, { limit: 113158, rate: 0.105 }, { limit: 137407, rate: 0.1229 }, { limit: 186306, rate: 0.147 }, { limit: 259829, rate: 0.168 }, { limit: 0, rate: 0.205 }],
    'MB': [{ limit: 47564, rate: 0.108 }, { limit: 101200, rate: 0.1275 }, { limit: 0, rate: 0.174 }],
    'NB': [{ limit: 51306, rate: 0.094 }, { limit: 102614, rate: 0.14 }, { limit: 190060, rate: 0.16 }, { limit: 0, rate: 0.195 }],
    'NL': [{ limit: 44192, rate: 0.087 }, { limit: 88382, rate: 0.145 }, { limit: 157792, rate: 0.158 }, { limit: 220910, rate: 0.178 }, { limit: 282214, rate: 0.198 }, { limit: 564429, rate: 0.208 }, { limit: 1128858, rate: 0.213 }, { limit: 0, rate: 0.218 }],
    'NT': [{ limit: 51964, rate: 0.059 }, { limit: 103930, rate: 0.086 }, { limit: 168967, rate: 0.122 }, { limit: 0, rate: 0.1405 }],
    'NS': [{ limit: 30507, rate: 0.0879 }, { limit: 61015, rate: 0.1495 }, { limit: 95883, rate: 0.1667 }, { limit: 154650, rate: 0.175 }, { limit: 0, rate: 0.21 }],
    'NU': [{ limit: 54707, rate: 0.04 }, { limit: 109413, rate: 0.07 }, { limit: 177881, rate: 0.09 }, { limit: 0, rate: 0.115 }],
    'ON': [{ limit: 52886, rate: 0.0505 }, { limit: 105775, rate: 0.0915 }, { limit: 150000, rate: 0.1116 }, { limit: 220000, rate: 0.1216 }, { limit: 0, rate: 0.1316 }],
    'PE': [{ limit: 33328, rate: 0.095 }, { limit: 64656, rate: 0.1347 }, { limit: 105000, rate: 0.166 }, { limit: 140000, rate: 0.1762 }, { limit: 0, rate: 0.19 }],
    'QC': [], // Add QC brackets if needed
    'SK': [{ limit: 53463, rate: 0.105 }, { limit: 152750, rate: 0.125 }, { limit: 0, rate: 0.145 }],
    'YT': [{ limit: 57375, rate: 0.064 }, { limit: 114750, rate: 0.09 }, { limit: 177882, rate: 0.109 }, { limit: 500000, rate: 0.128 }, { limit: 0, rate: 0.15 }],
    'AL': [{ limit: 3000, rate: 0.05 }, { limit: 500, rate: 0.04 }, { limit: 0, rate: 0.02 }],
    'AK': [], 'AZ': [{ limit: 0, rate: 0.025 }], 'AR': [{ limit: 8500, rate: 0.049 }, { limit: 4300, rate: 0.04 }, { limit: 0, rate: 0.02 }],
    'CA': [{ limit: 1162000, rate: 0.133 }, { limit: 788800, rate: 0.123 }, { limit: 473300, rate: 0.113 }, { limit: 394000, rate: 0.103 }, { limit: 77000, rate: 0.093 }, { limit: 61000, rate: 0.08 }, { limit: 44000, rate: 0.06 }, { limit: 27800, rate: 0.04 }, { limit: 11700, rate: 0.02 }, { limit: 0, rate: 0.01 }],
    'CO': [{ limit: 0, rate: 0.044 }],
    // Add remaining US states from your original SUBREGIONALTAXBRACKETS as needed
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("income.js: DOMContentLoaded fired");

    const regionDropdown = document.getElementById('RegionDropdown');
    const subregionDropdown = document.getElementById('SubregionDropdown');

    function updateSubregionDropdown() {
        console.log("income.js: updateSubregionDropdown called");
        const selectedRegion = regionDropdown.value;
        subregionDropdown.innerHTML = '<option value="">Select Tax Subregion</option>';
        if (selectedRegion in subregionMap) {
            subregionMap[selectedRegion].forEach(subregionCode => {
                const subregionOption = document.createElement("option");
                subregionOption.text = subregionOption.value = subregionCode;
                subregionDropdown.appendChild(subregionOption);
            });
            subregionDropdown.value = subregionMap[selectedRegion][0];
        }
    }

   

    regionDropdown.addEventListener('change', () => {
        setLocal("RegionDropdown", regionDropdown.value, 365);
        updateHideShow();
        updateSubregionDropdown();
    });
    regionDropdown.addEventListener('input', () => {
        setLocal("RegionDropdown", regionDropdown.value, 365);
        updateHideShow();
        updateSubregionDropdown();
    });

    const regionValue = getLocal('RegionDropdown') || 'NONE';
    regionDropdown.value = regionValue;
    updateSubregionDropdown();
});

window.validateAndProceed = function() {
    console.log("income.js: validateAndProceed called");
    const termscheckbox = document.getElementById("termscheckbox");
    const notintended = document.getElementById("notintended");
    const regionDropdown = document.getElementById('RegionDropdown'); // Added here
    const subregionDropdown = document.getElementById('SubregionDropdown'); // Added here

    console.log("income.js: Validation state", {
        terms: termscheckbox?.checked,
        notintended: notintended?.checked,
        region: regionDropdown?.value,
        subregion: subregionDropdown?.value
    });

    if (!termscheckbox?.checked || !notintended?.checked) {
        alert("Check the damn boxes.");
        return;
    }
    if (!regionDropdown?.value || regionDropdown.value === "NONE") {
        alert("Pick a region, dipshit.");
        return;
    }
    if (!subregionDropdown?.value) {
        alert("Pick a subregion too.");
        return;
    }
    calculateNext();
};

// Frequency calculation
function calculateAnnual(inputId, frequencyGroupId) {
    let input = parseFloat(document.getElementById(inputId)?.value) || 0;
    if (inputId === 'income_sole_prop') {
        const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
        if (calculatedFromWorksheet === 'true') {
            const totalRevenue = parseFloat(getLocal("totalRevenue")) || 0;
            if (totalRevenue && totalRevenue !== 'annually') input = totalRevenue;
        }
    }

    const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
    const frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${frequencyGroupId}`) || 'annually';

    switch (frequency) {
        case 'annually': return input;
        case 'quarterly': return input * 4;
        case 'monthly': return input * 12;
        case 'weekly': return input * 52;
        default: return 0;
    }
}

// Income calculations
function calculateNormalizedSum() {
    const incomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'], ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency'], ['income_sole_prop', 'income_sole_prop_frequency'],
        ['income_investment_property', 'income_investment_property_frequency'], ['income_capital_gains_losses', 'income_capital_gains_losses_frequency'],
        ['income_interest', 'income_interest_frequency'], ['income_owner_dividend', 'income_owner_dividend_frequency'],
        ['income_public_dividend', 'income_public_dividend_frequency'], ['income_trust', 'income_trust_frequency'],
        ['income_federal_pension', 'income_federal_pension_frequency'], ['income_work_pension', 'income_work_pension_frequency'],
        ['income_social_security', 'income_social_security_frequency'], ['income_employment_insurance', 'income_employment_insurance_frequency'],
        ['income_alimony', 'income_alimony_frequency'], ['income_scholarships_grants', 'income_scholarships_grants_frequency'],
        ['income_royalties', 'income_royalties_frequency'], ['income_gambling_winnings', 'income_gambling_winnings_frequency'],
        ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'], ['income_venture_capital', 'income_venture_capital_frequency'],
        ['income_tax_free_income', 'income_tax_free_income_frequency']
    ];

    let annualIncomeSum = 0, annualTaxableSum = 0;
    incomeFields.forEach(field => {
        const income = calculateAnnual(field[0], field[1]);
        annualIncomeSum += income;
        annualTaxableSum += income;
    });

    ANNUALINCOME = annualIncomeSum;
    const region = document.getElementById('RegionDropdown').value;
    incomeFields.forEach(field => {
        const [inputId, frequencyGroupId] = field;
        const income = calculateAnnual(inputId, frequencyGroupId);
        if (region === 'CAN' && inputId === 'income_gambling_winnings') annualTaxableSum -= income;
        if (inputId === 'income_tax_free_income') annualTaxableSum -= income;
        if (inputId === 'income_capital_gains_losses') {
            if (region === 'CAN') annualTaxableSum -= income * 0.5;
            else if (region !== 'USA') annualTaxableSum -= income;
        }
        if (region === 'USA' && inputId === 'income_alimony') annualTaxableSum -= income;
    });

    const subregion = document.getElementById('SubregionDropdown').value;
    const bpaOrSD = getBPAorSD(subregion);
    ANNUALTAXABLEINCOMESUB = Math.max(annualTaxableSum - bpaOrSD, 0);
    annualTaxableSum = Math.max(annualTaxableSum - (region === 'USA' ? SD : BPA), 0);
    ANNUALTAXABLEINCOME = annualTaxableSum;

    document.getElementById('annual_income_sum').textContent = `$${annualIncomeSum.toFixed(2)}`;
    document.getElementById('taxable_sum').textContent = `$${ANNUALTAXABLEINCOME.toFixed(2)}`;
}

function getBPAorSD(subregion) {
    const amount = {
        'AB': 21003, 'BC': 12580, 'MB': 11132, 'NB': 12644, 'NL': 10382, 'NS': 11481, 'ON': 12399, 'PE': 13500, 'QC': 18056, 'SK': 18491,
        'NT': 17373, 'NU': 18718, 'YT': 15705, 'AL': 3000, 'AK': 0, 'AZ': 12750, 'AR': 2270, 'CA': 4700, 'CO': 12750, 'CT': 15000,
        'DC': 12750, 'DE': 3250, 'FL': 0, 'GA': 3000, 'HI': 2200, 'ID': 12760, 'IL': 2325, 'IN': 1000, 'IA': 2180, 'KS': 3500,
        'KY': 0, 'LA': 4500, 'ME': 12750, 'MD': 2200, 'MA': 4400, 'MI': 4750, 'MN': 12750, 'MS': 2300, 'MO': 12750, 'MT': 5000,
        'NC': 10000, 'ND': 4200, 'NH': 0, 'NJ': 1000, 'NM': 12750, 'NY': 8000, 'NE': 7300, 'NV': 0, 'OH': 2400, 'OK': 1000,
        'OR': 2315, 'PA': 0, 'RI': 8500, 'SC': 4010, 'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0, 'VA': 8000, 'VT': 4350, 'WV': 0,
        'WA': 0, 'WI': 11150, 'WY': 0
    };
    return amount[subregion] || 0;
}

function calculateEmploymentIncome() {
    const employmentIncomeFields = [
        ['income_salary_wages', 'income_salary_wages_frequency'],
        ['income_tips', 'income_tips_frequency'],
        ['income_bonuses', 'income_bonuses_frequency']
    ];
    ANNUALEMPLOYMENTINCOME = employmentIncomeFields.reduce((sum, field) => sum + calculateAnnual(field[0], field[1]), 0);
    document.getElementById('ANNUALEMPLOYMENTINCOME').textContent = `$${ANNUALEMPLOYMENTINCOME.toFixed(2)}`;
}

function getCppPayable() {
    const annualIncomeSelfEmployed = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    const annualEmployedIncome = ANNUALEMPLOYMENTINCOME;
    const cppRateEmployed = 0.0595, cppRateSelfEmployed = 0.1190, cppMaxEmployed = 3867.50, cppMaxSelfEmployed = 7735,
          cppExemptionAmount = 3500, cppYMPE = 68500;
    const totalPensionableIncome = annualEmployedIncome + annualIncomeSelfEmployed;
    const cappedPensionableIncome = Math.min(cppYMPE, totalPensionableIncome);
    const taxableIncome = Math.max(cappedPensionableIncome - cppExemptionAmount, 0);

    let cppPayableEmployed = 0, cppPayableSelfEmployed = 0;
    if (taxableIncome > 0) {
        const employedFraction = totalPensionableIncome ? annualEmployedIncome / totalPensionableIncome : 0;
        const selfEmployedFraction = totalPensionableIncome ? annualIncomeSelfEmployed / totalPensionableIncome : 0;
        cppPayableEmployed = Math.min(taxableIncome * employedFraction * cppRateEmployed, cppMaxEmployed);
        if (totalPensionableIncome > cppYMPE && annualIncomeSelfEmployed > 0) {
            cppPayableSelfEmployed = cppMaxSelfEmployed - cppPayableEmployed;
        } else if (annualEmployedIncome === 0) {
            cppPayableSelfEmployed = Math.min(taxableIncome * cppRateSelfEmployed, cppMaxSelfEmployed);
        } else {
            cppPayableSelfEmployed = taxableIncome * selfEmployedFraction * cppRateSelfEmployed;
        }
    }

    ANNUALCPP = cppPayableEmployed + cppPayableSelfEmployed;
    CPPPAYABLEEMPLOYED = cppPayableEmployed;
    CPPPAYABLESELFEMPLOYED = cppPayableSelfEmployed;
    document.getElementById('ANNUALCPP').textContent = '$' + ANNUALCPP.toFixed(2);
    document.getElementById('annual_cpp_eresult').textContent = '$' + cppPayableEmployed.toFixed(2);
    document.getElementById('annual_cpp_seresult').textContent = '$' + cppPayableSelfEmployed.toFixed(2);
}

function getEIPayable() {
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
    const annualEmployedIncome = employmentIncomeFields.reduce((sum, field) => sum + calculateAnnual(field[0], field[1]), 0);
    const annualSelfEmployedIncome = calculateAnnual(selfEmploymentIncomeField[0], selfEmploymentIncomeField[1]);
    const eiRate = 0.0164, eiMaxPremium = 1077.48, eiMIE = 65700;
    const totalInsurableIncome = annualEmployedIncome + annualSelfEmployedIncome;
    ANNUALEI = Math.min(Math.min(eiMIE, totalInsurableIncome) * eiRate, eiMaxPremium);
    document.getElementById('ANNUALEI').textContent = '$' + ANNUALEI.toFixed(2);
}

function getSocialSecurity() {
    const annualEmployedIncome = ['income_salary_wages', 'income_tips', 'income_bonuses']
        .reduce((sum, id) => sum + calculateAnnual(id, `${id}_frequency`), 0);
    const annualSelfEmployedIncome = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    const socialSecurityRate = 0.062, socialSecurityMaxTaxable = 142800;
    const taxableEmploymentIncome = annualEmployedIncome;
    const taxableSelfEmploymentIncome = annualSelfEmployedIncome * 0.9235;
    const totalTaxableIncome = taxableEmploymentIncome + taxableSelfEmploymentIncome;
    const cappedTaxableIncome = Math.min(totalTaxableIncome, socialSecurityMaxTaxable);
    const employmentFraction = totalTaxableIncome ? taxableEmploymentIncome / totalTaxableIncome : 0;
    const selfEmploymentFraction = totalTaxableIncome ? taxableSelfEmploymentIncome / totalTaxableIncome : 0;
    TOTALSOCIALSECURITYE = cappedTaxableIncome * employmentFraction * socialSecurityRate;
    TOTALSOCIALSECURITYSE = cappedTaxableIncome * selfEmploymentFraction * socialSecurityRate * 2;
    TOTALSOCIALSECURITY = TOTALSOCIALSECURITYE + TOTALSOCIALSECURITYSE;
    document.getElementById('TOTALSOCIALSECURITY').textContent = '$' + TOTALSOCIALSECURITY.toFixed(2);
}

function getMedicare() {
    const annualEmployedIncome = ['income_salary_wages', 'income_tips', 'income_bonuses']
        .reduce((sum, id) => sum + calculateAnnual(id, `${id}_frequency`), 0);
    const annualSelfEmployedIncome = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');
    const totalAnnualIncome = annualEmployedIncome + annualSelfEmployedIncome;
    const medicareEmployeeRate = 0.0145, medicareSelfEmployedRate = 0.029, medicareAdditionalRate = 0.009, medicareThreshold = 200000;
    const employmentMedicareTax = annualEmployedIncome * medicareEmployeeRate;
    const selfEmploymentMedicareTax = annualSelfEmployedIncome * medicareSelfEmployedRate;
    const additionalMedicareTax = totalAnnualIncome > medicareThreshold ? (totalAnnualIncome - medicareThreshold) * medicareAdditionalRate : 0;
    TOTALMEDICARE = employmentMedicareTax + selfEmploymentMedicareTax + additionalMedicareTax;
    document.getElementById('TOTALMEDICARE').textContent = '$' + TOTALMEDICARE.toFixed(2);
}

function calculateTax(taxBrackets, taxableIncome) {
    let tax = 0;
    taxBrackets.sort((a, b) => a.limit - b.limit);
    let previousLimit = 0;
    for (const bracket of taxBrackets) {
        if (taxableIncome > previousLimit) {
            let bracketIncome = Math.min(taxableIncome, bracket.limit || Infinity) - previousLimit;
            tax += bracketIncome * bracket.rate;
            previousLimit = bracket.limit;
        }
    }
    return tax;
}

function calculateRegionalTax() {
    const selectedRegion = document.getElementById("RegionDropdown").value;
    const taxBrackets = selectedRegion === "CAN" ? REGIONALTAXBRACKETSCAN : REGIONALTAXBRACKETSUSA;
    ANNUALREGIONALTAX = calculateTax(taxBrackets, ANNUALTAXABLEINCOME);
    document.getElementById('ANNUALREGIONALTAX').textContent = '$' + ANNUALREGIONALTAX.toFixed(2);
}

function calculateSubregionalTax(Subregion, taxBrackets) {
    ANNUALSUBREGIONALTAX = calculateTax(taxBrackets[Subregion] || [], ANNUALTAXABLEINCOMESUB);
    document.getElementById('ANNUALSUBREGIONALTAX').textContent = '$' + ANNUALSUBREGIONALTAX.toFixed(2);
}

function calculateCapitalGainsTax() {
    const capitalGain = calculateAnnual('income_capital_gains_losses', 'income_capital_gains_losses_frequency');
    calculateNormalizedSum();
    const annualIncomeSum = ANNUALINCOME;
    const stateRateInput = document.getElementById('income_capital_gain_state_rate')?.value || '0';
    const stateRate = stateRateInput ? parseFloat(stateRateInput) / 100 : 0;
    let federalRate = annualIncomeSum <= 48350 ? 0 : annualIncomeSum <= 533400 ? 0.15 : 0.20;
    TOTALTAXCG = capitalGain * (federalRate + stateRate);
    document.getElementById('TOTALTAXCG').textContent = '$' + TOTALTAXCG.toFixed(2);
}

function passiveincome() {
    const fireFields = [
        ['income_investment_property', 'income_investment_property_frequency'], ['income_interest', 'income_interest_frequency'],
        ['income_public_dividend', 'income_public_dividend_frequency'], ['income_trust', 'income_trust_frequency'],
        ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'], ['income_royalties', 'income_royalties_frequency']
    ];
    PASSIVEINCOME = fireFields.reduce((sum, [field, freq]) => sum + calculateAnnual(field, freq), 0);
}

function handleUSAResident() {
    if (document.getElementById('RegionDropdown').value === "USA") {
        calculateCapitalGainsTax();
        getMedicare();
        getSocialSecurity();
    }
}

function calculateNext() {
    console.log("income.js: calculateNext called");
    calculateAll();
    window.location.href = './expense.html';
}

function calculateAll() {
    console.log("income.js: calculateAll executed");
    calculateNormalizedSum();
    calculateRegionalTax();
    const Subregion = document.getElementById('SubregionDropdown').value;
    calculateSubregionalTax(Subregion, SUBREGIONALTAXBRACKETS);
    calculateEmploymentIncome();
    getCppPayable();
    getEIPayable();
    passiveincome();
    handleUSAResident();

    const fields = [
        "income_salary_wages", "income_tips", "income_bonuses", "income_sole_prop", "income_investment_property",
        "income_capital_gains_losses", "income_interest", "income_owner_dividend", "income_public_dividend",
        "income_trust", "income_federal_pension", "income_work_pension", "income_social_security",
        "income_employment_insurance", "income_alimony", "income_scholarships_grants", "income_royalties",
        "income_gambling_winnings", "income_peer_to_peer_lending", "income_venture_capital", "income_tax_free_income"
    ];
    fields.forEach(id => {
        const value = document.getElementById(id)?.value.trim();
        setLocal(id, value !== "" ? value : "0", 365);
    });

    const globals = { "RegionDropdown": document.getElementById("RegionDropdown").value, "SubregionDropdown": document.getElementById("SubregionDropdown").value,
        ANNUALINCOME, ANNUALEMPLOYMENTINCOME, PASSIVEINCOME, BPA, SD, ANNUALTAXABLEINCOME, ANNUALREGIONALTAX,
        ANNUALSUBREGIONALTAX, ANNUALCPP, CPPPAYABLEEMPLOYED, CPPPAYABLESELFEMPLOYED, ANNUALEI, TOTALTAXCG,
        TOTALMEDICARE, TOTALSOCIALSECURITY, TOTALSOCIALSECURITYE, TOTALSOCIALSECURITYSE };
    Object.entries(globals).forEach(([key, value]) => setLocal(key, value, 365));
}

window.addEventListener("message", (event) => {
    if (event.data === "close-modal") {
        document.querySelector("#ROI-modal").style.display = "none";
        const selfEmploymentIncomeField = document.querySelector("#income_sole_prop");
        const totalRevenue = getLocal("totalRevenue");
        const paid = getLocal("authenticated") === "paid";
        if (totalRevenue && totalRevenue !== "annually" && totalRevenue !== "") {
            if (paid) {
                selfEmploymentIncomeField.value = totalRevenue;
                setLocal("income_sole_prop", totalRevenue, 365);
                selfEmploymentIncomeField.placeholder = "";
            } else {
                selfEmploymentIncomeField.value = "";
                setLocal("calculated_from_worksheet", true, 365);
                selfEmploymentIncomeField.placeholder = "payment required";
            }
        }
    }
});

console.log("income.js: Script loaded");