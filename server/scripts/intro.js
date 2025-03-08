/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
  */ 


  

import { setCookie } from '/server/scripts/setcookie.js'; // Adjust path as needed
import { getCookie } from '/server/scripts/getcookie.js'; // Adjust path as needed


document.addEventListener('DOMContentLoaded', () => {
  // Function to check cookie and set grid item state
  const setGridItemFromCookie = (id, name) => {
    const item = document.querySelector('#' + id);
    const cookieValue = getCookie(name);

    if (item) {
      item.classList.toggle('selected', cookieValue === 'checked');
      // If no cookie is set or it's not 'checked', set it to 'unChecked'
      if (cookieValue !== 'checked') {
        setCookie(name, 'unChecked', 365);
      }
    }
  };

  // Apply cookie values to grid items or set to 'unChecked' if nothing is selected
  ['romanticincome', 'romanticexpense', 'dependantcheckbox', 'debtcheckbox', 'romanticasset', 'romanticliability'].forEach(id => {
    setGridItemFromCookie(id, id);
  });

  // Handle grid item clicks
  function toggleSelection(event) {
    const item = event.target;
    item.classList.toggle('selected');
    
    // Set cookie based on item's selection state
    setCookie(item.id, item.classList.contains('selected') ? 'checked' : 'unChecked', 365);
  }

  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', toggleSelection);
    // Set unique IDs for each item to match with cookies
    item.id = item.getAttribute('data-value');
  });
});



window.nextPage = function() {
  // Navigate to the new page after setting cookies
  window.location.href = './income.html';
}
