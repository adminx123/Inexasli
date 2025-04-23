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
    // Function to initialize the data-container
    function initializeDataContainer() {
        if (document.querySelector('.data-container')) {
            console.log('Data container already exists, skipping initialization');
            return;
        }

        // Inject CSS styles
        const style = document.createElement('style');
        style.textContent = `/* Data Container */
.data-container {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-radius: 8px;
    box-shadow: 4px 4px 0 #000;
    z-index: 1000;
    width: 200px;
    transition: height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
}

.data-container.initial {
    height: auto;
}

.data-container.expanded {
    height: auto;
}

.data-container:hover {
    background-color: rgb(255, 255, 255);
}

.data-container .close-data-container {
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

.data-container .data-label {
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

/* Responsive Design */
@media (max-width: 480px) {
    .data-container {
        width: 150px;
    }
    .data-container .data-label {
        font-size: 11px;
        padding: 6px;
    }
}
        `;
        document.head.appendChild(style);

        // Create data-container
        const dataContainer = document.createElement('div');
        dataContainer.className = 'data-container initial';
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA</span>
        `;

        // Append directly to body
        document.body.appendChild(dataContainer);
        console.log('Data container injected');

        // Set up close button functionality
        const closeButton = dataContainer.querySelector('.close-data-container');
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Close button not found');
        }

        // Function to toggle the data-container state
        const toggleDataContainer = () => {
            if (dataContainer.dataset.state === 'initial') {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                closeButton.textContent = '-';
                console.log('Data container expanded');
            } else {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                closeButton.textContent = '+';
                console.log('Data container returned to initial state');
            }
        };

        // Collapse data-container when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideDataContainer = dataContainer.contains(e.target);
            if (!isClickInsideDataContainer && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside data container, collapsing it');
                toggleDataContainer();
            }
        });
    }

    // Initialize data-container immediately
    initializeDataContainer();
});