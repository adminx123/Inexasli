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
const formatCheckboxes = (selector, prefix) => {
    const items = Array.from(document.querySelectorAll(selector))
        .map(cb => cb.value.charAt(0).toUpperCase() + cb.value.slice(1))
        .join('\n');
    return items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
};

function generatePrompt(promptType) {
    console.log('Debug: generatePrompt function called with argument:', promptType);

    let prompt = '';

    if (promptType === 'QuizIQ™') {
        const quizSubject = document.getElementById('quiz-subject');
        if (quizSubject?.value) {
            prompt += formatList(quizSubject.value, 'Quiz Subject');
            const quizObjective = document.getElementById('quiz-objective');
            if (quizObjective?.value) prompt += formatList(quizObjective.value.charAt(0).toUpperCase() + quizObjective.value.slice(1), 'Objective of the Quiz');
            const quizDifficulty = document.getElementById('quiz-difficulty-tier');
            if (quizDifficulty?.value) prompt += formatList(quizDifficulty.value.charAt(0).toUpperCase() + quizDifficulty.value.slice(1), 'Difficulty Tier');
            prompt += formatCheckboxes('input[name="quiz-formats"]:checked', 'Question Formats');
            const quizQuestionCount = document.getElementById('quiz-question-count');
            if (quizQuestionCount?.value) prompt += formatList(quizQuestionCount.value, 'Number of Questions');
            const quizFocusAreas = document.getElementById('quiz-focus-areas');
            if (quizFocusAreas?.value) prompt += formatList(quizFocusAreas.value, 'Focus Areas');
            prompt += formatCheckboxes('input[name="quiz-participants"]:checked', 'Quiz Participants');
            const quizExtraInstructions = document.getElementById('quiz-extra-instructions');
            if (quizExtraInstructions?.value) prompt += formatList(quizExtraInstructions.value, 'Extra Instructions or Constraints');
            prompt += `
                Create a quiz based on the provided subject, objective, difficulty, question formats, number of questions, focus areas, participants, and extra instructions. Output the quiz specifications in a code block with the following table format:
                \`\`\`
                Quiz Specifications:
                | Category            | Details                                       |
                |--------------------|-----------------------------------------------|
                | Subject            | [Subject, e.g., World War II]                |
                | Objective          | [Objective, e.g., Self-Study]                |
                | Difficulty         | [Difficulty, e.g., Intermediate]             |
                | Question Formats   | [Formats, e.g., Multiple Choice, True/False] |
                | Number of Questions| [Number, e.g., 10]                           |
                | Focus Areas        | [Areas, e.g., Causes of WWI, Key Battles]    |
                | Participants       | [Participants, e.g., Students, Enthusiasts]  |
                | Extra Instructions | [Instructions, e.g., Include answers]        |

                Note: Ensure the quiz is tailored to the specified objective and participants.
                \`\`\`
                Include no text outside the code blocks.
            `;
        } else {
            prompt = 'Error: Please provide a quiz subject.';
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