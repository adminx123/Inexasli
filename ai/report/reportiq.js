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
    // Generate prompt button
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
    });
});

const formatList = (items, prefix) => items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'ReportIQ™') {
        const reportTopic = document.getElementById('reportiq-topic');
        if (reportTopic?.value) {
            prompt += formatList(reportTopic.value, 'Report Topic');
            const reportType = document.getElementById('reportiq-type');
            if (reportType?.value) prompt += formatList(reportType.value.charAt(0).toUpperCase() + reportType.value.slice(1), 'Report Type');
            const reportAudience = document.getElementById('reportiq-audience');
            if (reportAudience?.value) prompt += formatList(reportAudience.value.charAt(0).toUpperCase() + reportAudience.value.slice(1), 'Audience');
            const reportDataSources = document.getElementById('reportiq-data-sources');
            if (reportDataSources?.value) prompt += formatList(reportDataSources.value, 'Data Sources');
            const reportKeyMetrics = document.getElementById('reportiq-key-metrics');
            if (reportKeyMetrics?.value) prompt += formatList(reportKeyMetrics.value, 'Key Metrics');
            const reportPriority = document.getElementById('reportiq-priority');
            if (reportPriority?.value) prompt += formatList(reportPriority.value.charAt(0).toUpperCase() + reportPriority.value.slice(1), 'Priority Focus');
            const reportConstraints = document.getElementById('reportiq-constraints');
            if (reportConstraints?.value) prompt += formatList(reportConstraints.value, 'Constraints');
            const reportInstructions = document.getElementById('reportiq-instructions');
            if (reportInstructions?.value) prompt += formatList(reportInstructions.value, 'Additional Instructions');
            prompt += `
                Create a report plan based on the provided topic, type, audience, data sources, key metrics, priority focus, constraints, and instructions. Output the plan in a code block with the following table format:
                \`\`\`
                Report Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Topic              | [Topic, e.g., Sales Performance]             |
                | Type               | [Type, e.g., Analytical]                     |
                | Audience           | [Audience, e.g., Executives]                 |
                | Data Sources       | [Sources, e.g., CRM, Financial Records]      |
                | Key Metrics        | [Metrics, e.g., Revenue, Conversion Rate]    |
                | Priority Focus     | [Priority, e.g., Clarity]                    |
                | Constraints        | [Constraints, e.g., Time, Data Access]       |
                | Instructions       | [Instructions, e.g., Include charts]         |

                Proposed Report Structure:
                | Section | Content                                   | Details                    |
                |---------|-------------------------------------------|----------------------------|
                | 1       | [Content, e.g., Executive Summary]        | [Details, e.g., Key findings] |
                | 2       | [Content, e.g., Data Analysis]            | [Details, e.g., Visualize trends] |

                Note: Consult a data analyst or subject matter expert to ensure accuracy and relevance.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a report topic.';
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