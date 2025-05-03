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
    // Grid item selection with single selection for app-code-status
    document.querySelectorAll('#app-code-status .grid-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('#app-code-status .grid-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            toggleCodeFields();
        });
    });

    // Grid item selection for app-features (multiple selections allowed)
    document.querySelectorAll('#app-features .grid-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('selected'));
    });

    // Generate prompt button
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });

    // Toggle visibility of code and details fields
    function toggleCodeFields() {
        const codeStatus = document.querySelector('#app-code-status .grid-item.selected')?.dataset.value;
        const codeRow = document.getElementById('app-current-code-row1');
        const platformRow = document.querySelector('textarea[id="app-platform"]').parentElement;
        const budgetRow = document.querySelector('textarea[id="app-budget"]').parentElement;
        const timelineRow = document.querySelector('textarea[id="app-timeline"]').parentElement;

        if (codeStatus === 'code-started') {
            codeRow.classList.remove('hidden');
            platformRow.classList.remove('hidden');
            budgetRow.classList.remove('hidden');
            timelineRow.classList.remove('hidden');
        } else {
            codeRow.classList.add('hidden');
            platformRow.classList.add('hidden');
            budgetRow.classList.add('hidden');
            timelineRow.classList.add('hidden');
        }
    }
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

    if (promptType === 'AppIQ™') {
        const appPurpose = document.getElementById('app-purpose');
        if (appPurpose?.value) {
            prompt += formatList(appPurpose.value, 'App Purpose');
            prompt += formatGrid('#app-code-status .grid-item.selected', 'Code Status');
            const currentCode = document.getElementById('app-current-code');
            if (currentCode?.value) prompt += formatList(currentCode.value, 'Current Code');
            prompt += formatGrid('#app-features .grid-item.selected', 'Features');
            const platform = document.getElementById('app-platform');
            if (platform?.value) prompt += formatList(platform.value, 'Platform');
            const budget = document.getElementById('app-budget');
            if (budget?.value) prompt += formatList(budget.value, 'Budget');
            const timeline = document.getElementById('app-timeline');
            if (timeline?.value) prompt += formatList(timeline.value, 'Timeline');
            prompt += `
                Create a development plan for an app based on the provided purpose, code status, current code, features, platform, budget, and timeline. Output the plan in a code block with the following table format:
                \`\`\`
                App Development Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Purpose            | [Purpose, e.g., Task management]             |
                | Code Status        | [Status, e.g., Code started]                 |
                | Current Code       | [Code, e.g., HTML/CSS snippet or None]       |
                | Features           | [Features, e.g., Notifications, User Accounts] |
                | Platform           | [Platform, e.g., iOS, Android]               |
                | Budget             | [Budget, e.g., $5000]                        |
                | Timeline           | [Timeline, e.g., 3 months]                   |

                Proposed Development Steps:
                | Step | Action                                    | Details                    |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Set up project structure]  | [Details, e.g., Use React Native] |
                | 2    | [Action, e.g., Implement notifications]   | [Details, e.g., Use Firebase] |

                Note: Consult a professional developer to implement the proposed solution.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide an app purpose.';
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