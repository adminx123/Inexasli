

	
var ASSETS;
var LIQUIDASSETS;

     function calculateAssets() {
    const assetFields = [
        'assets_checking_accounts', 
        'assets_savings_accounts', 
        'assets_other_liquid_accounts', 
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
        if (!isNaN(parsedValue)) {
            assets += parsedValue;
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
        'assets_other_liquid_accounts'
    ];

    let liquidAssets = 0;

    for (let i = 0; i < liquidAssetFields.length; i++) {
        const fieldValue = document.getElementById(liquidAssetFields[i]).value;
        console.log(`Field value for ${liquidAssetFields[i]}: ${fieldValue}`);
        const parsedValue = parseFloat(fieldValue);
        if (!isNaN(parsedValue)) {
            liquidAssets += parsedValue;
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
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function setIncomeData(){ 
	const assetsFields = [
        'assets_checking_accounts', 
        'assets_savings_accounts', 
        'assets_other_liquid_accounts', 
        'assets_long_term_investment_accounts', 
        'assets_primary_residence', 
        'assets_investment_properties', 
        'assets_small_business', 
        'assets_vehicles', 
        'assets_art_jewelry'
    ];


//for (let i = 0; i < frequencyFields.length; i++) {
  //const frequencyInput = document.getElementById(frequencyFields[i]);
 // if (frequencyInput.value.trim() !== "") {
 //   const frequency = frequencyInput.value;
 //   const expirationDate = new Date();
 //   expirationDate.setDate(expirationDate.getDate() + 365);
 //   document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
 // } else {
//    const frequency = "0";
 //   const expirationDate = new Date();
  //  expirationDate.setDate(expirationDate.getDate() + 365);
  //  document.cookie = `${frequencyFields[i]}=${frequency}; expires=${expirationDate.toUTCString()}`;
 // }
//}

for (let i = 0; i < assetsFields.length; i++) {
  const assetsInput = document.getElementById(assetsFields[i]);
  if (assetsInput.value.trim() !== "") {
    const assets = assetsInput.value;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${assetsFields[i]}=${assets}; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`;
  } else {
    const assets = "0";
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    document.cookie = `${assetsFields[i]}=${assets}; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`;
  }
}
}


	document.addEventListener('DOMContentLoaded', function() {
    // Function to retrieve cookie value by name
		function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : '';
}
   
    
document.getElementById('assets_checking_accounts').value = getCookie('assets_checking_accounts');
document.getElementById('assets_savings_accounts').value = getCookie('assets_savings_accounts');
document.getElementById('assets_other_liquid_accounts').value = getCookie('assets_other_liquid_accounts');
document.getElementById('assets_long_term_investment_accounts').value = getCookie('assets_long_term_investment_accounts');
document.getElementById('assets_primary_residence').value = getCookie('assets_primary_residence');
document.getElementById('assets_investment_properties').value = getCookie('assets_investment_properties');
document.getElementById('assets_small_business').value = getCookie('assets_small_business');
document.getElementById('assets_vehicles').value = getCookie('assets_vehicles');
document.getElementById('assets_art_jewelry').value = getCookie('assets_art_jewelry');


	})	

    
function calculateNext() {
  calculateAll();
  window.location.href = 'liability.html';
}    

	function calculateBack() {
  calculateAll();
  window.location.href = 'expense.html';
}    

    function calculateAll() {
        
 calculateAssets();
 
 calculateLiquidAssets();

        setCookie("ASSETS", ASSETS, 365);
        setCookie("LIQUIDASSETS", LIQUIDASSETS, 365);

	    setIncomeData();
    }



