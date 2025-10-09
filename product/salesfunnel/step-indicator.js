// Step Indicator Component - Self-contained module
// Includes HTML, CSS, and JS for the sales funnel step navigation

(function() {
    'use strict';

    // Configuration
    const stepPages = {
        1: 'packages.html',
        2: 'customization.html',
        3: 'quote.html',
        4: 'oauth-connect.html'
    };

    const stepTitles = {
        1: 'Choose Package',
        2: 'Customize Automation',
        3: 'Review & Pay',
        4: 'Connect Socials'
    };

    // HTML Template
    const stepIndicatorHTML = `
        <div class="step-indicator">
            <div class="step currency-step" id="currencyStep">
                <div class="currency-display" id="currencyDisplay">🇨🇦 CAD ($)</div>
                <div class="currency-dropdown" id="currencyDropdown">
                    <div class="currency-option" data-currency="CAD" data-symbol="$">🇨🇦 CAD ($)</div>
                    <div class="currency-option" data-currency="USD" data-symbol="$">🇺🇸 USD ($)</div>
                    <div class="currency-option" data-currency="EUR" data-symbol="€">🇪🇺 EUR (€)</div>
                    <div class="currency-option" data-currency="GBP" data-symbol="£">🇬🇧 GBP (£)</div>
                    <div class="currency-option" data-currency="AUD" data-symbol="$">🇦🇺 AUD ($)</div>
                </div>
            </div>
            <a href="packages.html" class="step" data-step="1">
                <div class="step-number">1</div>
                <span>Packages</span>
            </a>
            <a href="customization.html" class="step" data-step="2">
                <div class="step-number">2</div>
                <span>Customize</span>
            </a>
            <a href="quote.html" class="step" data-step="3">
                <div class="step-number">3</div>
                <span>Review & Pay</span>
            </a>
            <a href="oauth-connect.html" class="step" data-step="4">
                <div class="step-number">4</div>
                <span>Connect</span>
            </a>
        </div>
    `;

    // CSS Styles
    const stepIndicatorCSS = `
        .step-indicator {
            display: flex;
            justify-content: center;
            margin: 10px 0 20px 0;
            gap: 6px;
            flex-wrap: wrap;
            padding: 0 5px;
            max-width: 100%;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 1px 2px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 12px;
            color: #ccc;
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            white-space: nowrap;
            min-width: 0;
            flex-shrink: 0;
            text-decoration: none;
        }

        .step:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.4);
            transform: translateY(-2px);
        }

        .step.active {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-color: #10b981;
        }

        .step.active:hover {
            background: linear-gradient(135deg, #059669, #047857);
            transform: translateY(-2px);
        }

        .step.completed {
            background: rgba(16, 185, 129, 0.3);
            color: #10b981;
            border-color: #10b981;
        }

        .step.completed:hover {
            background: rgba(16, 185, 129, 0.5);
            transform: translateY(-2px);
        }

        .step.disabled {
            background: rgba(255,255,255,0.05);
            color: #ccc;
            cursor: not-allowed;
            border-color: rgba(255,255,255,0.1);
        }

        .step.disabled:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(0);
        }

        .step-number {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 9px;
            flex-shrink: 0;
        }

        .step.completed .step-number {
            background: #28a745;
            color: white;
        }

        .step.active .step-number {
            background: rgba(255,255,255,0.3);
            color: white;
        }

        .step.disabled .step-number {
            background: rgba(255,255,255,0.1);
        }

        .currency-step {
            display: flex;
            align-items: center;
            padding: 1px 2px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 12px;
            color: #ccc;
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            white-space: nowrap;
            position: relative;
        }

        .currency-step:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.4);
            transform: translateY(-2px);
        }

        .currency-display {
            padding: 0 2px;
        }

        .currency-dropdown {
            position: fixed;
            background: #f0f0f0;
            border: 1px solid rgba(200, 200, 200, 0.3);
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            min-width: 120px;
            padding: 0;
            margin: 0;
        }
        .currency-dropdown li {
            background: white;
            list-style: none;
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #e0e0e0;
        }
        .currency-dropdown li:last-child {
            border-bottom: none;
        }
        .currency-dropdown li:hover {
            background: #e0e0e0;
        }

        .currency-option {
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            cursor: pointer;
            border-bottom: 1px solid rgba(200, 200, 200, 0.1);
        }

        .currency-option:last-child {
            border-bottom: none;
        }

        .currency-option:hover {
            background: rgba(240, 240, 240, 0.8);
        }

        .currency-step.active .currency-dropdown {
            display: block;
        }
    `;

    const CURRENCY_CONFIG = {
        exchangeRates: {
            CAD: 1.0,     // Base currency (Canadian Dollars)
            USD: 0.74,    // 1 CAD = 0.74 USD
            EUR: 0.68,    // 1 CAD = 0.68 EUR
            GBP: 0.58,    // 1 CAD = 0.58 GBP
            AUD: 1.12     // 1 CAD = 1.12 AUD
        },
        symbols: {
            CAD: '$',
            USD: '$',
            EUR: '€',
            GBP: '£',
            AUD: '$'
        }
    };

    function saveCurrencyPreference(currency) {
        localStorage.setItem('selectedCurrency', currency);
    }

    function loadCurrencyPreference() {
        return localStorage.getItem('selectedCurrency') || 'CAD';
    }

    function updatePagePricing(currency) {
        // Update package prices
        const priceElements = document.querySelectorAll('[id$="-price"]');
        priceElements.forEach(element => {
            const packageName = element.id.replace('-price', '');
            const price = getPackagePrice(packageName, currency);
            element.textContent = price;
        });
        
        // Update addon prices if any
        const addonPrices = document.querySelectorAll('.addon-price');
        addonPrices.forEach(element => {
            const addonName = element.dataset.addon;
            const price = getAddonPrice(addonName, currency);
            element.textContent = price;
        });
    }

    function getPackagePrice(packageName, currency = 'CAD') {
        const basePrices = {
            basic: 99,
            social: 149,
            pro: 299,
            enterprise: 499
        };
        
        const cadAmount = basePrices[packageName];
        return formatPrice(cadAmount, currency);
    }

    function getAddonPrice(addonName, currency = 'CAD') {
        const basePrices = {
            instagram: 15,
            twitter: 15,
            linkedin: 20,
            facebook: 15
        };
        
        const cadAmount = basePrices[addonName];
        return formatPrice(cadAmount, currency);
    }

    function formatPrice(cadAmount, currency) {
        const rate = CURRENCY_CONFIG.exchangeRates[currency];
        const symbol = CURRENCY_CONFIG.symbols[currency];
        const convertedAmount = cadAmount * rate;
        return `${symbol}${convertedAmount.toFixed(0)}`;
    }

    // Main initialization function
    function initStepIndicator() {
        // Inject CSS
        injectCSS();

        // Inject HTML
        injectHTML();

        // Initialize functionality
        setupStepNavigation();
    }

    // Inject CSS into head
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = stepIndicatorCSS;
        document.head.appendChild(style);
    }

    // Inject HTML into placeholder
    function injectHTML() {
        const placeholder = document.querySelector('.step-indicator-placeholder');
        if (placeholder) {
            placeholder.innerHTML = stepIndicatorHTML;
        }
    }

    // Setup navigation functionality
    function setupStepNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        let currentStep = 1;

        // Determine current step
        Object.entries(stepPages).forEach(([step, page]) => {
            if (currentPage === page) {
                currentStep = parseInt(step);
            }
        });

        // Update step states
        updateStepStates(currentStep);

        // Add click handlers
        const steps = document.querySelectorAll('.step[data-step]');
        steps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);

            // Determine if step is navigable
            const isCompleted = step.classList.contains('completed');
            const isActive = step.classList.contains('active');
            const isPrevious = stepNumber < currentStep;
            const isNavigable = isCompleted || isActive || isPrevious;

            if (isNavigable) {
                step.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Add confirmation for going backwards
                    if (stepNumber < currentStep && !this.classList.contains('completed')) {
                        if (confirm('This will take you back to a previous step. Any unsaved progress may be lost. Continue?')) {
                            navigateToStep(stepNumber);
                        }
                    } else {
                        navigateToStep(stepNumber);
                    }
                });
            } else {
                step.classList.add('disabled');
                step.addEventListener('click', function(e) {
                    e.preventDefault();
                    showMessage('Complete previous steps first');
                });
            }
        });

        // Setup currency selector for packages page
        if (currentPage === 'packages.html') {
            console.log('Setting up currency selector for packages page');
            const currencyStep = document.getElementById('currencyStep');
            const currencyDropdown = document.getElementById('currencyDropdown');
            const currencyDisplay = document.getElementById('currencyDisplay');

            if (currencyStep && currencyDropdown && currencyDisplay) {
                console.log('Currency elements found');
                // Load saved currency
                const savedCurrency = loadCurrencyPreference();
                const currencies = [
                    { code: 'CAD', name: '🇨🇦 CAD ($)' },
                    { code: 'USD', name: '🇺🇸 USD ($)' },
                    { code: 'EUR', name: '🇪🇺 EUR (€)' },
                    { code: 'GBP', name: '🇬🇧 GBP (£)' },
                    { code: 'AUD', name: '🇦🇺 AUD ($)' }
                ];
                const current = currencies.find(c => c.code === savedCurrency) || currencies[0];
                currencyDisplay.textContent = current.name;
                console.log('Currency display set to:', current.name);

                // Toggle dropdown
        currencyStep.addEventListener('click', function(event) {
            event.stopPropagation();
            const dropdown = document.querySelector('.currency-dropdown');
            if (currencyStep.classList.contains('active')) {
                currencyStep.classList.remove('active');
            } else {
                const rect = currencyStep.getBoundingClientRect();
                dropdown.style.top = rect.bottom + 'px';
                dropdown.style.left = rect.left + 'px';
                currencyStep.classList.add('active');
            }
        });                // Close on outside click
                document.addEventListener('click', function() {
                    currencyStep.classList.remove('active');
                });

                // Handle selection
                currencyDropdown.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const option = e.target.closest('.currency-option');
                    if (option) {
                        const currency = option.dataset.currency;
                        const name = option.textContent;
                        currencyDisplay.textContent = name;
                        saveCurrencyPreference(currency);
                        updatePagePricing(currency);
                        currencyStep.classList.remove('active');
                    }
                });
            } else {
                console.log('Currency elements not found:', { currencyStep, currencyDropdown, currencyDisplay });
            }
        }
    }

    // Update visual states of steps
    function updateStepStates(currentStep) {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);

            // Remove existing classes
            step.classList.remove('completed', 'active', 'disabled');

            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }

    // Navigation function
    function navigateToStep(stepNumber) {
        const targetPage = stepPages[stepNumber];
        if (targetPage) {
            document.body.style.opacity = '0.8';
            document.body.style.transition = 'opacity 0.2s ease';

            setTimeout(() => {
                window.location.href = targetPage;
            }, 100);
        }
    }

    // Show message function
    function showMessage(message) {
        // Remove existing messages
        const existing = document.querySelector('.step-navigation-message');
        if (existing) existing.remove();

        // Create message
        const msgDiv = document.createElement('div');
        msgDiv.className = 'step-navigation-message';
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(220, 38, 38, 0.3);
            animation: slideInDown 0.3s ease-out;
        `;

        // Add animation
        const animStyle = document.createElement('style');
        animStyle.textContent = `
            @keyframes slideInDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-100%); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(animStyle);

        document.body.appendChild(msgDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.remove();
            }
        }, 3000);
    }

    // Get step title (for tooltips)
    function getStepTitle(stepNumber) {
        return stepTitles[stepNumber] || `Step ${stepNumber}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStepIndicator);
    } else {
        initStepIndicator();
    }

    // Expose functions globally if needed
    window.StepIndicator = {
        navigateToStep: navigateToStep,
        updateStepStates: updateStepStates
    };

})();