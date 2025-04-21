

document.addEventListener("DOMContentLoaded", () => {
  // Inject HTML with unique class names
  const menuHTML = `
    <div class="hamburger-menu" id="hamburgerMenuToggle">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="hamburger-dropdown" id="hamburgerDropdownMenu">
      <a href="#" id="hamburgerCalculations" class="hamburger-menu-item">CALCULATE</a>
      <div class="hamburger-submenu" id="hamburgerCalculationsMenu">
        <a href="/budget/vacation.html" id="vacation">Vacation</a>
        <a href="/budget/intro.html" id="personal">IncomeIQ™</a>
      </div>
      <a href="#" id="hamburgerCreate" class="hamburger-menu-item">CREATE</a>
      <div class="hamburger-submenu" id="hamburgerCreateMenu">
        <a href="/create/prompt.html" id="website">Promptify™</a>
      </div>
      <a href="mailto:support@inexasli.com" id="hamburgerContact" class="hamburger-menu-item">CONTACT</a>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", menuHTML);

  // Inject CSS with unique class names
  const style = document.createElement("style");
  style.textContent = `
   .hamburger-menu {
  position: fixed; /* Changed from absolute to fixed */
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  z-index: 100;
  background-color: transparent;
  border: none;
}
.hamburger-menu div {
  width: 25px;
  height: 3px;
  background-color: #fff;
  margin: 4px 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.hamburger-menu.active div:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}
.hamburger-menu.active div:nth-child(2) {
  opacity: 0;
}
.hamburger-menu.active div:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}
.hamburger-dropdown {
  display: none;
  position: fixed; /* Changed from absolute to fixed */
  top: 50px; /* Adjusted to position below the fixed hamburger */
  left: 10px;
  background-color: #FFF;
  border-radius: 5px;
  padding: 5px 0;
  min-width: 200px;
  z-index: 90;
  box-shadow: 0 4px 8px rgba(126, 4, 4, 0.3);
}
/* Rest of your CSS remains the same */


    .hamburger-dropdown.show {
      display: block;
    }
    .hamburger-menu-item {
      display: block;
      padding: 10px 20px;
      color: #000;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 16px;
      text-transform: uppercase;
      transition: background-color 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .hamburger-menu-item:hover {
      background-color: #444;
    }
    .hamburger-menu-item.active {
      font-weight: bold;
      background-color: #fff;
    }
    .hamburger-submenu {
      display: none;
      position: static; /* Keep in normal flow for vertical stacking */
      background-color: #000;
      padding: 5px 0;
      width: 100%;
      box-sizing: border-box;
    }
    .hamburger-submenu.show {
      display: block;
    }
    .hamburger-submenu a {
      display: block;
      padding: 8px 20px;
      color: #ddd;
      text-decoration: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: background-color 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .hamburger-submenu a:hover {
      background-color: #555;
    }
  `;
  document.head.appendChild(style);

  // JavaScript behavior with updated selectors
  const menuToggle = document.querySelector("#hamburgerMenuToggle");
  const dropdownMenu = document.querySelector("#hamburgerDropdownMenu");
  const calculations = document.querySelector("#hamburgerCalculations");
  const calculationsMenu = document.querySelector("#hamburgerCalculationsMenu");
  const create = document.querySelector("#hamburgerCreate");
  const createMenu = document.querySelector("#hamburgerCreateMenu");
  const allMenuItems = document.querySelectorAll(".hamburger-menu-item");
  const allSubmenus = document.querySelectorAll(".hamburger-submenu");

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

  const dropdownLinks = document.querySelectorAll(".hamburger-dropdown a");
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

