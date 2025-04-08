/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */
import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getLocal.js';

// Define expenseCategories and totalOnlyCategories FIRST
const expenseCategories = [
    'flights', 'car', 'uber', 'transit', 'bike',
    'hotels', 'camping',
    'dining', 'grocery',
    'tickets', 'alcohol', 'gambling', 'rental',
    'insurance', 'sim', 'luggage'
];

const totalOnlyCategories = ['flights', 'tickets', 'insurance', 'sim', 'luggage'];

function getTermsCookie(name) {
    const now = Date.now();
    const status = JSON.parse(window.localStorage.getItem(name));

    if (status && now > status.time) {
        localStorage.removeItem(name);
        return false;
    }

    if (status && status.accepted) {
        return true;
    } else if (status && !status.accepted) {
        return false;
    }

    return false;
}

function setTermsCookie(name, value) {
    const date = new Date();
    window.localStorage.setItem(name, JSON.stringify({
        accepted: value,
        time: date.setTime(date.getTime() + 30 * 60 * 1000)
    }));
}

window.loadLocalStorage = function() {
    console.log('Starting loadLocalStorage...');
    formElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const storedValue = getLocal(id); // Retrieve value from localStorage
            if (element.tagName === 'SELECT') {
                // Handle <select> elements
                element.value = storedValue || element.options[0].value; // Default to the first <option>
                if (!Array.from(element.options).some(option => option.value === element.value)) {
                    element.value = element.options[0].value; // Ensure valid value
                }
                console.log(`Set <select> ${id} to ${element.value}`);
            } else if (expenseCategories.includes(id.replace('trip_', '').replace('_frequency', ''))) {
                // Handle <input> elements for expense inputs
                element.value = storedValue || ''; // Leave blank if no value
                console.log(`Set <input> ${id} to ${element.value}`);
            } else {
                // Handle other <input> elements
                element.value = storedValue || '';
                console.log(`Set other <input> ${id} to ${element.value}`);
            }

            // Update frequency totals if applicable
            const category = id.replace('trip_', '').replace('_frequency', '');
            if (expenseCategories.includes(category) && !id.endsWith('_frequency')) {
                updateFrequency(category);
            }
        } else {
            console.warn(`Element with ID '${id}' not found in the DOM`);
        }
    });
    console.log('LocalStorage values loaded into form elements');
};

const tabs = document.querySelectorAll('.tab');

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location');
    const location = document.location.pathname;

    tab.addEventListener('click', (e) => {
        const isChecked1 = getTermsCookie('term1');
        const isChecked2 = getTermsCookie('term2');

        if (!isChecked1 || !isChecked2) {
            e.preventDefault();
            alert("Please agree to the terms of service & acknowledge that all amounts entered are pre-tax & contributions");
        }
        loadLocalStorage(); // Optional: Keep this if you want tab clicks to reload cookies
    });

    if (location.includes(dataL)) {
        tab.removeAttribute('href');
        tab.classList.add('active');
    }
});

const checkbox1 = document.querySelector('#termscheckbox');
const checkbox2 = document.querySelector('#notintended');

checkbox1.addEventListener('click', () => {
    setTermsCookie('term1', checkbox1.checked);
});

checkbox2.addEventListener('click', () => {
    setTermsCookie('term2', checkbox2.checked);
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    const frequencyDropdowns = document.querySelectorAll('select[id$="_frequency"]');
    frequencyDropdowns.forEach(dropdown => {
        const cookieValue = getLocal(dropdown.id);
        dropdown.value = cookieValue || 'total'; // Default to "total" if no valid cookie exists
        console.log(`Set ${dropdown.id} to ${dropdown.value}`);
    });

    setTimeout(() => {
        loadLocalStorage(); // Ensure cookies are loaded after DOM is ready
    }, 100); // Slight delay to ensure DOM readiness
});

window.updateFrequency = function(category) {
    const amountInput = document.getElementById(`trip_${category}`);
    const frequencySelect = document.getElementById(`trip_${category}_frequency`);
    const totalSpan = document.getElementById(`trip_${category}_total`);
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;

    if (!amountInput || !amountInput.value || (tripDuration <= 0 && !totalOnlyCategories.includes(category) && frequencySelect.value !== 'total')) {
        if (totalSpan) totalSpan.textContent = '';
        return;
    }

    const amount = parseFloat(amountInput.value) || 0;
    const frequency = frequencySelect.value;
    let total = 0;

    if (totalOnlyCategories.includes(category)) {
        total = amount;
    } else {
        switch (frequency) {
            case 'total':
                total = amount;
                break;
            case 'daily':
                total = amount * tripDuration;
                break;
            case 'weekly':
                const fullWeeks = Math.floor(tripDuration / 7);
                const remainingDays = tripDuration % 7;
                const dailyRate = amount / 7;
                total = (fullWeeks * amount) + (remainingDays * dailyRate);
                break;
        }
    }

    if (totalSpan) totalSpan.textContent = `$${total.toFixed(2)}`;
};

window.termsAgreed = function() {
    const termsCheckbox = document.querySelector('#termscheckbox');
    const cookieCheckbox = document.querySelector('#notintended');

    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms of Service before calculating the total.');
        return;
    }
    if (!cookieCheckbox.checked) {
        alert('Please consent to cookie usage before calculating the total.');
        return;
    }

    function calculateTotal() {
        const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
        if (tripDuration <= 0 && expenseCategories.some(cat => !totalOnlyCategories.includes(cat) && document.getElementById(`trip_${cat}`).value && document.getElementById(`trip_${cat}_frequency`).value !== 'total')) {
            alert('Please enter a valid trip duration for expenses with daily or weekly frequencies.');
            return;
        }

        let grandTotal = 0;
        const expenseList = document.getElementById('expense_list');
        expenseList.innerHTML = ''; // Clear previous list

        expenseCategories.forEach(category => {
            const amountInput = document.getElementById(`trip_${category}`);
            const frequencySelect = document.getElementById(`trip_${category}_frequency`);
            const totalSpan = document.getElementById(`trip_${category}_total`);

            const amount = parseFloat(amountInput.value) || 0;
            const frequency = frequencySelect.value;
            let total = 0;

            if (totalOnlyCategories.includes(category)) {
                total = amount;
            } else {
                switch (frequency) {
                    case 'total':
                        total = amount;
                        break;
                    case 'daily':
                        total = amount * tripDuration;
                        break;
                    case 'weekly':
                        const fullWeeks = Math.floor(tripDuration / 7);
                        const remainingDays = tripDuration % 7;
                        const dailyRate = amount / 7;
                        total = (fullWeeks * amount) + (remainingDays * dailyRate);
                        break;
                }
            }

            if (total > 0) {
                grandTotal += total;
                totalSpan.textContent = `$${total.toFixed(2)}`;
                const li = document.createElement('li');
                li.textContent = `${category.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}: $${total.toFixed(2)}`; // Removed (${frequency})
                expenseList.appendChild(li);
            } else {
                totalSpan.textContent = '';
            }
        });

        // Add the total of all expenses to the breakdown
        const totalLi = document.createElement('li');
        totalLi.textContent = `Total Expenses: $${grandTotal.toFixed(2)}`;
        totalLi.style.fontWeight = 'bold'; // Optional: make it stand out
        expenseList.appendChild(totalLi);

        const totalCostDisplay = document.getElementById('total_cost_display');
        totalCostDisplay.textContent = `$${grandTotal.toFixed(2)}`;
        document.getElementById('totalCost').classList.remove('hidden');
        document.getElementById('expenseBreakdown').classList.remove('hidden');
    }

    calculateTotal();
};

window.copyResults = function() {
    const termsCheckbox = document.querySelector('#termscheckbox');
    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms of Service before copying results.');
        return;
    }

    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    const totalCost = document.getElementById('total_cost_display').textContent;
    const expenseItems = Array.from(document.getElementById('expense_list').getElementsByTagName('li'))
        .map(li => li.textContent);

    const textToCopy = `Vacation Cost Estimate\nTrip Duration: ${tripDuration} days\nTotal Estimated Cost: ${totalCost}\n\nExpense Breakdown:\n${expenseItems.join('\n')}`;

    navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Results copied to clipboard!'))
        .catch(err => alert('Failed to copy results: ' + err));
};

// Add event listeners to update totals on input change
expenseCategories.forEach(category => {
    const inputElement = document.getElementById(`trip_${category}`);
    if (inputElement) {
        inputElement.addEventListener('input', () => updateFrequency(category));
    } else {
        console.error(`Input element not found for category: ${category}`);
    }
});

const tripDurationInput = document.getElementById('trip_duration');
if (tripDurationInput) {
    tripDurationInput.addEventListener('input', () => {
        expenseCategories.forEach(category => updateFrequency(category));
    });
} else {
    console.error('Trip duration input not found');
}

const formElementIds = [
    'trip_duration', 'trip_flights', 'trip_car', 'trip_uber', 'trip_transit', 'trip_bike',
    'trip_hotels', 'trip_camping', 'trip_dining', 'trip_grocery', 'trip_tickets',
    'trip_alcohol', 'trip_gambling', 'trip_rental', 'trip_insurance', 'trip_sim', 'trip_luggage',
    'trip_flights_frequency', 'trip_car_frequency', 'trip_uber_frequency', 'trip_transit_frequency',
    'trip_bike_frequency', 'trip_hotels_frequency', 'trip_camping_frequency', 'trip_dining_frequency',
    'trip_grocery_frequency', 'trip_tickets_frequency', 'trip_alcohol_frequency', 'trip_gambling_frequency',
    'trip_rental_frequency', 'trip_insurance_frequency', 'trip_sim_frequency', 'trip_luggage_frequency'
];

window.createCookies = function() {
    console.log('Saving cookies...');
    formElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.value || '0';
            setLocal(id, value, 365);
            console.log(`Saved ${id}: ${value}`);
        } else {
            console.warn(`Element with ID '${id}' not found in the DOM`);
        }
    });
    console.log('Cookies created for all form elements');
};

// Function to overwrite cookies and clear input fields for Vacation Worksheet
window.overwriteCookies1 = function() {
    console.log('Overwriting cookies...');
    const formElements = [
        'trip_duration',
        'trip_flights', 'trip_car', 'trip_uber', 'trip_transit', 'trip_bike',
        'trip_hotels', 'trip_camping', 'trip_dining', 'trip_grocery', 'trip_tickets',
        'trip_alcohol', 'trip_gambling', 'trip_rental', 'trip_insurance', 'trip_sim', 'trip_luggage',
        'trip_flights_frequency', 'trip_car_frequency', 'trip_uber_frequency', 'trip_transit_frequency',
        'trip_bike_frequency', 'trip_hotels_frequency', 'trip_camping_frequency', 'trip_dining_frequency',
        'trip_grocery_frequency', 'trip_tickets_frequency', 'trip_alcohol_frequency', 'trip_gambling_frequency',
        'trip_rental_frequency', 'trip_insurance_frequency', 'trip_sim_frequency', 'trip_luggage_frequency'
    ];

    const value = ''; // Default value to clear cookies

    // First, overwrite all cookies regardless of whether elements exist
    formElements.forEach(function (cookieName) {
        setLocal(cookieName, value, 365); // Set all cookies with a 1-year expiry
        console.log(`Cleared cookie for ${cookieName}`);
    });

    // Then, only clear input fields that exist on the current page
    formElements.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value; // Only clear the input/select if it exists on current page
            // Reset frequency dropdowns to "total"
            if (elementId.endsWith('_frequency')) {
                element.value = 'total';
            }
        }
    });

    console.log("All Vacation Worksheet cookies have been overwritten and existing input fields cleared.");
};

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadLocalStorage(); // Ensure cookies are loaded after DOM is ready
    }, 100); // Slight delay to ensure DOM readiness
});