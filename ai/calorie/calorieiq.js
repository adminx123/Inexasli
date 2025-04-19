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
    // Correcting the debug log to reference the correct parameter name
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'CalorieIQ™') {
        prompt += formatGrid('#calorie-goal .grid-item.selected', 'Estimate calories and macronutrients for the following input as a percentage of daily requirements relative to my goal. Also analyze my height, weight, and age to compare me against the average person at my height, age, and weight. ');
        prompt += `
            Output only a text-based table in a code block with these exact columns: Nutrient, Target Amount, Food Log Intake, Percentage Reached. Use this header format in the code block:
            Include no text outside the code block—no comments, explanations, or recommendations unless specified below.
            `;
        const recommendations = document.querySelector('#calorie-recommendations .grid-item.selected');
        if (recommendations) {
            prompt += `
                If there are deficits in calories or macronutrients based on my goal and food log, suggest meal recommendations to meet the remaining needs. Output meal suggestions in a separate text-based table in a code block with columns: Meal, Calories, Protein (g), Carbs (g), Fat (g). Use this header format:
                Include no text outside the code blocks.
                `;
        }
        prompt += `
            Add any future amounts I provide to the running totals unless I request a new estimate.
            `;
        const age = document.getElementById('calorie-age');
        if (age?.value) prompt += formatList(age.value, 'Age');
        const height = document.getElementById('calorie-height');
        const heightUnit = document.getElementById('calorie-height-unit');
        if (height?.value && heightUnit?.value) {
            prompt += formatList(`${height.value} ${heightUnit.value}`, 'Height');
        }
        const weight = document.getElementById('calorie-weight');
        const weightUnit = document.getElementById('calorie-weight-unit');
        if (weight?.value && weightUnit?.value) {
            prompt += formatList(`${height.value} ${weightUnit.value}`, 'Weight');
        }
        prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');
        const foodLog = document.getElementById('calorie-food-log');
        if (foodLog?.value) prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
    }

    if (prompt) {
        // Adding a debug log to check the value of the prompt variable before calling openCustomModal
        console.log('Debug: Generated prompt content:', prompt);
        openCustomModal(prompt);
    }
}

function openCustomModal(content) {
    // Adding a debug log to verify if openCustomModal is being called and modal is appended
    console.log('Debug: openCustomModal called with content:', content);

    // Updating openCustomModal to use openGeneratedPromptModal
    openGeneratedPromptModal();
}

window.openCustomModal = openCustomModal;