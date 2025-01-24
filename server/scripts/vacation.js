function calculateAnnual(id, frequency) {
    const amount = parseFloat(document.getElementById(id).value) || 0;
    const freq = document.getElementById(frequency).value;
    let annualAmount = amount;
    
    if (freq === 'daily') {
        let duration = parseInt(prompt("Enter the number of days for the trip:"), 10);
        annualAmount *= duration;
    }
    
    document.getElementById(id + '_annual').innerText = `$${annualAmount.toFixed(2)}`;
}

function calculateTotal() {
    let total = 0;
    const expenseFields = ['flights', 'car_rental', 'uber', 'transit', 'hotels', 'camping_fees', 'dining', 'grocery', 'entertainment_tickets', 'entertainment_alcohol'];
    
    expenseFields.forEach(field => {
        total += parseFloat(document.getElementById(`expenses_${field}_annual`).innerText.replace('$', '')) || 0;
    });

    document.getElementById('total_cost_display').innerText = `$${total.toFixed(2)}`;
    document.getElementById('totalCost').classList.remove('hidden');
}
