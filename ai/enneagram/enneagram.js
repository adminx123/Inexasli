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

    if (promptType === 'EnneagramIQ™') {
        const enneagramSelf = document.getElementById('enneagram-self');
        if (enneagramSelf?.value) {
            prompt += formatList(enneagramSelf.value, 'Self-Description');
            prompt += formatGrid('#enneagram-traits .grid-item.selected', 'Core Traits I Identify With');
            prompt += formatGrid('#enneagram-behaviors .grid-item.selected', 'Behavioral Responses');
            const motivations = document.getElementById('enneagram-motivations');
            if (motivations?.value) prompt += formatList(motivations.value, 'Core Motivations');
            const fears = document.getElementById('enneagram-fears');
            if (fears?.value) prompt += formatList(fears.value, 'Core Fears');
            const stress = document.getElementById('enneagram-stress');
            if (stress?.value) prompt += formatList(stress.value, 'Behavior Under Stress');
            const growth = document.getElementById('enneagram-growth');
            if (growth?.value) prompt += formatList(growth.value, 'Behavior at My Best');
            const childhood = document.getElementById('enneagram-childhood');
            if (childhood?.value) prompt += formatList(childhood.value, 'Influential Childhood Memory');
            prompt += `
                Analyze the provided self-description, traits, behaviors, motivations, fears, stress, growth, and childhood memory to determine my primary Enneagram type, potential wing(s), stress and growth directions, and additional insights based on Enneagram theory. Output the analysis in a code block with the following table format:
                \`\`\`
                Enneagram Assessment:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Primary Type       | [Type, e.g., Type 1: The Reformer]           |
                | Wing(s)            | [Wing(s), e.g., 1w2, 1w9, or None]           |
                | Stress Direction   | [Type in stress, e.g., Moves to Type 4]      |
                | Growth Direction   | [Type in growth, e.g., Moves to Type 7]      |
                | Key Insights       | [Insights based on input, e.g., Perfectionist tendencies] |

                Note: This is an interpretive tool. For a professional Enneagram assessment, consult a certified coach.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a self-description.';
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