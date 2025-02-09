// Hamburger menu toggle
const menuToggle = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");
const calculations = document.getElementById("calculations");
const calculationsMenu = document.getElementById("calculationsMenu");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  dropdownMenu.classList.toggle("show");
});

// Toggle active class for CALCULATE to show submenu
calculations.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default behavior
  calculations.classList.toggle("active"); // Toggle the active class
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (
    !menuToggle.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
    menuToggle.classList.remove("active");
  }
});

// Prevent default behavior for other links but allow mailto
document.querySelectorAll('.dropdown a').forEach(link => {
  link.addEventListener("click", (event) => {
    // If the link is a mailto, allow it to open
    if (link.href.includes("mailto:")) {
      return; // Do not prevent mailto links
    }
    
    // Password protection logic for certain links (e.g., Vacation, Personal)
    const protectedLinks = ["vacation", "personal", "home"]; // IDs of links to protect
    if (protectedLinks.includes(link.id)) {
      event.preventDefault(); // Prevent link navigation
      const password = prompt("Enter the password to access this page:");
      
      if (password === "iq") {  // Replace with your password
        window.location.href = link.href;  // Navigate to the link if password is correct
      } else {
        alert("Incorrect password! Access denied.");
      }
    }
  });
});


/* 

This is for the HTML

<div class="menu" id="menuToggle">
        <div></div>
        <div></div>
        <div></div>
    </div>
    
    <div class="dropdown" id="dropdownMenu">
       
       <!-- Main Category: Contact -->
       <a href="mailto:support@inexasli.com" id="contact" class="menu-item">CONTACT</a> 

        <!-- Main Category: Calculations -->
        <a href="#" id="calculations" class="menu-item">CALCULATE</a>
        
        <!-- Sub-Menu under Calculations -->
        <div class="submenu" id="calculationsMenu" >
            <a href="/calculator/vacation/vacation.html" id="vacation">Vacation</a>
            <a href="/calculator/budget/intro.html" id="personal">Personal</a>
        </div> */