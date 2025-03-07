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


  export { setCookie }; // Export the function


  /*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */