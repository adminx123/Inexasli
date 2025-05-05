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
    // Generate prompt button
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });
});

const formatList = (items, prefix) => items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';

// Format function for grid items
const formatGridItems = (containerId, prefix) => {
    const container = document.getElementById(containerId);
    if (!container) return '';
    
    const selectedItems = Array.from(container.querySelectorAll('.grid-item.selected'))
        .map(item => {
            const value = item.getAttribute('data-value');
            return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
        });
    
    return selectedItems.length ? 
        `${prefix}:\n${selectedItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
};

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'DecisionIQ™') {
        const decisionGoal = document.getElementById('decisioniq-goal');
        if (decisionGoal?.value) {
            prompt += formatList(decisionGoal.value, 'Decision Goal');
            const analysisType = document.getElementById('decisioniq-analysis-type');
            if (analysisType?.value) prompt += formatList(analysisType.value.charAt(0).toUpperCase() + analysisType.value.slice(1), 'Analysis Type');
            const priority = document.getElementById('decisioniq-priority');
            if (priority?.value) prompt += formatList(priority.value.charAt(0).toUpperCase() + priority.value.slice(1), 'Priority Focus');
            const criteria = document.getElementById('decisioniq-criteria');
            if (criteria?.value) prompt += formatList(criteria.value, 'Decision Criteria');
            const options = document.getElementById('decisioniq-options');
            if (options?.value) prompt += formatList(options.value, 'Decision Options');
            
            // Use the new grid-items format function instead of checkbox formatting
            prompt += formatGridItems('decisioniq-stakeholders', 'Stakeholders');
            
            const constraints = document.getElementById('decisioniq-constraints');
            if (constraints?.value) prompt += formatList(constraints.value, 'Constraints');
            const instructions = document.getElementById('decisioniq-instructions');
            if (instructions?.value) prompt += formatList(instructions.value, 'Additional Instructions');
            prompt += `
                Create a decision analysis plan based on the provided goal, analysis type, priority, criteria, options, stakeholders, constraints, and instructions. Output the plan in a code block with the following table format:
                \`\`\`
                Decision Analysis Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Goal               | [Goal, e.g., Choose a software vendor]       |
                | Analysis Type      | [Type, e.g., Pros/Cons]                      |
                | Priority Focus     | [Priority, e.g., Cost]                       |
                | Criteria           | [Criteria, e.g., Cost, Features]             |
                | Options            | [Options, e.g., Vendor A, Vendor B]          |
                | Stakeholders       | [Stakeholders, e.g., Team Members, Executives] |
                | Constraints        | [Constraints, e.g., Budget, Timeline]        |
                | Instructions       | [Instructions, e.g., Include risk analysis]  |

                Recommended Approach:
                | Step | Action                                    | Details                    |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., List pros/cons]            | [Details, e.g., For each vendor] |
                | 2    | [Action, e.g., Evaluate costs]            | [Details, e.g., Quantitative] |

                Note: Consult stakeholders or a decision-making expert for critical decisions.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a decision goal.';
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