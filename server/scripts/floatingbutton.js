/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { getCookie } from '/server/scripts/getcookie.js';

function injectStyles() {
  const styles = `
    #gotosummary {
  position: fixed;
  top: 2.5px;         /* move to top */
  right: 10px;       /* keep on right */
  z-index: 1000;
  background-color: #f5f5f5;
  padding: 5px;
  border: 2px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
  display: inline-block;
  transition: background-color 0.3s ease;
}

#gotosummary:hover {
  background-color: rgb(210, 210, 210);
}

#summary-btn {
  padding: 8px 8px;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

#summary-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

#summary-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  #gotosummary {
    padding: 5px;
  }
  #summary-btn {
    padding: 6px 8px;
    font-size: 11px;
  }
}

  `;
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function createFloatingButton() {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'gotosummary';
  buttonContainer.style.display = 'none';
  const innerContainer = document.createElement('div');
  innerContainer.style.display = 'flex';
  innerContainer.style.alignItems = 'center';
  innerContainer.style.gap = '15px';
  const button = document.createElement('button');
  button.id = 'summary-btn';
  button.textContent = 'SUMMARY';
  innerContainer.appendChild(button);
  buttonContainer.appendChild(innerContainer);
  document.body.appendChild(buttonContainer);
  console.log('Button created at:', buttonContainer.getBoundingClientRect());
}

function checkLocalAndToggleButton() {
  const summaryCookie = getCookie('summary_reached');
  const summaryButtonContainer = document.getElementById('gotosummary');
  console.log('summary_reached cookie:', summaryCookie);

  const termsCheckbox = document.getElementById('termscheckbox');
  const notIntendedCheckbox = document.getElementById('notintended');
  const currentPage = window.location.pathname;

  // Pages where only timestamp matters (no checkboxes)
  const timestampOnlyPages = ['/budget/expense.html', '/budget/asset.html', '/budget/liability.html', '/budget/income.html'];

  if (summaryCookie) {
    const timestamp = summaryCookie.timestamp || 0;
    const currentTime = Date.now();
    const fifteenMinutes = 5 * 60 * 1000;
    const timeDifference = currentTime - timestamp;
    const isTimestampValid = timeDifference < fifteenMinutes;

    if (timestampOnlyPages.includes(currentPage)) {
      // On timestamp-only pages: only check timestamp
      if (isTimestampValid) {
        summaryButtonContainer.style.display = 'inline-block';
        console.log('Button shown on timestamp-only page - timestamp < 15 min:', timeDifference / 1000, 'seconds');
      } else {
        summaryButtonContainer.style.display = 'none';
        console.log('Button hidden on timestamp-only page - timestamp > 15 min:', timeDifference / 1000, 'seconds');
      }
    } else {
      // On other pages: check timestamp + checkboxes
      if (termsCheckbox && notIntendedCheckbox) {
        const areCheckboxesChecked = termsCheckbox.checked && notIntendedCheckbox.checked;

        if (isTimestampValid && areCheckboxesChecked) {
          summaryButtonContainer.style.display = 'inline-block';
          console.log('Button shown - timestamp < 15 min and conditions met:', timeDifference / 1000, 'seconds');
        } else {
          summaryButtonContainer.style.display = 'none';
          console.log('Button hidden - conditions not met:', {
            timestampValid: isTimestampValid,
            checkboxesChecked: areCheckboxesChecked
          });
        }
      } else {
        summaryButtonContainer.style.display = 'none';
        console.log('Button hidden - missing DOM elements on non-timestamp-only page');
      }
    }
  } else {
    summaryButtonContainer.style.display = 'none';
    console.log('Button hidden - no summary_reached cookie');
  }
}

function addButtonClickListener() {
  document.getElementById('summary-btn').addEventListener('click', () => {
    window.location.href = '/budget/summary.html';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  createFloatingButton();
  checkLocalAndToggleButton();
  addButtonClickListener();
  const termsCheckbox = document.getElementById('termscheckbox');
  const notIntendedCheckbox = document.getElementById('notintended');
  const regionDropdown = document.getElementById('RegionDropdown');
  if (termsCheckbox) termsCheckbox.addEventListener('change', checkLocalAndToggleButton);
  if (notIntendedCheckbox) notIntendedCheckbox.addEventListener('change', checkLocalAndToggleButton);
  if (regionDropdown) regionDropdown.addEventListener('change', checkLocalAndToggleButton);
});