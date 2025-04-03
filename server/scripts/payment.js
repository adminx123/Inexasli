document.addEventListener("DOMContentLoaded", () => {
    console.log("payment.js loaded");
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
      const planSelect = document.querySelector("#plan");
      const payStatus = document.querySelector("#status");
  
      console.log("Form elements:", { payButton, nameInput, emailInput, planSelect, payStatus });
  
      payStatus.innerHTML = "Please wait...";
      const name = nameInput.value;
      const email = emailInput.value;
      const plan = planSelect.value;
      console.log("Form data:", { name, email, plan });
  
      if (!name || !email || !plan) {
        console.warn("Missing name, email, or plan");
        payStatus.innerHTML = "Please enter your name, email, and select a plan.";
        return;
      }
  
      nameInput.disabled = true;
      emailInput.disabled = true;
      planSelect.disabled = true;
      payButton.disabled = true;
  
      const payload = { task: "pay", client_email: email, client_name: name, plan: plan };
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
          planSelect.disabled = false;
          payButton.disabled = false;
        }
      } catch (error) {
        console.error("Fetch failed with error:", error.message);
        console.error("Error details:", error);
        payStatus.innerHTML = "Unable to connect. Check your internet and try again.";
        nameInput.disabled = false;
        emailInput.disabled = false;
        planSelect.disabled = false;
        payButton.disabled = false;
      }
    });
  });