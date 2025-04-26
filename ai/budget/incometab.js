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
    const overwriteCookies = window.overwriteCookies || function () {
        console.warn('overwriteCookies not defined');
    };

    // Income logic
    console.log('Income logic initialized in incometab.js');
    let incomeInitialized = false;
    var ANNUALEMPLOYMENTINCOME = 0;
    var ANNUALINCOME = 0;
    var PASSIVEINCOME = 0;

    function getTermsCookie(name) {
        const now = Date.now();
        const status = JSON.parse(localStorage.getItem(name));
        if (status && now > status.time) {
            localStorage.removeItem(name);
            return false;
        }
        return status ? status.accepted : false;
    }

    function setTermsCookie(name, value) {
        const date = new Date();
        localStorage.setItem(name, JSON.stringify({
            accepted: value,
            time: date.setTime(date.getTime() + 30 * 60 * 1000)
        }));
    }

    function calculateAnnual(inputId, frequencyGroupId) {
        let input = parseFloat(document.getElementById(inputId).value) || 0;
        if (inputId === 'income_sole_prop') {
            const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
            if (calculatedFromWorksheet === 'true') {
                const totalRevenue = getLocal("totalRevenue");
                if (totalRevenue && totalRevenue !== 'annually' && !isNaN(parseFloat(totalRevenue))) {
                    if (input != totalRevenue) {
                        input = parseFloat(totalRevenue);
                    }
                }
            }
        }
        const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
        const frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${frequencyGroupId}`) || 'annually';
        switch (frequency) {
            case 'annually':
                return input;
            case 'quarterly':
                return input * 4;
            case 'monthly':
                return input * 12;
            case 'weekly':
                return input * 52;
            default:
                return 0;
        }
    }

    function calculateNormalizedSum() {
        const incomeFields = [
            ['income_salary_wages', 'income_salary_wages_frequency'],
            ['income_tips', 'income_tips_frequency'],
            ['income_bonuses', 'income_bonuses_frequency'],
            ['income_sole_prop', 'income_sole_prop_frequency'],
            ['income_investment_property', 'income_investment_property_frequency'],
            ['income_capital_gains_losses', 'income_capital_gains_losses_frequency'],
            ['income_interest', 'income_interest_frequency'],
            ['income_owner_dividend', 'income_owner_dividend_frequency'],
            ['income_public_dividend', 'income_public_dividend_frequency'],
            ['income_trust', 'income_trust_frequency'],
            ['income_federal_pension', 'income_federal_pension_frequency'],
            ['income_work_pension', 'income_work_pension_frequency'],
            ['income_social_security', 'income_social_security_frequency'],
            ['income_employment_insurance', 'income_employment_insurance_frequency'],
            ['income_alimony', 'income_alimony_frequency'],
            ['income_scholarships_grants', 'income_scholarships_grants_frequency'],
            ['income_royalties', 'income_royalties_frequency'],
            ['income_gambling_winnings', 'income_gambling_winnings_frequency'],
            ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
            ['income_venture_capital', 'income_venture_capital_frequency'],
            ['income_tax_free_income', 'income_tax_free_income_frequency']
        ];
        let annualIncomeSum = 0;
        incomeFields.forEach(field => {
            annualIncomeSum += calculateAnnual(field[0], field[1]);
        });
        ANNUALINCOME = annualIncomeSum;
        const sumElement = document.getElementById('annual_income_sum');
        if (sumElement) sumElement.textContent = `$${annualIncomeSum.toFixed(2)}`;
    }

    function calculateEmploymentIncome() {
        const employmentIncomeFields = [
            ['income_salary_wages', 'income_salary_wages_frequency'],
            ['income_tips', 'income_tips_frequency'],
            ['income_bonuses', 'income_bonuses_frequency']
        ];
        let annualEmploymentIncome = 0;
        employmentIncomeFields.forEach(field => {
            annualEmploymentIncome += calculateAnnual(field[0], field[1]);
        });
        ANNUALEMPLOYMENTINCOME = annualEmploymentIncome;
        const empElement = document.getElementById('ANNUALEMPLOYMENTINCOME');
        if (empElement) empElement.textContent = `$${annualEmploymentIncome.toFixed(2)}`;
    }

    function passiveincome() {
        const fireFields = [
            ['income_investment_property', 'income_investment_property_frequency'],
            ['income_interest', 'income_interest_frequency'],
            ['income_public_dividend', 'income_public_dividend_frequency'],
            ['income_trust', 'income_trust_frequency'],
            ['income_peer_to_peer_lending', 'income_peer_to_peer_lending_frequency'],
            ['income_royalties', 'income_royalties_frequency']
        ];
        let income = 0;
        for (const [incomeField, frequencyField] of fireFields) {
            const incomeValue = calculateAnnual(incomeField, frequencyField);
            income += incomeValue;
        }
        PASSIVEINCOME = income;
    }

    function calculateAll() {
        calculateNormalizedSum();
        calculateEmploymentIncome();
        passiveincome();
        function getCheckedFrequency(id) {
            const checkedCheckbox = document.querySelector(`#${id} input[type="checkbox"]:checked`);
            return checkedCheckbox ? checkedCheckbox.value : "0";
        }
        const incomeFields = [
            'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop',
            'income_investment_property', 'income_capital_gains_losses', 'income_interest',
            'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension',
            'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony',
            'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending',
            'income_venture_capital', 'income_tax_free_income'
        ];
        incomeFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const value = element.value.trim();
                setLocal(field, value !== "" ? value : "0", 365);
            }
        });
        setLocal("ANNUALINCOME", ANNUALINCOME, 365);
        setLocal("ANNUALEMPLOYMENTINCOME", ANNUALEMPLOYMENTINCOME, 365);
        setLocal("PASSIVEINCOME", PASSIVEINCOME, 365);
    }

    function validatecheckbox() {
        const termscheckbox = document.getElementById("termscheckbox");
        const notintended = document.getElementById("notintended");
        if (termscheckbox && notintended && termscheckbox.checked && notintended.checked) {
            calculateNext();
        } else {
            alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
        }
    }

    function calculateNext() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const incomeContainer = originalQuerySelector('.data-container-income');
        if (incomeContainer && incomeContainer.dataset.state === 'expanded') {
            const incomeClose = incomeContainer.querySelector('.close-data-container');
            if (incomeClose) {
                incomeClose.click();
                console.log('Income tab closed');
            } else {
                console.error('Income close button not found');
            }
        } else {
            console.log('Income tab already closed or not found');
        }
        const expenseContainer = originalQuerySelector('.data-container-expense');
        if (expenseContainer) {
            const expenseLabel = expenseContainer.querySelector('.data-label');
            if (expenseLabel) {
                setTimeout(() => {
                    expenseLabel.click();
                    console.log('Expense tab triggered to open');
                }, 300);
            } else {
                console.error('Expense data label not found');
            }
        } else {
            console.error('Expense data container not found. Ensure budget.expense.js is loaded');
        }
    }

    function initializeIncomeForm(container) {
        if (incomeInitialized) {
            console.log('Income form already initialized, skipping');
            return;
        }
        incomeInitialized = true;
        console.log('Income form initialized');

        const tabs = container.querySelectorAll('.tab');
        const checkbox1 = container.querySelector('#termscheckbox');
        const checkbox2 = container.querySelector('#notintended');

        function handleCheckboxChange() {
            setTermsCookie('term1', checkbox1.checked);
            setTermsCookie('term2', checkbox2.checked);
        }

        function handleTabClick(e) {
            const isChecked1 = getTermsCookie('term1');
            const isChecked2 = getTermsCookie('term2');
            if (!isChecked1 || !isChecked2) {
                e.preventDefault();
                alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
            }
        }

        if (checkbox1) {
            checkbox1.checked = getTermsCookie('term1');
            // Remove existing listeners to prevent duplicates
            checkbox1.removeEventListener('click', handleCheckboxChange);
            checkbox1.addEventListener('click', handleCheckboxChange);
            console.log('termscheckbox initialized, checked:', checkbox1.checked);
        } else {
            console.error('termscheckbox not found');
        }
        if (checkbox2) {
            checkbox2.checked = getTermsCookie('term2');
            checkbox2.removeEventListener('click', handleCheckboxChange);
            checkbox2.addEventListener('click', handleCheckboxChange);
            console.log('notintended initialized, checked:', checkbox2.checked);
        } else {
            console.error('notintended not found');
        }

        tabs.forEach(tab => {
            tab.removeEventListener('click', handleTabClick);
            tab.addEventListener('click', handleTabClick);
            const dataL = tab.getAttribute('data-location');
            const location = document.location.pathname;
            if (location.includes(dataL)) {
                tab.removeAttribute('href');
                tab.classList.add('active');
            }
        });

        const formElements = [
            'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop',
            'income_investment_property', 'income_capital_gains_losses', 'income_interest',
            'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension',
            'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony',
            'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending',
            'income_venture_capital', 'income_tax_free_income'
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
                // Remove existing input listeners to prevent duplicates
                element.removeEventListener('input', handleInputChange);
                element.addEventListener('input', handleInputChange);
                function handleInputChange() {
                    setLocal(elementId, element.value.trim() !== "" ? element.value : "0", 365);
                    console.log(`Saved ${elementId}: ${element.value}`);
                }
            } else {
                console.error(`Element #${elementId} not found`);
            }
        });

        const overwriteLink = container.querySelector('#cookie-overwrite-link');
        if (overwriteLink) {
            overwriteLink.removeEventListener('click', handleOverwriteClick);
            overwriteLink.addEventListener('click', handleOverwriteClick);
            function handleOverwriteClick(e) {
                e.preventDefault();
                overwriteCookies();
            }
        }

        const paid = getLocal("authenticated") === "paid";
        const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
        if (calculatedFromWorksheet === 'true' && paid) {
            const totalRevenue = getLocal("totalRevenue");
            const selfEmploymentIncomeField = container.querySelector("#income_sole_prop");
            if (selfEmploymentIncomeField) {
                selfEmploymentIncomeField.value = totalRevenue;
                setLocal("income_sole_prop", totalRevenue, 365);
                setLocal('calculated_from_worksheet', 'resolved', 365);
                selfEmploymentIncomeField.placeholder = "";
                console.log(`Set income_sole_prop to totalRevenue: ${totalRevenue}`);
            }
        } else if (calculatedFromWorksheet === 'true' && !paid) {
            const selfEmploymentIncomeField = container.querySelector("#income_sole_prop");
            if (selfEmploymentIncomeField) {
                selfEmploymentIncomeField.placeholder = "payment required";
            }
        }

        console.log('Total checkbox groups found:', container.querySelectorAll('.checkbox-button-group').length);
        container.querySelectorAll('.checkbox-button-group').forEach((group, index) => {
            try {
                console.log(`Processing group ${index + 1}: ${group.id || 'no-id'}`);
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                if (!checkboxes.length) {
                    console.warn(`No checkboxes found in group ${group.id || 'no-id'}`);
                    return;
                }
                checkboxes.forEach(checkbox => {
                    checkbox.removeEventListener('change', handleCheckboxGroupChange);
                    checkbox.addEventListener('change', handleCheckboxGroupChange);
                    function handleCheckboxGroupChange() {
                        try {
                            if (this.checked) {
                                checkboxes.forEach(cb => {
                                    if (cb !== this) cb.checked = false;
                                });
                                const input = group.closest('.checkboxrow').querySelector('input[type="number"]');
                                const inputId = input ? input.id : null;
                                if (inputId && typeof calculateAnnual === 'function') {
                                    calculateAnnual(inputId, this.value);
                                }
                                setLocal(`frequency_${group.id}`, this.value, 365);
                                console.log(`Saved ${this.value} to cookie for ${group.id}`);
                            }
                        } catch (error) {
                            console.error(`Error in checkbox change for ${group.id}:`, error);
                        }
                    }
                });
                const savedFrequency = getLocal(`frequency_${group.id}`);
                const checkboxToCheck = group.querySelector(`input[value="${savedFrequency}"]`) ||
                    group.querySelector('input[value="annually"]');
                if (checkboxToCheck) {
                    checkboxes.forEach(cb => {
                        if (cb !== checkboxToCheck) cb.checked = false;
                    });
                    checkboxToCheck.checked = true;
                    console.log(`Set ${checkboxToCheck.value} as checked for ${group.id} (saved: ${savedFrequency})`);
                    const input = group.closest('.checkboxrow').querySelector('input[type="number"]');
                    const inputId = input ? input.id : null;
                    if (inputId && typeof calculateAnnual === 'function') {
                        calculateAnnual(inputId, checkboxToCheck.value);
                    }
                } else {
                    console.warn(`No valid checkbox for saved value '${savedFrequency}' in ${group.id}`);
                }
            } catch (error) {
                console.error(`Error processing group ${group.id || 'no-id'}:`, error);
            }
        });

        const interactiveElements = container.querySelectorAll(
            ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
        );
        const tooltips = container.querySelectorAll(".checkboxrow .tooltip");
        tooltips.forEach(tooltip => {
            const content = tooltip.querySelector(".tooltip-content");
            const message = tooltip.getAttribute("data-tooltip");
            if (content && message) content.textContent = message;
        });
        interactiveElements.forEach(element => {
            element.removeEventListener('click', handleTooltipClick);
            element.addEventListener('click', handleTooltipClick);
            function handleTooltipClick(e) {
                const row = element.closest(".checkboxrow");
                const tooltip = row.querySelector(".tooltip");
                const content = tooltip ? tooltip.querySelector(".tooltip-content") : null;
                container.querySelectorAll(".checkboxrow").forEach(r => {
                    r.classList.remove("active");
                    const otherTooltip = r.querySelector(".tooltip");
                    if (otherTooltip) otherTooltip.classList.remove("show");
                });
                row.classList.add("active");
                if (tooltip && content) {
                    tooltip.classList.add("show");
                    const contentRect = content.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    if (contentRect.left < 0) {
                        content.style.left = '0';
                        content.style.transform = 'translateX(0)';
                    } else if (contentRect.right > viewportWidth) {
                        content.style.left = '100%';
                        content.style.transform = 'translateX(-100%)';
                    } else {
                        content.style.left = '50%';
                        content.style.transform = 'translateX(-50%)';
                    }
                }
                e.stopPropagation();
            }
        });
        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);
        function handleOutsideClick(e) {
            if (!e.target.closest(".checkboxrow")) {
                container.querySelectorAll(".checkboxrow").forEach(r => {
                    r.classList.remove("active");
                    const tooltip = r.querySelector(".tooltip");
                    if (tooltip) tooltip.classList.remove("show");
                });
            }
        }
    }

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url}`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);

            const content = await response.text();
            console.log('Stored content fetched successfully');

            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">INCOME</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into income container`);

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'income.js', 'setlocal.js', 'getlocal.js', 'cookieoverwrite.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    if (
                        script.src.includes('frequency.js') ||
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

            initializeIncomeForm(dataContainer);

            const validateButton = dataContainer.querySelector('.nav-btn');
            if (validateButton) {
                validateButton.removeEventListener('click', validatecheckbox);
                validateButton.addEventListener('click', validatecheckbox);
                console.log('validatecheckbox bound to button');
            } else {
                console.error('validateButton not found');
            }
        } catch (error) {
            console.error(`Error loading stored content:`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-income')) {
            console.log('Income data container already exists, skipping initialization');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-income {
                position: fixed;
                top: calc(20% + 36px);
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
            .data-container-income.collapsed {
                max-width: 18px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-income.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-income:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-income .close-data-container {
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
            .data-container-income .data-label {
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
            .data-container-income.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-income .data-content {
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
                .data-container-income {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-income.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-income.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-income .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-income.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-income .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-income .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-income collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">INCOME</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Income data container injected with state: collapsed');

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Income data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.classList.remove('expanded');
                dataContainer.classList.add('collapsed');
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">INCOME</span>
                `;
                console.log('Income data container collapsed');
            } else {
                dataContainer.classList.remove('collapsed');
                dataContainer.classList.add('expanded');
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/income.html');
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
                const isValidateButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isValidateButton) {
                    console.log('Clicked outside income data container, collapsing');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing income data container:', error);
    }
});