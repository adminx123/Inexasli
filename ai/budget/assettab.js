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

    // Asset logic
    console.log('Asset logic initialized in assettab.js at:', new Date().toISOString());
    let assetInitialized = false;
    let ASSETS = 0;
    let LIQUIDASSETS = 0;

    function calculateAssets() {
        const assetFields = [
            'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
            'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
            'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry'
        ];

        let assets = 0;

        for (let i = 0; i < assetFields.length; i++) {
            const field = assetFields[i];
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
                assets += (parsedValue * fieldPercentage / 100);
            }
        }

        ASSETS = assets;
        const assetsElement = document.getElementById('ASSETS');
        if (assetsElement) {
            assetsElement.textContent = `$${ASSETS.toFixed(2)}`;
        } else {
            console.error('ASSETS element not found');
        }
    }

    function calculateLiquidAssets() {
        const liquidAssetFields = [
            'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
            'assets_money_lent_out'
        ];

        let liquidAssets = 0;
        const isPartner = getLocal('assetspousecheckbox') === 'checked';

        for (let i = 0; i < liquidAssetFields.length; i++) {
            const field = liquidAssetFields[i];
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
                if (isNaN(fieldPercentage) || !isPartner) {
                    fieldPercentage = 100;
                }
                liquidAssets += (parsedValue * fieldPercentage / 100);
            }
        }

        LIQUIDASSETS = liquidAssets;
        const liquidAssetsElement = document.getElementById('LIQUIDASSETS');
        if (liquidAssetsElement) {
            liquidAssetsElement.textContent = `$${LIQUIDASSETS.toFixed(2)}`;
        } else {
            console.error('LIQUIDASSETS element not found');
        }
    }

    function calculateAll() {
        calculateAssets();
        calculateLiquidAssets();
        setLocal("ASSETS", ASSETS, 365);
        setLocal("LIQUIDASSETS", LIQUIDASSETS, 365);

        const fields = [
            'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
            'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
            'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
            'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
            'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
            'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                setLocal(field, element.value.trim() !== "" ? element.value : field.includes('_percent') ? "100" : "0", 365);
            }
        });
    }

    function calculateNext() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const assetContainer = originalQuerySelector('.data-container-asset');
        if (assetContainer && assetContainer.dataset.state === 'expanded') {
            const assetClose = assetContainer.querySelector('.close-data-container');
            if (assetClose) {
                assetClose.click();
                console.log('Asset tab closed at:', new Date().toISOString());
            } else {
                console.error('Asset close button not found');
            }
        } else {
            console.log('Asset tab already closed or not found');
        }
        const liabilityContainer = originalQuerySelector('.data-container-liability');
        if (liabilityContainer) {
            const liabilityLabel = liabilityContainer.querySelector('.data-label');
            if (liabilityLabel) {
                setTimeout(() => {
                    liabilityLabel.click();
                    console.log('Liability tab triggered to open at:', new Date().toISOString());
                }, 300);
            } else {
                console.error('Liability data label not found');
            }
        } else {
            console.error('Liability data container not found. Ensure liabilitytab.js is loaded');
        }
    }

    function calculateBack() {
        calculateAll();
        const originalQuerySelector = document.querySelector.bind(document);
        const assetContainer = originalQuerySelector('.data-container-asset');
        if (assetContainer && assetContainer.dataset.state === 'expanded') {
            const assetClose = assetContainer.querySelector('.close-data-container');
            if (assetClose) {
                assetClose.click();
                console.log('Asset tab closed at:', new Date().toISOString());
            } else {
                console.error('Asset close button not found');
            }
        } else {
            console.log('Asset tab already closed or not found');
        }
        const expenseContainer = originalQuerySelector('.data-container-expense');
        if (expenseContainer) {
            const expenseLabel = expenseContainer.querySelector('.data-label');
            if (expenseLabel) {
                setTimeout(() => {
                    expenseLabel.click();
                    console.log('Expense tab triggered to open at:', new Date().toISOString());
                }, 300);
            } else {
                console.error('Expense data label not found');
            }
        } else {
            console.error('Expense data container not found. Ensure expensetab.js is loaded');
        }
    }

    function initializeAssetForm(container) {
        if (assetInitialized) {
            console.log('Asset form already initialized, skipping at:', new Date().toISOString());
            return;
        }
        assetInitialized = true;
        console.log('Asset form initialized at:', new Date().toISOString());

        // Bind navigation buttons
        function bindNavButtons() {
            const nextButton = container.querySelector('.nav-btn.nav-right');
            const backButton = container.querySelector('.nav-btn.nav-left');
            let success = true;

            if (nextButton) {
                nextButton.removeAttribute('onclick');
                nextButton.removeEventListener('click', calculateNext);
                nextButton.addEventListener('click', calculateNext);
                console.log('calculateNext bound to nav-btn.nav-right at:', new Date().toISOString());
            } else {
                console.warn('nav-btn.nav-right not found at:', new Date().toISOString());
                success = false;
            }

            if (backButton) {
                backButton.removeAttribute('onclick');
                backButton.removeEventListener('click', calculateBack);
                backButton.addEventListener('click', calculateBack);
                console.log('calculateBack bound to nav-btn.nav-left at:', new Date().toISOString());
            } else {
                console.warn('nav-btn.nav-left not found at:', new Date().toISOString());
                success = false;
            }

            return success;
        }

        // Initial attempt to bind
        bindNavButtons();

        // Persistent observer for nav buttons
        const observer = new MutationObserver((mutations, obs) => {
            if ((container.querySelector('.nav-btn.nav-right') && !container.querySelector('.nav-btn.nav-right').onclick) ||
                (container.querySelector('.nav-btn.nav-left') && !container.querySelector('.nav-btn.nav-left').onclick)) {
                console.log('Nav button(s) detected by observer, binding at:', new Date().toISOString());
                if (bindNavButtons()) {
                    obs.disconnect();
                }
            }
        });
        observer.observe(container, { childList: true, subtree: true });

        // Fallback binding after delay
        setTimeout(() => {
            if (!container.querySelector('.nav-btn.nav-right')?.onclick || !container.querySelector('.nav-btn.nav-left')?.onclick) {
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
            'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
            'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
            'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
            'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
            'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
            'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent'
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
                    setLocal(elementId, element.value.trim() !== "" ? element.value : elementId.includes('_percent') ? "100" : "0", 365);
                    console.log(`Saved ${elementId}: ${element.value}`);
                    calculateAll();
                }
            } else {
                console.error(`Element #${elementId} not found`);
            }
        });

        const maritalStatus = getLocal('maritalStatus');
        const percentInputs = container.querySelectorAll('.percent-input');
        if (maritalStatus === 'married' || maritalStatus === 'common-law') {
            percentInputs.forEach(input => input.style.display = 'block');
            console.log('Showing percent inputs for maritalStatus:', maritalStatus);
        } else {
            percentInputs.forEach(input => input.style.display = 'none');
            console.log('Hiding percent inputs for maritalStatus:', maritalStatus);
        }

        const spouseCheckbox = container.querySelector('#assetspousecheckbox');
        if (spouseCheckbox) {
            const spouseValue = getLocal('assetspousecheckbox');
            spouseCheckbox.checked = spouseValue === 'checked';
            spouseCheckbox.removeEventListener('change', handleSpouseChange);
            spouseCheckbox.addEventListener('change', handleSpouseChange);
            function handleSpouseChange() {
                setLocal('assetspousecheckbox', this.checked ? 'checked' : 'unchecked', 365);
                percentInputs.forEach(input => {
                    input.style.display = this.checked ? 'block' : 'none';
                });
                console.log(`Asset spouse checkbox set to: ${this.checked ? 'checked' : 'unchecked'}`);
                calculateAll();
            }
        } else {
            console.error('assetspousecheckbox not found');
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
                <span class="data-label">ASSET</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded into asset container at:`, new Date().toISOString());

            const scripts = dataContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src && ![
                    'assettab.js', 'setlocal.js', 'getlocal.js'
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

            initializeAssetForm(dataContainer);
        } catch (error) {
            console.error(`Error loading stored content at:`, new Date().toISOString(), error);
        }
    }

    function initializeDataContainer() {
        if (document.querySelector('.data-container-asset')) {
            console.log('Asset data container already exists, skipping initialization at:', new Date().toISOString());
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .data-container-asset {
                position: fixed;
                top: calc(50% + 36px);
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
            .data-container-asset.collapsed {
                max-width: 72px; /* Double the current width */
                height: 120px; /* Maintain current height */
                margin-bottom: 15px; /* Add spacing between tabs */
                left: 0; /* Align to the left side of the screen */
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .data-container-asset.expanded {
                width: 90vw;
                max-width: calc(90vw - 20px);
                min-width: 25%;
                max-height: 95%;
                top: 20px;
                margin-right: calc(85vw - 20px);
            }
            .data-container-asset:hover {
                background-color: rgb(255, 255, 255);
            }
            .data-container-asset .close-data-container {
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
            .data-container-asset .data-label {
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
            .data-container-asset.expanded .data-label {
                writing-mode: horizontal-tb;
                position: absolute;
                top: 4px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 16px;
                padding: 5px;
            }
            .data-container-asset .data-content {
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
                .data-container-asset {
                    max-width: 28px;
                    padding: 3px;
                }
                .data-container-asset.collapsed {
                    width: 28px;
                    height: 100px;
                    z-index: 10001;
                }
                .data-container-asset.expanded {
                    width: 90vw;
                    max-width: calc(90vw - 10px);
                    max-height: 95%;
                    top: 10px;
                    margin-right: calc(85vw - 10px);
                }
                .data-container-asset .data-label {
                    font-size: 10px;
                    padding: 3px;
                }
                .data-container-asset.expanded .data-label {
                    font-size: 14px;
                    padding: 4px;
                }
                .data-container-asset .close-data-container {
                    font-size: 12px;
                    padding: 4px;
                }
                .data-container-asset .data-content {
                    font-size: 12px;
                    padding: 8px;
                    margin-top: 25px;
                }
            }
        `;
        document.head.appendChild(style);

        const dataContainer = document.createElement('div');
        dataContainer.className = `data-container-asset collapsed`;
        dataContainer.dataset.state = 'collapsed';
        dataContainer.innerHTML = `
            <span class="data-label">ASSET</span>
        `;

        document.body.appendChild(dataContainer);
        console.log('Asset data container injected with state: collapsed at:', new Date().toISOString());

        const dataLabel = dataContainer.querySelector('.data-label');

        if (dataLabel) {
            dataLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataContainer();
            });
        } else {
            console.error('Asset data label not found');
        }

        function toggleDataContainer() {
            if (!dataContainer) return;

            const isExpanded = dataContainer.dataset.state === 'expanded';

            if (isExpanded) {
                dataContainer.className = 'data-container-asset collapsed';
                dataContainer.dataset.state = 'collapsed';
                dataContainer.innerHTML = `
                    <span class="data-label">ASSET</span>
                `;
                assetInitialized = false;
                ASSETS = 0;
                LIQUIDASSETS = 0;
                console.log('Asset data container collapsed, state and globals reset at:', new Date().toISOString());
            } else {
                dataContainer.className = 'data-container-asset expanded';
                dataContainer.dataset.state = 'expanded';
                loadStoredContent(dataContainer, '/ai/budget/asset.html');
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
                const isNavButton = e.target.closest('.nav-btn');
                if (!isClickInside && !isNavButton) {
                    console.log('Clicked outside asset data container, collapsing at:', new Date().toISOString());
                    toggleDataContainer();
                }
            }
        });
    }

    try {
        initializeDataContainer();
    } catch (error) {
        console.error('Error initializing asset data container at:', new Date().toISOString(), error);
    }
});