/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 


import { setCookie } from '/server/scripts/setcookie.js'; // Adjust path as needed
import { getCookie } from '/server/scripts/getcookie.js'; // Adjust path as needed



window.updateFrequency = function(category) {
    const amountInput = document.getElementById(`expenses_${category}`);
    const frequencySelect = document.getElementById(`expenses_${category}_frequency`);
    const totalSpan = document.getElementById(`expenses_${category}_total`);
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


// Array of expense categories and their IDs
const expenseCategories = [
    'flights', 'car', 'uber', 'transit', 'bike',
    'hotels', 'camping',
    'dining', 'grocery',
    'tickets', 'alcohol', 'gambling', 'rental',
    'insurance', 'sim', 'luggage_fees'
];

// Categories that should only have "Total" frequency
const totalOnlyCategories = ['flights', 'tickets', 'insurance', 'sim', 'luggage_fees'];



// Calculate total vacation cost and populate breakdown
window.calculateTotal = function() {
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    if (tripDuration <= 0 && expenseCategories.some(cat => !totalOnlyCategories.includes(cat) && document.getElementById(`expenses_${cat}`).value && document.getElementById(`expenses_${cat}_frequency`).value !== 'total')) {
        alert('Please enter a valid trip duration for expenses with daily or weekly frequencies.');
        return;
    }
    // Rest of your calculateTotal function remains unchanged...
    let grandTotal = 0;
    const expenseList = document.getElementById('expense_list');
    expenseList.innerHTML = ''; // Clear previous breakdown

    expenseCategories.forEach(category => {
        const amountInput = document.getElementById(`expenses_${category}`);
        const frequencySelect = document.getElementById(`expenses_${category}_frequency`);
        const totalSpan = document.getElementById(`expenses_${category}_total`);

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
            li.textContent = `${category.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}: $${total.toFixed(2)} (${frequency})`;
            expenseList.appendChild(li);
        } else {
            totalSpan.textContent = '';
        }
    });

    const totalCostDisplay = document.getElementById('total_cost_display');
    totalCostDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
    document.getElementById('expenseBreakdown').classList.remove('hidden');
};

// Copy results to clipboard
window.copyResults = function() {
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
    const inputElement = document.getElementById(`expenses_${category}`);
    if (inputElement) {
        inputElement.addEventListener('input', () => updateFrequency(category));
    } else {
        console.error(`Input element not found for category: ${category}`);
    }
});

// Separate trip duration listener to update all categories
const tripDurationInput = document.getElementById('trip_duration');
if (tripDurationInput) {
    tripDurationInput.addEventListener('input', () => {
        expenseCategories.forEach(category => updateFrequency(category));
    });
} else {
    console.error('Trip duration input not found');
}




// List of all input and select element IDs from your HTML
const formElementIds = [
    // Input elements
    'trip_duration',
    'expenses_flights',
    'expenses_car',
    'expenses_uber',
    'expenses_transit',
    'expenses_bike',
    'expenses_hotels',
    'expenses_camping',
    'expenses_dining',
    'expenses_grocery',
    'expenses_tickets',
    'expenses_alcohol',
    'expenses_gambling',
    'expenses_rental',
    'expenses_insurance',
    'expenses_sim',
    'expenses_luggage_fees',
    // Select elements
    'expenses_flights_frequency',
    'expenses_car_frequency',
    'expenses_uber_frequency',
    'expenses_transit_frequency',
    'expenses_bike_frequency',
    'expenses_hotels_frequency',
    'expenses_camping_frequency',
    'expenses_dining_frequency',
    'expenses_grocery_frequency',
    'expenses_tickets_frequency',
    'expenses_alcohol_frequency',
    'expenses_gambling_frequency',
    'expenses_rental_frequency',
    'expenses_insurance_frequency',
    'expenses_sim_frequency',
    'expenses_luggage_fees_frequency'
];

// Function to create cookies for all form elements using imported setCookie
function createCookies() {
    formElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.value || '0'; // Default to '0' if empty, matching setCookie logic
            setCookie(id, value, 365); // Use imported setCookie with 1-year expiry
        } else {
            console.warn(`Element with ID '${id}' not found in the DOM`);
        }
    });
    console.log('Cookies created for all form elements');
}

// Note: No export here - this is just a function to be used in another script