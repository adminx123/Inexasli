/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */
/* income.js */
console.log('income.js loaded and executing');
/* Rest of the updated income.js code remains unchanged */
import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getlocal.js';
import { overwriteCookies } from '/utility/cookieoverwrite.js';

// Prevent duplicate initialization
if (!window.incomeInitialized) {
    window.incomeInitialized = true;

    function getTermsCookie(name) {
        const now = Date.now();
        const status = JSON.parse(window.localStorage.getItem(name));
        if (status && now > status.time) {
            localStorage.removeItem(name);
            return false;
        }
        return status ? status.accepted : false;
    }

    function setTermsCookie(name, value) {
        const date = new Date();
        window.localStorage.setItem(name, JSON.stringify({
            accepted: value,
            time: date.setTime(date.getTime() + 30 * 60 * 1000)
        }));
    }

    // Centralized initialization function for the income form
    window.initializeIncomeForm = function () {
        const tabs = document.querySelectorAll('.tab');
        const checkbox1 = document.getElementById('termscheckbox');
        const checkbox2 = document.getElementById('notintended');

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

        // Remove existing listeners to prevent duplicates
        if (checkbox1) {
            const newCheckbox1 = checkbox1.cloneNode(true);
            checkbox1.parentNode.replaceChild(newCheckbox1, checkbox1);
            newCheckbox1.addEventListener('click', handleCheckboxChange);
        }
        if (checkbox2) {
            const newCheckbox2 = checkbox2.cloneNode(true);
            checkbox2.parentNode.replaceChild(newCheckbox2, checkbox2);
            newCheckbox2.addEventListener('click', handleCheckboxChange);
        }

        tabs.forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            const dataL = newTab.getAttribute('data-location');
            const location = document.location.pathname;
            newTab.addEventListener('click', handleTabClick);
            if (location.includes(dataL)) {
                newTab.removeAttribute('href');
                newTab.classList.add('active');
            }
        });

        const isChecked1 = getTermsCookie('term1');
        const isChecked2 = getTermsCookie('term2');
        if (checkbox1) checkbox1.checked = isChecked1;
        if (checkbox2) checkbox2.checked = isChecked2;

        const formElements = [
            'income_salary_wages', 'income_tips', 'income_bonuses', 'income_sole_prop',
            'income_investment_property', 'income_capital_gains_losses', 'income_interest',
            'income_owner_dividend', 'income_public_dividend', 'income_trust', 'income_federal_pension',
            'income_work_pension', 'income_social_security', 'income_employment_insurance', 'income_alimony',
            'income_scholarships_grants', 'income_royalties', 'income_gambling_winnings', 'income_peer_to_peer_lending',
            'income_venture_capital', 'income_tax_free_income'
        ];
        formElements.forEach(function (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                const savedValue = getLocal(elementId);
                if (savedValue) element.value = savedValue;
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                newElement.addEventListener('input', () => {
                    setLocal(elementId, newElement.value.trim() !== "" ? newElement.value : "0", 365);
                });
            }
        });

        const overwriteLink = document.getElementById('cookie-overwrite-link');
        if (overwriteLink) {
            const newOverwriteLink = overwriteLink.cloneNode(true);
            overwriteLink.parentNode.replaceChild(newOverwriteLink, overwriteLink);
            newOverwriteLink.addEventListener('click', (e) => {
                e.preventDefault();
                overwriteCookies();
            });
        }

        const paid = getLocal("authenticated") == "paid";
        const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
        if (calculatedFromWorksheet == 'true' && paid) {
            const totalRevenue = getLocal("totalRevenue");
            const selfEmploymentIncomeField = document.getElementById("income_sole_prop");
            if (selfEmploymentIncomeField) {
                selfEmploymentIncomeField.value = totalRevenue;
                setLocal("income_sole_prop", totalRevenue, 365);
                setLocal('calculated_from_worksheet', 'resolved', 365);
                selfEmploymentIncomeField.placeholder = "";
            }
        } else if (calculatedFromWorksheet == 'true' && !paid) {
            const selfEmploymentIncomeField = document.getElementById("income_sole_prop");
            if (selfEmploymentIncomeField) {
                selfEmploymentIncomeField.placeholder = "payment required";
            }
        }

        // Initialize checkbox groups
        console.log('Total checkbox groups found:', document.querySelectorAll('.checkbox-button-group').length);
        document.querySelectorAll('.checkbox-button-group').forEach((group, index) => {
            try {
                console.log(`Processing group ${index + 1}: ${group.id || 'no-id'}`);
                const checkboxes = group.querySelectorAll('input[type="checkbox"]');
                if (!checkboxes.length) {
                    console.warn(`No checkboxes found in group ${group.id || 'no-id'}`);
                    return;
                }
                checkboxes.forEach(checkbox => {
                    const newCheckbox = checkbox.cloneNode(true);
                    checkbox.parentNode.replaceChild(newCheckbox, checkbox);
                    newCheckbox.addEventListener('change', function () {
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
                    });
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

        // Initialize tooltips
        const interactiveElements = document.querySelectorAll(
            ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
        );
        const tooltips = document.querySelectorAll(".checkboxrow .tooltip");
        tooltips.forEach((tooltip) => {
            const content = tooltip.querySelector(".tooltip-content");
            const message = tooltip.getAttribute("data-tooltip");
            if (content && message) content.textContent = message;
        });
        interactiveElements.forEach((element) => {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            newElement.addEventListener("click", (e) => {
                const row = newElement.closest(".checkboxrow");
                const tooltip = row.querySelector(".tooltip");
                const content = tooltip ? tooltip.querySelector(".tooltip-content") : null;
                document.querySelectorAll(".checkboxrow").forEach(r => {
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
            });
        });
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".checkboxrow")) {
                document.querySelectorAll(".checkboxrow").forEach(r => {
                    r.classList.remove("active");
                    const tooltip = r.querySelector(".tooltip");
                    if (tooltip) tooltip.classList.remove("show");
                });
            }
        });
    };

    var ANNUALEMPLOYMENTINCOME = 0;
    var ANNUALINCOME = 0;
    var PASSIVEINCOME = 0;

    window.validatecheckbox = function () {
        const termscheckbox = document.getElementById("termscheckbox");
        const notintended = document.getElementById("notintended");
        if (termscheckbox && notintended && termscheckbox.checked && notintended.checked) {
            calculateNext();
        } else {
            alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
        }
    };

    function calculateAnnual(inputId, frequencyGroupId) {
        let input = parseFloat(document.getElementById(inputId).value) || 0;
        if (inputId === 'income_sole_prop') {
            const calculatedFromWorksheet = getLocal("calculated_from_worksheet");
            if (calculatedFromWorksheet === true) {
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

    window.calculateNext = function () {
        calculateAll();

        // Use global DOM context to avoid potential overrides
        const originalQuerySelector = document.querySelector.bind(document);

        // Close the income tab
        const incomeContainer = originalQuerySelector('.data-container-income');
        if (incomeContainer && incomeContainer.dataset.state === 'expanded') {
            const incomeClose = incomeContainer.querySelector('.close-data-container');
            if (incomeClose) {
                incomeClose.click();
                console.log('Income tab closed (income.js)');
            } else {
                console.error('Income close button not found (income.js)');
            }
        } else {
            console.log('Income tab already closed or not found (income.js)');
        }

        // Open the expense tab
        const expenseContainer = originalQuerySelector('.data-container-expense');
        if (expenseContainer) {
            const expenseLabel = expenseContainer.querySelector('.data-label');
            if (expenseLabel) {
                setTimeout(() => {
                    expenseLabel.click();
                    console.log('Expense tab triggered to open (income.js)');
                }, 300);
            } else {
                console.error('Expense data label not found (income.js)');
            }
        } else {
            console.error('Expense data container not found. Ensure budget.expense.js is loaded (income.js)');
            // Fallback: Dynamically load budget.expense.js
            const expenseScript = document.createElement('script');
            expenseScript.src = '/ai/budget/budget.expense.js';
            expenseScript.type = 'module';
            expenseScript.onload = () => {
                setTimeout(() => {
                    const newExpenseContainer = originalQuerySelector('.data-container-expense');
                    if (newExpenseContainer) {
                        const expenseLabel = newExpenseContainer.querySelector('.data-label');
                        if (expenseLabel) {
                            expenseLabel.click();
                            console.log('Expense tab triggered after dynamic load (income.js)');
                        } else {
                            console.error('Expense data label not found after dynamic load (income.js)');
                        }
                    } else {
                        console.error('Expense data container still not found after dynamic load (income.js)');
                    }
                }, 500);
            };
            expenseScript.onerror = () => console.error('Failed to load budget.expense.js (income.js)');
            document.body.appendChild(expenseScript);
        }
    };

    window.calculateAll = function () {
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
    };

    // Run initialization on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeIncomeForm();
    });
}