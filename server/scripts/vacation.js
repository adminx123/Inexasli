function updateFrequency(expense) {
    const amount = parseFloat(document.getElementById(`expenses_${expense}`).value) || 0;
    const frequency = document.getElementById(`expenses_${expense}_frequency`).value;
    let days = 1;

    // If the frequency is not 'one-time', parse it as the number of days
    if (frequency !== "one-time") {
        days = parseInt(frequency);
    }

    // If frequency is "one-time", do not multiply, just use the entered amount
    const total = (frequency === "one-time") ? amount : amount * days;

    // Update the total display for the current expense
    document.getElementById(`expenses_${expense}_total`).innerText = `$${total.toFixed(2)}`;
}

function calculateTotal() {
    let total = 0;
    const expenseTypes = [
        'flights', 'car', 'uber', 'transit', 'bike', 
        'hotels', 'camping', 
        'dining', 'grocery', 
        'tickets', 'alcohol', 'gambling', 'rental',
        'insurance', 'sim', 'luggage'
    ];

    // Loop through each expense type and calculate the total
    expenseTypes.forEach(type => {
        const amount = parseFloat(document.getElementById(`expenses_${type}`).value) || 0;
        const frequencySelect = document.getElementById(`expenses_${type}_frequency`);
        let days = 1;

        // Check if a frequency select element exists
        if (frequencySelect) {
            const frequency = frequencySelect.value;
            // If frequency is "one-time", set days to 1, else parse the frequency
            if (frequency === "one-time") {
                days = 1; // Don't multiply for one-time
            } else {
                days = parseInt(frequency); // Multiply by the selected frequency
            }
        }

        // Accumulate the total amount based on frequency
        if (days === 1) {
            total += amount;  // For "one-time", add the entered amount
        } else {
            total += amount * days;  // For other frequencies, multiply by days
        }
    });

    // Update the total cost display
    document.getElementById('total_cost_display').innerText = `$${total.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
}
