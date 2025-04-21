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

    if (promptType === 'MarketingIQ™') {
        const marketGoal = document.getElementById('market-goal');
        if (marketGoal?.value) {
            prompt += formatList(marketGoal.value, 'Campaign Goal');
            prompt += formatGrid('#market-channels .grid-item.selected', 'Channels');
            const marketAudience = document.getElementById('market-audience');
            if (marketAudience?.value) prompt += formatList(marketAudience.value, 'Target Audience');
            const marketBudget = document.getElementById('market-budget');
            if (marketBudget?.value) prompt += formatList(marketBudget.value, 'Budget');
            const marketMetrics = document.getElementById('market-metrics');
            if (marketMetrics?.value) prompt += formatList(marketMetrics.value, 'Metrics');
            const marketMessage = document.getElementById('market-message');
            if (marketMessage?.value) prompt += formatList(marketMessage.value, 'Key Messages');
            const marketTimeline = document.getElementById('market-timeline');
            if (marketTimeline?.value) prompt += formatList(marketTimeline.value, 'Timeline');
            const marketCompetitors = document.getElementById('market-competitors');
            if (marketCompetitors?.value) prompt += formatList(marketCompetitors.value, 'Competitor Strengths');
            prompt += formatGrid('#market-visuals .grid-item.selected', 'Visual Assets');
            prompt += `
                Create a marketing campaign plan based on the provided goal, channels, audience, budget, metrics, messages, timeline, competitors, and visual assets. Output the plan in a code block with the following table format:
                \`\`\`
                Marketing Campaign Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Goal               | [Goal, e.g., Increase sales by 20%]          |
                | Channels           | [Channels, e.g., Social Media, Email]        |
                | Audience           | [Audience, e.g., Age 18-35, Tech enthusiasts]|
                | Budget             | [Budget, e.g., $1000]                        |
                | Metrics            | [Metrics, e.g., 10% conversion, 5000 clicks] |
                | Key Messages       | [Messages, e.g., Unlock your potential]      |
                | Timeline           | [Timeline, e.g., 3 months, Q2 2025]          |
                | Competitors        | [Competitors, e.g., Competitor A: value advantage] |
                | Visual Assets      | [Assets, e.g., Videos, Infographics]         |

                Proposed Strategy:
                | Step | Action                                    | Channel/Method             |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Launch social media ads]   | [e.g., Social Media]       |
                | 2    | [Action, e.g., Send email newsletter]     | [e.g., Email]              |

                Note: Consult a marketing professional to refine and execute the campaign.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a campaign goal.';
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