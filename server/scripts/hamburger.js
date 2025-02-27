document.addEventListener("DOMContentLoaded", () => {
  // Inject HTML
  const menuHTML = `
    <div class="menu" id="menuToggle">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="dropdown" id="dropdownMenu">
      <a href="mailto:support@inexasli.com" id="contact" class="menu-item">CONTACT</a>
      <a href="#" id="calculations" class="menu-item">CALCULATE</a>
      <div class="submenu" id="calculationsMenu">
        <a href="/xxxxxx" id="vacation">Vacation</a>
        <a href="/xxxxxx" id="personal">Personal</a>
      </div>
      <a href="#" id="create" class="menu-item">CREATE</a>
      <div class="submenu" id="createMenu">
        <a href="/create/prompt.html" id="website">Prompt</a>
        <a href="/xxxxxx" id="other">Other</a>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", menuHTML);

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    .menu {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      z-index: 100;
      background-color: transparent;
      border: none;
    }
    .menu div {
      width: 25px;
      height: 3px;
      background-color: #fff;
      margin: 4px 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .menu.active div:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }
    .menu.active div:nth-child(2) {
      opacity: 0;
    }
    .menu.active div:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }
    .dropdown {
      display: none;
      position: absolute;
      top: 40px;
      left: 10px;
      background-color: #222;
      border-radius: 5px;
      padding: 10px 0;
      min-width: 200px;
      z-index: 90;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    .dropdown.show {
      display: block;
    }
    .menu-item {
      display: block;
      padding: 10px 20px;
      color: #fff;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
      transition: background-color 0.2s ease;
      width: 100%; /* Ensure it takes full width */
      box-sizing: border-box; /* Include padding in width */
    }
    .menu-item:hover {
      background-color: #444;
    }
    .menu-item.active {
      font-weight: bold;
      background-color: #333;
    }
    .submenu {
      display: none;
      position: static; /* Consistent flow within dropdown */
      background-color: #333;
      padding: 5px 0;
      width: 100%; /* Match parent width */
      box-sizing: border-box;
    }
    .submenu.show {
      display: block;
    }
    .submenu a {
      display: block;
      padding: 8px 20px;
      color: #ddd;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: background-color 0.2s ease;
      width: 100%; /* Full width for consistency */
      box-sizing: border-box;
    }
    .submenu a:hover {
      background-color: #555;
    }
  `;
  document.head.appendChild(style);

  // JavaScript behavior
  const menuToggle = document.querySelector("#menuToggle");
  const dropdownMenu = document.querySelector("#dropdownMenu");
  const calculations = document.querySelector("#calculations");
  const calculationsMenu = document.querySelector("#calculationsMenu");
  const create = document.querySelector("#create");
  const createMenu = document.querySelector("#createMenu");
  const allMenuItems = document.querySelectorAll(".menu-item");
  const allSubmenus = document.querySelectorAll(".submenu");

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

  const dropdownLinks = document.querySelectorAll(".dropdown a");
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