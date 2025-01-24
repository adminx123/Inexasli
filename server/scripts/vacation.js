function updateFrequency(expense) {
    const daysInput = document.getElementById(`${expense}_days`);
    const select = document.getElementById(`expenses_${expense}_frequency`);
    
    if (select.value === "days") {
        daysInput.style.display = "inline-block";
    } else {
        daysInput.style.display = "none";
    }
}

function calculateTotal() {
    let total = 0;
    const expenseTypes = ['flights', 'car_rental', 'uber', 'transit', 'hotels', 'camping_fees', 'dining', 'grocery', 'entertainment_tickets', 'entertainment_alcohol'];

    expenseTypes.forEach(type => {
        const amount = parseFloat(document.getElementById(`expenses_${type}`).value) || 0;
        const frequencySelect = document.getElementById(`expenses_${type}_frequency`);
        let days = 1; // Default to one-time for simplicity

        if (frequencySelect.value === "days") {
            days = parseInt(document.getElementById(`${type}_days`).value) || 1;
        }

        total += amount * days;
        document.getElementById(`expenses_${type}_total`).innerText = `$${amount * days}`;
    });

    document.getElementById('total_cost_display').innerText = `$${total.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
}
