
import { displayWarning } from './utils.js';


document.querySelector('#cookie-delete-link').addEventListener('click', (event) => {
    event.preventDefault();  // Prevent the link's default behavior
    deleteCookies();         // Trigger the cookie deletion function
});

function deleteCookies() {
    // First, display the warning using displayWarning from utils.js (assuming this function exists)
    displayWarning();

    // Ask the user for confirmation before proceeding
    const userConfirmed = confirm("Are you sure you want to delete all cookies? This action cannot be undone.");

    if (!userConfirmed) {
        console.log("Cookie deletion canceled.");
        return; // If the user cancels, stop the function
    }

    // Retrieve cookies and delete them
    const cookies = document.cookie.split(";");
    const paths = ["/"];
    const domains = [window.location.hostname];

    cookies.forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim();

        // Skip the 'authenticated' cookie
        if (cookieName === "authenticated") {
            return;
        }

        // Delete the cookie by setting its expiration date to the past
        let expires = "";
        const date = new Date();
        date.setTime(date.getTime() - 1); // Set the cookie's expiration to the past
        expires = "; expires=" + date.toUTCString();

        paths.forEach(path => {
            domains.forEach(domain => {
                document.cookie = cookieName + "=; " + expires + "; path=" + path + "; domain=" + domain + "; SameSite=Strict; Secure";
            });
        });
    });

    // Reload the page to apply changes
    document.location.reload();
}

