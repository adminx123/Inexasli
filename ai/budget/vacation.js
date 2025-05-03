/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */
import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getLocal.js';

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
            const storedValue = getLocal(id);
            element.value = storedValue || '';
            console.log(`Set ${id} to ${element.value}`);
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

// Calculate total based on checkbox selection
function calculateTotalForCategory(category) {
    const amountInput = document.getElementById(`trip_${category}`);
    const frequencyGroup = document.getElementById(`trip_${category}_frequency`);
    const totalSpan = document.getElementById(`trip_${category}_total`);
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;

    if (!amountInput || !amountInput.value || (tripDuration <= 0 && !totalOnlyCategories.includes(category))) {
        if (totalSpan) totalSpan.textContent = '';
        return 0;
    }

    const amount = parseFloat(amountInput.value) || 0;
    const checkedCheckbox = frequencyGroup.querySelector('input[type="checkbox"]:checked');
    const frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`trip_${category}_frequency`) || 'total';
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
    return total;
}

window.updateFrequency = function(category) {
    calculateTotalForCategory(category);
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

    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    if (tripDuration <= 0 && expenseCategories.some(cat => !totalOnlyCategories.includes(cat) && document.getElementById(`trip_${cat}`).value)) {
        alert('Please enter a valid trip duration for expenses with daily or weekly frequencies.');
        return;
    }

    let grandTotal = 0;
    const expenseList = document.getElementById('expense_list');
    expenseList.innerHTML = '';

    expenseCategories.forEach(category => {
        const total = calculateTotalForCategory(category);
        if (total > 0) {
            grandTotal += total;
            const li = document.createElement('li');
            li.textContent = `${category.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}: $${total.toFixed(2)}`;
            expenseList.appendChild(li);
        }
    });

    const totalLi = document.createElement('li');
    totalLi.textContent = `Total Expenses: $${grandTotal.toFixed(2)}`;
    totalLi.style.fontWeight = 'bold';
    expenseList.appendChild(totalLi);

    const totalCostDisplay = document.getElementById('total_cost_display');
    totalCostDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
    document.getElementById('expenseBreakdown').classList.remove('hidden');
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

window.createCookies = function() {
    console.log('Saving cookies...');
    formElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.value || '0';
            setLocal(id, value, 365);
            console.log(`Saved ${id}: ${value}`);
        }
    });

    expenseCategories.forEach(category => {
        const frequencyGroup = document.getElementById(`trip_${category}_frequency`);
        const checkedCheckbox = frequencyGroup.querySelector('input[type="checkbox"]:checked');
        const value = checkedCheckbox ? checkedCheckbox.value : getLocal(`trip_${category}_frequency`) || 'total';
        setLocal(`trip_${category}_frequency`, value, 365);
        console.log(`Saved trip_${category}_frequency: ${value}`);
    });
    console.log('Cookies created for all form elements');
};

window.overwriteCookies1 = function() {
    console.log('Overwriting cookies...');
    formElementIds.forEach(id => {
        setLocal(id, '', 365);
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    expenseCategories.forEach(category => {
        setLocal(`trip_${category}_frequency`, 'total', 365);
        const frequencyGroup = document.getElementById(`trip_${category}_frequency`);
        const checkboxes = frequencyGroup.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = cb.value === 'total';
        });
    });
    console.log("All Vacation Worksheet cookies have been overwritten and fields cleared.");
};

// Form element IDs
const formElementIds = [
    'trip_duration', 'trip_flights', 'trip_car', 'trip_uber', 'trip_transit', 'trip_bike',
    'trip_hotels', 'trip_camping', 'trip_dining', 'trip_grocery', 'trip_tickets',
    'trip_alcohol', 'trip_gambling', 'trip_rental', 'trip_insurance', 'trip_sim', 'trip_luggage'
];

// Event listeners
expenseCategories.forEach(category => {
    const inputElement = document.getElementById(`trip_${category}`);
    if (inputElement) {
        inputElement.addEventListener('input', () => updateFrequency(category));
    }
});

const tripDurationInput = document.getElementById('trip_duration');
if (tripDurationInput) {
    tripDurationInput.addEventListener('input', () => {
        expenseCategories.forEach(category => updateFrequency(category));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    loadLocalStorage();

    document.querySelectorAll('.checkbox-button-group').forEach(group => {
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                    setLocal(group.id, this.value, 365);
                    console.log(`Saved ${this.value} to cookie for ${group.id}`);
                    const category = group.id.replace('trip_', '').replace('_frequency', '');
                    updateFrequency(category);
                }
            });
        });

        const savedFrequency = getLocal(group.id) || 'total';
        const checkboxToCheck = group.querySelector(`input[value="${savedFrequency}"]`);
        if (checkboxToCheck) {
            checkboxToCheck.checked = true;
            console.log(`Set ${checkboxToCheck.value} as checked for ${group.id}`);
        } else {
            group.querySelector('input[value="total"]').checked = true;
        }
    });
});