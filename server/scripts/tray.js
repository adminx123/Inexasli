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
      </div>
      <div class="tray-menu-item-container">
        <a href="/create/prompt.html" id="website" class="tray-menu-item">Promptemplate™</a>
      </div>
      <div class="tray-menu-item-container">
        <a href="/budget/vacation.html" id="website" class="tray-menu-item">Vacation</a>
      </div>
      <div class="tray-menu-item-container">
        <a href="mailto:support@inexasli.com" id="trayContact" class="tray-menu-item">CONTACT</a>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", menuHTML);

  // Inject modified CSS with non-clickable glow
  const style = document.createElement("style");
  style.textContent = `
    .tray-menu {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
      background-color: #000;
      padding: 5px;
      width: 100%;
      box-shadow: 0 -8px 8px rgba(64, 49, 49, 0.3); /* Static shadow */
    }
    .tray-menu-glow {
      position: fixed;
      bottom: 35px; /* Matches tray height to sit just above it */
      left: 0;
      width: 100%;
      height: 48px; /* Glow height */
      background: linear-gradient(to top, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
      animation: glowPulse 3s infinite ease-in-out;
      z-index: 99; /* Behind tray but above content */
      pointer-events: none; /* Prevents clicks */
    }
    @keyframes glowPulse {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.5;
      }
    }
    .tray-menu div {
      width: 25px;
      height: 3px;
      background-color: #fff;
      margin: 4px auto;
      transition: transform 0.3s ease, opacity 0.3s ease;
      cursor: pointer; /* Cursor only on hamburger bars */
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
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
    }
    .tray-menu-item-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      text-align: center;
    }
    .tray-menu-item {
      display: block;
      padding: 12px 20px;
      color: #fff;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
      transition: background-color 0.2s ease;
      width: 100%;
    }
    .tray-menu-item:hover {
      background-color: #333;
    }
    .tray-menu-item.active {
      font-weight: bold;
      background-color: #000;
    }
    @media (max-width: 768px) {
      .tray-dropdown.show {
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

  // Inject glow element after tray
  const glowHTML = `<div class="tray-menu-glow"></div>`;
  document.body.insertAdjacentHTML("afterbegin", glowHTML);

  // JavaScript behavior - refined click target
  const menuToggle = document.querySelector("#trayMenuToggle");
  const dropdownMenu = document.querySelector("#trayDropdownMenu");
  const hamburgerBars = menuToggle.querySelectorAll("div"); // Target only the bars

  if (menuToggle && dropdownMenu) {
    hamburgerBars.forEach(bar => {
      bar.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent bubbling to tray-menu
        menuToggle.classList.toggle("active");
        dropdownMenu.classList.toggle("show");
        if (!dropdownMenu.classList.contains("show")) {
          document.querySelectorAll(".tray-submenu").forEach(submenu => submenu.classList.remove("show"));
          document.querySelectorAll(".tray-menu-item").forEach(item => item.classList.remove("active"));
        }
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (menuToggle && dropdownMenu && !menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
      menuToggle.classList.remove("active");
      document.querySelectorAll(".tray-submenu").forEach(submenu => submenu.classList.remove("show"));
      document.querySelectorAll(".tray-menu-item").forEach(item => item.classList.remove("active"));
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