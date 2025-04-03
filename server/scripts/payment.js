document.addEventListener("DOMContentLoaded", () => {
    const lambda = "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
    const publicKey = "pk_test_51POOigILSdrwu9bgkDsm3tpdvSgP8PaV0VA4u9fSFMILqQDG0Bv8GxxFfNuTAv7knKX3x6685X3lYvxCs2iGEd9x00cSBedhxi";
    const payForm = document.querySelector("#payment-form");
  
    payForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const stripe = Stripe(publicKey);
      const nameInput = document.querySelector("#username");
      const emailInput = document.querySelector("#useremail");
      const planSelect = document.querySelector("#plan"); // Must include this
      const payStatus = document.querySelector("#status");
  
      payStatus.innerHTML = "Please wait...";
      const name = nameInput.value;
      const email = emailInput.value;
      const plan = planSelect.value; // Get the plan value
  
      if (!name || !email || !plan) {
        payStatus.innerHTML = "Please enter your name, email, and select a plan.";
        return;
      }
  
      nameInput.disabled = true;
      emailInput.disabled = true;
      planSelect.disabled = true;
      document.querySelector("#pay-button").disabled = true;
  
      const payload = { task: "pay", client_email: email, client_name: name, plan: plan };
      try {
        const res = await fetch(lambda, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.id) {
          payStatus.innerHTML = "Redirecting to payment...";
          await stripe.redirectToCheckout({ sessionId: data.id });
        } else {
          payStatus.innerHTML = data.error || "Payment failed. Please try again.";
          nameInput.disabled = false;
          emailInput.disabled = false;
          planSelect.disabled = false;
          document.querySelector("#pay-button").disabled = false;
        }
      } catch (error) {
        payStatus.innerHTML = "Unable to connect. Check your internet and try again.";
        nameInput.disabled = false;
        emailInput.disabled = false;
        planSelect.disabled = false;
        document.querySelector("#pay-button").disabled = false;
      }
    });
  });