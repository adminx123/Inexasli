function updateFrequency(expense) {
    const amount = parseFloat(document.getElementById(`expenses_${expense}`).value) || 0;
    const frequency = document.getElementById(`expenses_${expense}_frequency`).value;
    let days = 1;

    if (frequency !== "one-time") {
        days = parseInt(frequency);
    }

    document.getElementById(`expenses_${expense}_total`).innerText = `$${(amount * days).toFixed(2)}`;
}

function calculateTotal() {
    let total = 0;
    const expenseTypes = ['flights', 'car_rental', 'uber', 'transit', 'hotels', 'camping_fees', 'dining', 'grocery', 'entertainment_tickets', 'entertainment_alcohol'];

    expenseTypes.forEach(type => {
        const amount = parseFloat(document.getElementById(`expenses_${type}`).value) || 0;
        const frequency = document.getElementById(`expenses_${type}_frequency`).value;
        let days = frequency === "one-time" ? 1 : parseInt(frequency);

        total += amount * days;
    });

    document.getElementById('total_cost_display').innerText = `$${total.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
}