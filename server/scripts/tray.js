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
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: flex-start;
    }
    .tray-menu-item-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tray-menu-item {
      display: block;
      padding: 10px 20px;
      color: #fff;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
      transition: background-color 0.2s ease;
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
    /* Mobile stacking */
    @media (max-width: 768px) {
      .tray-dropdown.show {
        flex-direction: column;
        align-items: center;
        padding: 10px 0;
      }
      .tray-menu-item-container {
        width: 100%;
        text-align: center;
      }
      .tray-menu-item {
        padding: 12px 0;
        width: 100%;
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