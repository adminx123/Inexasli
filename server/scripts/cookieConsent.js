function getCookie(name) {
  const cookieArray = document.cookie.split(";");
  for (let cookie of cookieArray) {
    cookie = cookie.trim(); // Remove extra spaces
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null; // Return null if my cookie doesn't exist
}
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/;SameSite=Lax`;
}

const cookeConsent = `
    <div class="cookie-container">
  <h2>we value your privacy</h2>
  <p>This site use cookies to enhance your experience, analyze traffic, and personalize content. By clicking 'Accept All,' you consent to our use of cookies.</p>
  <div><button class='cookieX'>Accept All</button></div>

</div>`;

document.addEventListener("DOMContentLoaded", () => {
  const visited = getCookie("visited");

  if (!visited) {
    setTimeout(() => {
      document.body.insertAdjacentHTML("beforeend", cookeConsent);
      const element = document.querySelector(".cookie-container");
      element.classList.add("visible");
      const button = document.querySelector(".cookieX");
      button.addEventListener("click", () => {
        setCookie("visited", true, 365);
        element.remove();
      });
    }, 2000);
  }
});

