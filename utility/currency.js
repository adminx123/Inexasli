// INEXASLI Currency Utility
// Handles multi-currency pricing across the sales flow

// Inject currency selector CSS
function injectCurrencyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .currency-selector-container {
      margin-bottom: 20px;
      padding: 0 20px;
      margin-top: 30px;
    }
    
    .currency-selector {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 4px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 28px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      position: relative;
    }
    
    .currency-label {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      flex-shrink: 0;
      margin-right: 15px;
      line-height: 1;
    }
    
    .currency-display {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      flex-grow: 1;
      text-align: right;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    
    .currency-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid rgba(200, 200, 200, 0.3);
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      display: none;
    }
    
    .currency-option {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      cursor: pointer;
      border-bottom: 1px solid rgba(200, 200, 200, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .currency-option:last-child {
      border-bottom: none;
    }
    
    .currency-option:hover {
      background: rgba(240, 240, 240, 0.8);
    }
    
    .currency-selector.active .currency-dropdown {
      display: block;
    }
  `;
  document.head.appendChild(style);
}

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
  },
  
  names: {
    CAD: 'Canadian Dollar',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AUD: 'Australian Dollar'
  },

  // Base prices in CAD
  packages: {
    starter: {
      setup: 397,
      monthly: 127
    },
    professional: {
      setup: 597,
      monthly: 197
    },
    enterprise: {
      setup: 897,
      monthly: 297
    }
  },

  addons: {
    extraPhotos10: 47,
    extraPhotos25: 97,
    extraVideos5: 67,
    extraVideos10: 127,
    expressSetup: 197,
    premiumSupport: 97
  }
};

// Currency conversion functions
function convertPrice(cadAmount, targetCurrency) {
  const rate = CURRENCY_CONFIG.exchangeRates[targetCurrency] || 1.0;
  return Math.round(cadAmount * rate);
}

function formatCurrency(amount, currency) {
  const symbol = CURRENCY_CONFIG.symbols[currency] || '$';
  return `${symbol}${amount}`;
}

function formatPrice(cadAmount, currency) {
  const convertedAmount = convertPrice(cadAmount, currency);
  return formatCurrency(convertedAmount, currency);
}

// Local storage functions
function saveCurrencyPreference(currency) {
  localStorage.setItem('inexasli_currency', currency);
  sessionStorage.setItem('inexasli_currency', currency);
}

function loadCurrencyPreference() {
  return localStorage.getItem('inexasli_currency') || 
         sessionStorage.getItem('inexasli_currency') || 
         'CAD'; // Default to CAD
}

// Get package pricing in specified currency
function getPackagePrice(packageName, currency = 'CAD') {
  const pkg = CURRENCY_CONFIG.packages[packageName];
  if (!pkg) return null;
  
  return {
    setup: convertPrice(pkg.setup, currency),
    monthly: convertPrice(pkg.monthly, currency),
    setupFormatted: formatPrice(pkg.setup, currency),
    monthlyFormatted: formatPrice(pkg.monthly, currency),
    currency: currency,
    symbol: CURRENCY_CONFIG.symbols[currency]
  };
}

// Get addon pricing in specified currency
function getAddonPrice(addonName, currency = 'CAD') {
  const price = CURRENCY_CONFIG.addons[addonName];
  if (!price) return null;
  
  return {
    amount: convertPrice(price, currency),
    formatted: formatPrice(price, currency),
    currency: currency,
    symbol: CURRENCY_CONFIG.symbols[currency]
  };
}

// Update all pricing elements on page
function updatePagePricing(currency) {
  // Update package prices
  document.querySelectorAll('[data-package-price]').forEach(element => {
    const packageName = element.dataset.packagePrice;
    const priceType = element.dataset.priceType || 'setup'; // 'setup' or 'monthly'
    const packagePrice = getPackagePrice(packageName, currency);
    
    if (packagePrice) {
      element.textContent = priceType === 'monthly' ? 
        packagePrice.monthlyFormatted : 
        packagePrice.setupFormatted;
    }
  });

  // Update addon prices
  document.querySelectorAll('[data-addon-price]').forEach(element => {
    const addonName = element.dataset.addonPrice;
    const addonPrice = getAddonPrice(addonName, currency);
    
    if (addonPrice) {
      element.textContent = addonPrice.formatted;
    }
  });

  // Update currency symbols
  document.querySelectorAll('[data-currency-symbol]').forEach(element => {
    element.textContent = CURRENCY_CONFIG.symbols[currency];
  });

  // Trigger custom event for other components
  window.dispatchEvent(new CustomEvent('currencyChanged', {
    detail: { currency: currency }
  }));
}

// Initialize currency selector
function initializeCurrencySelector() {
  // Inject styles first
  injectCurrencyStyles();
  
  const container = document.querySelector('.currency-selector-container');
  if (!container) return;
  
  // Create custom dropdown structure
  const currencies = [
    { code: 'CAD', symbol: '$', name: '🇨🇦 CAD ($)' },
    { code: 'USD', symbol: '$', name: '🇺🇸 USD ($)' },
    { code: 'EUR', symbol: '€', name: '🇪🇺 EUR (€)' },
    { code: 'GBP', symbol: '£', name: '🇬🇧 GBP (£)' },
    { code: 'AUD', symbol: '$', name: '🇦🇺 AUD ($)' }
  ];
  
  const savedCurrency = loadCurrencyPreference();
  const currentCurrency = currencies.find(c => c.code === savedCurrency) || currencies[0];
  
  container.innerHTML = `
    <div class="currency-selector" id="currencySelector">
      <span class="currency-label">Your Currency:</span>
      <div class="currency-display" id="currencyDisplay">
        ${currentCurrency.name}
      </div>
      <div class="currency-dropdown" id="currencyDropdown">
        ${currencies.map(currency => `
          <div class="currency-option" data-currency="${currency.code}" data-symbol="${currency.symbol}">
            <span>${currency.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add event listeners
  const selector = document.getElementById('currencySelector');
  const dropdown = document.getElementById('currencyDropdown');
  const display = document.getElementById('currencyDisplay');
  
  // Toggle dropdown
  selector.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function() {
    selector.classList.remove('active');
  });
  
  // Handle option selection
  dropdown.addEventListener('click', function(e) {
    e.stopPropagation();
    const option = e.target.closest('.currency-option');
    if (!option) return;
    
    const currencyCode = option.dataset.currency;
    const currencySymbol = option.dataset.symbol;
    const currencyName = option.textContent.trim();
    
    // Update display
    display.textContent = currencyName;
    
    // Save preference
    saveCurrencyPreference(currencyCode);
    
    // Update pricing
    updatePagePricing(currencyCode);
    
    // Close dropdown
    selector.classList.remove('active');
  });
  
  // Update pricing immediately
  updatePagePricing(savedCurrency);
}

// Auto-detect user's likely currency based on timezone (optional)
function detectUserCurrency() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('America/Toronto') || 
        timezone.includes('America/Vancouver') || 
        timezone.includes('America/Montreal')) {
      return 'CAD';
    } else if (timezone.includes('America/New_York') || 
               timezone.includes('America/Los_Angeles') || 
               timezone.includes('America/Chicago')) {
      return 'USD';
    } else if (timezone.includes('Europe/London')) {
      return 'GBP';
    } else if (timezone.includes('Europe/')) {
      return 'EUR';
    } else if (timezone.includes('Australia/')) {
      return 'AUD';
    }
  } catch (e) {
    console.log('Could not detect timezone for currency');
  }
  
  return 'CAD'; // Default
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CURRENCY_CONFIG,
    convertPrice,
    formatCurrency,
    formatPrice,
    saveCurrencyPreference,
    loadCurrencyPreference,
    getPackagePrice,
    getAddonPrice,
    updatePagePricing,
    initializeCurrencySelector,
    detectUserCurrency
  };
}
