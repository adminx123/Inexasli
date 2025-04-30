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

    // Expense logic
    console.log('Expense logic initialized in expensetab.js');
    let expenseInitialized = false;
    let ANNUALEXPENSESUM = 0;
    let HOUSING = 0;
    let TRANSPORTATION = 0;
    let ESSENTIAL = 0;
    let DISCRETIONARY = 0;
    let DEBT = 0;
    let DEPENDANT = 0;

    function hideShowClass(className, action) {
        document.querySelectorAll(`.${className}`).forEach(el => {
            el.style.display = action === 'show' ? 'block' : 'none';
        });
    }

    function updateDependantVisibility() {
        const selectedFilingStatus = getLocal('fillingStatus');
        if (statusesWithDependants.includes(selectedFilingStatus)) {
            hideShowClass('dependantornot', 'show');
        } else {
            hideShowClass('dependantornot', 'hide');
        }
    }

    function updateSingleOrNotVisibility() {
        const selectedFilingStatus = getLocal('fillingStatus');
        if (singleStatuses.includes(selectedFilingStatus)) {
            hideShowClass('singleornot', 'hide');
        } else {
            hideShowClass('singleornot', 'show');
        }
    }

    function calculateAnnual(inputId, frequency) {
        const input = document.getElementById(inputId);
        if (!input || !input.value) return 0;
        const amount = parseFloat(input.value) || 0;
        switch (frequency) {
            case 'annually': return amount;
            case 'quarterly': return amount * 4;
            case 'monthly': return amount * 12;
            case 'weekly': return amount * 52;
            default: return 0;
        }
    }

    function calculateNormalizedSum() {
        const expenseFields = [
            ['expenses_grocery', 'expenses_grocery_frequency'],
            ['expenses_fitness', 'expenses_fitness_frequency'],
            ['expenses_hygiene', 'expenses_hygiene_frequency'],
            ['expenses_clothing', 'expenses_clothing_frequency'],
            ['expenses_cellphone_service', 'expenses_cellphone_service_frequency'],
            ['expenses_medical_dental', 'expenses_medical_dental_frequency'],
            ['expenses_perscription', 'expenses_perscription_frequency'],
            ['expenses_retirement', 'expenses_retirement_frequency'],
            ['expenses_dining', 'expenses_dining_frequency'],
            ['expenses_subscriptions', 'expenses_subscriptions_frequency'],
            ['expenses_vacation', 'expenses_vacation_frequency'],
            ['expenses_beauty', 'expenses_beauty_frequency'],
            ['expenses_travel_life_insurance', 'expenses_travel_life_insurance_frequency'],
            ['expenses_entertainment', 'expenses_entertainment_frequency'],
            ['expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_frequency'],
            ['expenses_student_loan_payment', 'expenses_student_loan_payment_frequency'],
            ['expenses_credit_card_payment', 'expenses_credit_card_payment_frequency'],
            ['expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_frequency'],
            ['expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_frequency'],
            ['housing_mortgage_payment', 'housing_mortgage_payment_frequency'],
            ['housing_rent_payment', 'housing_rent_payment_frequency'],
            ['housing_property_tax', 'housing_property_tax_frequency'],
            ['housing_condo_fee', 'housing_condo_fee_frequency'],
            ['housing_hydro', 'housing_hydro_frequency'],
            ['housing_insurance', 'housing_insurance_frequency'],
            ['housing_repairs', 'housing_repairs_frequency'],
            ['housing_water', 'housing_water_frequency'],
            ['housing_gas', 'housing_gas_frequency'],
            ['housing_internet', 'housing_internet_frequency'],
            ['transportation_car_loan_payment', 'transportation_car_loan_payment_frequency'],
            ['transportation_insurance', 'transportation_insurance_frequency'],
            ['transportation_fuel', 'transportation_fuel_frequency'],
            ['transportation_maintenance', 'transportation_maintenance_frequency'],
            ['transportation_public_transit', 'transportation_public_transit_frequency'],
            ['transportation_ride_hailing', 'transportation_ride_hailing_frequency'],
            ['dependant_day_care', 'dependant_day_care_frequency'],
            ['dependant_medical_dental', 'dependant_medical_dental_frequency'],
            ['dependant_clothing', 'dependant_clothing_frequency'],
            ['dependant_sports_recreation', 'dependant_sports_recreation_frequency'],
            ['dependant_transportation', 'dependant_transportation_frequency'],
            ['dependant_tuition', 'dependant_tuition_frequency'],
            ['dependant_housing', 'dependant_housing_frequency'],
            ['dependant_cellular_service', 'dependant_cellular_service_frequency']
        ];

        let annualExpenseSum = 0;
        expenseFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            annualExpenseSum += calculateAnnual(inputId, frequency);
        });

        ANNUALEXPENSESUM = annualExpenseSum;
        const retirementCheckbox = document.querySelector(`#expenses_retirement_frequency input[type="checkbox"]:checked`);
        const retirementFrequency = retirementCheckbox ? retirementCheckbox.value : 'annually';
        const retirementContribution = calculateAnnual('expenses_retirement', retirementFrequency);
        setLocal('RETIREMENTCONTRIBUTION', retirementContribution, 365);
        console.log('RETIREMENTCONTRIBUTION saved:', retirementContribution);
    }

    function essentialExpenses() {
        const essentialFields = [
            ['expenses_grocery', 'expenses_grocery_frequency'],
            ['expenses_fitness', 'expenses_fitness_frequency'],
            ['expenses_hygiene', 'expenses_hygiene_frequency'],
            ['expenses_clothing', 'expenses_clothing_frequency'],
            ['expenses_cellphone_service', 'expenses_cellphone_service_frequency'],
            ['expenses_medical_dental', 'expenses_medical_dental_frequency'],
            ['expenses_perscription', 'expenses_perscription_frequency']
        ];

        let essential = 0;
        essentialFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            essential += calculateAnnual(inputId, frequency);
        });

        ESSENTIAL = essential;
    }

    function discretionaryExpenses() {
        const discretionaryFields = [
            ['expenses_dining', 'expenses_dining_frequency'],
            ['expenses_subscriptions', 'expenses_subscriptions_frequency'],
            ['expenses_vacation', 'expenses_vacation_frequency'],
            ['expenses_beauty', 'expenses_beauty_frequency'],
            ['expenses_travel_life_insurance', 'expenses_travel_life_insurance_frequency'],
            ['expenses_entertainment', 'expenses_entertainment_frequency'],
            ['expenses_retirement', 'expenses_retirement_frequency']
        ];

        let discretionary = 0;
        discretionaryFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            discretionary += calculateAnnual(inputId, frequency);
        });

        DISCRETIONARY = discretionary;
    }

    function housingExpenses() {
        const housingFields = [
            ['housing_mortgage_payment', 'housing_mortgage_payment_frequency'],
            ['housing_rent_payment', 'housing_rent_payment_frequency'],
            ['housing_property_tax', 'housing_property_tax_frequency'],
            ['housing_condo_fee', 'housing_condo_fee_frequency'],
            ['housing_hydro', 'housing_hydro_frequency'],
            ['housing_insurance', 'housing_insurance_frequency'],
            ['housing_repairs', 'housing_repairs_frequency'],
            ['housing_water', 'housing_water_frequency'],
            ['housing_gas', 'housing_gas_frequency'],
            ['housing_internet', 'housing_internet_frequency']
        ];

        let housing = 0;
        housingFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            housing += calculateAnnual(inputId, frequency);
        });

        HOUSING = housing;
    }

    function transportationExpenses() {
        const transportationFields = [
            ['transportation_car_loan_payment', 'transportation_car_loan_payment_frequency'],
            ['transportation_insurance', 'transportation_insurance_frequency'],
            ['transportation_fuel', 'transportation_fuel_frequency'],
            ['transportation_maintenance', 'transportation_maintenance_frequency'],
            ['transportation_public_transit', 'transportation_public_transit_frequency'],
            ['transportation_ride_hailing', 'transportation_ride_hailing_frequency']
        ];

        let transportation = 0;
        transportationFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            transportation += calculateAnnual(inputId, frequency);
        });

        TRANSPORTATION = transportation;
    }

    function dependantExpenses() {
        const dependantFields = [
            ['dependant_day_care', 'dependant_day_care_frequency'],
            ['dependant_medical_dental', 'dependant_medical_dental_frequency'],
            ['dependant_clothing', 'dependant_clothing_frequency'],
            ['dependant_sports_recreation', 'dependant_sports_recreation_frequency'],
            ['dependant_transportation', 'dependant_transportation_frequency'],
            ['dependant_tuition', 'dependant_tuition_frequency'],
            ['dependant_housing', 'dependant_housing_frequency'],
            ['dependant_cellular_service', 'dependant_cellular_service_frequency']
        ];

        let dependant = 0;
        dependantFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            dependant += calculateAnnual(inputId, frequency);
        });

        DEPENDANT = dependant;
    }

    function debtExpenses() {
        const debtFields = [
            ['expenses_line_of_credit_payment', 'expenses_line_of_credit_payment_frequency'],
            ['expenses_student_loan_payment', 'expenses_student_loan_payment_frequency'],
            ['expenses_credit_card_payment', 'expenses_credit_card_payment_frequency'],
            ['expenses_tax_arrears_payment', 'expenses_tax_arrears_payment_frequency'],
            ['expenses_small_business_loan_payment', 'expenses_small_business_loan_payment_frequency']
        ];

        let debt = 0;
        debtFields.forEach(([inputId, frequencyGroupId]) => {
            const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
            const frequency = checkedCheckbox ? checkedCheckbox.value : 'annually';
            debt += calculateAnnual(inputId, frequency);
        });

        DEBT = debt;
    }

    function calculateAll() {
        calculateNormalizedSum();
        housingExpenses();
        transportationExpenses();
        dependantExpenses();
        debtExpenses();
        essentialExpenses();
        discretionaryExpenses();
        setLocal("ANNUALEXPENSESUM", ANNUALEXPENSESUM, 365);
        setLocal("HOUSING", HOUSING, 365);
        setLocal("TRANSPORTATION", TRANSPORTATION, 365);
        setLocal("DEPENDANT", DEPENDANT, 365);
        setLocal("DEBT", DEBT, 365);
        setLocal("ESSENTIAL", ESSENTIAL, 365);
        setLocal("DISCRETIONARY", DISCRETIONARY, 365);
    }

    function calculateNext() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const expenseContainer = originalQuerySelector('.data-container-expense');
        if (expenseContainer && expenseContainer.dataset.state === 'expanded') {
            const expenseClose = expenseContainer.querySelector('.close-data-container');
            if (expenseClose) {
                expenseClose.click();
                console.log('Expense tab closed');
            } else {
                console.error('Expense close button not found');
            }
        } else {
            console.log('Expense tab already closed or not found');
        }
        const assetContainer = originalQuerySelector('.data-container-asset');
        if (assetContainer) {
            const assetLabel = assetContainer.querySelector('.data-label');
            if (assetLabel) {
                setTimeout(() => {
                    assetLabel.click();
                    console.log('Asset tab triggered to open');
                }, 300);
            } else {
                console.error('Asset data label not found');
            }
        } else {
            console.error('Asset data container not found. Ensure assettab.js is loaded');
        }
    }

    function calculateBack() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const expenseContainer = originalQuerySelector('.data-container-expense');
        if (expenseContainer && expenseContainer.dataset.state === 'expanded') {
            const expenseClose = expenseContainer.querySelector('.close-data-container');
            if (expenseClose) {
                expenseClose.click();
                console.log('Expense tab closed');
            } else {
                console.error('Expense close button not found');
            }
        } else {
            console.log('Expense tab already closed or not found');
        }
        const incomeContainer = originalQuerySelector('.data-container-income');
        if (incomeContainer) {
            const incomeLabel = incomeContainer.querySelector('.data-label');
            if (incomeLabel) {
                setTimeout(() => {
                    incomeLabel.click();
                    console.log('Income tab triggered to open');
                }, 300);
            } else {
                console.error('Income data label not found');
            }
        } else {
            console.error('Income data container not found. Ensure incometab.js is loaded');
        }
    }

    function initializeExpenseForm(container) {
        if (expenseInitialized) {
            console.log('Expense form already initialized, skipping');
            return;
        }
        expenseInitialized = true;
        console.log('Expense form initialized');

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
                <span class="data-label">EXPENSE</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into expense container`);

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'expensetab.js', 'setlocal.js', 'getlocal.js'
                ].some(exclude => script.src.includes(exclude))) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src + '?v=' + new Date().getTime(); // Prevent caching
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

            initializeExpenseForm(dataContainer);
        } catch (error) {
            console.error(`Error loading stored content:`, error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-expense')) {
            console.log('Expense data container already exists, skipping initialization');
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-expense {
                position: fixed;
                top: calc(35% + 36px);
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
            .data-container-expense.collapsed {
                max-width: 36px; /* Doubled from 18px */
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            .data-container-expense.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-expense:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-expense .close-data-container {
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
            .data-container-expense .data-label {
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
            .data-container-expense.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-expense .data-content {
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
                .data-container-expense {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-expense.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-expense.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-expense .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-expense.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-expense .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-expense .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-expense collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">EXPENSE</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Expense data container injected with state: collapsed');

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Expense data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;
            const isExpanded = dataContainer.dataset.state === 'expanded';
            if (isExpanded) {
                dataContainer.className = 'data-container-expense collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `<span class="data-label">EXPENSE</span>`;
            } else {
                dataContainer.className = 'data-container-expense expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/expense.html');
            }
            const newLabel = dataContainer.querySelector('.data-label');
            const newClose = dataContainer.querySelector('.close-data-container');
            if (newLabel) newLabel.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
            if (newClose) newClose.addEventListener('click', function (e) { e.preventDefault(); toggleDataContainer(); });
        }

        document.addEventListener('click', function (e) {
            if (dataContainer && dataContainer.dataset.state === 'expanded') {
                const isClickInside = dataContainer.contains(e.target);
                const isNavButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isNavButton) {
                    console.log('Clicked outside expense data container, collapsing');
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing expense data container:', error);
    }
});