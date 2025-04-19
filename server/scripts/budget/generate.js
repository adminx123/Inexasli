import { getLocal } from '/server/scripts/getlocal.js';


function generateFinancialPrompt() {
    let prompt = "";

    // Define the required localStorage keys
    const requiredFields = [
        'ANNUALINCOME', 'ANNUALEMPLOYMENTINCOME', 'fillingStatus', 'income_sole_prop', 
        'birthYearDisabledDependants', 'RETIREMENTCONTRIBUTION', 'residency'
    ];

    // Add data to prompt
    requiredFields.forEach(field => {
        const value = getLocal(field);
        if (value && value !== '') {
            prompt += `${field}\t${value}\n`;
        }
    });

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
        expandSummaryContainer(); // Expand all contents
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

function expandSummaryContainer() {
    const summaryContainer = document.querySelector('.summary-container');
    if (summaryContainer) {
        const detailsElements = summaryContainer.querySelectorAll('details');
        detailsElements.forEach(details => {
            details.open = true; // Expand all <details> elements
        });
    }
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