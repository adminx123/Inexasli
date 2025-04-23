/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', async function() {
    function initializeDataContainer() {
        if (document.querySelector('.data-container-left')) {
            console.log('Left data container already exists, skipping initialization');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `/* Left Data Container */
.data-container-left {
    position: fixed;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-left: none;
    border-radius: 0 8px 8px 0;
    box-shadow: 4px 4px 0 #000;
    z-index: 10000;
    width: 200px;
    min-height: 50px;
    transition: height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
    visibility: visible;
    opacity: 1;
}

.data-container-left.initial {
    height: auto;
}

.data-container-left.expanded {
    height: auto;
}

.data-container-left:hover {
    background-color: rgb(255, 255, 255);
}

.data-container-left .close-data-container {
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

.data-container-left .data-label {
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
    .data-container-left {
        width: 150px;
    }
    .data-container-left .data-label {
        font-size: 11px;
        padding: 6px;
    }
}
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = 'data-container-left initial';
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA IN</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Left data container injected (detain.js)');

        console.log('Left data container styles:', 
                    window.getComputedStyle(dataContainer).getPropertyValue('left'), 
                    window.getComputedStyle(dataContainer).getPropertyValue('top'),
                    window.getComputedStyle(dataContainer).getPropertyValue('transform'));

        const closeButton = dataContainer.querySelector('.close-data-container');
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Left close button not found (detain.js)');
        }

        function toggleDataContainer() {
            if (dataContainer.dataset.state === 'initial') {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                closeButton.textContent = '-';
                console.log('Left data container expanded (detain.js)');
            } else {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                closeButton.textContent = '+';
                console.log('Left data container returned to initial state (detain.js)');
            }
        }

        document.addEventListener('click', function(e) {
            const isClickInsideDataContainer = dataContainer.contains(e.target);
            if (!isClickInsideDataContainer && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside left data container, collapsing it (detain.js)');
                toggleDataContainer();
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing left data container (detain.js):', error);
    }
});