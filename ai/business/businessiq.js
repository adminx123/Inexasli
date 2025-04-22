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
    // Single selection for business-knowledge-level
    document.querySelectorAll('#business-knowledge-level .grid-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('#business-knowledge-level .grid-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        });
    });

    // Multiple selection for business-general-skills and business-weaknesses
    document.querySelectorAll('#business-general-skills .grid-item, #business-weaknesses .grid-item').forEach(item => {
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

    if (promptType === 'newbiziq™') {
        const businessVision = document.getElementById('business-vision');
        if (businessVision?.value) {
            prompt += formatList(businessVision.value, 'Business Idea');
            prompt += formatGrid('#business-knowledge-level .grid-item.selected', 'Experience Level');
            prompt += formatGrid('#business-general-skills .grid-item.selected', 'Business Skills');
            prompt += formatGrid('#business-weaknesses .grid-item.selected', 'Challenges');
            const organization = document.getElementById('business-organization');
            if (organization?.value) prompt += formatList(organization.value, 'Business Tools & Equipment');
            const network = document.getElementById('business-network');
            if (network?.value) prompt += formatList(network.value, 'Business Network');
            prompt += `
                Create a business plan analysis for the provided business idea, experience level, skills, challenges, tools, and network. Output the analysis in a code block with the following table format:
                \`\`\`
                Business Plan Analysis:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Business Idea      | [Idea, e.g., Launch a coffee shop]           |
                | Experience Level   | [Level, e.g., New]                           |
                | Business Skills    | [Skills, e.g., Communication, Leadership]    |
                | Challenges         | [Challenges, e.g., Procrastination, Indecisiveness] |
                | Tools & Equipment  | [Tools, e.g., QuickBooks, Shopify]           |
                | Business Network   | [Network, e.g., Friend who owns a café]      |

                Feasibility and Recommendations:
                | Step | Action                                    | Details                    |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Conduct market research]   | [Details, e.g., Analyze local demand] |
                | 2    | [Action, e.g., Address procrastination]   | [Details, e.g., Set deadlines] |

                Note: Consult a business advisor to refine the plan and address risks.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a business idea.';
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