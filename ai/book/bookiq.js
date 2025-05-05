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

// New function to format grid items instead of checkboxes
const formatGridItems = (containerId, prefix) => {
    const container = document.getElementById(containerId);
    if (!container) return '';
    
    const selectedItems = Array.from(container.querySelectorAll('.grid-item.selected'))
        .map(item => {
            const value = item.getAttribute('data-value');
            return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
        });
    
    return selectedItems.length ? 
        `${prefix}:\n${selectedItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
};

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'BookIQ™') {
        const bookTitleAuthor = document.getElementById('book-title-author');
        if (bookTitleAuthor?.value) {
            prompt += formatList(bookTitleAuthor.value, 'Book Title and Author');
            const summaryPurpose = document.getElementById('summary-purpose');
            if (summaryPurpose?.value) prompt += formatList(summaryPurpose.value.charAt(0).toUpperCase() + summaryPurpose.value.slice(1), 'Purpose of the Summary');
            const summaryLength = document.getElementById('summary-length');
            if (summaryLength?.value) prompt += formatList(summaryLength.value.charAt(0).toUpperCase() + summaryLength.value.slice(1), 'Summary Length');
            const summaryThemes = document.getElementById('summary-themes');
            if (summaryThemes?.value) prompt += formatList(summaryThemes.value, 'Key Themes or Topics');
            
            // Use the new grid-items format function instead of checkbox formatting
            prompt += formatGridItems('summary-audience', 'Target Audience');
            prompt += formatGridItems('summary-elements', 'Specific Elements to Include');
            
            const summaryTone = document.getElementById('summary-tone');
            if (summaryTone?.value) prompt += formatList(summaryTone.value.charAt(0).toUpperCase() + summaryTone.value.slice(1), 'Tone or Style');
            const summaryDetails = document.getElementById('summary-details');
            if (summaryDetails?.value) prompt += formatList(summaryDetails.value, 'Additional Details or Constraints');
            prompt += `
                Create a book summary based on the provided title, author, purpose, length, themes, audience, elements, tone, and details. Output the summary specifications in a code block with the following table format:
                \`\`\`
                Book Summary Specifications:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Title and Author   | [e.g., Pride and Prejudice by Jane Austen]   |
                | Purpose            | [e.g., Personal Understanding]               |
                | Length             | [e.g., Short (1 paragraph)]                  |
                | Themes             | [e.g., Love, Identity]                       |
                | Audience           | [e.g., General Readers, Students]            |
                | Elements           | [e.g., Plot, Characters]                     |
                | Tone               | [e.g., Formal]                               |
                | Details            | [e.g., Avoid spoilers, Focus on chapter 5]   |

                Note: Ensure the summary aligns with the specified purpose, audience, and tone.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a book title and author.';
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