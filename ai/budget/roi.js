import { setLocal } from '/utility/setlocal.js';
import { getLocal } from '/utility/getLocal.js';

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

// Updated calculateAnnual to use checked checkbox
function calculateAnnual(inputId, frequencyGroupId) {
    const element = document.getElementById(inputId);
    if (!element) return 0; // Return 0 if element doesn't exist
    
    const input = parseFloat(element.value) || 0;
    const frequencyGroup = document.getElementById(frequencyGroupId);
    
    let frequency = 'annually'; // Default to annual
    if (frequencyGroup) {
        const checkedCheckbox = frequencyGroup.querySelector('input[type="checkbox"]:checked');
        frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${frequencyGroupId}`) || 'annually';
    } else {
        // Fallback to document-wide search
        const checkedCheckbox = document.querySelector(`#${frequencyGroupId} input[type="checkbox"]:checked`);
        frequency = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${frequencyGroupId}`) || 'annually';
    }

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
    const salesAnnual = calculateAnnual('sales', 'salesFrequency');

    const totalRevenue = salesAnnual * price;

    const cogsMaterialsValue = calculateAnnual('cogsMaterials', 'cogsMaterialsFrequency');
    const cogsLaborValue = calculateAnnual('cogsLabor', 'cogsLaborFrequency');
    const cogsOverheadValue = calculateAnnual('cogsOverhead', 'cogsOverheadFrequency');
    const cogsShippingValue = calculateAnnual('cogsShipping', 'cogsShippingFrequency');
    const totalCOGS = (cogsMaterialsValue + cogsLaborValue + cogsOverheadValue + cogsShippingValue) * salesAnnual;

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

    setLocal('totalRevenue', totalRevenue.toFixed(2), 365);
    setLocal('totalCOGS', totalCOGS.toFixed(2), 365);
    setLocal('totalOperationalCosts', totalOperationalCosts.toFixed(2), 365);
    setLocal('totalBuildingCosts', totalBuildingCosts.toFixed(2), 365);
    setLocal('totalVehicleCosts', totalVehicleCosts.toFixed(2), 365);
    setLocal('netIncome', netIncome.toFixed(2), 365);
    setLocal('revenueType', document.getElementById('revenueType').value, 365);

    saveCookies();

    document.querySelector('#alert').textContent = 'Annual Net Income Captured. Tap outside now...';
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
        'revenueType', 'cogs'
    ];
    const frequencyFields = [
        'salesFrequency', 'cogsMaterialsFrequency', 'cogsLaborFrequency', 'cogsOverheadFrequency',
        'cogsShippingFrequency', 'rentFrequency', 'utilitiesFrequency', 'salariesFrequency',
        'marketingFrequency', 'insuranceFrequency', 'travelFrequency', 'hotelFrequency',
        'buildingRentFrequency', 'buildingMaintenanceFrequency', 'buildingUtilitiesFrequency',
        'vehicleRentalFrequency', 'vehicleLeaseFrequency', 'vehicleGasFrequency',
        'vehicleMaintenanceFrequency', 'vehicleInsuranceFrequency'
    ];

    fields.forEach(field => {
        const value = document.querySelector(`#${field}`)?.value || '';
        setLocal(field, value, 365);
    });

    frequencyFields.forEach(groupId => {
        const checkedCheckbox = document.querySelector(`#${groupId} input[type="checkbox"]:checked`);
        const value = checkedCheckbox ? checkedCheckbox.value : getLocal(`frequency_${groupId}`) || 'annually';
        setLocal(`frequency_${groupId}`, value, 365);
    });
}

window.sendMessage = function () {
    saveCookies();
    window.parent.postMessage('close-modal', '*');
};

// Checkbox group handling (like income.js)
document.addEventListener('DOMContentLoaded', function () {
    window.toggleCogs(); // Initial toggle

    const fields = [
        'price', 'sales', 'cogsMaterials', 'cogsLabor', 'cogsOverhead', 'cogsShipping',
        'rent', 'utilities', 'salaries', 'marketing', 'insurance', 'travel', 'hotel',
        'buildingRent', 'buildingMaintenance', 'buildingUtilities', 'vehicleRental',
        'vehicleLease', 'vehicleGas', 'vehicleMaintenance', 'vehicleInsurance',
        'revenueType', 'cogs'
    ];

    fields.forEach(field => {
        const value = getLocal(field);
        const element = document.querySelector(`#${field}`);
        if (element) {
            if (field === 'revenueType') {
                element.value = value || 'rental';
            } else if (field === 'cogs') {
                element.value = value || 'no';
            } else {
                const parsedValue = parseFloat(value) || '';
                element.value = parsedValue === 0 ? '' : parsedValue;
            }
        }
    });

    // Handle checkbox groups
    document.querySelectorAll('.checkbox-button-group').forEach(group => {
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                    setLocal(`frequency_${group.id}`, this.value, 365);
                    console.log(`Saved ${this.value} to cookie for ${group.id}`);
                }
            });
        });

        // Load saved selection or default to "annually"
        const savedFrequency = getLocal(`frequency_${group.id}`);
        const checkboxToCheck = group.querySelector(`input[value="${savedFrequency}"]`) ||
                               group.querySelector('input[value="annually"]');
        if (checkboxToCheck) {
            checkboxes.forEach(cb => {
                if (cb !== checkboxToCheck) cb.checked = false;
            });
            checkboxToCheck.checked = true;
            console.log(`Set ${checkboxToCheck.value} as checked for ${group.id}`);
        }
    });
});