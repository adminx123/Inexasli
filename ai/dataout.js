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
        console.log('canShowContainer (dataout.js):', { isIntroHidden });
        return isIntroHidden;
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-right')) {
            console.log('Right data container already exists, skipping initialization (dataout.js)');
            return;
        }

        if (!canShowContainer()) {
            console.log('Intro div is not hidden, skipping initialization (dataout.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
.data-container-right {
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #f5f5f5;
    padding: 4px;
    border: 2px solid #000;
    border-right: none;
    border-radius: 8px 0 0 8px;
    box-shadow: -4px 4px 0 #000;
    z-index: 10000;
    width: 34px;
    min-height: 30px;
    transition: width 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
    visibility: visible;
    opacity: 1;
}

.data-container-right.initial {
    height: 120px;
}

.data-container-right.expanded {
    width: 200px;
    height: auto;
}

.data-container-right:hover {
    background-color: rgb(255, 255, 255);
}

.data-container-right .close-data-container {
    position: absolute;
    top: 4px;
    left: 10px;
    padding: 5px;
    font-size: 14px;
    line-height: 1;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    display: block;
    font-family: "Inter", sans-serif;
}

.data-container-right .data-label {
    text-decoration: none;
    color: #000;
    font-size: 12px;
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    text-align: center;
    padding: 4px;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    font-family: "Geist", sans-serif;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
}

.data-container-right.initial .data-label {
    margin-top: 20px;
}

.data-container-right.expanded .data-label {
    margin-top: 0;
}

@media (max-width: 480px) {
    .data-container-right {
        width: 28px;
        padding: 3px;
    }
    .data-container-right.initial {
        height: 100px;
    }
    .data-container-right.expanded {
        width: 150px;
    }
    .data-container-right .data-label {
        font-size: 12px;
        padding: 3px;
    }
    .data-container-right .close-data-container {
        font-size: 12px;
        padding: 4px;
    }
}`;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = 'data-container-right initial';
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA OUT</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Right data container injected (dataout.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        }

        function toggleDataContainer() {
            if (dataContainer.dataset.state === 'initial') {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                closeButton.textContent = '-';
                console.log('Right data container expanded (dataout.js)');
            } else {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                closeButton.textContent = '+';
                console.log('Right data container collapsed (dataout.js)');
            }
        }

        document.addEventListener('click', function(e) {
            const isClickInside = dataContainer.contains(e.target);
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside right data container, collapsing (dataout.js)');
                toggleDataContainer();
            }
        });
    }

    const introDiv = document.getElementById('intro');
    if (introDiv) {
        const observer = new MutationObserver(() => {
            const dataContainer = document.querySelector('.data-container-right');
            if (canShowContainer()) {
                if (!dataContainer) {
                    initializeDataContainer();
                    console.log('Intro hidden, initialized right container (dataout.js)');
                }
            } else if (dataContainer) {
                dataContainer.remove();
                console.log('Intro visible, removed right container (dataout.js)');
            }
        });
        observer.observe(introDiv, { attributes: true, attributeFilter: ['class'] });
    } else {
        console.error('Intro div not found (dataout.js)');
    }

    try {
        if (canShowContainer()) {
            initializeDataContainer();
        }
    } catch (error) {
        console.error('Error initializing right data container (dataout.js):', error);
    }
});
