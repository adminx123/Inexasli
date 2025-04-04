function setCookie(name, value, days) {
  if (value === undefined || value === null || value === '') {
      value = '0';
  }
  
  // Store in localStorage (days parameter is ignored as localStorage doesn't expire)
  localStorage.setItem(name, encodeURIComponent(value));
}

export { setCookie };

/*
* Copyright (c) 2025 INEXASLI. All rights reserved.
* This code is protected under Canadian and international copyright laws.
* Unauthorized use, reproduction, distribution, or modification of this code 
* without explicit written permission via email from info@inexasli.com 
* is strictly prohibited. Violators will be pursued and prosecuted to the 
* fullest extent of the law in British Columbia, Canada, and applicable 
* jurisdictions worldwide.
*/