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

    if (promptType === 'SpeculationIQ™') {
        const speculationGoal = document.getElementById('speculation-goal');
        if (speculationGoal?.value) {
            prompt += formatList(speculationGoal.value, 'Speculation Goal');
            const speculationPurpose = document.getElementById('speculation-purpose');
            if (speculationPurpose?.value) prompt += formatList(speculationPurpose.value, 'Purpose of Speculation');
            const speculationType = document.getElementById('speculation-type');
            if (speculationType?.value) prompt += formatList(speculationType.value.charAt(0).toUpperCase() + speculationType.value.slice(1), 'Type of Speculation');
            const speculationScope = document.getElementById('speculation-scope');
            if (speculationScope?.value) prompt += formatList(speculationScope.value, 'Scope of Speculation');
            const speculationApproach = document.getElementById('speculation-approach');
            if (speculationApproach?.value) prompt += formatList(speculationApproach.value.charAt(0).toUpperCase() + speculationApproach.value.slice(1), 'Approach to Speculation');
            const speculationAudience = document.getElementById('speculation-audience');
            if (speculationAudience?.value) prompt += formatList(speculationAudience.value, 'Focus of Speculation');
            const speculationContext = document.getElementById('speculation-context');
            if (speculationContext?.value) prompt += formatList(speculationContext.value, 'Context of Speculation');
            const speculationOutcomes = document.getElementById('speculation-outcomes');
            if (speculationOutcomes?.value) prompt += formatList(speculationOutcomes.value, 'Expected Outcomes');
            const additionalDetails = document.getElementById('additional-details');
            if (additionalDetails?.value) prompt += formatList(additionalDetails.value, 'Additional Details');
            prompt += `
                Create a speculation plan based on the provided goal, purpose, type, scope, approach, focus, context, outcomes, and additional details. Output the plan in a code block with the following table format:
                \`\`\`
                Speculation Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Goal               | [Goal, e.g., Imagine future trends]          |
                | Purpose            | [Purpose, e.g., Inspire new ideas]           |
                | Type               | [Type, e.g., Futuristic]                     |
                | Scope              | [Scope, e.g., Specific industry, 10 years]   |
                | Approach           | [Approach, e.g., Brainstorming]              |
                | Focus              | [Focus, e.g., Technology, Cancer drugs]      |
                | Context            | [Context, e.g., Current AI trends]           |
                | Expected Outcomes  | [Outcomes, e.g., New concepts, Hypotheses]   |
                | Additional Details | [Details, e.g., Wild tone, Sci-fi inspiration] |

                Proposed Speculative Ideas:
                | Idea | Description                               | Potential Impact           |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Idea, e.g., AI-driven cancer treatment]  | [Impact, e.g., Improved outcomes] |
                | 2    | [Idea, e.g., Virtual reality healthcare]  | [Impact, e.g., Accessibility] |

                Note: Speculative ideas are exploratory and should be validated with research or expert consultation.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a speculation goal.';
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