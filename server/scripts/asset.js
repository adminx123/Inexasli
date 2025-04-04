/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 

import { displayWarning } from "./utils.js"
import { setLocal } from '/server/scripts/setlocal.js'; // Adjust path as needed
import { getLocal } from '/server/scripts/getlocal.js'; // Adjust path as needed



const tabs = document.querySelectorAll('.tab')

tabs.forEach(tab => {
    const dataL = tab.getAttribute('data-location')
    const location = document.location.pathname
    

    if (location.includes(dataL)) {
        tab.removeAttribute('href')

        tab.classList.add('active')
    }
})


var ASSETS;
var LIQUIDASSETS;

    function calculateAssets() {
    const assetFields = [
        'assets_checking_accounts', 
        'assets_savings_accounts', 
        'assets_other_liquid_accounts',
        'assets_money_lent_out',
        'assets_long_term_investment_accounts', 
        'assets_primary_residence', 
        'assets_investment_properties', 
        'assets_small_business', 
        'assets_vehicles', 
        'assets_art_jewelry'
    ];

    let assets = 0;

    for (let i = 0; i < assetFields.length; i++) {
        const fieldValue = document.getElementById(assetFields[i]).value;
        console.log(`Field value for ${assetFields[i]}: ${fieldValue}`);
        const parsedValue = parseFloat(fieldValue);

        const cookieValue = getLocal('romanticasset');
        
        if (!isNaN(parsedValue)) {
            let fieldPercentage = parseFloat(document.querySelector(`#${assetFields[i]}_percent`).value);

            // Check if the cookie is set to "Checked" or "unChecked"
            if (cookieValue === 'checked') {
                // Use the user's input percentage
                if (!fieldPercentage || isNaN(fieldPercentage)) {
                    fieldPercentage = 100; // Default to 100% if input is invalid
                }
                assets += (parsedValue * fieldPercentage / 100);
            } else if (cookieValue === 'unChecked') {
                // Use the number directly from the field
                assets += parsedValue;
            } else {
                // Default behavior (if cookie not set or invalid value)
                if (!fieldPercentage || isNaN(fieldPercentage)) {
                    fieldPercentage = 100;
                }
                assets += (parsedValue * fieldPercentage / 100);
            }
        } 
    }

    ASSETS = assets;
    document.getElementById('ASSETS').textContent = '$' + ASSETS.toFixed(2);
}
 
 function calculateLiquidAssets() {
    const liquidAssetFields = [
        'assets_checking_accounts', 
        'assets_savings_accounts', 
        'assets_other_liquid_accounts',
	    'assets_money_lent_out'
    ];

    let liquidAssets = 0;

    for (let i = 0; i < liquidAssetFields.length; i++) {
        const fieldValue = document.getElementById(liquidAssetFields[i]).value;
        console.log(`Field value for ${liquidAssetFields[i]}: ${fieldValue}`);
        const parsedValue = parseFloat(fieldValue);
        const isPartner = getLocal('assetspousecheckbox') == 'checked'

        if (!isNaN(parsedValue)) {
            let fieldPercentage = parseFloat(document.querySelector(`#${liquidAssetFields[i]}_percent`).value)

            if (!fieldPercentage || isNaN(fieldPercentage) || !isPartner) {
                fieldPercentage = 100
            }

            // console.log(fieldPercentage)


            liquidAssets += (parsedValue * fieldPercentage / 100);
            // console.log(`${parsedValue}, ${fieldPercentage}, ${parsedValue * fieldPercentage / 100}`)
        } 
    }

LIQUIDASSETS = liquidAssets;


    document.getElementById('LIQUIDASSETS').textContent = '$' + LIQUIDASSETS.toFixed(2);

  
}





document.addEventListener('DOMContentLoaded', function () {
    // List of form element IDs you want to set based on cookies
    const formElements = [
        'assets_checking_accounts', 'assets_savings_accounts', 'assets_other_liquid_accounts',
        'assets_money_lent_out', 'assets_long_term_investment_accounts', 'assets_primary_residence',
        'assets_investment_properties', 'assets_small_business', 'assets_vehicles', 'assets_art_jewelry',
        'assets_checking_accounts_percent', 'assets_savings_accounts_percent', 'assets_other_liquid_accounts_percent',
        'assets_money_lent_out_percent', 'assets_long_term_investment_accounts_percent', 'assets_primary_residence_percent',
        'assets_investment_properties_percent', 'assets_small_business_percent', 'assets_vehicles_percent', 'assets_art_jewelry_percent'
    ];

    // Loop through each element ID and set the value using getLocal
    formElements.forEach(function (elementId) {
        const value = getLocal(elementId); // Get the value from the cookie
        const element = document.getElementById(elementId);
        if (element) { // Check if the element exists before trying to set its value
            element.value = value;
        }
    });
});

    
window.calculateNext = function () {
  calculateAll();
  window.location.href = '/budget/liability.html';
}    

	window.calculateBack = function () {
  calculateAll();
  window.location.href = 'expense.html';
}    

    window.calculateAll = function () {
        
 calculateAssets();
 
 calculateLiquidAssets();

        setLocal("ASSETS", ASSETS, 365);
        setLocal("LIQUIDASSETS", LIQUIDASSETS, 365);

        setLocal("assets_checking_accounts", document.getElementById("assets_checking_accounts").value.trim() !== "" ? document.getElementById("assets_checking_accounts").value : "0", 365);
        setLocal("assets_savings_accounts", document.getElementById("assets_savings_accounts").value.trim() !== "" ? document.getElementById("assets_savings_accounts").value : "0", 365);
        setLocal("assets_other_liquid_accounts", document.getElementById("assets_other_liquid_accounts").value.trim() !== "" ? document.getElementById("assets_other_liquid_accounts").value : "0", 365);
        setLocal("assets_money_lent_out", document.getElementById("assets_money_lent_out").value.trim() !== "" ? document.getElementById("assets_money_lent_out").value : "0", 365);
        setLocal("assets_long_term_investment_accounts", document.getElementById("assets_long_term_investment_accounts").value.trim() !== "" ? document.getElementById("assets_long_term_investment_accounts").value : "0", 365);
        setLocal("assets_primary_residence", document.getElementById("assets_primary_residence").value.trim() !== "" ? document.getElementById("assets_primary_residence").value : "0", 365);
        setLocal("assets_investment_properties", document.getElementById("assets_investment_properties").value.trim() !== "" ? document.getElementById("assets_investment_properties").value : "0", 365);
        setLocal("assets_small_business", document.getElementById("assets_small_business").value.trim() !== "" ? document.getElementById("assets_small_business").value : "0", 365);
        setLocal("assets_vehicles", document.getElementById("assets_vehicles").value.trim() !== "" ? document.getElementById("assets_vehicles").value : "0", 365);
        setLocal("assets_art_jewelry", document.getElementById("assets_art_jewelry").value.trim() !== "" ? document.getElementById("assets_art_jewelry").value : "0", 365);
    

        setLocal("assets_checking_accounts_percent", document.getElementById("assets_checking_accounts_percent").value.trim() !== "" ? document.getElementById("assets_checking_accounts_percent").value : "100", 365);
    setLocal("assets_savings_accounts_percent", document.getElementById("assets_savings_accounts_percent").value.trim() !== "" ? document.getElementById("assets_savings_accounts_percent").value : "100", 365);
    setLocal("assets_other_liquid_accounts_percent", document.getElementById("assets_other_liquid_accounts_percent").value.trim() !== "" ? document.getElementById("assets_other_liquid_accounts_percent").value : "100", 365);
    setLocal("assets_money_lent_out_percent", document.getElementById("assets_money_lent_out_percent").value.trim() !== "" ? document.getElementById("assets_money_lent_out_percent").value : "100", 365);
    setLocal("assets_long_term_investment_accounts_percent", document.getElementById("assets_long_term_investment_accounts_percent").value.trim() !== "" ? document.getElementById("assets_long_term_investment_accounts_percent").value : "100", 365);
    setLocal("assets_primary_residence_percent", document.getElementById("assets_primary_residence_percent").value.trim() !== "" ? document.getElementById("assets_primary_residence_percent").value : "100", 365);
    setLocal("assets_investment_properties_percent", document.getElementById("assets_investment_properties_percent").value.trim() !== "" ? document.getElementById("assets_investment_properties_percent").value : "100", 365);
    setLocal("assets_small_business_percent", document.getElementById("assets_small_business_percent").value.trim() !== "" ? document.getElementById("assets_small_business_percent").value : "100", 365);
    setLocal("assets_vehicles_percent", document.getElementById("assets_vehicles_percent").value.trim() !== "" ? document.getElementById("assets_vehicles_percent").value : "100", 365);
    setLocal("assets_art_jewelry_percent", document.getElementById("assets_art_jewelry_percent").value.trim() !== "" ? document.getElementById("assets_art_jewelry_percent").value : "100", 365);

    }






document.addEventListener('DOMContentLoaded', () => {
    const romanticassetLocal = getLocal('romanticasset');
    const percentInputs = document.querySelectorAll('.percent-input');

    // Check for romantic liability sharing based on cookie value
    if (romanticassetLocal === 'checked') {
		              displayWarning("You have indicated that you own one or more assets jointly with your romantic partner. Please enter the market value of the assets and your corresponding percentage of ownership.")

        percentInputs.forEach(input => {
            input.style.display = 'block';
        });
    } else {
        percentInputs.forEach(input => {
            input.style.display = 'none';
        });
    }
});
