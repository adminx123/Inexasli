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

    if (promptType === 'FitnessIQ™') {
        const fitnessGoalsSelected = document.querySelectorAll('#fitness-goal .grid-item.selected');
        if (fitnessGoalsSelected.length > 0) {
            prompt += formatGrid('#fitness-goal .grid-item.selected', 'Fitness Goals');
            const locationSelection = document.querySelector('#fitness-home-exercises .grid-item.selected');
            if (locationSelection) {
                const locationValue = locationSelection.getAttribute('data-value');
                prompt += formatList(locationValue, 'Workout Location');
            }
            const age = document.getElementById('fitness-age');
            if (age?.value) prompt += formatList(age.value, 'Age');
            const height = document.getElementById('fitness-height');
            const heightUnit = document.getElementById('fitness-height-unit');
            if (height?.value && heightUnit?.value) prompt += formatList(`${height.value} ${heightUnit.value}`, 'Height');
            const weight = document.getElementById('fitness-weight');
            const weightUnit = document.getElementById('fitness-weight-unit');
            if (weight?.value && weightUnit?.value) prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
            prompt += formatGrid('#fitness-level .grid-item.selected', 'Fitness Level');
            const injuries = document.getElementById('fitness-injuries');
            if (injuries?.value) prompt += formatList(injuries.value, 'Injuries/Health Conditions');
            const frequency = document.getElementById('fitness-frequency');
            if (frequency?.value) prompt += formatList(frequency.value, 'Workouts per Week');
            const duration = document.getElementById('fitness-duration');
            if (duration?.value) prompt += formatList(duration.value, 'Workout Duration (minutes)');
            prompt += `
                Create a personalized fitness plan based on the provided fitness goals, location, age, height, weight, fitness level, injuries, frequency, and duration. Output the plan in a code block with sections for each workout (e.g., "Workout 1", "Workout 2") and subcategories in a table format. Use the following format:
                \`\`\`
                Workout 1:
                | Exercise      | Sets | Reps | Rest (sec) | Notes                     |
                |---------------|------|------|------------|---------------------------|
                | [Exercise 1]  | [N]  | [N]  | [N]        | [E.g., adjust for injury] |
                | [Exercise 2]  | [N]  | [N]  | [N]        | [E.g., use bodyweight]    |

                Workout 2:
                | Exercise      | Sets | Reps | Rest (sec) | Notes                     |
                |---------------|------|------|------------|---------------------------|
                | [Exercise 1]  | [N]  | [N]  | [N]        | [E.g., adjust for injury] |

                Note: Consult a fitness professional or physician before starting any new exercise program.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please select at least one fitness goal.';
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