// INEXASLI Currency Utility
// Handles multi-currency pricing across the sales flow

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
    premium: {
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
  const currencySelect = document.getElementById('currencySelect');
  if (!currencySelect) return;
  
  const savedCurrency = loadCurrencyPreference();
  currencySelect.value = savedCurrency;
  
  // Update pricing immediately
  updatePagePricing(savedCurrency);
  
  // Listen for changes
  currencySelect.addEventListener('change', function() {
    const selectedCurrency = this.value;
    saveCurrencyPreference(selectedCurrency);
    updatePagePricing(selectedCurrency);
  });
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
