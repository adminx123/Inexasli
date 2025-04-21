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
    // Single selection for area-goal
    document.querySelectorAll('#area-goal .grid-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('#area-goal .grid-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        });
    });

    // Multiple selection for other grids
    document.querySelectorAll('#incident-goal .grid-item, #incident-warnings .grid-item, #incident-mood .grid-item').forEach(item => {
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

    if (promptType === 'SocialIQ™') {
        const incidentDetails = document.getElementById('incident-details');
        if (incidentDetails?.value) {
            prompt += formatGrid('#area-goal .grid-item.selected', 'Incident Area');
            prompt += formatGrid('#incident-goal .grid-item.selected', 'Analysis Goals');
            prompt += formatList(incidentDetails.value, 'Incident Details');
            prompt += formatGrid('#incident-warnings .grid-item.selected', 'My Personality Traits');
            prompt += formatGrid('#incident-mood .grid-item.selected', 'Perceived Mood/Tone of Others');
            const incidentMoments = document.getElementById('incident-moments');
            if (incidentMoments?.value) prompt += formatList(incidentMoments.value, 'Key Moments');
            const incidentThoughts = document.getElementById('incident-thoughts');
            if (incidentThoughts?.value) prompt += formatList(incidentThoughts.value, 'My Initial Thoughts');
            prompt += `
                Analyze the provided social incident based on the incident area, analysis goals, details, personality traits, perceived mood, key moments, and initial thoughts to maximize efficiency, productivity, safety, and understanding of social dynamics. Output the analysis in a code block with the following table format:
                \`\`\`
                Social Incident Analysis:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Incident Area      | [Area, e.g., Workplace]                      |
                | Analysis Goals     | [Goals, e.g., Root Cause Identification]     |
                | Incident Details   | [Details, e.g., Argued over missed deadline] |
                | Personality Traits | [Traits, e.g., Impulsive, Insecure]          |
                | Perceived Mood     | [Mood, e.g., Angry, Frustrated]              |
                | Key Moments        | [Moments, e.g., They raised their voice]     |
                | Initial Thoughts   | [Thoughts, e.g., Am I going to lose my job]  |

                Recommendations:
                | Step | Action                                    | Details                    |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Schedule mediation]        | [Details, e.g., Discuss calmly] |
                | 2    | [Action, e.g., Reflect on impulsiveness]  | [Details, e.g., Practice patience] |

                Note: Consult a mediator or HR professional for workplace incidents or a counselor for personal life incidents.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide incident details.';
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