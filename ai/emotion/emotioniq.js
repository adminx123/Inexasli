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

    if (promptType === 'EmotionIQ™') {
        const therapyGoal = document.getElementById('therapy-goal');
        if (therapyGoal?.value) {
            prompt += `Act as a compassionate and professional counselor/therapist. Use the following input to provide empathetic guidance, insights, and actionable steps to support my emotional well-being and work toward my therapy goal: ${therapyGoal.value}\n\n`;
            prompt += formatGrid('#therapy-emotions .grid-item.selected', 'Current Emotional State');
            prompt += formatGrid('#therapy-triggers .grid-item.selected', 'Triggers or Stressors');
            const recentEvents = document.getElementById('therapy-recent');
            if (recentEvents?.value) prompt += formatList(recentEvents.value, 'Recent Events or Feelings');
            prompt += formatGrid('#therapy-coping .grid-item.selected', 'Coping Strategies I’ve Tried');
            const therapyHistory = document.getElementById('therapy-history');
            if (therapyHistory?.value) prompt += formatList(therapyHistory.value, 'Therapy History or Context');
            const therapyContext = document.getElementById('therapy-context');
            if (therapyContext?.value) prompt += formatList(therapyContext.value, 'Additional Context (Past or Future)');
            prompt += `
                Output the response in a code block with two sections: "Reflections" and "Suggestions". Use the following format:
                \`\`\`
                Reflections:
                | Observation   | Details                                       |
                |---------------|-----------------------------------------------|
                | [Obs 1]       | [Insight based on emotions, triggers, etc.]   |
                | [Obs 2]       | [Additional insight]                          |

                Suggestions:
                | Step          | Action                                        | Purpose       |
                |---------------|-----------------------------------------------|---------------|
                | 1             | [Action, e.g., try daily journaling]          | [Why it helps] |
                | 2             | [Next action]                                 | [Why it helps] |

                Note: For professional mental health support, consider consulting a licensed therapist.
                \`\`\`
                Use a warm, supportive tone, avoiding clinical jargon unless clearly explained. Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a therapy goal.';
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