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

    if (promptType === 'WorkflowIQ™') {
        const workflowTask = document.getElementById('workflowiq-task');
        if (workflowTask?.value) {
            prompt += formatList(workflowTask.value, 'Task');
            const workflowSteps = document.getElementById('workflowiq-steps');
            if (workflowSteps?.value) prompt += formatList(workflowSteps.value, 'Task Steps');
            const workflowTools = document.getElementById('workflowiq-tools');
            if (workflowTools?.value) prompt += formatList(workflowTools.value, 'Tools Used');
            const workflowAutomationType = document.getElementById('workflowiq-automation-type');
            if (workflowAutomationType?.value) prompt += formatList(workflowAutomationType.value.charAt(0).toUpperCase() + workflowAutomationType.value.slice(1), 'Automation Type');
            const workflowPriority = document.getElementById('workflowiq-priority');
            if (workflowPriority?.value) prompt += formatList(workflowPriority.value.charAt(0).toUpperCase() + workflowPriority.value.slice(1), 'Priority Focus');
            const workflowGoals = document.getElementById('workflowiq-goals');
            if (workflowGoals?.value) prompt += formatList(workflowGoals.value, 'Goals');
            const workflowConstraints = document.getElementById('workflowiq-constraints');
            if (workflowConstraints?.value) prompt += formatList(workflowConstraints.value, 'Constraints');
            const workflowInstructions = document.getElementById('workflowiq-instructions');
            if (workflowInstructions?.value) prompt += formatList(workflowInstructions.value, 'Additional Instructions');
            prompt += `
                Create an automation plan for the provided task, steps, tools, automation type, priority, goals, constraints, and instructions. Output the plan in a code block with the following table format:
                \`\`\`
                Automation Plan:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Task               | [Task, e.g., Invoice processing]             |
                | Steps              | [Steps, e.g., Data entry, Approval]          |
                | Tools              | [Tools, e.g., Excel, ERP]                    |
                | Automation Type    | [Type, e.g., Scripting]                      |
                | Priority Focus     | [Priority, e.g., Efficiency]                 |
                | Goals              | [Goals, e.g., Reduce time, Minimize errors]  |
                | Constraints        | [Constraints, e.g., Budget, Legacy systems]  |
                | Instructions       | [Instructions, e.g., Prefer open-source]     |

                Proposed Solution:
                | Step | Action                                    | Tool/Method                |
                |------|-------------------------------------------|----------------------------|
                | 1    | [Action, e.g., Automate data entry]       | [Tool, e.g., Python script]|
                | 2    | [Action, e.g., Set up approval workflow]  | [Tool, e.g., ERP API]      |

                Note: Consult an automation specialist to implement the proposed solution.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a task.';
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