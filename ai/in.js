/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', async function () {
    initializeInContainer();

    function initializeInContainer() {
        if (document.querySelector('.in-container-left')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Left IN container specific styling */
            .in-container-left {
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
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
                display: flex;
                flex-direction: column;
            }

            .in-container-left.initial, .in-container-left.collapsed {
                max-width: 36px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }

            .in-container-left:hover {
                background-color: rgb(255, 255, 255);
            }

            .in-container-left .close-in-container {
                position: absolute;
                top: 4px;
                left: 10px;
                padding: 5px;
                font-size: 14px;
                line-height: 1;
                color: #000;
                cursor: pointer;
                font-weight: bold;
                font-family: "Inter", sans-serif;
            }

            .in-container-left .in-label {
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

            /* Mobile responsiveness for left IN container */
            @media (max-width: 480px) {
                .in-container-left {
                    max-width: 28px;
                    padding: 3px;
                }

                .in-container-left.initial, .in-container-left.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }

                .in-container-left .in-label {
                    font-size: 10px;
                    padding: 3px;
                }

                .in-container-left .close-in-container {
                    font-size: 12px;
                    padding: 4px;
                }
            }
        `;
        document.head.appendChild(style);

        const inContainer = document.createElement('div');
        inContainer.className = `in-container-left initial`;
        inContainer.dataset.state = 'initial';
        inContainer.innerHTML = `
            <span class="close-in-container">+</span>
            <span class="in-label">IN</span>
        `;

        document.body.appendChild(inContainer);

        const closeButton = inContainer.querySelector('.close-in-container');
        const inLabel = inContainer.querySelector('.in-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                // Add your modal opening logic here
                console.log('IN container clicked - open modal');
            });
        }

        if (inLabel) {
            inLabel.addEventListener('click', function (e) {
                e.preventDefault();
                // Add your modal opening logic here
                console.log('IN label clicked - open modal');
            });
        }
    }
});
