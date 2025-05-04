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

        // Replace AWS Lambda URL with your Cloudflare Worker URL
        const paymentEndpoint = "https://stripeintegration.4hm7q4q75z.workers.dev/";
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
            console.log("Sending payload to Cloudflare Worker:", payload);

            try {
                console.log("Initiating fetch to:", paymentEndpoint);
                console.log("Current origin:", window.location.origin);
                
                // First, make sure the Worker properly handles OPTIONS preflight requests
                // by sending a preflight request ourselves
                try {
                    console.log("Sending preflight request to test CORS setup...");
                    const preflightResponse = await fetch(paymentEndpoint, {
                        method: "OPTIONS",
                        headers: {
                            "Origin": window.location.origin,
                            "Access-Control-Request-Method": "POST",
                            "Access-Control-Request-Headers": "Content-Type",
                        },
                        mode: "cors",
                        signal: AbortSignal.timeout(5000) // 5-second timeout for preflight
                    });
                    
                    console.log("Preflight response:", {
                        status: preflightResponse.status,
                        headers: [...preflightResponse.headers.entries()]
                    });
                    
                    // Check if CORS headers are present
                    const hasAccessControlAllowOrigin = preflightResponse.headers.has("Access-Control-Allow-Origin");
                    const hasAccessControlAllowMethods = preflightResponse.headers.has("Access-Control-Allow-Methods");
                    
                    if (!hasAccessControlAllowOrigin || !hasAccessControlAllowMethods) {
                        console.warn("CORS headers may not be properly configured on the Cloudflare Worker:");
                        console.warn("- Access-Control-Allow-Origin present:", hasAccessControlAllowOrigin);
                        console.warn("- Access-Control-Allow-Methods present:", hasAccessControlAllowMethods);
                    }
                } catch (preflightError) {
                    console.error("Preflight request failed:", preflightError.message);
                    // Continue anyway, as some servers don't handle OPTIONS requests properly
                }
                
                // Increase timeout to 20 seconds
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.error("Request timed out after 20 seconds");
                    controller.abort();
                }, 20000);

                const res = await fetch(paymentEndpoint, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Origin": window.location.origin
                    },
                    body: JSON.stringify(payload),
                    mode: "cors", // Explicitly set CORS mode
                    credentials: "omit", // Don't send cookies
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log("Fetch response status:", res.status, res.statusText);
                console.log("Fetch response headers:", [...res.headers.entries()]);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Server returned error response:", errorText);
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
                
                // More user-friendly error message with troubleshooting tips
                if (error.name === 'AbortError') {
                    payStatus.innerHTML = "Request timed out. The payment server might be down or experiencing high traffic. Please try again later.";
                } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    payStatus.innerHTML = "Network error. Please check your internet connection and try again.";
                } else if (error.message.includes('CORS')) {
                    payStatus.innerHTML = "Connection blocked by browser security. This is likely a CORS issue with the Cloudflare Worker. Please contact support.";
                } else {
                    payStatus.innerHTML = "Unable to connect. Please try again or contact support.";
                }
                
                nameInput.disabled = false;
                emailInput.disabled = false;
                payButton.disabled = false;
            }
        });
    } catch (error) {
        console.error("Error initializing payment form:", error);
    }
}