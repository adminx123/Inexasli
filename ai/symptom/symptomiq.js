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

    if (promptType === 'SymptomIQ™') {
        const rootoutSymptoms = document.getElementById('rootout-symptoms');
        if (rootoutSymptoms?.value) {
            prompt += formatList(rootoutSymptoms.value, 'Symptoms');
            prompt += formatGrid('#rootout-triggers .grid-item.selected', 'Potential Triggers');
            const rootoutDiet = document.getElementById('rootout-diet');
            if (rootoutDiet?.value) prompt += formatList(rootoutDiet.value, 'Diet (Past 48 Hours)');
            const rootoutTiming = document.getElementById('rootout-timing');
            if (rootoutTiming?.value) prompt += formatList(rootoutTiming.value, 'Timing of Symptoms');
            const rootoutPatterns = document.getElementById('rootout-patterns');
            if (rootoutPatterns?.value) prompt += formatList(rootoutPatterns.value, 'Observed Patterns');
            const rootoutContext = document.getElementById('rootout-context');
            if (rootoutContext?.value) prompt += formatList(rootoutContext.value, 'Additional Context');
            prompt += `
                Analyze the provided symptoms, triggers, diet, timing, patterns, and context to identify potential causes and provide an elimination plan. Output the response in a code block with two sections: "Potential Causes" and "Elimination Plan". Use the following format:
                \`\`\`
                Potential Causes:
                | Cause         | Reasoning                                      | Likelihood |
                |---------------|-----------------------------------------------|------------|
                | [Cause 1]     | [Why this might cause symptoms]               | [High/Med/Low] |
                | [Cause 2]     | [Why this might cause symptoms]               | [High/Med/Low] |

                Elimination Plan:
                | Step          | Action                                        | Duration   |
                |---------------|-----------------------------------------------|------------|
                | 1             | [Action to test cause, e.g., avoid X food]    | [e.g., 1 week] |
                | 2             | [Next action]                                 | [Duration] |

                Note: Consult a healthcare professional for medical concerns.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide symptoms to analyze.';
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