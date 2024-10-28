
var ANNUALTAXABLEINCOME;
    var ANNUALREGIONALTAX;
    var ANNUALSUBREGIONALTAX;
    var TOTALTAXCG;
    var ANNUALTAX;
    var ANNUALEMPLOYMENTINCOME;
    var ANNUALINCOME;
    var ANNUALEXPENSE;
    var ANNUALCPP;
    var ANNUALEI; 
    var BPA = 15705;
    var SD = 14600;
    var PASSIVEINCOME;
    var CPPPAYABLESELFEMPLOYED;
    var CPPPAYABLEEMPLOYED;
    var TOTALMEDICARE;
     var TOTALSOCIALSECURITY;
    var TOTALSOCIALSECURITYSE;
    var TOTALSOCIALSECURITYE;

    
document.addEventListener('DOMContentLoaded', function() {
    var USAHIDE = document.querySelector('.USAHIDE');
    
    // Initially hide the field
    USAHIDE.style.display = 'none';

    // Function to handle the change in dropdown value
    function handleRegionChange() {
        if (this.value === 'USA' || this.value === '') { // Check for USA or empty value
            USAHIDE.style.display = 'block';
        } else {
            USAHIDE.style.display = 'none';
        }
    }

    // Call handleRegionChange function to handle initial state
    handleRegionChange.call(document.getElementById('RegionDropdown'));

    // Add event listener to the dropdown for change in value
    document.getElementById('RegionDropdown').addEventListener('change', handleRegionChange);
});



    function validatecheckbox() {
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

    function openTermsModal() {
  console.log('openTermsModal() function called');
  // **Change:** Move setting modal display to within the then block after content is retrieved
  fetch('../../client/finance/legal.txt') // Corrected file extension to '.txt'
    .then(response => response.text())
    .then(data => {
      document.getElementById('modalContent').innerText = data;
      // Set modal display to block after content is retrieved
      document.getElementById('termsModal').style.display = 'block';
    })
    .catch(error => console.error('Error fetching legal content:', error));
}

    function closeModal(event) {
    const modal = document.getElementById('termsModal');
    const modalContent = document.getElementById('modalContent');

    if (event.target === modal && event.target !== modalContent) {
        modal.style.display = 'none';
    }
}
    
document.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.getElementById('termsModal').style.display === 'block') {
        closeModal();
    }
});    
          
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
    
function calculateAnnual(inputId, frequencyId) {
        const input = parseFloat(document.getElementById(inputId).value) || 0;
        const frequency = document.getElementById(frequencyId).value;

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
            ['income_gambling_winnings', 'income_gambling_winnings_frequency'],
            ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
            ['income_venture_capital', 'income_venture_capital_frequency'],
            ['income_tax_free_income', 'income_tax_free_income_frequency']
            // Add more income fields here
        ];
let annualIncomeSum = 0;
  // Calculate annual income sum
        incomeFields.forEach(field => {
            const [inputId, frequencyId] = field;
            annualIncomeSum += calculateAnnual(inputId, frequencyId);
        });
ANNUALINCOME = annualIncomeSum
 // Display the results
        document.getElementById('annual_income_sum').textContent = `$${annualIncomeSum.toFixed(2)}`;

// Define all  taxable income fields with their corresponding frequency fields
        const taxableincomeFields = [
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
            ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
            ['income_venture_capital', 'income_venture_capital_frequency'],
                        // Add more income fields here
        ];
      
let annualTaxableSum = 0;

taxableincomeFields.forEach(field => {
    const [inputId, frequencyId] = field;
    let taxableincome = calculateAnnual(inputId, frequencyId);

    // Exclude capital gains completely for USA
    if (document.getElementById('RegionDropdown').value === 'USA' && inputId === 'income_capital_gains_losses') {
        return; // Skip this iteration
    }

    // Apply Canada-specific adjustments for capital gains
    if (document.getElementById('RegionDropdown').value === 'CAN' && inputId === 'income_capital_gains_losses') {
        taxableincome *= 0.5; // Adjust for Canada
    }

    annualTaxableSum += taxableincome;
});

// Apply standard deduction for USA
if (document.getElementById('RegionDropdown').value === 'USA') {
    annualTaxableSum -= SD;
} else {
    // Apply BPA for other regions
    annualTaxableSum -= BPA;
}

// Ensure result is not less than 0
annualTaxableSum = Math.max(annualTaxableSum, 0);

ANNUALTAXABLEINCOME = annualTaxableSum;

// Display the results
document.getElementById('taxable_sum').textContent = `$${annualTaxableSum.toFixed(2)}`;

     
        
       
      const employmentincomeFields = 
      [[ 'income_salary_wages', 'income_salary_wages_frequency'],
      ['income_tips', 'income_tips_frequency'],
      ['income_bonuses', 'income_bonuses_frequency']];
      let annualEmploymentIncome = 0;
    employmentincomeFields.forEach(field => {
      const [inputId, frequencyId] = field;
      annualEmploymentIncome += calculateAnnual(inputId, frequencyId);
    });
ANNUALEMPLOYMENTINCOME = annualEmploymentIncome;
 }
    
function getCppPayable() {
    var annualSoleProp = parseFloat(document.getElementById('income_sole_prop').value) || 0;
    var SolePropFrequency = parseFloat(document.getElementById('income_sole_prop_frequency').value) || 0;
    var annualIncomeSelfEmployed = calculateAnnual('income_sole_prop', 'income_sole_prop_frequency');

    // Define CPP rates and maximums
    var cppRateEmployed = 0.0595;
    var cppRateSelfEmployed = 0.1190;
    var cppMaxEmployed = 3867.5;
    var cppMaxEmployer = 7735;
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
    var eiRateEmployed = 0.0166;
    var eiRateSelfEmployed = 0.0166;
    var eiEmployeePremiumMax = 1049.12;
    var eiEmployerPremiumMax = 1468.77;

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
    const socialSecurityRate = 0.062; // 6.2%
    const socialSecurityMaxTaxable = 142800; // Maximum taxable earnings for Social Security

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
    const medicareRate = 0.0145; // 1.45%
    const medicareAdditionalRate = 0.009; // Additional 0.9% for high earners
    const medicareThreshold = 200000; // Threshold for additional Medicare tax

    // Calculate Medicare tax for total income
    let totalMedicareTax = 0;

    // If total income exceeds Medicare threshold, apply additional rate
    if (totalAnnualIncome > medicareThreshold) {
        totalMedicareTax = (totalAnnualIncome - medicareThreshold) * medicareAdditionalRate;
    }

    // Apply standard Medicare rate to total income
    totalMedicareTax += totalAnnualIncome * medicareRate;

    // Total US equivalent tax
   TOTALMEDICARE = totalMedicareTax;

    // Update the DOM element with the calculated value
    document.getElementById('TOTALMEDICARE').textContent = '$' + TOTALMEDICARE.toFixed(2);
}


// Define the tax brackets
const REGIONALTAXBRACKETSCAN = [
    { limit: 235675, rate: 0.33 },
    { limit: 165430, rate: 0.29 },
    { limit: 106717, rate: 0.26 },
    { limit: 53359, rate: 0.205 },
    { limit: 0, rate: 0.15 }
];


const REGIONALTAXBRACKETSUSA =

     [
        { limit: 609350, rate: 0.37 },
        { limit: 243725, rate: 0.35 },
        { limit: 191950, rate: 0.32 },
        { limit: 100525, rate: 0.24 },
        { limit: 47150, rate: 0.22 },
        { limit: 11600, rate: 0.12 },
        { limit: 0, rate: 0.10 }
    ];
    
// Define the SUBREGIONAL tax brackets
const SUBREGIONALTAXBRACKETS = {
    //Canada Provinces
    'AB': [
        { limit: 341502, rate: 0.15 },
        { limit: 227668, rate: 0.14 },
        { limit: 170751, rate: 0.13 },
        { limit: 142292, rate: 0.12 },
        { limit: 0, rate: 0.10 }
    ],
    'BC': [
        { limit: 240716, rate: 0.205 },
        { limit: 172602, rate: 0.168 },
        { limit: 127299, rate: 0.147 },
        { limit: 104835, rate: 0.1229 },
        { limit: 91310, rate: 0.105 },
        { limit: 45654, rate: 0.077 },
        { limit: 0, rate: 0.0506 }
    ],
    'MB': [
        { limit: 79625, rate: 0.174 },
        { limit: 36842, rate: 0.1275 },
        { limit: 0, rate: 0.108 }
    ],
    'NB': [
        { limit: 176756, rate: 0.195 },
        { limit: 95431, rate: 0.16 },
        { limit: 47715, rate: 0.14 },
        { limit: 0, rate: 0.094 }
    ],
    'NL': [
        { limit: 1059000, rate: 0.218 },
        { limit: 529500, rate: 0.213 },
        { limit: 264750, rate: 0.208 },
        { limit: 207239, rate: 0.198 },
        { limit: 148027, rate: 0.178 },
        { limit: 82913, rate: 0.158 },
        { limit: 41457, rate: 0.145 },
        { limit: 0, rate: 0.087 }
    ],
    'NT': [
        { limit: 157139, rate: 0.1405 },
        { limit: 96655, rate: 0.122 },
        { limit: 48326, rate: 0.086 },
        { limit: 0, rate: 0.059 }
    ],
    'NS': [
        { limit: 150000, rate: 0.21 },
        { limit: 93000, rate: 0.175 },
        { limit: 59180, rate: 0.1667 },
        { limit: 29590, rate: 0.1495 },
        { limit: 0, rate: 0.0879 }
    ],
    'NU': [
        { limit: 165429, rate: 0.115 },
        { limit: 101754, rate: 0.09 },
        { limit: 50877, rate: 0.07 },
        { limit: 0, rate: 0.04 }
    ],
    'ON': [
        { limit: 220000, rate: 0.1316 },
        { limit: 150000, rate: 0.1216 },
        { limit: 98463, rate: 0.1116 },
        { limit: 49231, rate: 0.0915 },
        { limit: 0, rate: 0.0505 }
    ],
    'PE': [
        { limit: 63969, rate: 0.167 },
        { limit: 31984, rate: 0.138 },
        { limit: 0, rate: 0.098 }
    ],
    'QC': [
        { limit: 119910, rate: 0.2575 },
        { limit: 98540, rate: 0.24 },
        { limit: 49275, rate: 0.19 },
        { limit: 0, rate: 0.14 }
    ],
    'SK': [
        { limit: 142058, rate: 0.145 },
        { limit: 49720, rate: 0.125 },
        { limit: 0, rate: 0.105 }
    ],
    'YT': [
        { limit: 500000, rate: 0.15 },
        { limit: 165430, rate: 0.128 },
        { limit: 106717, rate: 0.109 },
        { limit: 53359, rate: 0.09 },
        { limit: 0, rate: 0.064 }
    ],

    //US STATES
    "AL": [
        { "limit": 3000, "rate": 0.05 },
        { "limit": 500, "rate": 0.04 },
        { "limit": 0, "rate": 0.02 }
    ],
    "AK": [],
    "AZ": [
        { "limit": 0, "rate": 0.025 }
    ],
    "AR": [
        { "limit": 8500, "rate": 0.049 },
        { "limit": 4300, "rate": 0.04 },
        { "limit": 0, "rate": 0.02 }
    ],
    "CA": [
        { "limit": 1000000, "rate": 0.133 },
        { "limit": 677275, "rate": 0.123 },
        { "limit": 406364, "rate": 0.113 },
        { "limit": 338639, "rate": 0.103 },
        { "limit": 66295, "rate": 0.093 },
        { "limit": 52455, "rate": 0.08 },
        { "limit": 37788, "rate": 0.06 },
        { "limit": 23942, "rate": 0.04 },
        { "limit": 10099, "rate": 0.02 },
        { "limit": 0, "rate": 0.01 }
    ],
    "CO": [
        { "limit": 0, "rate": 0.044 }
    ],
    "CT": [
        { "limit": 500000, "rate": 0.0699 },
        { "limit": 250000, "rate": 0.069 },
        { "limit": 200000, "rate": 0.065 },
        { "limit": 100000, "rate": 0.06 },
        { "limit": 50000, "rate": 0.055 },
        { "limit": 10000, "rate": 0.05 },
        { "limit": 0, "rate": 0.03 }
    ],
    "DC": [
        { "limit": 1000000, "rate": 0.1075 },
        { "limit": 500000, "rate": 0.0975 },
        { "limit": 250000, "rate": 0.0925 },
        { "limit": 60000, "rate": 0.085 },
        { "limit": 40000, "rate": 0.065 },
        { "limit": 10000, "rate": 0.06 },
        { "limit": 0, "rate": 0.04 }
    ],
    "DE": [
        { "limit": 60000, "rate": 0.066 },
        { "limit": 25000, "rate": 0.0555 },
        { "limit": 20000, "rate": 0.052 },
        { "limit": 10000, "rate": 0.048 },
        { "limit": 5000, "rate": 0.039 },
        { "limit": 2000, "rate": 0.022 }
    ],
    "FL": [],
    "GA": [
        { "limit": 7000, "rate": 0.0575 },
        { "limit": 5250, "rate": 0.05 },
        { "limit": 3750, "rate": 0.04 },
        { "limit": 2250, "rate": 0.03 },
        { "limit": 750, "rate": 0.02 },
        { "limit": 0, "rate": 0.01 }
    ],
    "HI": [
        { "limit": 200000, "rate": 0.11 },
        { "limit": 175000, "rate": 0.1 },
        { "limit": 150000, "rate": 0.09 },
        { "limit": 48000, "rate": 0.0825 },
        { "limit": 36000, "rate": 0.079 },
        { "limit": 24000, "rate": 0.076 },
        { "limit": 19200, "rate": 0.072 },
        { "limit": 14400, "rate": 0.068 },
        { "limit": 9600, "rate": 0.064 },
        { "limit": 4800, "rate": 0.055 },
        { "limit": 2400, "rate": 0.032 },
        { "limit": 0, "rate": 0.014 }
    ],
    "ID": [
        { "limit": 0, "rate": 0.058 }
    ],
    "IL": [
        { "limit": 0, "rate": 0.0495 }
    ],
    "IN": [
        { "limit": 0, "rate": 0.0315 }
    ],
    "IA": [
        { "limit": 75000, "rate": 0.06 },
        { "limit": 30000, "rate": 0.057 },
        { "limit": 6000, "rate": 0.0482 },
        { "limit": 0, "rate": 0.044 }
    ],
    "KS": [
        { "limit": 30000, "rate": 0.057 },
        { "limit": 15000, "rate": 0.0525 },
        { "limit": 0, "rate": 0.031 }
    ],
    "KY": [
        { "limit": 0, "rate": 0.045 }
    ],
    "LA": [
        { "limit": 50000, "rate": 0.0425 },
        { "limit": 12500, "rate": 0.035 },
        { "limit": 0, "rate": 0.0185 }
    ],
    "ME": [
        { "limit": 58050, "rate": 0.0715 },
        { "limit": 24500, "rate": 0.0675 },
        { "limit": 0, "rate": 0.058 }
    ],
    "MD": [
        { "limit": 250000, "rate": 0.0575 },
        { "limit": 150000, "rate": 0.055 },
        { "limit": 125000, "rate": 0.0525 },
        { "limit": 100000, "rate": 0.05 },
        { "limit": 3000, "rate": 0.0475 },
        { "limit": 2000, "rate": 0.04 },
        { "limit": 1000, "rate": 0.03 },
        { "limit": 0, "rate": 0.02 }
    ],
    "MA": [
        { "limit": 1000000, "rate": 0.09 },
        { "limit": 0, "rate": 0.05 }
    ],
    "MI": [
        { "limit": 0, "rate": 0.0425 }
    ],
    "MN": [
        { "limit": 183340, "rate": 0.0985 },
        { "limit": 98760, "rate": 0.0785 },
        { "limit": 30070, "rate": 0.068 },
        { "limit": 0, "rate": 0.0535 }
    ],
    "MS": [
        { "limit": 10000, "rate": 0.05 }
    ],
    "MO": [
        { "limit": 7847, "rate": 0.0495 },
        { "limit": 6726, "rate": 0.045 },
        { "limit": 5605, "rate": 0.04 },
        { "limit": 4484, "rate": 0.035 },
        { "limit": 3363, "rate": 0.03 },
        { "limit": 2242, "rate": 0.025 },
        { "limit": 1121, "rate": 0.02 }
    ],
    "MT": [
        { "limit": 21600, "rate": 0.0675 },
        { "limit": 16800, "rate": 0.06 },
        { "limit": 13000, "rate": 0.05 },
        { "limit": 9700, "rate": 0.04 },
        { "limit": 6300, "rate": 0.03 },
        { "limit": 3600, "rate": 0.02 },
        { "limit": 0, "rate": 0.01 }
    ],
    "NC": [
        { "limit": 0, "rate": 0.0475 }
    ],
    "ND": [
        { "limit": 458350, "rate": 0.029 },
        { "limit": 210825, "rate": 0.0264 },
        { "limit": 101050, "rate": 0.0227 },
        { "limit": 41775, "rate": 0.0204 },
        { "limit": 0, "rate": 0.011 }
    ],
    "NH": [],
    "NJ": [
        { "limit": 1000000, "rate": 0.1075 },
        { "limit": 500000, "rate": 0.0897 },
        { "limit": 75000, "rate": 0.0637 },
        { "limit": 40000, "rate": 0.05525 },
        { "limit": 35000, "rate": 0.035 },
        { "limit": 20000, "rate": 0.0175 },
        { "limit": 0, "rate": 0.014 }
    ],
    "NM": [
        { "limit": 210000, "rate": 0.059 },
        { "limit": 16000, "rate": 0.049 },
        { "limit": 11000, "rate": 0.047 },
        { "limit": 5500, "rate": 0.032 },
        { "limit": 0, "rate": 0.017 }
    ],
    "NY": [
        { "limit": 25000000, "rate": 0.109 },
        { "limit": 5000000, "rate": 0.103 },
        { "limit": 1077550, "rate": 0.0965 },
        { "limit": 215400, "rate": 0.0685 },
        { "limit": 80650, "rate": 0.06 },
        { "limit": 13900, "rate": 0.055 },
        { "limit": 11700, "rate": 0.0525 },
        { "limit": 8500, "rate": 0.045 },
        { "limit": 0, "rate": 0.04 }
    ],
    "NE": [
        { "limit": 35730, "rate": 0.0664 },
        { "limit": 22170, "rate": 0.0501 },
        { "limit": 3700, "rate": 0.0351 },
        { "limit": 0, "rate": 0.0246 }
    ],
    "NV": [],
    "OH": [
        { "limit": 115300, "rate": 0.0399 },
        { "limit": 92150, "rate": 0.03688 },
        { "limit": 46100, "rate": 0.03226 },
        { "limit": 26050, "rate": 0.02765 }
    ],
    "OK": [
        { "limit": 7200, "rate": 0.0475 },
        { "limit": 4900, "rate": 0.0375 },
        { "limit": 3750, "rate": 0.0275 },
        { "limit": 2500, "rate": 0.0175 },
        { "limit": 1000, "rate": 0.0075 },
        { "limit": 0, "rate": 0.0025 }
    ],
    "OR": [
        { "limit": 125000, "rate": 0.099 },
        { "limit": 10200, "rate": 0.0875 },
        { "limit": 4050, "rate": 0.0675 },
        { "limit": 0, "rate": 0.0475 }
    ],
    "PA": [
        { "limit": 0, "rate": 0.0307 }
    ],
    "RI": [
        { "limit": 155050, "rate": 0.0599 },
        { "limit": 68200, "rate": 0.0475 },
        { "limit": 0, "rate": 0.0375 }
    ],
    "SC": [
        { "limit": 16040, "rate": 0.065 },
        { "limit": 3200, "rate": 0.03 },
        { "limit": 0, "rate": 0.00 }
    ],
    "SD": [],
    "TN": [],
    "TX": [],
    "UT": [
        { "limit": 0, "rate": 0.0485 }
    ],
    "VA": [
        { "limit": 17000, "rate": 0.0575 },
        { "limit": 5000, "rate": 0.05 },
        { "limit": 3000, "rate": 0.03 },
        { "limit": 0, "rate": 0.02 }
    ],
    
    "VT": [
        { "limit": 213150, "rate": 0.0875 },
        { "limit": 102200, "rate": 0.076 },
        { "limit": 42150, "rate": 0.066 },
        { "limit": 0, "rate": 0.0335 }
    ],
    "WV": [
        { "limit": 60000, "rate": 0.065 },
        { "limit": 40000, "rate": 0.06 },
        { "limit": 25000, "rate": 0.045 },
        { "limit": 10000, "rate": 0.04 },
        { "limit": 0, "rate": 0.03 }
    ],
    "WA": [],
    "WI": [
        { "limit": 304170, "rate": 0.0765 },
        { "limit": 27630, "rate": 0.053 },
        { "limit": 13810, "rate": 0.0465 },
        { "limit": 0, "rate": 0.0354 }
    ],
    "WY": []
};



// Define the calculateTax function to calculate both federal and SUBREGIONAL tax
function calculateTax(taxBrackets) {
    let tax = 0;
    let taxableIncome = ANNUALTAXABLEINCOME;

    for (const bracket of taxBrackets) {
        if (taxableIncome > bracket.limit) {
            let bracketTax = (taxableIncome - bracket.limit) * bracket.rate;
            tax += parseFloat(bracketTax.toFixed(2)); // Round to two decimal places and add to total tax
            taxableIncome = bracket.limit;
        }
    }
    return tax;
}



    // Define the calculateFederalTax function
function calculateRegionalTax() {
ANNUALREGIONALTAX = calculateTax(REGIONALTAXBRACKETSCAN);
document.getElementById('ANNUALREGIONALTAX').textContent = '$' + (ANNUALREGIONALTAX).toFixed(2);
}


// Define the calculateSubregionalTax function
function calculateSubregionalTax(Subregion, taxBrackets) {
  ANNUALSUBREGIONALTAX = calculateTax(taxBrackets[Subregion]);
  document.getElementById('ANNUALSUBREGIONALTAX').textContent = '$' + (ANNUALSUBREGIONALTAX).toFixed(2);
}


function calculateCapitalGainsTax() {
  // Check if region is USA
  const region = document.getElementById('RegionDropdown').value;
  if (region !== 'USA') {
    alert('Capital gains tax calculation only available for USA');
    return;
  }
  // Get user inputs
  const capitalGain = calculateAnnual('income_capital_gains_losses', 'income_capital_gains_losses_frequency');
  const stateRateInput = document.getElementById('income_capital_gain_state_rate').value;
  let stateRate = 0;
  
  // Check if state rate input is empty or 0, then set state rate to 0
  if (stateRateInput !== '' && parseFloat(stateRateInput) !== 0) {
    stateRate = parseFloat(stateRateInput) / 100;
  }

  // Calculate federal capital gains tax
  let federalTaxCG = 0;
  if (capitalGain <= 47025) {
    federalTaxCG = 0;
  } else if (capitalGain <= 518000) {
    federalTaxCG = (capitalGain - 47025) * 0.15;
  } else {
    federalTaxCG = (capitalGain - 518000) * 0.2 + (518000 - 47025) * 0.15;
  }
// Calculate state capital gains tax
  const stateTaxCG = capitalGain * stateRate;

  // Display the result
  const totalTaxCG = federalTaxCG + stateTaxCG;
  const resultDiv = document.getElementById('capital_gains_tax_result');
  
   TOTALTAXCG = totalTaxCG
  
  document.getElementById('TOTALTAXCG').textContent = '$' + (TOTALTAXCG).toFixed(2);
   
}


function calculateAnnualTax() {
    var regionDropdown = document.getElementById("RegionDropdown");
    let annualtaxx;
    if (regionDropdown.value === 'USA') {
        annualtaxx = (isNaN(ANNUALREGIONALTAX) ? 0 : ANNUALREGIONALTAX) +
                    (isNaN(ANNUALSUBREGIONALTAX) ? 0 : ANNUALSUBREGIONALTAX) +
                    (isNaN(TOTALTAXCG) ? 0 : TOTALTAXCG);
    } else if (regionDropdown.value === 'CAN') {
        annualtaxx = (isNaN(ANNUALREGIONALTAX) ? 0 : ANNUALREGIONALTAX) +
                    (isNaN(ANNUALSUBREGIONALTAX) ? 0 : ANNUALSUBREGIONALTAX);
    }
ANNUALTAX = annualtaxx
    
    document.getElementById('ANNUALTAX').textContent = '$' + (ANNUALTAX).toFixed(2);
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

    
    
function setIncomeData() {
  const frequencyFields = [
    "income_salary_wages_frequency",
    "income_tips_frequency",
    "income_bonuses_frequency",
    "income_sole_prop_frequency",
    "income_investment_property_frequency",
    "income_capital_gains_losses_frequency",
    "income_interest_frequency",
    "income_owner_dividend_frequency",
    "income_public_dividend_frequency",
    "income_trust_frequency",
    "income_federal_pension_frequency",
    "income_work_pension_frequency",
    "income_social_security_frequency",
    "income_employment_insurance_frequency",
    "income_alimony_frequency",
    "income_scholarships_grants_frequency",
    "income_royalties_frequency",
    "income_gambling_winnings_frequency",
    "income_peer_to_peer_lending_frequency",
    "income_venture_capital_frequency",
    "income_tax_free_income_frequency"
  ];

  const incomeFields = [
    "income_salary_wages",
    "income_tips",
    "income_bonuses",
    "income_sole_prop",
    "income_investment_property",
    "income_capital_gains_losses",
    "income_interest",
    "income_owner_dividend",
    "income_public_dividend",
    "income_trust",
    "income_federal_pension",
    "income_work_pension",
    "income_social_security",
    "income_employment_insurance",
    "income_alimony",
    "income_scholarships_grants",
    "income_royalties",
    "income_gambling_winnings",
    "income_peer_to_peer_lending",
    "income_venture_capital",
    "income_tax_free_income"
  ];

for (let i = 0; i < frequencyFields.length; i++) {
  const frequencyInput = document.getElementById(frequencyFields[i]);
  if (frequencyInput.value.trim() !== "") {
    const frequency = frequencyInput.value;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
  } else {
    const frequency = "0";
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
  }
}

for (let i = 0; i < incomeFields.length; i++) {
  const incomeInput = document.getElementById(incomeFields[i]);
  if (incomeInput.value.trim() !== "") {
    const income = incomeInput.value;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${incomeFields[i]}=${income}; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`; 
  } else {
    const income = "0";
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${incomeFields[i]}=${income}; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`;
  }
}
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to retrieve cookie value by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            // Decode the cookie value
            const decodedValue = decodeURIComponent(parts.pop().split(';').shift());
            // If the value is empty and it's a frequency field, set it to 'annually'
            if (decodedValue === '' && name.includes('_frequency')) {
                return 'annually';
            }
            return decodedValue;
        } else {
            return 'annually';
        }
    }

    document.getElementById('RegionDropdown').value = getCookie('RegionDropdown');
    document.getElementById('RegionDropdown').dispatchEvent(new Event('change')); // Manually trigger change event
document.getElementById('SubregionDropdown').value = getCookie('SubregionDropdown');
    
document.getElementById('income_salary_wages').value = getCookie('income_salary_wages');
document.getElementById('income_tips').value = getCookie('income_tips');
document.getElementById('income_bonuses').value = getCookie('income_bonuses');
document.getElementById('income_sole_prop').value = getCookie('income_sole_prop');
document.getElementById('income_investment_property').value = getCookie('income_investment_property');
document.getElementById('income_capital_gains_losses').value = getCookie('income_capital_gains_losses');
document.getElementById('income_interest').value = getCookie('income_interest');
document.getElementById('income_owner_dividend').value = getCookie('income_owner_dividend');
document.getElementById('income_public_dividend').value = getCookie('income_public_dividend');
document.getElementById('income_trust').value = getCookie('income_trust');
document.getElementById('income_federal_pension').value = getCookie('income_federal_pension');
document.getElementById('income_work_pension').value = getCookie('income_work_pension');
document.getElementById('income_social_security').value = getCookie('income_social_security');
document.getElementById('income_employment_insurance').value = getCookie('income_employment_insurance');
document.getElementById('income_alimony').value = getCookie('income_alimony');
document.getElementById('income_scholarships_grants').value = getCookie('income_scholarships_grants');
document.getElementById('income_royalties').value = getCookie('income_royalties');
document.getElementById('income_gambling_winnings').value = getCookie('income_gambling_winnings');
document.getElementById('income_peer_to_peer_lending').value = getCookie('income_peer_to_peer_lending');
document.getElementById('income_venture_capital').value = getCookie('income_venture_capital');
document.getElementById('income_tax_free_income').value = getCookie('income_tax_free_income');

document.getElementById('income_salary_wages_frequency').value = getCookie('income_salary_wages_frequency');
document.getElementById('income_tips_frequency').value = getCookie('income_tips_frequency');
document.getElementById('income_bonuses_frequency').value = getCookie('income_bonuses_frequency');
document.getElementById('income_sole_prop_frequency').value = getCookie('income_sole_prop_frequency');
document.getElementById('income_investment_property_frequency').value = getCookie('income_investment_property_frequency');
document.getElementById('income_capital_gains_losses_frequency').value = getCookie('income_capital_gains_losses_frequency');
document.getElementById('income_interest_frequency').value = getCookie('income_interest_frequency');
document.getElementById('income_owner_dividend_frequency').value = getCookie('income_owner_dividend_frequency');
document.getElementById('income_public_dividend_frequency').value = getCookie('income_public_dividend_frequency');
document.getElementById('income_trust_frequency').value = getCookie('income_trust_frequency');
document.getElementById('income_federal_pension_frequency').value = getCookie('income_federal_pension_frequency');
document.getElementById('income_work_pension_frequency').value = getCookie('income_work_pension_frequency');
document.getElementById('income_social_security_frequency').value = getCookie('income_social_security_frequency');
document.getElementById('income_employment_insurance_frequency').value = getCookie('income_employment_insurance_frequency');
document.getElementById('income_alimony_frequency').value = getCookie('income_alimony_frequency');
document.getElementById('income_scholarships_grants_frequency').value = getCookie('income_scholarships_grants_frequency');
document.getElementById('income_royalties_frequency').value = getCookie('income_royalties_frequency');
document.getElementById('income_gambling_winnings_frequency').value = getCookie('income_gambling_winnings_frequency');
document.getElementById('income_peer_to_peer_lending_frequency').value = getCookie('income_peer_to_peer_lending_frequency');
document.getElementById('income_venture_capital_frequency').value = getCookie('income_venture_capital_frequency');
document.getElementById('income_tax_free_income_frequency').value = getCookie('income_tax_free_income_frequency');

});

function handleUSAResident() {
    var regionDropdown = document.getElementById('RegionDropdown').value; // Assuming 'RegionDropdown' is the ID of your dropdown element
    if (regionDropdown === "USA") {
        calculateCapitalGainsTax();
        getMedicare();
        getSocialSecurity();
    }
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
  // Add SameSite and Secure attributes
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=None; Secure";
}
    
function calculateNext() {
    calculateAll();
window.location.href = '../finance/expense.html';
}   

    function calculateAll() {
        
    calculateNormalizedSum();
        
calculateRegionalTax();

        const SubregionDropdown = document.getElementById('SubregionDropdown');
    const Subregion = SubregionDropdown.value;
    calculateSubregionalTax(Subregion, SUBREGIONALTAXBRACKETS);

calculateAnnualTax();
        
    getCppPayable();
    
    getEIPayable();
        
    passiveincome();

handleUSAResident();
    
setIncomeData();

const regionDropdown = document.getElementById("RegionDropdown");
const subregionDropdown = document.getElementById("SubregionDropdown");
setCookie("RegionDropdown", RegionDropdown.value, 365); 
        setCookie("SubregionDropdown", SubregionDropdown.value, 365); 
        
// Save global variables as cookies with a longer expiration date
setCookie("ANNUALINCOME", ANNUALINCOME, 365);
setCookie("ANNUALEMPLOYMENTINCOME", ANNUALEMPLOYMENTINCOME, 365);
setCookie("PASSIVEINCOME", PASSIVEINCOME, 365); 
setCookie("ANNUALTAXABLEINCOME", ANNUALTAXABLEINCOME, 365);
setCookie("ANNUALREGIONALTAX", ANNUALREGIONALTAX, 365);
setCookie("ANNUALSUBREGIONALTAX", ANNUALSUBREGIONALTAX, 365);
setCookie("ANNUALTAX", ANNUALTAX, 365);
setCookie("ANNUALCPP", ANNUALCPP, 365);
setCookie("ANNUALEI", ANNUALEI, 365); 
setCookie("CPPPAYABLEEMPLOYED",CPPPAYABLEEMPLOYED , 365);
setCookie("CPPPAYABLESELFEMPLOYED", CPPPAYABLESELFEMPLOYED, 365);

        setCookie("TOTALTAXCG", TOTALTAXCG, 365);
setCookie("TOTALMEDICARE", TOTALMEDICARE, 365);
setCookie("TOTALSOCIALSECURITY", TOTALSOCIALSECURITY, 365);
        setCookie("TOTALSOCIALSECURITYE", TOTALSOCIALSECURITYE, 365);
        setCookie("TOTALSOCIALSECURITYSE", TOTALSOCIALSECURITYSE, 365);
    }


function deleteCookiesForDomain(domainToDelete) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var cookieName = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (cookieName.includes(domainToDelete)) {
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" + domainToDelete + "; path=/";
        }
    }
    console.log("Cookies with domain " + domainToDelete + " deleted.");
}


