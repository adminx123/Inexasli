import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getLocal.js';

// Expose functions to global scope for inline HTML events
window.toggleCogs = function () {
    const cogs = document.getElementById('cogs').value;
    const cogsSection = document.getElementById('cogsSection');
    cogsSection.style.display = cogs === 'yes' ? 'block' : 'none';
};

window.toggleRevenueType = function () {
    const revenueType = document.getElementById('revenueType').value;
    const salesLabel = document.querySelector('label[for="sales"]');
    const priceLabel = document.querySelector('label[for="price"]');

    if (revenueType === 'rental') {
        salesLabel.textContent = 'Rentals Contracted';
        priceLabel.textContent = 'Price Per Rental';
    } else if (revenueType === 'service') {
        salesLabel.textContent = 'Hours Billed';
        priceLabel.textContent = 'Price Per Hour';
    } else {
        salesLabel.textContent = 'Units Sold';
        priceLabel.textContent = 'Price Per Unit';
    }
};

window.updateFrequency = function (field) {
    const frequencySelect = document.getElementById(`${field}Frequency`);
    const frequency = frequencySelect.value;
    setLocal(`${field}Frequency`, frequency, 365); // Days ignored, stored in localStorage
    console.log(`Updated frequency for ${field} to ${frequency}`);
    // Optionally trigger calculate() if immediate update is desired
    // window.calculate();
};

function calculateAnnual(inputId, frequencyId) {
    const input = parseFloat(document.getElementById(inputId).value) || 0;
    const frequency = document.getElementById(frequencyId).value;

    switch (frequency) {
        case 'annually': return input * 1;
        case 'quarterly': return input * 4;
        case 'monthly': return input * 12;
        case 'weekly': return input * 52;
        default: return 0;
    }
}

window.calculate = function () {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const sales = parseFloat(document.getElementById('sales').value) || 0;
    const salesFrequency = document.getElementById('salesFrequency').value;

    const totalRevenue = calculateAnnual('sales', 'salesFrequency') * price;

    const cogsMaterialsValue = parseFloat(document.getElementById('cogsMaterials').value) || 0;
    const cogsLaborValue = parseFloat(document.getElementById('cogsLabor').value) || 0;
    const cogsOverheadValue = parseFloat(document.getElementById('cogsOverhead').value) || 0;
    const cogsShippingValue = parseFloat(document.getElementById('cogsShipping').value) || 0;
    const totalCOGS = (cogsMaterialsValue + cogsLaborValue + cogsOverheadValue + cogsShippingValue) * sales;

    const totalOperationalCosts = calculateAnnual('rent', 'rentFrequency') +
        calculateAnnual('utilities', 'utilitiesFrequency') +
        calculateAnnual('salaries', 'salariesFrequency') +
        calculateAnnual('marketing', 'marketingFrequency') +
        calculateAnnual('insurance', 'insuranceFrequency') +
        calculateAnnual('travel', 'travelFrequency') +
        calculateAnnual('hotel', 'hotelFrequency');

    const totalBuildingCosts = calculateAnnual('buildingRent', 'buildingRentFrequency') +
        calculateAnnual('buildingMaintenance', 'buildingMaintenanceFrequency') +
        calculateAnnual('buildingUtilities', 'buildingUtilitiesFrequency');

    const totalVehicleCosts = calculateAnnual('vehicleGas', 'vehicleGasFrequency') +
        calculateAnnual('vehicleMaintenance', 'vehicleMaintenanceFrequency') +
        calculateAnnual('vehicleInsurance', 'vehicleInsuranceFrequency') +
        calculateAnnual('vehicleRental', 'vehicleRentalFrequency') +
        calculateAnnual('vehicleLease', 'vehicleLeaseFrequency');

    const totalCosts = totalCOGS + totalOperationalCosts + totalBuildingCosts + totalVehicleCosts;
    const netIncome = totalRevenue - totalCosts;

    const selectedValue = parseFloat(document.getElementById('resultChange').value);
    const totalOperationalCostsDivided = totalOperationalCosts / selectedValue;
    const totalBuildingCostsDivided = totalBuildingCosts / selectedValue;
    const totalVehicleCostsDivided = totalVehicleCosts / selectedValue;
    const totalCOGSDivided = totalCOGS / selectedValue;
    const netIncomeAdjusted = netIncome / selectedValue;

    setLocal('totalRevenue', totalRevenue.toFixed(2), 365);
    setLocal('totalCOGS', totalCOGS.toFixed(2), 365);
    setLocal('totalOperationalCostsDivided', totalOperationalCostsDivided.toFixed(2), 365);
    setLocal('totalBuildingCostsDivided', totalBuildingCostsDivided.toFixed(2), 365);
    setLocal('totalVehicleCostsDivided', totalVehicleCostsDivided.toFixed(2), 365);
    setLocal('netIncomeAdjusted', netIncomeAdjusted.toFixed(2), 365);
    setLocal('revenueType', document.getElementById('revenueType').value, 365);

    saveCookies();

    document.querySelector('#alert').textContent = 'Business data captured. Go back now...';
    setLocal("calculated_from_worksheet", true, 365);
    console.log('Calculated cookie added from worksheet');
};

window.validatecheckbox = function () {
    window.calculate();
};

function saveCookies() {
    const fields = [
        'price', 'sales', 'cogsMaterials', 'cogsLabor', 'cogsOverhead', 'cogsShipping',
        'rent', 'utilities', 'salaries', 'marketing', 'insurance', 'travel', 'hotel',
        'buildingRent', 'buildingMaintenance', 'buildingUtilities', 'vehicleRental',
        'vehicleLease', 'vehicleGas', 'vehicleMaintenance', 'vehicleInsurance',
        'revenueType', 'salesFrequency', 'cogs', 'rentFrequency', 'utilitiesFrequency',
        'salariesFrequency', 'marketingFrequency', 'insuranceFrequency', 'travelFrequency',
        'hotelFrequency', 'buildingRentFrequency', 'buildingMaintenanceFrequency',
        'buildingUtilitiesFrequency', 'vehicleRentalFrequency', 'vehicleLeaseFrequency',
        'vehicleGasFrequency', 'vehicleMaintenanceFrequency', 'vehicleInsuranceFrequency',
        'resultChange'
    ];
    fields.forEach(field => {
        const value = document.querySelector(`#${field}`)?.value || '';
        setLocal(field, value, 365);
    });
}

window.sendMessage = function () {
    saveCookies();
    window.parent.postMessage('close-modal', '*');
};

document.addEventListener('DOMContentLoaded', function () {
    window.toggleCogs(); // Initial toggle

    const fields = [
        'price', 'sales', 'cogsMaterials', 'cogsLabor', 'cogsOverhead', 'cogsShipping',
        'rent', 'utilities', 'salaries', 'marketing', 'insurance', 'travel', 'hotel',
        'buildingRent', 'buildingMaintenance', 'buildingUtilities', 'vehicleRental',
        'vehicleLease', 'vehicleGas', 'vehicleMaintenance', 'vehicleInsurance',
        'revenueType', 'salesFrequency', 'cogs', 'rentFrequency', 'utilitiesFrequency',
        'salariesFrequency', 'marketingFrequency', 'insuranceFrequency', 'travelFrequency',
        'hotelFrequency', 'buildingRentFrequency', 'buildingMaintenanceFrequency',
        'buildingUtilitiesFrequency', 'vehicleRentalFrequency', 'vehicleLeaseFrequency',
        'vehicleGasFrequency', 'vehicleMaintenanceFrequency', 'vehicleInsuranceFrequency',
        'resultChange'
    ];

    fields.forEach(field => {
        const value = getLocal(field);
        const element = document.querySelector(`#${field}`);
        if (element) {
            if (field === 'revenueType') {
                // Default to 'rental' if no value is found
                element.value = value || 'rental';
            } else if (field === 'cogs') {
                // Default to 'no' if no value is found
                element.value = value || 'no';
            } else if (field === 'salesFrequency' || field.endsWith('Frequency')) {
                // Default to 'annually' for frequency fields
                element.value = value || 'annually';
            } else if (field === 'resultChange') {
                // Default to '1' (Annual results)
                element.value = value || '1';
            } else {
                // For other fields, set the value or leave blank
                const parsedValue = parseFloat(value) || '';
                element.value = parsedValue === 0 ? '' : parsedValue;
            }
        }
    });
});