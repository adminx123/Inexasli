/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 

document.addEventListener("DOMContentLoaded", () => {
  // Inject HTML - unchanged
  const menuHTML = `
    <div class="tray-menu" id="trayMenuToggle">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="tray-dropdown" id="trayDropdownMenu">
      <div class="tray-menu-item-container">
        <a href="/budget/intro.html" id="website" class="tray-menu-item">IncomeIQ™</a>
        // <div class="tray-submenu" id="trayCalculationsMenu">
          // <a href="/budget/vacation.html" id="vacation">Vacation</a>
          // <a href="/budget/intro.html" id="personal">IncomeIQ™</a>
        // </div>
      </div>
      <div class="tray-menu-item-container">
        <a href="/create/prompt.html" id="website" class="tray-menu-item">Promptemplate™</a>
        // <div class="tray-submenu" id="trayCreateMenu">
          // <a href="/create/prompt.html" id="website">Promptemplate™</a>
        // </div>
      </div>
      <div class="tray-menu-item-container">
        <a href="/budget/vacation.html" id="website" class="tray-menu-item">Vacation</a>
        // <div class="tray-submenu" id="trayCreateMenu">
          // <a href="/create/prompt.html" id="website">Promptify™</a>
        // </div>
      </div>
      <div class="tray-menu-item-container">
        <a href="mailto:support@inexasli.com" id="trayContact" class="tray-menu-item">CONTACT</a>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", menuHTML);

  // Inject modified CSS
  const style = document.createElement("style");
  style.textContent = `
    .tray-menu {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      z-index: 100;
      background-color: #000;
      padding: 5px;
      width: 100%;
      box-shadow: 0 -8px 8px rgba(64, 49, 49, 0.3);
    }
    .tray-menu div {
      width: 25px;
      height: 3px;
      background-color: #fff;
      margin: 4px auto;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .tray-menu.active div:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }
    .tray-menu.active div:nth-child(2) {
      opacity: 0;
    }
    .tray-menu.active div:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }
    .tray-dropdown {
      display: none;
      position: fixed;
      bottom: 35px;
      left: 0;
      right: 0;
      width: 100%;
      background-color: #000;
      padding: 5px 0;
      z-index: 90;
      box-shadow: 0 -8px 8px rgba(66, 49, 49, 0.3);
    }
    .tray-dropdown.show {
      display: flex;
      flex-direction: column; /* Changed to stack vertically on all devices */
      align-items: center; /* Center items vertically */
      padding: 10px 0; /* Consistent padding */
    }
    .tray-menu-item-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%; /* Ensure full width for consistency */
      text-align: center; /* Center text */
    }
    .tray-menu-item {
      display: block;
      padding: 12px 20px; /* Adjusted padding for better spacing */
      color: #fff;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
      transition: background-color 0.2s ease;
      width: 100%; /* Full width for each item */
    }
    .tray-menu-item:hover {
      background-color: #333;
    }
    .tray-menu-item.active {
      font-weight: bold;
      background-color: #000;
    }
    .tray-submenu {
      display: none;
      position: absolute;
      bottom: calc(100% + 5px);
      left: 50%;
      transform: translateX(-50%);
      background-color: #000;
      padding: 5px 0;
      width: 200px;
      box-sizing: border-box;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
      z-index: 91;
    }
    .tray-submenu.show {
      display: block;
    }
    .tray-submenu a {
      display: block;
      padding: 8px 20px;
      color: #ddd;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: background-color 0.2s ease;
    }
    .tray-submenu a:hover {
      background-color: #333;
    }
    /* Mobile stacking (optional adjustments) */
    @media (max-width: 768px) {
      .tray-dropdown.show {
        padding: 10px 0; /* Already set above, kept for consistency */
      }
      .tray-menu-item-container {
        width: 100%; /* Already set above */
        text-align: center; /* Already set above */
      }
      .tray-menu-item {
        padding: 12px 0; /* Adjusted for mobile consistency */
        width: 100%; /* Already set above */
      }
    }
  `;
  document.head.appendChild(style);

  // JavaScript behavior (unchanged)
  const menuToggle = document.querySelector("#trayMenuToggle");
  const dropdownMenu = document.querySelector("#trayDropdownMenu");
  const calculations = document.querySelector("#trayCalculations");
  const calculationsMenu = document.querySelector("#trayCalculationsMenu");
  const create = document.querySelector("#trayCreate");
  const createMenu = document.querySelector("#trayCreateMenu");
  const allMenuItems = document.querySelectorAll(".tray-menu-item");
  const allSubmenus = document.querySelectorAll(".tray-submenu");

  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      dropdownMenu.classList.toggle("show");
      if (!dropdownMenu.classList.contains("show")) {
        allSubmenus.forEach(submenu => submenu.classList.remove("show"));
        allMenuItems.forEach(item => item.classList.remove("active"));
      }
    });
  }

  if (calculations && calculationsMenu) {
    calculations.addEventListener("click", (event) => {
      event.preventDefault();
      allSubmenus.forEach(submenu => {
        if (submenu !== calculationsMenu) submenu.classList.remove("show");
      });
      allMenuItems.forEach(item => {
        if (item !== calculations) item.classList.remove("active");
      });
      calculations.classList.toggle("active");
      calculationsMenu.classList.toggle("show");
    });
  }

  if (create && createMenu) {
    create.addEventListener("click", (event) => {
      event.preventDefault();
      allSubmenus.forEach(submenu => {
        if (submenu !== createMenu) submenu.classList.remove("show");
      });
      allMenuItems.forEach(item => {
        if (item !== create) item.classList.remove("active");
      });
      create.classList.toggle("active");
      createMenu.classList.toggle("show");
    });
  }

  document.addEventListener("click", (event) => {
    if (menuToggle && dropdownMenu && !menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
      menuToggle.classList.remove("active");
      allSubmenus.forEach(submenu => submenu.classList.remove("show"));
      allMenuItems.forEach(item => item.classList.remove("active"));
    }
  });

  const dropdownLinks = document.querySelectorAll(".tray-dropdown a");
  if (dropdownLinks.length > 0) {
    dropdownLinks.forEach(link => {
      link.addEventListener("click", (event) => {
        if (link.href.includes("mailto:")) return;
        const protectedLinks = ["vacation", "personal", "home"];
        if (protectedLinks.includes(link.id)) {
          event.preventDefault();
          const password = prompt("Enter the password to access this page:");
          if (password === "iq") {
            window.location.href = link.href;
          } else {
            alert("Incorrect password! Access denied.");
          }
        }
      });
    });
  }
});