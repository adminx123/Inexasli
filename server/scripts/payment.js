
// THis is for the HTML***********

/* 
<form class="payment-form" id="payment-form" style="margin-top: 30px;">
  <input type="text" class="payment-input" id="username" placeholder="input name" required >
  <input type="email" class="payment-input" id="useremail" placeholder="input email" required >
  <div id="status"></div>
  <button    class="pay-button" id="pay-button">Subscribe for Premium Educational Insights!</button>
 
 </form>
 <a  href="mailto:support@inexasli.com" class=" contact-support" >I have paid</a>
 <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class=" contact-support" style="margin-bottom: 20px;">Customer portal</a>
 */






// This goes on Html page with the form ***********

/*
<script src="https://js.stripe.com/v3/" async ></script>

    */      
          


//This goes on teh Html where data is to be dipslayed
          /* 



          const paid = getCookie("authenticated");
          
          
          if (paid == "paid") {
              window.location.href = "/budget/summary.html";
      
        } else {
          document.body.style.display = 'initial'
        }*/
          


    // /server/scripts/payment.js
    document.addEventListener("DOMContentLoaded", () => {
      console.log("payment.js loaded"); // Confirm script loads
    
      const lambda = "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
      const publicKey = "pk_test_51POOigILSdrwu9bgkDsm3tpdvSgP8PaV0VA4u9fSFMILqQDG0Bv8GxxFfNuTAv7knKX3x6685X3lYvxCs2iGEd9x00cSBedhxi";
      const payForm = document.querySelector("#payment-form");
    
      if (!payForm) {
          console.error("Payment form not found in DOM");
          return;
      }
      console.log("Payment form found:", payForm);
    
      payForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          console.log("Form submitted");
    
          if (typeof Stripe === "undefined") {
              console.error("Stripe not loaded");
              return;
          }
          const stripe = Stripe(publicKey);
          console.log("Stripe initialized with public key:", publicKey);
    
          const payButton = document.querySelector("#pay-button");
          const nameInput = document.querySelector("#username");
          const emailInput = document.querySelector("#useremail");
          const payStatus = document.querySelector("#status");
    
          console.log("Form elements:", { payButton, nameInput, emailInput, payStatus });
    
          payStatus.innerHTML = "Please wait...";
          const name = nameInput.value;
          const email = emailInput.value;
          console.log("Form data:", { name, email });
    
          if (!name || !email) {
              console.warn("Missing name or email");
              payStatus.innerHTML = "Please enter your name and email.";
              return;
          }
    
          nameInput.disabled = true;
          emailInput.disabled = true;
          payButton.disabled = true;
    
          const payload = { task: "pay", client_email: email, client_name: name };
          console.log("Sending payload to Lambda:", payload);
    
          try {
              console.log("Initiating fetch to:", lambda);
              const res = await fetch(lambda, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload)
              });
              console.log("Fetch response status:", res.status, res.statusText);
              console.log("Fetch response headers:", [...res.headers.entries()]);
    
              const data = await res.json();
              console.log("Fetch response data:", data);
    
              if (data.id) {
                  console.log("Checkout session ID received:", data.id);
                  payStatus.innerHTML = "Redirecting to payment...";
                  await stripe.redirectToCheckout({ sessionId: data.id });
                  console.log("Redirect to Stripe checkout initiated");
              } else {
                  console.warn("No session ID in response:", data);
                  payStatus.innerHTML = data.error || "Payment failed. Please try again.";
                  nameInput.disabled = false;
                  emailInput.disabled = false;
                  payButton.disabled = false;
              }
          } catch (error) {
              console.error("Fetch failed with error:", error.message);
              console.error("Error details:", error);
              payStatus.innerHTML = "Unable to connect. Check your internet and try again.";
              nameInput.disabled = false;
              emailInput.disabled = false;
              payButton.disabled = false;
          }
      });
    });