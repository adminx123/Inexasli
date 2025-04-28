/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Dependency fallbacks
    const setLocal = window.setLocal || function (key, value, days) {
        console.warn('setLocal not defined, using localStorage directly');
        try {
            localStorage.setItem(key, encodeURIComponent(value));
        } catch (error) {
            console.error('Error in setLocal:', error);
        }
    };
    const getLocal = window.getLocal || function (key) {
        console.warn('getLocal not defined, using localStorage directly');
        try {
            const value = localStorage.getItem(key);
            return value ? decodeURIComponent(value) : null;
        } catch (error) {
            console.error('Error in getLocal:', error);
            return null;
        }
    };
    const setCookie = window.setCookie || function (name, value, days) {
        console.warn('setCookie not defined, using document.cookie directly');
        try {
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = `; expires=${date.toUTCString()}`;
            }
            document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
        } catch (error) {
            console.error('Error in setCookie:', error);
        }
    };

    // Liability logic
    console.log('Liability logic initialized in liabilitytab.js at:', new Date().toISOString());
    let liabilityInitialized = false;
    let LIABILITIES = 0;
    let LIABILITIESNA = 0;

    function calculateLiabilities() {
        const liabilitiesFields = [
            'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
            'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
            'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears'
        ];

        let liabilities = 0;

        for (let i = 0; i < liabilitiesFields.length; i++) {
            const field = liabilitiesFields[i];
            const element = document.getElementById(field);
            if (!element) {
                console.error(`Element #${field} not found`);
                continue;
            }
            const fieldValue = element.value;
            console.log(`Field value for ${field}: ${fieldValue}`);
            const parsedValue = parseFloat(fieldValue);
            if (!isNaN(parsedValue)) {
                let fieldPercentage = parseFloat(document.querySelector(`#${field}_percent`)?.value);
                if (isNaN(fieldPercentage)) {
                    fieldPercentage = 100;
                }
                liabilities += (parsedValue * fieldPercentage / 100);
            }
        }

        LIABILITIES = liabilities;
        const liabilitiesElement = document.getElementById('LIABILITIES');
        if (liabilitiesElement) {
            liabilitiesElement.textContent = `$${LIABILITIES.toFixed(2)}`;
        } else {
            console.error('LIABILITIES element not found');
        }
    }

    function setDebtData2() {
        const isPartner = getLocal('liabilityspousecheckbox') === 'checked';
        const liabilitiesFields = [
            'liabilities_personal_debt', 'liabilities_student_loan', 'liabilities_line_of_credit',
            'liabilities_credit_card', 'liabilities_tax_arrears'
        ];

        let totalDebt = 0;

        liabilitiesFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element) {
                console.error(`Element #${field} not found`);
                return;
            }
            const fieldValue = parseFloat(element.value) || 0;
            let fieldValuePercent = parseFloat(document.getElementById(`${field}_percent`)?.value);
            if (isNaN(fieldValuePercent) || !isPartner) {
                fieldValuePercent = 100;
            }
            totalDebt += (fieldValue * fieldValuePercent / 100);
        });

        LIABILITIESNA = totalDebt;
    }

    function calculateAll() {
        calculateLiabilities();
        setLocal("LIABILITIES", LIABILITIES, 365);
        setDebtData2();
        setLocal("LIABILITIESNA", LIABILITIESNA, 365);

        const fields = [
            'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
            'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
            'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            const percentElement = document.getElementById(`${field}_percent`);
            if (element) {
                setLocal(field, element.value.trim() !== "" ? element.value : "", 365);
            }
            if (percentElement) {
                setLocal(`${field}_percent`, percentElement.value.trim() !== "" ? percentElement.value : "100", 365);
            }
        });
    }

    function calculateNext() {
        calculateAll();
        setCookie('summary_reached', Date.now(), 365);
        const originalQuerySelector = document.querySelector.bind(document);
        const liabilityContainer = originalQuerySelector('.data-container-liability');
        if (liabilityContainer && liabilityContainer.dataset.state === 'expanded') {
            const liabilityClose = liabilityContainer.querySelector('.close-data-container');
            if (liabilityClose) {
                liabilityClose.click();
                console.log('Liability tab closed at:', new Date().toISOString());
            } else {
                console.error('Liability close button not found');
            }
        } else {
            console.log('Liability tab already closed or not found');
        }
        const summaryContainer = originalQuerySelector('.data-container-summary');
        if (summaryContainer) {
            const summaryLabel = summaryContainer.querySelector('.data-label');
            if (summaryLabel) {
                setTimeout(() => {
                    summaryLabel.click();
                    console.log('Summary tab triggered to open at:', new Date().toISOString());
                }, 300);
            } else {
                console.error('Summary data label not found');
            }
        } else {
            console.error('Summary data container not found. Ensure summarytab.js is loaded');
        }
    }

    function calculateBack() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const liabilityContainer = originalQuerySelector('.data-container-liability');
        if (liabilityContainer && liabilityContainer.dataset.state === 'expanded') {
            const liabilityClose = liabilityContainer.querySelector('.close-data-container');
            if (liabilityClose) {
                liabilityClose.click();
                console.log('Liability tab closed at:', new Date().toISOString());
            } else {
                console.error('Liability close button not found');
            }
        } else {
            console.log('Liability tab already closed or not found');
        }
        const assetContainer = originalQuerySelector('.data-container-asset');
        if (assetContainer) {
            const assetLabel = assetContainer.querySelector('.data-label');
            if (assetLabel) {
                setTimeout(() => {
                    assetLabel.click();
                    console.log('Asset tab triggered to open at:', new Date().toISOString());
                }, 300);
            } else {
                console.error('Asset data label not found');
            }
        } else {
            console.error('Asset data container not found. Ensure assettab.js is loaded');
        }
    }

    function initializeLiabilityForm(container) {
        if (liabilityInitialized) {
            console.log('Liability form already initialized, skipping at:', new Date().toISOString());
            return;
        }
        liabilityInitialized = true;
        console.log('Liability form initialized at:', new Date().toISOString());

        // Bind navigation buttons
        function bindNavButtons() {
            const nextButton = container.querySelector('#nextButton');
            const backButton = container.querySelector('#backButton');
            let success = true;

            if (nextButton) {
                nextButton.removeAttribute('onclick');
                nextButton.removeEventListener('click', calculateNext);
                nextButton.addEventListener('click', calculateNext);
                console.log('calculateNext bound to nextButton at:', new Date().toISOString());
            } else {
                console.warn('nextButton not found at:', new Date().toISOString());
                success = false;
            }

            if (backButton) {
                backButton.removeAttribute('onclick');
                backButton.removeEventListener('click', calculateBack);
                backButton.addEventListener('click', calculateBack);
                console.log('calculateBack bound to backButton at:', new Date().toISOString());
            } else {
                console.warn('backButton not found at:', new Date().toISOString());
                success = false;
            }

            return success;
        }

        // Initial attempt to bind
        bindNavButtons();

        // Persistent observer for nav buttons
        const observer = new MutationObserver((mutations, obs) => {
            if ((container.querySelector('#nextButton') && !container.querySelector('#nextButton').onclick) ||
                (container.querySelector('#backButton') && !container.querySelector('#backButton').onclick)) {
                console.log('Nav button(s) detected by observer, binding at:', new Date().toISOString());
                if (bindNavButtons()) {
                    obs.disconnect();
                }
            }
        });
        observer.observe(container, { childList: true, subtree: true });

        // Fallback binding after delay
        setTimeout(() => {
            if (!container.querySelector('#nextButton')?.onclick || !container.querySelector('#backButton')?.onclick) {
                console.log('Fallback binding attempt for nav buttons at:', new Date().toISOString());
                if (bindNavButtons()) {
                    console.log('Fallback binding succeeded');
                } else {
                    console.error('Fallback binding failed, nav buttons not found. DOM state:', container.innerHTML);
                }
            }
        }, 3000);

        // Initialize form elements
        const tabs = container.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.removeEventListener('click', handleTabClick);
            tab.addEventListener('click', handleTabClick);
            function handleTabClick() {
                const dataL = tab.getAttribute('data-location');
                const location = document.location.pathname;
                if (location.includes(dataL)) {
                    tab.removeAttribute('href');
                    tab.classList.add('active');
                }
            }
        });

        const formElements = [
            'liabilities_small_business_loan', 'liabilities_primary_residence', 'liabilities_investment_properties',
            'liabilities_vehicle_loan', 'liabilities_personal_debt', 'liabilities_student_loan',
            'liabilities_line_of_credit', 'liabilities_credit_card', 'liabilities_tax_arrears',
            'liabilities_small_business_loan_percent', 'liabilities_primary_residence_percent', 'liabilities_investment_properties_percent',
            'liabilities_vehicle_loan_percent', 'liabilities_personal_debt_percent', 'liabilities_student_loan_percent',
            'liabilities_line_of_credit_percent', 'liabilities_credit_card_percent', 'liabilities_tax_arrears_percent'
        ];

        formElements.forEach(elementId => {
            const element = container.querySelector(`#${elementId}`);
            if (element) {
                const savedValue = getLocal(elementId);
                if (savedValue !== null) {
                    element.value = savedValue;
                    console.log(`Set ${elementId} to saved value: ${savedValue}`);
                } else {
                    console.log(`No saved value for ${elementId}`);
                }
                element.removeEventListener('input', handleInputChange);
                element.addEventListener('input', handleInputChange);
                function handleInputChange() {
                    setLocal(elementId, element.value.trim() !== "" ? element.value : elementId.includes('_percent') ? "100" : "", 365);
                    console.log(`Saved ${elementId}: ${element.value}`);
                    calculateAll();
                }
            } else {
                console.error(`Element #${elementId} not found`);
            }
        });

        const romanticliabilityCheckbox = container.querySelector('#liabilityspousecheckbox');
        if (romanticliabilityCheckbox) {
            const romanticliabilityValue = getLocal('romanticliability');
            romanticliabilityCheckbox.checked = romanticliabilityValue === 'checked';
            romanticliabilityCheckbox.removeEventListener('change', handleRomanticChange);
            romanticliabilityCheckbox.addEventListener('change', handleRomanticChange);
            function handleRomanticChange() {
                setLocal('romanticliability', this.checked ? 'checked' : 'unchecked', 365);
                const percentInputs = container.querySelectorAll('.percent-input');
                percentInputs.forEach(input => {
                    input.style.display = this.checked ? 'block' : 'none';
                });
                console.log(`Romantic liability set to: ${this.checked ? 'checked' : 'unchecked'}`);
            }
            const percentInputs = container.querySelectorAll('.percent-input');
            percentInputs.forEach(input => {
                input.style.display = romanticliabilityCheckbox.checked ? 'block' : 'none';
            });
        } else {
            console.error('liabilityspousecheckbox not found');
        }

        calculateAll();
    }

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url} at:`, new Date().toISOString());
            const startTime = performance.now();
            const response = await fetch(url);
            const fetchTime = performance.now() - startTime;
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log(`Stored content fetched in ${fetchTime.toFixed(2)}ms at:`, new Date().toISOString());

            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">LIABILITY</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into liability container at:`, new Date().toISOString());

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'liabilitytab.js', 'setlocal.js', 'getlocal.js', 'setcookie.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime();
                    if (
                        script.src.includes('utils.js') ||
                        script.src.includes('hideShow.js')
                    ) {
                        newScript.type = 'module';
                    }
                    newScript.onerror = () => console.error(`Failed to load script: ${script.src}`);
                    document.body.appendChild(newScript);
                } else if (!script.src) {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                }
            });

            // Trigger JavaScript for liability.html only when container is expanded
            initializeLiabilityForm(dataContainer);
        } catch (error) {
            console.error(`Error loading stored content at:`, new Date().toISOString(), error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-liability')) {
            console.log('Liability data container already exists, skipping initialization at:', new Date().toISOString());
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-liability {
                position: fixed;
                top: calc(65% + 36px);
                left: 0;
                background-color: #f5f5f5;
                padding: 4px;
                border: 2px solid #000;
                border-left: none;
                border-radius: 0 8px 8px 0;
                box-shadow: 4px 4px 0 #000;
                z-index: 10000;
                max-width: 34px;
                min-height: 30px;
                transition: max-width 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out;
                overflow: hidden;
                font-family: "Inter", sans-serif;
                visibility: visible;
                opacity: 1;
            }
            .data-container-liability.collapsed {
                max-width: 36px; /* Doubled from 18px */
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-liability.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-liability:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-liability .close-data-container {
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
            .data-container-liability .data-label {
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
            .data-container-liability.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-liability .data-content {
                padding: 10px;
                font-size: 14px;
                max-height: calc(100vh - 80px);
                overflow-y: auto;
                overflow-x: auto;
                font-family: "Inter", sans-serif;
                max-width: 100%;
                margin-top: 30px;
            }
            @media (max-width: 480px) {
                .data-container-liability {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-liability.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-liability.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-liability .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-liability.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-liability .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-liability .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-liability collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">LIABILITY</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Liability data container injected with state: collapsed at:', new Date().toISOString());

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Liability data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.className = 'data-container-liability collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">LIABILITY</span>
                `;
                liabilityInitialized = false; // Reset initialization flag
                LIABILITIES = 0; // Reset global variables
                LIABILITIESNA = 0;
                console.log('Liability data container collapsed, state and globals reset at:', new Date().toISOString());
            } else {
                dataContainer.className = 'data-container-liability expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/liability.html');
            }

            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');

            if (newLabel) {
                newLabel.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }

            if (newClose) {
                newClose.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDataContainer();
                });
            }
        }

        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                const isNavButton = e.target.closest('#nextButton, #backButton');
                if (!isClickInside && !isNavButton) {
                    console.log('Clicked outside liability data container, collapsing at:', new Date().toISOString());
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing liability data container at:', new Date().toISOString(), error);
    }
});