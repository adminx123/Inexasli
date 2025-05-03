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

    // Toggle visibility of indoor/outdoor setup based on event-location
    window.toggleEventDetails = function () {
        const location = document.getElementById('event-location').value;
        const indoorsRow = document.getElementById('event-indoors');
        const outdoorsRow = document.getElementById('event-outdoors');

        if (location === 'indoors') {
            indoorsRow.classList.remove('hidden');
            outdoorsRow.classList.add('hidden');
        } else if (location === 'outdoors') {
            indoorsRow.classList.add('hidden');
            outdoorsRow.classList.remove('hidden');
        }
    };
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

    if (promptType === 'EventIQ™') {
        const eventTypesSelected = document.querySelectorAll('#event-types .grid-item.selected');
        if (eventTypesSelected.length > 0) {
            prompt += formatGrid('#event-types .grid-item.selected', 'Event Type');
        } else {
            prompt += formatList('Generic Event', 'Event Type');
        }
        const venueStatus = document.getElementById('event-venue')?.value;
        if (venueStatus) prompt += formatList(venueStatus, 'Venue Status');
        const location = document.getElementById('event-location')?.value;
        if (location) {
            prompt += formatList(location.charAt(0).toUpperCase() + location.slice(1), 'Indoor/Outdoor');
            if (location === 'indoors') {
                prompt += formatGrid('#event-indoor-setup .grid-item.selected', 'Indoor Setup Needs');
            } else if (location === 'outdoors') {
                prompt += formatGrid('#event-outdoor .grid-item.selected', 'Outdoor Setup Needs');
            }
        }
        prompt += formatGrid('#event-elements .grid-item.selected', 'Event Elements');
        const guests = document.getElementById('event-guests')?.value;
        if (guests) prompt += formatList(guests, 'Guest Count');
        const budget = document.getElementById('event-budget')?.value;
        if (budget) prompt += formatList(budget, 'Budget');
        const startTime = document.getElementById('event-start')?.value;
        const endTime = document.getElementById('event-end')?.value;
        let timeString = '';
        if (startTime) timeString += `Start: ${startTime}`;
        if (endTime) timeString += `${timeString ? ' - ' : ''}End: ${endTime}`;
        if (timeString) prompt += formatList(timeString, 'Timeline');
        const specificLocation = document.getElementById('event-specific-location')?.value;
        if (specificLocation) prompt += formatList(specificLocation, 'Specific Location');
        const specificContext = document.getElementById('event-specific-context')?.value;
        if (specificContext) prompt += formatList(specificContext, 'Context');
        prompt += `
            Create an event planning checklist based on the provided event type, venue status, indoor/outdoor setup, elements, guest count, budget, timeline, location, and context. If the specific location is provided, include a weather forecast for the event date if available. Output the checklist in a code block with the following table format:
            \`\`\`
            Event Planning Checklist:
            | Category            | Details                                       |
            |--------------------|-----------------------------------------------|
            | Event Type         | [Type, e.g., Birthday]                       |
            | Venue Status       | [Status, e.g., Venue Secured]                |
            | Indoor/Outdoor     | [e.g., Indoors]                              |
            | Setup Needs        | [Needs, e.g., Seating, Lighting]             |
            | Elements           | [Elements, e.g., Food, Music]                |
            | Guest Count        | [Count, e.g., 50]                            |
            | Budget             | [Budget, e.g., $1000]                        |
            | Timeline           | [Timeline, e.g., Start: 18:00 - End: 22:00]  |
            | Location           | [Location, e.g., 123 Main St, New York]      |
            | Context            | [Context, e.g., Italian background attendees]|
            | Weather Forecast   | [Forecast, e.g., Sunny, 75°F, or Not available] |

            Actionable Steps:
            | Step | Action                                    | Details                    |
            |------|-------------------------------------------|----------------------------|
            | 1    | [Action, e.g., Book venue]                | [Details, e.g., Confirm availability] |
            | 2    | [Action, e.g., Arrange catering]          | [Details, e.g., Italian menu] |

            Note: Consult an event planner for complex events or to address feasibility issues.
            \`\`\`
            Include no text outside the code blocks.
        `;
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