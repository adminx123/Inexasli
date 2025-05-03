/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Grid item selection
    document.querySelectorAll('.grid-container .grid-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('selected'));
    });

    // Generate prompt button
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });
});

const formatList = (items, prefix) => items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
const formatGrid = (selector, prefix) => {
    const items = Array.from(document.querySelectorAll(selector))
        .filter(el => el.classList.contains('selected'))
        .map(el => el.dataset.value)
        .join('\n');
    return items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
};

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'GeneralIQ™') {
        const generalGoal = document.getElementById('general-goal');
        if (generalGoal?.value) {
            prompt += formatList(generalGoal.value, 'Goal');
            prompt += formatGrid('#general-purpose .grid-item.selected', 'Purpose of Analysis');
            const generalContext = document.getElementById('general-context');
            if (generalContext?.value) prompt += formatList(generalContext.value, 'Context');
            const selectedFormat = document.querySelector('#general-info-return .grid-item.selected');
            let formatValue = selectedFormat ? selectedFormat.getAttribute('data-value') : 'table';
            prompt += formatList(formatValue.charAt(0).toUpperCase() + formatValue.slice(1), 'Return Format');
            prompt += `
                Analyze the provided goal, purpose, context, and return format to provide a structured analysis. Output the analysis in a code block with the following table format, unless another format is specified:
                \`\`\`
                Analysis Results:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Goal               | [Goal, e.g., Planning an exciting hike]      |
                | Purpose            | [Purpose, e.g., Improving Decision-Making]   |
                | Context            | [Context, e.g., Hiking in Colorado, Dog-friendly] |
                | Key Findings       | [Findings based on analysis]                 |
                | Recommendations    | [Recommendations, e.g., Suggested trails]     |

                Note: For complex analyses, consult a domain expert.
                \`\`\`
                If a specific return format (e.g., JSON, Narrative) is selected, adapt the output to that format while maintaining a code block. Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a goal.';
        }
    } else {
        console.log('Debug: Unknown prompt type:', promptType);
        prompt = 'Error: Invalid prompt type.';
    }

    if (prompt) {
        console.log('Debug: Generated prompt content:', prompt);
        openCustomModal(prompt);
    }
}

function openCustomModal(content) {
    console.log('Debug: openCustomModal called with content:', content);
    openGeneratedPromptModal();
}

window.openCustomModal = openCustomModal;