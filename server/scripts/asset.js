
import { displayWarning } from "./utils.js"

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

        const cookieValue = getCookie('romanticasset');
        
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
        } else {
            console.error(`Invalid value for ${assetFields[i]}: ${fieldValue}`);
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
        const isPartner = getCookie('assetspousecheckbox') == 'checked'

        if (!isNaN(parsedValue)) {
            let fieldPercentage = parseFloat(document.querySelector(`#${liquidAssetFields[i]}_percent`).value)

            if (!fieldPercentage || isNaN(fieldPercentage) || !isPartner) {
                fieldPercentage = 100
            }

            // console.log(fieldPercentage)


            liquidAssets += (parsedValue * fieldPercentage / 100);
            // console.log(`${parsedValue}, ${fieldPercentage}, ${parsedValue * fieldPercentage / 100}`)
        } else {
            console.error(`Invalid value for ${liquidAssetFields[i]}: ${fieldValue}`);
        }
    }

LIQUIDASSETS = liquidAssets;


    document.getElementById('LIQUIDASSETS').textContent = '$' + LIQUIDASSETS.toFixed(2);

  
}

function setCookie(name, value, days) {
    var expires = "";
    if (value === undefined || value === null || value === '') {
        value = '0';
    }
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict; Secure";
}

function setIncomeData(){ 
	const assetsFields = [
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




for (let i = 0; i < assetsFields.length; i++) {
  const assetsInput = document.getElementById(assetsFields[i]);
  if (assetsInput.value.trim() !== "") {
    const assets = assetsInput.value;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${assetsFields[i]}=${assets}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;
// set percentage cookie

let fieldPercentage = parseFloat(document.querySelector(`#${assetsFields[i]}_percent`).value)

if (!fieldPercentage || isNaN(fieldPercentage)) {
    // fieldPercentage = 100
    continue
}

    document.cookie = `${assetsFields[i]}_percent=${fieldPercentage}; expires=${expirationDate.toUTCString()};  path=/; SameSite=Strict; Secure`;
  } else {
    const assets = "0";
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${assetsFields[i]}=${assets}; expires=${expirationDate.toUTCString()};  path=/;SameSite=Strict; Secure`;
  }
}
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    const val = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
    return val == 0 || val == '0'? '': val
}






	document.addEventListener('DOMContentLoaded', function() {
    // Function to retrieve cookie value by name
		function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    const val = parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
    return val == 0 || val == '0'? '': val
}
   
    
document.getElementById('assets_checking_accounts').value = getCookie('assets_checking_accounts');
document.getElementById('assets_savings_accounts').value = getCookie('assets_savings_accounts');
document.getElementById('assets_other_liquid_accounts').value = getCookie('assets_other_liquid_accounts');
document.getElementById('assets_money_lent_out').value = getCookie('assets_money_lent_out');
document.getElementById('assets_long_term_investment_accounts').value = getCookie('assets_long_term_investment_accounts');
document.getElementById('assets_primary_residence').value = getCookie('assets_primary_residence');
document.getElementById('assets_investment_properties').value = getCookie('assets_investment_properties');
document.getElementById('assets_small_business').value = getCookie('assets_small_business');
document.getElementById('assets_vehicles').value = getCookie('assets_vehicles');
document.getElementById('assets_art_jewelry').value = getCookie('assets_art_jewelry');



document.getElementById('assets_checking_accounts_percent').value = getCookie('assets_checking_accounts_percent');
document.getElementById('assets_savings_accounts_percent').value = getCookie('assets_savings_accounts_percent');
document.getElementById('assets_other_liquid_accounts_percent').value = getCookie('assets_other_liquid_accounts_percent');
document.getElementById('assets_money_lent_out_percent').value = getCookie('assets_money_lent_out_percent');
document.getElementById('assets_long_term_investment_accounts_percent').value = getCookie('assets_long_term_investment_accounts_percent');
document.getElementById('assets_primary_residence_percent').value = getCookie('assets_primary_residence_percent');
document.getElementById('assets_investment_properties_percent').value = getCookie('assets_investment_properties_percent');
document.getElementById('assets_small_business_percent').value = getCookie('assets_small_business_percent');
document.getElementById('assets_vehicles_percent').value = getCookie('assets_vehicles_percent');
document.getElementById('assets_art_jewelry_percent').value = getCookie('assets_art_jewelry_percent');





	})	

    
window.calculateNext = function () {
  calculateAll();
  window.location.href = '/calculator/budget/liability.html';
}    

	window.calculateBack = function () {
  calculateAll();
  window.location.href = 'expense.html';
}    

    window.calculateAll = function () {
        
 calculateAssets();
 
 calculateLiquidAssets();

        setCookie("ASSETS", ASSETS, 365);
        setCookie("LIQUIDASSETS", LIQUIDASSETS, 365);

	    setIncomeData();
    }






document.addEventListener('DOMContentLoaded', () => {
    const romanticassetCookie = getCookie('romanticasset');
    const percentInputs = document.querySelectorAll('.percent-input');

    // Check for romantic liability sharing based on cookie value
    if (romanticassetCookie === 'checked') {
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
