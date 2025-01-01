window.closeWarning = function () {
    const warningElement = document.querySelector('.warning-parent');
    if (warningElement) {
        warningElement.remove();
    }
};


export function displayWarning(content = 'kindly add text needed in function call') {
    

    const warning = `
    <div class="warning-parent" >
        <div class="warning-content">
            <h2>WARNING</h2>
            <p>${content}</p>
            <button class="warning-close-btn" onclick="closeWarning()">Got it</button>
        </div>
    </div>`;




    document.body.insertAdjacentHTML('beforeend', warning);
}
    


// i hope this is what you meant by the below

// Create a show hide script or take the one for USA or CANADA that is located in the income.js file and and do the same thing so I can call the script to any page in the future. 

// hide show for id

export function hideShow(id, task)  {
    const element = document.getElementById(id);
    if (element) {
        if (task === 'hide') {
            element.style.display = 'none';
        } else if (task ==='show') {
            element.style.display = 'block';
        }
    } else {
        alert(`No element with id '${id}' found.`);
        console.error(`No element with id '${id}' found.`);
    }


}

// hide show for class

export function hideShowClass(className, task) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        if (element) {
            if (task === 'hide') {
                element.style.display = 'none';
            } else if (task ==='show') {
                element.style.display = 'block';
            }
        } else {
            alert(`No element with class '${className}' found.`);
            console.error(`No element with class '${className}' found.`);
        }
    });
}


// example usage 

//  hideShow('spousecheckbox', 'hide')
//  hideShowClass('spousecheckboxclass', 'show')

// you can call it from any script by importing it like in example then calling like normal

// import {hideShow} from './utils.js'





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
