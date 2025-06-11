// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Skip external button creation - now integrated into datain.js
    console.log('[PaymentForm] Button creation skipped - integrated into datain.js');
    // createPaymentCornerButton();

    // Create modal HTML for payment form using self-contained modal system
    if (!document.getElementById('payment-modal')) {
        // Load Stripe script if not already loaded
        if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
            const stripeScript = document.createElement('script');
            stripeScript.src = 'https://js.stripe.com/v3/';
            stripeScript.async = true;
            document.head.appendChild(stripeScript);
            console.log('Stripe script added to page');
        }

        // Add modal styles matching copy.js pattern
        addPaymentModalStyles();
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.id = 'payment-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'payment-modal-content';
        modalContent.innerHTML = `
            <div class="payment-modal-header">
                <div class="payment-modal-title">Premium Features</div>
            </div>
            <div id="status" class="payment-status"></div>
            <form class="payment-form" id="payment-form">
                <input type="text" class="payment-input" id="username" placeholder="Input your name" required>
                <input type="email" class="payment-input" id="useremail" placeholder="Input your email" required>
                <button class="payment-pay-button" id="pay-button" type="button">Subscribe - $2.99</button>
                <div class="payment-button-row">
                    <a href="mailto:support@inexasli.com" class="payment-support-link">I have paid</a>
                    <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="payment-support-link">Customer Portal</a>
                </div>
                <button id="terms-button" class="payment-terms-button" type="button">Terms of Service</button>
            </form>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        console.log('Payment modal created');

        // Add debugging to the button immediately after creation
        const debugButton = document.getElementById('pay-button');
        if (debugButton) {
            console.log('Subscribe button found:', debugButton);
            console.log('Button type:', debugButton.type);
            
            // Add a simple test click handler
            debugButton.addEventListener('click', function(e) {
                console.log('🔥 BUTTON CLICKED! Event details:', e);
                console.log('🔥 Button element:', this);
                console.log('🔥 Form element:', document.getElementById('payment-form'));
            });
            console.log('Debug click handler added to button');
        } else {
            console.error('Subscribe button not found after modal creation!');
        }

        // Set up modal functionality
        setupPaymentModalFunctionality(modal);

        // Initialize payment processing directly (combined from payment.js)
        initializePaymentProcessing();

        console.log('Payment form and processing initialized');
    }

    // Create legal modal function - simple alert for now
    window.openLegalModal = async function() {
        try {
            // Close payment modal if it's open
            if (typeof window.closePaymentModal === 'function') {
                window.closePaymentModal();
            }
            
            // Simple alert for legal content for now
            alert('Terms of Service functionality will be added.');
            
        } catch (error) {
            console.error('Failed to load legal content:', error);
            alert('Failed to load Terms of Service. Please try again.');
        }
    };

    // Add event listener for Terms of Service button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'terms-button') {
            e.preventDefault();
            window.openLegalModal();
        }
    });

    // Add functionality to toggle premium sections
    const premiumHeaders = document.querySelectorAll('.section1-header');

    premiumHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            section.classList.toggle('expanded');
        });
    });
});

/**
 * Add CSS styles for the payment modal matching copy.js pattern - clean and simple
 */
function addPaymentModalStyles() {
    // Check if styles already exist
    if (document.getElementById('payment-modal-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'payment-modal-styles';
    style.textContent = `
        .payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            font-family: "Inter", sans-serif;
        }
        
        .payment-modal-content {
            background-color: #f2f9f3;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #4a7c59;
            box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
            max-width: 300px;
            width: 90%;
            text-align: center;
            font-family: "Inter", sans-serif;
        }
        
        .payment-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .payment-modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            font-family: "Geist", sans-serif;
            color: #2d5a3d;
            flex: 1;
            text-align: center;
        }
        
        
        .payment-status {
            margin-bottom: 15px;
            font-size: 0.9rem;
            text-align: center;
        }
        
        .payment-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .payment-input-row {
            display: flex;
            gap: 8px;
        }
        
        .payment-input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #4a7c59;
            border-radius: 6px;
            font-family: "Inter", sans-serif;
            font-size: 0.9rem;
            transition: border-color 0.2s ease;
        }
        
        .payment-input:focus {
            outline: none;
            border-color: #2d5a3d;
        }
        
        .payment-pay-button {
            padding: 14px 20px;
            background-color: #f2f9f3;
            color: #2d5a3d;
            border: 1px solid #4a7c59;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
        }
        
        .payment-pay-button:hover {
            background-color: #eef7f0;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(74, 124, 89, 0.3);
        }
        
        .payment-pay-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
        }
        
        .payment-button-row {
            display: flex;
            gap: 8px;
        }
        
        .payment-support-link {
            flex: 1;
            padding: 10px 12px;
            background-color: #f2f9f3;
            color: #2d5a3d;
            border: 1px solid #4a7c59;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: 500;
            transition: all 0.2s ease;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
        }
        
        .payment-support-link:hover {
            background-color: #eef7f0;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(74, 124, 89, 0.3);
            text-decoration: none;
            color: #2d5a3d;
        }
        
        .payment-support-link:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
        }
        
        .payment-terms-button {
            padding: 8px 16px;
            background-color: transparent;
            color: #666;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-family: "Inter", sans-serif;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 8px;
        }
        
        .payment-terms-button:hover {
            background-color: #f5f5f5;
            color: #333;
        }
        
        /* Premium Section Styling */
        .premium-blur {
            filter: blur(3px);
            color: #888;
            pointer-events: none;
            transition: filter 0.3s ease, color 0.3s ease;
            font-family: "Inter", sans-serif;
        }

        /* Section1 Styling (Premium-specific) */
        .section1 {
            margin-bottom: 2px;
            padding: 1px;
            font-family: "Inter", sans-serif;
        }

        .section1-header {
            display: flex;
            align-items: center; /* Vertically center items */
            justify-content: space-between; /* Push .premium-notice to right */
            cursor: pointer;
            padding: 1px;
            background-color: #f5f5f5;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: #000000;
            transition: background-color 0.3s ease;
            font-family: "Geist", sans-serif;
        }

        .section1-header:hover {
            background-color: rgba(211, 188, 15, 0.18); /* Gold hover */
        }

        .section1-header h2 {
            margin: 0;
            flex-grow: 1; /* Allow h2 to take available space */
            display: flex;
            align-items: center;
            gap: 5px; /* Space between text and toggle-icon */
        }

        .section1-content {
            display: none; /* Hidden by default */
            padding: 10px;
            font-family: "Inter", sans-serif;
        }

        .section1.expanded .section1-content {
            display: block; /* Shown when expanded */
        }

        .section1.expanded .toggle-icon {
            transform: rotate(45deg);
            font-family: "Inter", sans-serif;
        }

        .premium-notice {
            padding: 4px 8px;
            background-color: rgb(0, 0, 0);
            color: #D4AF37;
            font-size: 0.75em;
            border-radius: 2px;
            font-weight: bold;
            font-family: "Geist", sans-serif;
            margin-left: auto; /* Push to right in flex context */
        }

        .premium-notice1 {
            padding: 4px 8px;
            background-color: rgb(0, 0, 0);
            color: #D4AF37;
            font-size: 0.75em;
            border-radius: 2px;
            font-weight: bold;
            font-family: "Geist", sans-serif;
            margin-left: auto; /* Push to right in flex context */
        }

        @media (max-width: 480px) {
            .payment-modal-content {
                max-width: 280px;
                padding: 15px;
            }
            
            .payment-input-row {
                flex-direction: column;
                gap: 8px;
            }
            
            .payment-button-row {
                flex-direction: column;
                gap: 8px;
            }

            .premium-notice {
                font-size: 0.65em;
                padding: 3px 6px;
            }

            .premium-notice1 {
                font-size: 12px;
                padding: 3px 6px;
            }

            .section1-header {
                padding: 2px;
                font-size: 11px;
            }
            
            .section1-header h2 {
                gap: 3px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Setup payment modal functionality with proper event handling
 */
function setupPaymentModalFunctionality(modal) {
    // Function to open payment modal
    window.openPaymentModal = function() {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        addPaymentModalEventListeners(modal);
        console.log('Payment modal opened');
    };

    // Function to close payment modal
    window.closePaymentModal = function() {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        removePaymentModalEventListeners(modal);
        console.log('Payment modal closed');
    };
}

/**
 * Add event listeners for the payment modal
 */
function addPaymentModalEventListeners(modal) {
    // Close modal on Escape key
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            window.closePaymentModal();
        }
    }

    // Close modal when clicking outside
    function handleClickOutside(event) {
        if (event.target === modal) {
            window.closePaymentModal();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // Store references for cleanup
    modal._keyDownHandler = handleKeyDown;
    modal._clickOutsideHandler = handleClickOutside;
}

/**
 * Remove event listeners for the payment modal
 */
function removePaymentModalEventListeners(modal) {
    if (modal._keyDownHandler) {
        document.removeEventListener('keydown', modal._keyDownHandler);
        modal._keyDownHandler = null;
    }
    if (modal._clickOutsideHandler) {
        document.removeEventListener('click', modal._clickOutsideHandler);
        modal._clickOutsideHandler = null;
    }
}


// --- PREMIUM ACCESS LOGIC ---
function enablePremiumFeatures() {
    const auth = localStorage.getItem('authenticated');
    console.log('[Premium][Debug] localStorage.authenticated =', auth);
    const premiumElements = document.querySelectorAll('.premium-blur');
    console.log('[Premium][Debug] Found', premiumElements.length, 'elements with .premium-blur:', premiumElements);
    if (auth === 'paid') {
        premiumElements.forEach(el => {
            console.log('[Premium][Debug] Unblurring element:', el);
            el.classList.remove('premium-blur');
            el.style.pointerEvents = '';
            el.style.filter = '';
            el.style.color = '';
        });
        // Optionally, enable any disabled buttons/inputs inside premium sections
        document.querySelectorAll('[data-premium-disabled]')?.forEach(el => {
            el.removeAttribute('disabled');
        });
        // Log after unblurring
        const stillBlurred = document.querySelectorAll('.premium-blur');
        console.log('[Premium][Debug] After unblur, still blurred:', stillBlurred.length, stillBlurred);
        console.log('[Premium] Premium features enabled for paid user.');
    } else {
        console.log('[Premium][Debug] User is not paid, premium features remain blurred.');
    }
}
// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enablePremiumFeatures);
} else {
    enablePremiumFeatures();
}

// Throttled observer to prevent infinite loops
let premiumCheckTimeout = null;
function throttledPremiumCheck() {
    if (premiumCheckTimeout) return; // Already scheduled
    premiumCheckTimeout = setTimeout(() => {
        enablePremiumFeatures();
        premiumCheckTimeout = null;
    }, 250); // Only run once every 250ms
}

// Observe DOM for dynamically added premium-blur elements
const observer = new MutationObserver(throttledPremiumCheck);
observer.observe(document.body, { childList: true, subtree: true });
// Expose for other scripts
window.enablePremiumFeatures = enablePremiumFeatures;
// After successful payment, set localStorage and call enablePremiumFeatures
// ...existing code...

// ===== PAYMENT PROCESSING (Combined from payment.js) =====

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

// Combined payment initialization function
async function initializePaymentProcessing() {
    console.log("initializePaymentProcessing called");

    try {
        // Wait for Stripe to load
        await waitForStripe();

        // Payment endpoint and configuration
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

        // Add both form submit AND button click listeners for better debugging
        
        // Form submit listener (traditional way)
        payForm.addEventListener("submit", async (e) => {
            console.log("Form submit event triggered");
            await handlePaymentSubmission(e, stripe, paymentEndpoint);
        });

        // Button click listener (backup way)
        const payButton = document.querySelector("#pay-button");
        if (payButton) {
            payButton.addEventListener("click", async (e) => {
                console.log("Pay button clicked directly");
                e.preventDefault(); // Prevent any default behavior
                
                // Manually trigger form submission by creating a fake submit event
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                payForm.dispatchEvent(submitEvent);
            });
            console.log("Pay button click listener added");
        }

    } catch (error) {
        console.error("Error initializing payment processing:", error);
    }
}

// Handle payment submission (extracted from payment.js)
async function handlePaymentSubmission(e, stripe, paymentEndpoint) {
    e.preventDefault();
    console.log("Processing payment submission");

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
            mode: "cors",
            credentials: "omit",
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
        
        // User-friendly error messages
        if (error.name === 'AbortError') {
            payStatus.innerHTML = "Request timed out. Please try again later.";
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            payStatus.innerHTML = "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes('CORS')) {
            payStatus.innerHTML = "Connection blocked by browser security. Please contact support.";
        } else {
            payStatus.innerHTML = "Unable to connect. Please try again or contact support.";
        }
        
        nameInput.disabled = false;
        emailInput.disabled = false;
        payButton.disabled = false;
    }
}