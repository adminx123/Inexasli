/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    repopulateForm();
    document.querySelectorAll('.grid-container').forEach(container => {
        container.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', () => {
                // Enforce single selection for #calorie-activity and #calorie-diet-type
                if (container.id === 'calorie-activity' || container.id === 'calorie-diet-type') {
                    container.querySelectorAll('.grid-item').forEach(otherItem => {
                        otherItem.classList.remove('selected');
                    });
                    item.classList.add('selected');
                } else {
                    // Allow multiple selections for other grids (e.g., #calorie-goal)
                    item.classList.toggle('selected');
                }
                saveGridItem(item);
            });
        });
    });
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('change', () => saveInput(input));
    });
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            saveFormData();
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });
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
    const weightUnit = document.getElementById('calorie-weight-unit');
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Prompt copied to clipboard successfully!');
    }).catch(err => {
        console.error('Failed to copy prompt to clipboard:', err);
    });
}

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
        if (height?.value) {
            prompt += formatList(`${height.value} ft`, 'Height');
        }
        const weight = document.getElementById('calorie-weight');
        const weightUnit = document.getElementById('calorie-weight-unit');
        if (weight?.value && weightUnit?.value) {
            prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
        }
        const sex = document.getElementById('calorie-sex');
        if (sex?.value) prompt += formatList(sex.value, 'Sex');
        const waist = document.getElementById('calorie-waist');
        if (waist?.value) prompt += formatList(`${waist.value} cm`, 'Waist Circumference');
        const hip = document.getElementById('calorie-hip');
        if (hip?.value) prompt += formatList(`${hip.value} cm`, 'Hip Circumference');
        const chest = document.getElementById('calorie-chest');
        if (chest?.value) prompt += formatList(`${chest.value} cm`, 'Chest Circumference');
        const arm = document.getElementById('calorie-arm');
        if (arm?.value) prompt += formatList(`${arm.value} cm`, 'Arm Circumference');
        prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');
        prompt += formatGrid('#calorie-diet-type .grid-item.selected', 'Diet Type');
        const foodLog = document.getElementById('calorie-food-log');
        if (foodLog?.value) prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
    }
    if (prompt) {
        console.log('Debug: Generated prompt content:', prompt);
        copyToClipboard(prompt);
        openCustomModal(prompt);
    }
}

function openCustomModal(content) {
    console.log('Debug: openCustomModal called with content:', content);
    openGeneratedPromptModal();
}

document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function () {
        this.style.height = '100px';
        this.style.height = `${this.scrollHeight}px`;
    });
});

window.openCustomModal = openCustomModal;
window.generatePrompt = generatePrompt;