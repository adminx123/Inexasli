/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

function getCookie(name) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        const decodedValue = decodeURIComponent(cookieValue);
        console.log(`getCookie called for ${name}, stored value: ${cookieValue}`);
        console.log(`Decoded value for ${name}: ${decodedValue}`);
        const timestamp = isNaN(parseInt(decodedValue)) ? null : parseInt(decodedValue);
        return { value: decodedValue, timestamp: timestamp }; // e.g., { value: "1744328673033", timestamp: 1744328673033 }
      }
    }
    console.log(`No cookie found for ${name}`);
    return null;
  }
  
  export { getCookie };