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

    if (promptType === 'AdventureIQ™') {
        prompt += formatGrid('#trip-activities .grid-item.selected', 'Review the following activities I want to do on my trip');
        prompt += 'Purpose of review: To build a logical timeline for my trip in checklist format code block. If available, include the weather forecast for the location(s).\n\n';
        const tripSpecifics = document.getElementById('trip-specifics');
        if (tripSpecifics?.value) {
            prompt += formatGrid('#trip-activities .grid-item.selected', 'The main activities of this trip will be');
            prompt += `Activity-specific information requested:\n${tripSpecifics.value}\n\n`;
        }
        const plans = document.getElementById('trip-plans');
        if (plans?.value) prompt += formatList(plans.value, 'Confirmed Schedule');
        const packing = document.getElementById('trip-packing');
        if (packing?.value) {
            let packingDescription = '';
            switch (packing.value) {
                case 'YM': packingDescription = 'Packing tips needed for Male'; break;
                case 'YF': packingDescription = 'Packing tips needed for Female'; break;
                case 'YMF': packingDescription = 'Packing tips needed for Male & Female'; break;
                case 'NN': packingDescription = 'Packing tips not needed'; break;
            }
            prompt += formatList(packingDescription, 'Packing Requirements');
        }
        const people = document.getElementById('trip-people');
        if (people?.value) prompt += formatList(people.value, 'Number of People on Trip');
        const days = document.getElementById('trip-days');
        if (days?.value) prompt += formatList(days.value, 'Trip Length (days)');
        const location = document.getElementById('trip-location');
        if (location?.value) prompt += formatList(location.value, 'Trip Location');
        prompt += formatGrid('#trip-relationship .grid-item.selected', 'Relationship to People on Trip');
        const cost = document.getElementById('trip-cost');
        if (cost?.value) prompt += formatList(cost.value, 'Budget');
        prompt += `
            Output the trip timeline in a text-based checklist format in a code block with the following columns: Day, Time, Activity, Location, Notes. Use this header format:
            \`\`\`
            | Day       | Time      | Activity         | Location        | Notes           |
            |-----------|-----------|------------------|-----------------|-----------------|
            \`\`\`
            If packing tips are requested, provide them in a separate text-based list in a code block with the following format:
            \`\`\`
            Packing Tips:
            1. Item 1
            2. Item 2
            ...
            \`\`\`
            If weather forecast is available, include it in a separate text-based table in a code block with columns: Day, Location, Weather, Temperature (°C). Use this header format:
            \`\`\`
            | Day       | Location  | Weather          | Temperature (°C) |
            |-----------|-----------|------------------|------------------|
            \`\`\`
            Include no text outside the code blocks unless specified.
        `;
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