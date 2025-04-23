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
    min-height: 50px;
    transition: height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
    visibility: visible;
    opacity: 1;
}

.prompt-container.initial {
    height: auto;
}

.prompt-container.expanded {
    height: auto;
}

.prompt-container:hover {
    background-color: rgb(255, 255, 255);
}

.prompt-container .close-prompt-container {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 18px;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    display: block;
    font-family: "Inter", sans-serif;
}

.prompt-container .prompt-label {
    text-decoration: none;
    color: #000;
    font-size: 12px;
    display: block;
    text-align: center;
    padding: 8px;
    cursor: default;
    transition: color 0.2s ease;
    line-height: 1.2;
    font-family: "Geist", sans-serif;
}

@media (max-width: 480px) {
    .prompt-container {
        width: 150px;
    }
    .prompt-container .prompt-label {
        font-size: 11px;
        padding: 6px;
    }
}
        `;
        document.head.appendChild(style);

        const promptContainer = document.createElement('div');
        promptContainer.className = 'prompt-container initial';
        promptContainer.dataset.state = 'initial';
        promptContainer.innerHTML = `
            <span class="close-prompt-container">+</span>
            <span class="prompt-label">PROMPT</span>
        `;

        document.body.appendChild(promptContainer);
        console.log('Prompt container injected (prompt.js)');

        console.log('Prompt container styles:', 
                    window.getComputedStyle(promptContainer).getPropertyValue('left'), 
                    window.getComputedStyle(promptContainer).getPropertyValue('top'),
                    window.getComputedStyle(promptContainer).getPropertyValue('transform'));

        const closeButton = promptContainer.querySelector('.close-prompt-container');
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                togglePromptContainer();
            });
        } else {
            console.error('Prompt close button not found (prompt.js)');
        }

        function togglePromptContainer() {
            if (promptContainer.dataset.state === 'initial') {
                promptContainer.className = 'prompt-container expanded';
                promptContainer.dataset.state = 'expanded';
                closeButton.textContent = '-';
                console.log('Prompt container expanded (prompt.js)');
            } else {
                promptContainer.className = 'prompt-container initial';
                promptContainer.dataset.state = 'initial';
                closeButton.textContent = '+';
                console.log('Prompt container returned to initial state (prompt.js)');
            }
        }

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