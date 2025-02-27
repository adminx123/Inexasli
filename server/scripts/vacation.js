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

// Update frequency and calculate total for a specific expense
function updateFrequency(category) {
    const amountInput = document.getElementById(`expenses_${category}`);
    const frequencySelect = document.getElementById(`expenses_${category}_frequency`);
    const totalSpan = document.getElementById(`expenses_${category}_total`);
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;

    // Only exit if no input value OR (tripDuration is 0 and category isn't total-only and frequency isn't 'total')
    if (!amountInput || !amountInput.value || (tripDuration <= 0 && !totalOnlyCategories.includes(category) && frequencySelect.value !== 'total')) {
        if (totalSpan) totalSpan.textContent = '';
        return;
    }

    const amount = parseFloat(amountInput.value) || 0;
    const frequency = frequencySelect.value;
    let total = 0;

    if (totalOnlyCategories.includes(category)) {
        total = amount; // Always total for these categories
    } else {
        switch (frequency) {
            case 'total':
                total = amount;
                break;
            case 'daily':
                total = amount * tripDuration;
                break;
            case 'weekly':
                const fullWeeks = Math.floor(tripDuration / 7); // Full weeks
                const remainingDays = tripDuration % 7; // Leftover days
                const dailyRate = amount / 7; // Daily equivalent of weekly cost
                total = (fullWeeks * amount) + (remainingDays * dailyRate); // Full weeks + prorated days
                break;
        }
    }

    if (totalSpan) totalSpan.textContent = `$${total.toFixed(2)}`;
}

// Calculate total vacation cost and populate breakdown
function calculateTotal() {
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    if (tripDuration <= 0 && expenseCategories.some(cat => !totalOnlyCategories.includes(cat) && document.getElementById(`expenses_${cat}`).value && document.getElementById(`expenses_${cat}_frequency`).value !== 'total')) {
        alert('Please enter a valid trip duration for expenses with daily or weekly frequencies.');
        return;
    }

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
}

// Copy results to clipboard
function copyResults() {
    const tripDuration = parseInt(document.getElementById('trip_duration').value) || 0;
    const totalCost = document.getElementById('total_cost_display').textContent;
    const expenseItems = Array.from(document.getElementById('expense_list').getElementsByTagName('li'))
        .map(li => li.textContent);

    const textToCopy = `Vacation Cost Estimate\nTrip Duration: ${tripDuration} days\nTotal Estimated Cost: ${totalCost}\n\nExpense Breakdown:\n${expenseItems.join('\n')}`;

    navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Results copied to clipboard!'))
        .catch(err => alert('Failed to copy results: ' + err));
}

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