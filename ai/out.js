/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', async function () {
    initializeOutContainer();

    function initializeOutContainer() {
        if (document.querySelector('.out-container-right')) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            /* Right OUT container specific styling */
            .out-container-right {
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
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out, z-index 0.1s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }

            .out-container-right.initial, .out-container-right.collapsed {
                max-width: 36px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 12000; /* Ensure collapsed OUT is above expanded IN */
            }
            /* Explicit override to ensure tab stays above IN */
            .out-container-right.initial {
                z-index: 20000 !important;
            }
            .out-container-right.collapsed {
                z-index: 20000 !important;
            }

            .out-container-right:hover {
                background-color: rgb(255, 255, 255);
            }

            .out-container-right .close-out-container {
                position: absolute;
                top: 4px;
                right: 10px;
                padding: 5px;
                font-size: 14px;
                line-height: 1;
                color: #000;
                cursor: pointer;
                font-weight: bold;
                font-family: "Inter", sans-serif;
            }

            .out-container-right .out-label {
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

            /* Mobile responsiveness for right OUT container */
            @media (max-width: 480px) {
                .out-container-right {
                    max-width: 28px;
                    padding: 3px;
                }

                .out-container-right.initial, .out-container-right.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }

                .out-container-right .out-label {
                    font-size: 10px;
                    padding: 3px;
                }

                .out-container-right .close-out-container {
                    font-size: 12px;
                    padding: 4px;
                }
            }
        `;
        document.head.appendChild(style);

        const outContainer = document.createElement('div');
        outContainer.className = `out-container-right initial`;
        outContainer.dataset.state = 'initial';
        outContainer.innerHTML = `
            <span class="close-out-container">+</span>
            <span class="out-label">OUT</span>
        `;

        document.body.appendChild(outContainer);

        const closeButton = outContainer.querySelector('.close-out-container');
        const outLabel = outContainer.querySelector('.out-label');

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                // Add your modal opening logic here
                console.log('OUT container clicked - open modal');
            });
        }

        if (outLabel) {
            outLabel.addEventListener('click', function (e) {
                e.preventDefault();
                // Add your modal opening logic here
                console.log('OUT label clicked - open modal');
            });
        }
    }
});
