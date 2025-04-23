/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent 
 * of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', async function() {
    function canShowContainer() {
        const introDiv = document.getElementById('intro');
        const isIntroHidden = introDiv && introDiv.classList.contains('hidden');
        console.log('canShowContainer (prompt.js):', { isIntroHidden });
        return isIntroHidden;
    }

    function initializePromptContainer() {
        if (document.querySelector('.prompt-container')) {
            console.log('Prompt container already exists, skipping initialization (prompt.js)');
            return;
        }

        if (!canShowContainer()) {
            console.log('Intro div is not hidden, skipping initialization (prompt.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `/* Prompt Container */
.prompt-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 0 #000;
    z-index: 10000;
    width: 200px;
    max-width: 1200px;
    min-height: 50px;
    transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
    font-family: "Inter", sans-serif;
    visibility: visible;
    opacity: 1;
}

.prompt-container.initial {
    height: 50px;
    overflow: hidden;
}

.prompt-container.expanded {
    width: 90vw;
    height: auto;
    overflow: visible;
}

.prompt-container:hover {
    background-color: rgb(255, 255, 255);
}

.prompt-container .prompt-label {
    text-decoration: none;
    color: #000;
    font-size: 14px;
    display: block;
    text-align: center;
    padding: 12px 20px; /* Larger tap area */
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    font-family: "Geist", sans-serif;
}

.prompt-container .grid-container {
    display: none;
}

.prompt-container.expanded .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    padding: 10px;
}

.prompt-container .grid-item {
    background-color: #e0e0e0;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    font-family: "Geist", sans-serif;
}

.prompt-container .grid-item:hover {
    background-color: #d0d0d0;
}

.prompt-container .grid-item hr {
    margin: 5px 0;
    border: none;
    border-top: 1px solid #000;
}

.prompt-container .premium-notice {
    font-size: 10px;
    color: #b8860b;
    display: block;
}

@media (max-width: 480px) {
    .prompt-container {
        width: 150px;
    }
    .prompt-container.expanded {
        width: 95vw;
    }
    .prompt-container .prompt-label {
        font-size: 12px;
        padding: 10px 15px;
    }
    .prompt-container .grid-item {
        font-size: 11px;
        padding: 8px;
    }
}
        `;
        document.head.appendChild(style);

        const promptContainer = document.createElement('div');
        promptContainer.className = 'prompt-container initial';
        promptContainer.dataset.state = 'initial';
        promptContainer.innerHTML = `
            <span class="prompt-label">PROMPT</span>
            <div class="grid-container">
                <div class="grid-item" onclick="navigateTo('/ai/marketing/adagencyiq.html')">AdAgencyIQ™ <hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/adventure/adventureiq.html')">AdventureIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/app/appiq.html')">App<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/book/bookiq.html')">BookIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/calorie/calorieiq.html')">CalorieIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/decision/decisioniq.html')">DecisionIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/emotion/emotioniq.html')">EmotionIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/enneagram/enneagramiq.html')">EnneagramIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/event/eventiq.html')">EventIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/fitness/fitnessiq.html')">FitnessIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/general/general.html')">General<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/budget/incomeiq.html')">IncomeIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/business/newbiziq.html')">NewBizIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/quiz/quiziq.html')">QuizIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/receipts/receiptsiq.html')">ReceiptsIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/report/reportiq.html')">ReportIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/research/researchiq.html')">ResearchIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/social/socialiq.html')">SocialIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/speculation/speculationiq.html')">SpeculationIQ™<hr><span class="premium-notice">Premium</span></div>
                <div class="grid-item" onclick="navigateTo('/ai/symptom/symptomiq.html')">SymptomIQ™<hr></div>
                <div class="grid-item" onclick="navigateTo('/ai/workflow/workflowiq.html')">WorkflowIQ™<hr><span class="premium-notice">Premium</span></div>
            </div>
        `;

        document.body.appendChild(promptContainer);
        console.log('Prompt container injected with grid items (prompt.js)');

        console.log('Prompt container styles:', 
                    window.getComputedStyle(promptContainer).getPropertyValue('left'), 
                    window.getComputedStyle(promptContainer).getPropertyValue('top'),
                    window.getComputedStyle(promptContainer).getPropertyValue('transform'));

        const promptLabel = promptContainer.querySelector('.prompt-label');
        if (promptLabel) {
            promptLabel.addEventListener('click', function(e) {
                e.preventDefault();
                togglePromptContainer();
            });
        } else {
            console.error('Prompt label not found (prompt.js)');
        }

        function togglePromptContainer() {
            if (promptContainer.dataset.state === 'initial') {
                promptContainer.className = 'prompt-container expanded';
                promptContainer.dataset.state = 'expanded';
                console.log('Prompt container expanded (prompt.js)');
            } else {
                promptContainer.className = 'prompt-container initial';
                promptContainer.dataset.state = 'initial';
                console.log('Prompt container returned to initial state (prompt.js)');
            }
        }

        // Collapse when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsidePromptContainer = promptContainer.contains(e.target);
            if (!isClickInsidePromptContainer && promptContainer.dataset.state === 'expanded') {
                console.log('Clicked outside prompt container, collapsing it (prompt.js)');
                togglePromptContainer();
            }
        });
    }

    // Monitor intro div changes
    const introDiv = document.getElementById('intro');
    if (introDiv) {
        const observer = new MutationObserver(() => {
            const promptContainer = document.querySelector('.prompt-container');
            if (canShowContainer()) {
                if (!promptContainer) {
                    initializePromptContainer();
                    console.log('Intro div hidden, initialized prompt container (prompt.js)');
                }
            } else if (promptContainer) {
                promptContainer.remove();
                console.log('Intro div visible, removed prompt container (prompt.js)');
            }
        });
        observer.observe(introDiv, { attributes: true, attributeFilter: ['class'] });
    } else {
        console.error('Intro div not found (prompt.js)');
    }

    // Initial check
    try {
        if (canShowContainer()) {
            initializePromptContainer();
        }
    } catch (error) {
        console.error('Error initializing prompt container (prompt.js):', error);
    }
});