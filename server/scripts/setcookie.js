

/*
* Copyright (c) 2025 INEXASLI. All rights reserved.
* This code is protected under Canadian and international copyright laws.
* Unauthorized use, reproduction, distribution, or modification of this code 
* without explicit written permission via email from info@inexasli.com 
* is strictly prohibited. Violators will be pursued and prosecuted to the 
* fullest extent of the law in British Columbia, Canada, and applicable 
* jurisdictions worldwide.
*/

function setCookie(name, value, days, timestamp) {
  if (value === undefined || value === null || value === '') {
    value = '0';
  }

  // Create a JSON object to store value and timestamp
  const cookieData = {
    value: value,
    timestamp: timestamp || Date.now() // Use provided timestamp or current time
  };

  // Set expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Serialize and encode the cookie data
  const cookieValue = encodeURIComponent(JSON.stringify(cookieData));

  // Set the cookie
  document.cookie = `${name}=${cookieValue}; expires=${expires.toUTCString()}; path=/`;
}

export { setCookie };