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

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'ResearchIQ™') {
        const researchGoal = document.getElementById('research-goal');
        if (researchGoal?.value) {
            prompt += formatList(researchGoal.value, 'Research Goal');
            const researchPurpose = document.getElementById('research-purpose');
            if (researchPurpose?.value) prompt += formatList(researchPurpose.value, 'Purpose of Research');
            const researchType = document.getElementById('research-type');
            if (researchType?.value) prompt += formatList(researchType.value.charAt(0).toUpperCase() + researchType.value.slice(1), 'Type of Research');
            const researchScope = document.getElementById('research-scope');
            if (researchScope?.value) prompt += formatList(researchScope.value, 'Scope of Research');
            const dataCollectionMethod = document.getElementById('data-collection-method');
            if (dataCollectionMethod?.value) prompt += formatList(dataCollectionMethod.value.charAt(0).toUpperCase() + dataCollectionMethod.value.slice(1), 'Data Collection Method');
            const researchAudience = document.getElementById('research-audience');
            if (researchAudience?.value) prompt += formatList(researchAudience.value, 'Target Audience');
            const researchContext = document.getElementById('research-context');
            if (researchContext?.value) prompt += formatList(researchContext.value, 'Context of Research');
            const researchDeliverables = document.getElementById('research-deliverables');
            if (researchDeliverables?.value) prompt += formatList(researchDeliverables.value, 'Expected Deliverables');
            const additionalDetails = document.getElementById('additional-details');
            if (additionalDetails?.value) prompt += formatList(additionalDetails.value, 'Additional Details');
            prompt += `
                Create a research plan based on the provided goal, purpose, type, scope, data collection method, target audience, context, deliverables, and additional details. Output the plan in a code block with the following table format:
                \`\`\`
                Research Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Goal               | [Goal, e.g., Understand market trends]       |
                | Purpose            | [Purpose, e.g., Inform business decision]    |
                | Type               | [Type, e.g., Qualitative]                    |
                | Scope              | [Scope, e.g., North America, 18-35 age group]|
                | Data Collection    | [Method, e.g., Survey]                       |
                | Target Audience    | [Audience, e.g., Young professionals]        |
                | Context            | [Context, e.g., Recent economic shifts]      |
                | Deliverables       | [Deliverables, e.g., Report, Presentation]   |
                | Additional Details | [Details, e.g., Ethical concerns]            |

                Proposed Research Steps:
                | Step | Action                                    | Details                    |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Design survey]             | [Details, e.g., Target key metrics] |
                | 2    | [Action, e.g., Conduct interviews]        | [Details, e.g., Focus on insights] |

                Note: Consult a research professional to ensure methodological rigor and ethical compliance.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a research goal.';
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