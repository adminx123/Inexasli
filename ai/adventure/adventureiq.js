/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

function initializeAdventureIQ() {
    // Grid item selection
    const gridItems = document.querySelectorAll('.grid-container .grid-item');
    gridItems.forEach(item => {
        // Remove existing listeners to prevent duplicates
        item.removeEventListener('click', toggleGridItem);
        item.addEventListener('click', toggleGridItem);
    });

    function toggleGridItem() {
        this.classList.toggle('selected');
    }

    // Generate prompt button
    const generateButtons = document.querySelectorAll('.generate-btn');
    generateButtons.forEach(button => {
        button.removeEventListener('click', handleGenerateClick);
        button.addEventListener('click', handleGenerateClick);
    });

    function handleGenerateClick() {
        const promptType = this.getAttribute('data-prompt');
        generatePrompt(promptType);
    }

    // Set placeholders with actual line breaks for text areas
    const textAreas = [
        { id: 'trip-specifics', placeholder: ['Hiking duration: 3 hours', 'Kayaking: Beginner level', 'Camping: 2 nights'] },
        { id: 'trip-plans', placeholder: ['Day 1: Arrive at destination', 'Day 2: Hiking', 'Day 3: Kayaking'] },
        { id: 'trip-location', placeholder: ['New York', 'New Jersey', "Hampton's"] },
        { id: 'trip-budget', placeholder: ['Budget: $3000 usd'] }
    ];

    textAreas.forEach(textArea => {
        const element = document.getElementById(textArea.id);
        if (element) {
            element.placeholder = textArea.placeholder.join('\n');
        } else {
            console.warn(`Text area with ID ${textArea.id} not found`);
        }
    });
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
        const budget = document.getElementById('trip-budget');
        if (budget?.value) prompt += formatList(budget.value, 'Trip Budget');
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
    if (typeof openGeneratedPromptModal === 'function') {
        openGeneratedPromptModal();
    } else {
        console.warn('openGeneratedPromptModal is not defined');
    }
}

window.openCustomModal = openCustomModal;

// Initialize when DOM is loaded or when script is dynamically loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeAdventureIQ();
} else {
    document.addEventListener('DOMContentLoaded', initializeAdventureIQ);
}