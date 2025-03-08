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

// Array of expense categories
const expenseCategories = [
    'flights', 'car', 'uber', 'transit', 'bike',
    'hotels', 'camping',
    'dining', 'grocery',
    'tickets', 'alcohol', 'gambling', 'rental',
    'insurance', 'sim', 'luggage'
];

// Categories that should only have "Total" frequency
const totalOnlyCategories = ['flights', 'tickets', 'insurance', 'sim', 'luggage'];

// Calculate total vacation cost and populate breakdown
window.calculateTotal = function() {
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    if (tripDuration <= 0 && expenseCategories.some(cat => !totalOnlyCategories.includes(cat) && document.getElementById(`trip_${cat}`).value && document.getElementById(`trip_${cat}_frequency`).value !== 'total')) {
        alert('Please enter a valid trip duration for expenses with daily or weekly frequencies.');
        return;
    }

    let grandTotal = 0;
    const expenseList = document.getElementById('expense_list');
    expenseList.innerHTML = ''; // Clear previous breakdown

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
    const inputElement = document.getElementById(`trip_${category}`);
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

// List of all input and select element IDs
const formElementIds = [
    // Input elements
    'trip_duration',
    'trip_flights',
    'trip_car',
    'trip_uber',
    'trip_transit',
    'trip_bike',
    'trip_hotels',
    'trip_camping',
    'trip_dining',
    'trip_grocery',
    'trip_tickets',
    'trip_alcohol',
    'trip_gambling',
    'trip_rental',
    'trip_insurance',
    'trip_sim',
    'trip_luggage',
    // Select elements
    'trip_flights_frequency',
    'trip_car_frequency',
    'trip_uber_frequency',
    'trip_transit_frequency',
    'trip_bike_frequency',
    'trip_hotels_frequency',
    'trip_camping_frequency',
    'trip_dining_frequency',
    'trip_grocery_frequency',
    'trip_tickets_frequency',
    'trip_alcohol_frequency',
    'trip_gambling_frequency',
    'trip_rental_frequency',
    'trip_insurance_frequency',
    'trip_sim_frequency',
    'trip_luggage_frequency'
];

// Function to create cookies for all form elements using imported setCookie
window.createCookies = function() {
    formElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.value || '0'; // Default to '0' if empty
            setCookie(id, value, 365); // Use imported setCookie with 1-year expiry
        } else {
            console.warn(`Element with ID '${id}' not found in the DOM`);
        }
    });
    console.log('Cookies created for all form elements');
};