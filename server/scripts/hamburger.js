
 // Hamburger menu toggle
      const menuToggle = document.getElementById("menuToggle");
      const dropdownMenu = document.getElementById("dropdownMenu");

      menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", (event) => {
        if (
          !menuToggle.contains(event.target) &&
          !dropdownMenu.contains(event.target)
        ) {
          dropdownMenu.style.display = "none";
          menuToggle.classList.remove("active");
        }
      });

      

       // Function to handle password protection
       function handlePasswordProtection(url) {
        const password = prompt("Please enter the password for access:");
        if (password === "iq") {
            window.location.href = url; // Redirect to the protected page
        } else {
            alert("Incorrect password. Access denied.");
        }
    }

    // Add event listeners to password-protected links
    const budgetWorksheetLink = document.getElementById("budgetworksheet");
    budgetWorksheetLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        handlePasswordProtection(budgetWorksheetLink.href); // Pass the link's URL
    });

    const vacationEstimateLink = document.getElementById("vacationestimate");
    vacationEstimateLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        handlePasswordProtection(vacationEstimateLink.href); // Pass the link's URL
    });