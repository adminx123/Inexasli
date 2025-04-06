/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

function setCookie(name, days) {
  // Use current timestamp as the value
  const value = Date.now(); // Milliseconds since epoch (e.g., 1743964851967)

  // Set expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Set the cookie with the timestamp as the value
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

export { setCookie };