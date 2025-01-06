
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

      
/*
      // Function to handle password protection
      function handlePasswordProtection(url) {
        const password = prompt("Please enter the password for access:");
        if (password === "incomeiq") {
          window.location.href = url;
        } else {
          alert("Incorrect password. Access denied.");
        }
      }

      // Event listener for the FHE element
      const FHE = document.getElementById("FHE");
      FHE.addEventListener("click", function (event) {
        event.preventDefault();
        handlePasswordProtection("xxxx.html");
      });

      const newElement = document.getElementById("ai");
      newElement.addEventListener("click", function (event) {
        event.preventDefault();
        handlePasswordProtection("ai/form.html"); // Replace with the actual URL you want to redirect to
      });
*/
