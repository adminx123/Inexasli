import { getLocal } from '/server/scripts/getlocal.js';


function generateFinancialPrompt() {
    let prompt = `Text goes here for what i want the prmpt so say`;

    // Check filling status
    const fillingStatus = getLocal('fillingStatus');
    if (fillingStatus && fillingStatus.toLowerCase().includes('partner')) {
        prompt += `Note: The user is filing with a partner (fillingStatus: ${fillingStatus}). Ensure tax calculations reflect joint filing where applicable.\n\n`;
    }

    // Define all localStorage keys
    const incomeFields = [
        'income_salary_wages', 'income_salary_wages_partner', 'income_salary_wages_shared', 
        'income_salary_wages_shared_p1_percent', 'income_salary_wages_shared_p2_percent',
        // ... (other income fields as defined in original code)
    ];

    const incomeFrequencyFields = [
        'income_salary_wages_frequency', 'income_salary_wages_partner_frequency',
        // ... (other income frequency fields)
    ];

    const expenseFields = [
        'expenses_grocery', 'expenses_grocery_partner', 'expenses_grocery_shared', 
        'expenses_grocery_shared_p1_percent', 'expenses_grocery_shared_p2_percent',
        // ... (other expense fields)
    ];

    const expenseFrequencyFields = [
        'expenses_grocery_frequency', 'expenses_grocery_partner_frequency',
        // ... (other expense frequency fields)
    ];

    const assetFields = [
        'assets_checking_accounts', 'assets_checking_accounts_partner', 'assets_checking_accounts_shared', 
        'assets_checking_accounts_shared_p1_percent', 'assets_checking_accounts_shared_p2_percent',
        // ... (other asset fields)
    ];

    const liabilityFields = [
        'liabilities_small_business_loan', 'liabilities_small_business_loan_partner', 'liabilities_small_business_loan_shared', 
        'liabilities_small_business_loan_shared_p1_percent', 'liabilities_small_business_loan_shared_p2_percent',
        // ... (other liability fields)
    ];

    const otherFields = [
        'selectedCountry', 'selectedSubregion', 'summary_reached', 'fillingStatus'
    ];

    // Add data to prompt
    const region = getLocal('selectedCountry');
    const subregion = getLocal('selectedSubregion');
    if (region && region !== 'NONE') {
        prompt += `Region: ${region}\n`;
        if (subregion) prompt += `Subregion: ${subregion}\n\n`;
    }

    // Add ageSelf and ageSpouse
    const ageSelf = getLocal('ageSelf');
    const ageSpouse = getLocal('ageSpouse');
    if (ageSelf && ageSelf !== '0') {
        prompt += `Age (Self): ${ageSelf}\n`;
    }
    if (ageSpouse && ageSpouse !== '0') {
        prompt += `Age (Spouse): ${ageSpouse}\n`;
    }

    // Add employmentStatus
    const employmentStatus = getLocal('employmentStatus');
    if (employmentStatus && employmentStatus !== 'NONE') {
        prompt += `Employment Status: ${employmentStatus}\n`;
    }

    // Handle single filing status
    if (fillingStatus && fillingStatus.includes('single')) {
        const excludedKeys = ['partner', 'shared', 'percent'];
        const filterKeys = (key) => !excludedKeys.some(excluded => key.includes(excluded));

        const filteredIncomeFields = incomeFields.filter(filterKeys);
        const filteredExpenseFields = expenseFields.filter(filterKeys);
        const filteredAssetFields = assetFields.filter(filterKeys);
        const filteredLiabilityFields = liabilityFields.filter(filterKeys);

        prompt += formatSection(filteredIncomeFields, 'Income');
        prompt += formatFrequencySection(incomeFrequencyFields.filter(filterKeys), 'Income');
        prompt += formatSection(filteredExpenseFields, 'Expenses');
        prompt += formatFrequencySection(expenseFrequencyFields.filter(filterKeys), 'Expenses');
        prompt += formatSection(filteredAssetFields, 'Assets');
        prompt += formatSection(filteredLiabilityFields, 'Liabilities');
    } else {
        prompt += formatSection(incomeFields, 'Income');
        prompt += formatFrequencySection(incomeFrequencyFields, 'Income');
        prompt += formatSection(expenseFields, 'Expenses');
        prompt += formatFrequencySection(expenseFrequencyFields, 'Expenses');
        prompt += formatSection(assetFields, 'Assets');
        prompt += formatSection(liabilityFields, 'Liabilities');
    }

    prompt += formatSection(otherFields, 'Other Settings');

    prompt = addFrequencyItemsToPrompt(prompt);

    // Handle empty prompt case
    if (prompt.trim() === 'texta gasdgasgdgas8888***' ){
        openGeneratedPromptModal();
        return;
    }

    // Copy to clipboard and show modal
    navigator.clipboard.writeText(prompt).then(() => {
        openGeneratedPromptModal();
    }).catch(err => {
        console.error('Failed to copy prompt:', err);
        openGeneratedPromptModal();
        console.log(prompt); // Log for manual copy
    });

    // Unhide the summary-container
    const summaryContainer = document.querySelector('.summary-container');
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
    }
}


const formatSection = (items, prefix) => {
    let output = '';
    items.forEach(item => {
        const value = getLocal(item);
        if (value && value !== '' && value !== '0') {
            output += `${item}: ${value}\n`;
        }
    });
    return output ? `${prefix}:\n${output}\n` : '';
};

const formatFrequencySection = (items, prefix) => {
    let output = '';
    items.forEach(item => {
        const value = getLocal(item.replace('_frequency', ''));
        const frequencyValue = getLocal(item);
        if (value && value !== '' && value !== '0' && frequencyValue && frequencyValue !== '' && frequencyValue !== '0') {
            output += `${item.replace('_frequency', '')}: ${frequencyValue}\n`;
        }
    });
    return output ? `${prefix} Frequencies:\n${output}\n` : '';
};

function addFrequencyItemsToPrompt(prompt) {
    let frequencySection = 'Frequency Items:\n';
    let hasFrequencyItems = false;

    const fillingStatus = getLocal('fillingStatus');
    const excludePartnerFrequencies = fillingStatus && fillingStatus.toLowerCase().includes('single');

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (key.includes('frequency')) {
            const correspondingKey = key.replace('frequency_', '').replace('_frequency', '');
            const correspondingValue = localStorage.getItem(correspondingKey);

            if (excludePartnerFrequencies && key.toLowerCase().includes('partner')) {
                continue;
            }

            if (correspondingValue && correspondingValue.trim() !== '' && correspondingValue !== '0') {
                frequencySection += `${key}: ${value}\n`;
                hasFrequencyItems = true;
            }
        }
    }

    if (hasFrequencyItems) {
        prompt += `\n${frequencySection}`;
    }

    return prompt;
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            generateFinancialPrompt();
        });
    });
});

document.querySelector('.generate-btn').addEventListener('click', function() {
    // Existing prompt generation code
    generateIncomeIQPrompt(); // Hypothetical function
    // Show summary container
    document.querySelector('.summary-container').style.display = 'block';
});