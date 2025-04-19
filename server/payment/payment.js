// /server/scripts/payment.js
// Wait for the Stripe script to load
function waitForStripe() {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkStripe = () => {
            if (typeof Stripe !== "undefined") {
                console.log("Stripe script loaded");
                resolve();
            } else if (Date.now() - startTime > 10000) { // 10-second timeout
                console.error("Stripe script failed to load within 10 seconds");
                reject(new Error("Stripe script failed to load"));
            } else {
                setTimeout(checkStripe, 100);
            }
        };
        checkStripe();
    });
}

// Export a function to initialize the payment form
export async function initializePayment() {
    console.log("initializePayment called");

    try {
        // Wait for Stripe to load
        await waitForStripe();

        const lambda = "https://cup7hlgbjk.execute-api.us-east-1.amazonaws.com/production/create-checkout-session";
        const publicKey = "pk_test_51POOigILSdrwu9bgkDsm3tpdvSgP8PaV0VA4u9fSFMILqQDG0Bv8GxxFfNuTAv7knKX3x6685X3lYvxCs2iGEd9x00cSBedhxi";
        const payForm = document.querySelector("#payment-form");

        if (!payForm) {
            console.error("Payment form not found in DOM");
            return;
        }
        console.log("Payment form found:", payForm);

        const stripe = Stripe(publicKey);
        console.log("Stripe initialized with public key:", publicKey);

        payForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Form submitted");

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
                console.log("Current origin:", window.location.origin);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

                const res = await fetch(lambda, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    mode: "cors", // Explicitly set CORS mode
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log("Fetch response status:", res.status, res.statusText);
                console.log("Fetch response headers:", [...res.headers.entries()]);

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP error! Status: ${res.status}, Response: ${errorText}`);
                }

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
                console.error("Error stack:", error.stack);
                payStatus.innerHTML = "Unable to connect. Check your internet and try again.";
                nameInput.disabled = false;
                emailInput.disabled = false;
                payButton.disabled = false;
            }
        });
    } catch (error) {
        console.error("Error initializing payment form:", error);
    }
}