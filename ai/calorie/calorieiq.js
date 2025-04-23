/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Repopulate saved data
    repopulateForm();

    // Grid item selection with save
    document.querySelectorAll('.grid-container .grid-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            saveGridItem(item);
        });
    });

    // Input, textarea, and select change listeners for saving
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('change', () => saveInput(input));
    });

    // Generate prompt button with save
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            saveFormData(); // Save all data on generate button click
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });

    // Clear button
    document.querySelectorAll('.clear-btn').forEach(button => {
        button.addEventListener('click', clearLocalStorage);
    });
});

function saveGridItem(item) {
    const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
    const value = item.classList.contains('selected') ? 'true' : 'false';
    try {
        localStorage.setItem(key, value);
        console.log(`Saved ${key}: ${value}`);
    } catch (error) {
        console.error(`Error saving grid item ${key}:`, error);
    }
}

function saveInput(input) {
    const key = `input_${input.id}`;
    const value = input.value;
    try {
        localStorage.setItem(key, value);
        console.log(`Saved ${key}: ${value}`);
    } catch (error) {
        console.error(`Error saving input ${key}:`, error);
    }
}

function saveFormData() {
    document.querySelectorAll('.grid-container .grid-item').forEach(saveGridItem);
    document.querySelectorAll('input, textarea, select').forEach(saveInput);
}

function repopulateForm() {
    document.querySelectorAll('.grid-container .grid-item').forEach(item => {
        const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
        const value = localStorage.getItem(key);
        if (value === 'true') {
            item.classList.add('selected');
            console.log(`Restored ${key}: true`);
        } else if (value === 'false') {
            item.classList.remove('selected');
            console.log(`Restored ${key}: false`);
        }
    });

    document.querySelectorAll('input, textarea, select').forEach(input => {
        const key = `input_${input.id}`;
        const value = localStorage.getItem(key);
        if (value !== null) {
            input.value = value;
            console.log(`Restored ${key}: ${value}`);
        }
    });
}

function clearLocalStorage() {
    if (!confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) {
        console.log("User canceled the clear action.");
        return;
    }

    // Clear grid items
    document.querySelectorAll('.grid-container .grid-item').forEach(item => {
        const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
        try {
            localStorage.removeItem(key);
            item.classList.remove('selected');
            console.log(`Cleared ${key}`);
        } catch (error) {
            console.error(`Error clearing ${key}:`, error);
        }
    });

    // Clear inputs, textarea, and selects
    document.querySelectorAll('input, textarea, select').forEach(input => {
        const key = `input_${input.id}`;
        try {
            localStorage.removeItem(key);
            input.value = '';
            console.log(`Cleared ${key}`);
        } catch (error) {
            console.error(`Error clearing ${key}:`, error);
        }
    });

    // Reset selects to default
    const heightUnit = document.getElementById('calorie-height-unit');
    const weightUnit = document.getElementById('calorie-weight-unit');
    if (heightUnit) heightUnit.value = 'ft';
    if (weightUnit) weightUnit.value = 'lbs';

    console.log("All saved data cleared and form reset.");
}

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
            prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
        }
        prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');
        const foodLog = document.getElementById('calorie-food-log');
        if (foodLog?.value) prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
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