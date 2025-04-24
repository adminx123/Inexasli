/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent 
 * of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { getCookie } from '/utility/getcookie.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    function initializeDataContainer() {
        if (document.querySelector('.data-container-left')) {
            console.log('Left data container already exists, skipping initialization (datain.js)');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
        .data-container-left {
            position: fixed;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            background-color: #f5f5f5;
            padding: 4px;
            border: 2px solid #000;
            border-left: none;
            border-radius: 0 8px 8px 0;
            box-shadow: 4px 4px 0 #000;
            z-index: 10001;
            width: auto;
            max-width: 34px; /* Initial collapsed state */
            min-height: 30px;
            transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
            overflow: hidden;
            font-family: "Inter", sans-serif;
            visibility: visible;
            opacity: 1;
        }

        .data-container-left.initial {
            height: 120px;
        }

        .data-container-left.expanded {
            max-width: 100vw; /* Allows full content expansion */
            min-width: 300px; /* Minimum width to ensure usability */
            height: auto;
        }

        .data-container-left:hover {
            background-color: rgb(255, 255, 255);
        }

        .data-container-left .close-data-container {
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

        .data-container-left.expanded .close-data-container {
            top: 4px;
            right: 10px;
            left: auto;
        }

        .data-container-left .data-label {
            text-decoration: none;
            color: #000;
            font-size: 12px;
            display: flex;
            justify-content: center;
            text-align: center;
            padding: 4px;
            cursor: pointer;
            transition: color 0.2s ease;
            line-height: 1.2;
            font-family: "Geist", sans-serif;
            writing-mode: vertical-rl;
            text-orientation: mixed;
        }

        .data-container-left.initial .data-label {
            margin-top: 20px;
        }

        .data-container-left.expanded .data-label {
            margin-top: 0;
        }

        .data-container-left .data-content {
            padding: 10px;
            font-size: 14px;
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: auto; /* Handles wide content */
            font-family: "Inter", sans-serif;
            max-width: 100%; /* Prevents content from overflowing container */
        }

        @media (max-width: 480px) {
            .data-container-left {
                max-width: 28px; /* Initial collapsed state for mobile */
                padding: 3px;
            }
            .data-container-left.initial {
                height: 100px;
            }
            .data-container-left.expanded {
                max-width: 100vw; /* Allows full content expansion on mobile */
                min-width: 200px; /* Minimum width for mobile */
            }
            .data-container-left .data-label {
                font-size: 14px;
                padding: 3px;
            }
            .data-container-left .close-data-container {
                font-size: 12px;
                padding: 4px;
            }
            .data-container-left .data-content {
                font-size: 12px;
                padding: 8px;
                overflow-x: auto;
            }
        }`;

        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = 'data-container-left initial';
        dataContainer.dataset.state = 'initial';
        dataContainer.innerHTML = `
            <span class="close-data-container">+</span>
            <span class="data-label">DATA IN</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Left data container injected (datain.js)');

        const closeButton = dataContainer.querySelector('.close-data-container');
        const dataLabel = dataContainer.querySelector('.data-label');

        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Left close button not found (datain.js)');
        }

        if (dataLabel) {
            dataLabel.addEventListener('click', function(e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Left data label not found (datain.js)');
        }

        function toggleDataContainer() {
            if (dataContainer.dataset.state === 'initial') {
                dataContainer.classList.remove('initial');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                closeButton.textContent = '-';
                console.log('Left data container expanded (datain.js)');
            } else {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('initial');
                dataContainer.dataset.state = 'initial';
                closeButton.textContent = '+';
                console.log('Left data container collapsed (datain.js)');
            }
        }

        document.addEventListener('click', function(e) {
            const isClickInside = dataContainer.contains(e.target);
            if (!isClickInside && dataContainer.dataset.state === 'expanded') {
                console.log('Clicked outside left data container, collapsing (datain.js)');
                toggleDataContainer();
            }
        });
    }

    try {
        if (!isCookieExpired) {
            initializeDataContainer();
        }
    } catch (error) {
        console.error('Error initializing left data container (datain.js):', error);
    }
});