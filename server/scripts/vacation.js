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
    let breakdown = '';  // This will hold the breakdown HTML
    const expenseTypes = [
        'flights', 'car', 'uber', 'transit', 'bike', 
        'hotels', 'camping', 
        'dining', 'grocery', 
        'tickets', 'alcohol', 'gambling', 'rental',
        'insurance', 'sim', 'luggage_fees'  // Updated from luggage to luggage_fees
    ];

    expenseTypes.forEach(type => {
        // Get the input element for the expense
        const inputElement = document.getElementById(`expenses_${type}`);
        
        if (inputElement) {
            let amount = parseFloat(inputElement.value) || 0;
            
            // Get the frequency select element
            const frequencySelect = document.getElementById(`expenses_${type}_frequency`);
            let days = 1;  // Default to 1 day if no frequency

            if (frequencySelect) {
                const frequency = frequencySelect.value;
                days = frequency === "one-time" ? 1 : parseInt(frequency);
            }

            // Calculate total for the current expense
            const expenseTotal = amount * days;
            total += expenseTotal;

            // Create the breakdown item
            breakdown += `<li>${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}: $${expenseTotal.toFixed(2)} (${days} day${days > 1 ? 's' : ''})</li>`;
        } else {
            console.warn(`Input element with id 'expenses_${type}' is missing.`);
        }
    });

    // Log the total to verify the calculation
    console.log("Total calculated: ", total);

    // Update the total cost display
    const totalCostDisplay = document.getElementById('total_cost_display');
    if (totalCostDisplay) {
        totalCostDisplay.innerText = `$${total.toFixed(2)}`;
    }

    // Make sure total cost div is visible
    const totalCostDiv = document.getElementById('totalCost');
    if (totalCostDiv) {
        totalCostDiv.classList.remove('hidden');
    }

    // Show the breakdown
    const expenseBreakdownDiv = document.getElementById('expenseBreakdown');
    if (expenseBreakdownDiv) {
        expenseBreakdownDiv.classList.remove('hidden');
    }

    // Update the breakdown list
    const expenseList = document.getElementById('expense_list');
    if (expenseList) {
        expenseList.innerHTML = breakdown;  // Add the breakdown HTML
    }
}