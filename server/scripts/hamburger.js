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
    
    // Prevent default behavior for other links (like vacation or personal)
    event.preventDefault();
    // You can implement your logic here for other links like password protection or toggling submenu
  });
});
