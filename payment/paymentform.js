// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Import sanitizeErrorMessage function
    const { sanitizeErrorMessage } = await import('../utility/inputValidation.js');
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
                
                <div class="subscription-tiers">
                    <div class="tier-option" data-price-id="price_1R9egSILSdrwu9bgkFhjxXMs">
                        <input type="radio" name="subscription-tier" value="price_1R9egSILSdrwu9bgkFhjxXMs" id="tier-basic" checked>
                        <label for="tier-basic" class="tier-label">
                            <div class="tier-name">Basic Plan</div>
                            <div class="tier-price">$2.99</div>
                            <div class="tier-features">• All AI tools • Basic support</div>
                        </label>
                    </div>
                    <div class="tier-option" data-price-id="price_1RhZYOILSdrwu9bgJ25yhEov">
                        <input type="radio" name="subscription-tier" value="price_1RhZYOILSdrwu9bgJ25yhEov" id="tier-monthly">
                        <label for="tier-monthly" class="tier-label">
                            <div class="tier-name">Monthly Plan</div>
                            <div class="tier-price">$4.99/month</div>
                            <div class="tier-features">• All AI tools • Monthly billing</div>
                        </label>
                    </div>
                    <div class="tier-option" data-price-id="price_1R9egnILSdrwu9bgKFghOlih">
                        <input type="radio" name="subscription-tier" value="price_1R9egnILSdrwu9bgKFghOlih" id="tier-premium">
                        <label for="tier-premium" class="tier-label">
                            <div class="tier-name">Premium Plan</div>
                            <div class="tier-price">$29.99/year</div>
                            <div class="tier-features">• All AI tools • Priority support • Advanced features</div>
                        </label>
                    </div>
                </div>
                
                <button class="payment-pay-button" id="pay-button" type="button">Subscribe Now</button>
                <div class="payment-button-row">
                    <button class="payment-support-link recovery-button" id="recovery-button" type="button">I have paid</button>
                    <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="payment-support-link">Customer Portal</a>
                </div>
                <div id="recovery-form" class="recovery-form" style="display: none;">
                    <input type="email" class="payment-input recovery-input" id="recovery-email" placeholder="Recovery Email" required>
                    <button class="payment-recover-button" id="recover-button" type="button">Recover Access</button>
                    <button class="payment-cancel-button" id="cancel-recovery" type="button">Cancel</button>
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

        // Rate limit status will be set by backend after payment completion
        // No need to create hardcoded frontend values

        console.log('Payment form and processing initialized');
    }

    // Load and initialize legal modal
    if (!window.openLegalModal) {
        try {
            // Dynamically import the legal module
            const legalModule = await import('/utility/legal.js');
            console.log('[PaymentForm] Legal module loaded successfully');
        } catch (error) {
            console.error('[PaymentForm] Failed to load legal module:', error);
            // Fallback function if legal.js fails to load
            window.openLegalModal = function() {
                alert('Terms of Service functionality is temporarily unavailable. Please try again later.');
            };
        }
    }

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
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            font-family: "Inter", sans-serif;
            padding: 30px;
            overflow-y: auto;
        }
        
        .payment-modal-content {
            background-color: rgba(242, 249, 243, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(74, 124, 89, 0.12), 0 4px 16px rgba(74, 124, 89, 0.08), 0 1px 4px rgba(74, 124, 89, 0.04);
            max-width: 300px;
            width: 90%;
            text-align: center;
            font-family: "Inter", sans-serif;
            transform: scale(0.95);
            transition: all 0.3s ease;
        }
        
        .payment-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            text-align: left;
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
            background: rgba(45, 90, 61, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 14px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
        }
        
        .payment-pay-button:hover {
            background: rgba(74, 124, 89, 0.95);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
        }
        
        .payment-pay-button:active {
            transform: translate(0, 0);
            box-shadow: 2px 2px 0 #000;
        }
        
        .payment-button-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .payment-support-link {
            width: 100%;
            padding: 12px 20px;
            background: rgba(45, 90, 61, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            font-size: 12px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
            box-sizing: border-box;
        }
        
        .payment-support-link:hover {
            background: rgba(74, 124, 89, 0.95);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
            text-decoration: none;
            color: #fff;
        }
        
        .payment-support-link:active {
            transform: translate(0, 0);
            box-shadow: 2px 2px 0 #000;
        }
        
        .payment-terms-button {
            background: rgba(45, 90, 61, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 8px 16px;
            font-family: "Inter", sans-serif;
            font-size: 0.85rem;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-top: 8px;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
        }
        
        .payment-terms-button:hover {
            background: rgba(74, 124, 89, 0.95);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
        }
        
        .payment-terms-button:active {
            transform: translate(0, 0);
            box-shadow: 2px 2px 0 #000;
        }
        
        /* Recovery Form Styles */
        .recovery-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
            padding: 15px;
            background-color: rgba(242, 249, 243, 0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(74, 124, 89, 0.08);
        }
        
        .payment-recover-button {
            background: rgba(45, 90, 61, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
            box-sizing: border-box;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
        }
        
        .payment-recover-button:hover {
            background: rgba(74, 124, 89, 0.95);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
        }
        
        .payment-recover-button:disabled {
            background: rgba(178, 178, 178, 0.7);
            cursor: not-allowed;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: none;
            transform: none;
        }
        
        .payment-recover-button:active {
            transform: translate(0, 0);
            box-shadow: 2px 2px 0 #000;
        }
        
        .payment-cancel-button {
            background: rgba(45, 90, 61, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 13px;
            cursor: pointer;
            font-family: 'Geist', sans-serif;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 100%;
            box-sizing: border-box;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
        }
        
        .payment-cancel-button:hover {
            background: rgba(74, 124, 89, 0.95);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
        }
        
        .payment-cancel-button:active {
            transform: translate(0, 0);
            box-shadow: 2px 2px 0 #000;
        }
        
        .recovery-input {
            flex: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }
        
        .recovery-button {
            background: rgba(45, 90, 61, 0.9) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            color: #fff !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 12px !important;
            font-weight: bold !important;
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15) !important;
            text-decoration: none !important;
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
        
        /* Subscription Tier Styles */
        .subscription-tiers {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .tier-option {
            position: relative;
            border: 2px solid transparent;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .tier-option:hover {
            border-color: rgba(45, 90, 61, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(45, 90, 61, 0.1);
        }
        
        .tier-option input[type="radio"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
        }
        
        .tier-option input[type="radio"]:checked + .tier-label {
            border-color: #2d5a3d;
            background: rgba(45, 90, 61, 0.05);
        }
        
        .tier-option input[type="radio"]:checked + .tier-label:before {
            content: '✓';
            position: absolute;
            top: 12px;
            right: 12px;
            width: 20px;
            height: 20px;
            background: #2d5a3d;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .tier-label {
            display: block;
            padding: 16px;
            border: 2px solid rgba(45, 90, 61, 0.2);
            border-radius: 12px;
            background: transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            text-align: left;
        }
        
        .tier-name {
            font-size: 1rem;
            font-weight: 600;
            color: #2d5a3d;
            margin-bottom: 4px;
            font-family: "Geist", sans-serif;
        }
        
        .tier-price {
            font-size: 1.1rem;
            font-weight: 700;
            color: #4a7c59;
            margin-bottom: 8px;
            font-family: "Geist", sans-serif;
        }
        
        .tier-features {
            font-size: 0.85rem;
            color: #666;
            line-height: 1.4;
            font-family: "Inter", sans-serif;
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
let premiumFeaturesEnabled = false;

function enablePremiumFeatures() {
    // Prevent repeated execution
    if (premiumFeaturesEnabled) return;
    
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
        premiumFeaturesEnabled = true;
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
// Only observe for new premium-blur elements if not already enabled
if (!window.premiumPaymentObserver && !premiumFeaturesEnabled) {
    window.premiumPaymentObserver = new MutationObserver((mutations) => {
        // Only check if new elements with premium-blur are added
        const hasNewPremiumElements = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeType === 1 && (
                    node.classList?.contains('premium-blur') || 
                    node.querySelector?.('.premium-blur')
                )
            )
        );
        if (hasNewPremiumElements && !premiumFeaturesEnabled) {
            enablePremiumFeatures();
        }
    });
    window.premiumPaymentObserver.observe(document.body, { childList: true, subtree: true });
}
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

        // Add recovery functionality event listeners
        const recoveryButton = document.querySelector("#recovery-button");
        const recoveryForm = document.querySelector("#recovery-form");
        const recoverButton = document.querySelector("#recover-button");
        const cancelRecoveryButton = document.querySelector("#cancel-recovery");
        const recoveryEmailInput = document.querySelector("#recovery-email");
        
        if (recoveryButton && recoveryForm) {
            recoveryButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Recovery button clicked");
                
                // Hide main form elements, show recovery form
                const mainFormElements = document.querySelectorAll("#username, #useremail, #pay-button, .payment-button-row, #terms-button");
                mainFormElements.forEach(el => el.style.display = "none");
                recoveryForm.style.display = "block";
            });
            
            console.log("Recovery button listener added");
        }
        
        if (recoverButton && recoveryEmailInput) {
            recoverButton.addEventListener("click", async function(e) {
                e.preventDefault();
                console.log("[PaymentForm] STAGE 3: Recover access button clicked - email-only recovery");
                
                const email = recoveryEmailInput.value.trim();
                const payStatus = document.querySelector("#status");
                
                if (!email) {
                    payStatus.innerHTML = "Please enter your email address";
                    return;
                }
                
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    payStatus.innerHTML = "Please enter a valid email address";
                    return;
                }
                
                payStatus.innerHTML = "Verifying email...";
                recoverButton.disabled = true;
                
                try {
                    // STAGE 3: Email-only recovery - no fingerprint dependency
                    console.log("[PaymentForm] STAGE 3: Attempting email-only recovery for:", email);
                    
                    // Call the email recovery endpoint
                    const paymentEndpoint = "https://stripeintegration.4hm7q4q75z.workers.dev/";
                    
                    const response = await fetch(paymentEndpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            task: "recoverByEmailOnly", // STAGE 3: New task for email-only recovery
                            email: email
                            // No fingerprint required for Stage 3
                        }),
                        mode: "cors"
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        console.log("[PaymentForm] STAGE 3: Email recovery successful", {
                            email: email,
                            tier: data.tier,
                            isPaid: data.isPaid,
                            crossDevice: data.crossDevice
                        });
                        
                        // Store authentication locally
                        localStorage.setItem("authenticated", encodeURIComponent("paid"));
                        localStorage.setItem("userEmail", encodeURIComponent(email));
                        
                        // STAGE 3: Generate new fingerprint for this device if needed
                        let currentFingerprint;
                        try {
                            const fingerprintData = localStorage.getItem("fingerprintData");
                            if (fingerprintData) {
                                currentFingerprint = JSON.parse(decodeURIComponent(fingerprintData));
                            } else {
                                // Generate new fingerprint for cross-device recovery
                                const { generateFingerprint } = await import('../utility/utils.js');
                                currentFingerprint = await generateFingerprint();
                                localStorage.setItem("fingerprintData", encodeURIComponent(JSON.stringify(currentFingerprint)));
                                console.log("[PaymentForm] STAGE 3: Generated new fingerprint for cross-device recovery");
                            }
                        } catch (fingerprintError) {
                            console.warn("[PaymentForm] STAGE 3: Fingerprint generation failed, continuing without:", fingerprintError);
                        }
                        
                        // STAGE 3: Update rate limit status with email-based lookup
                        try {
                            const rateLimitEndpoint = "https://ratelimit.4hm7q4q75z.workers.dev/";
                            const rateLimitResponse = await fetch(rateLimitEndpoint, {
                                method: "POST",
                                headers: { 
                                    "Content-Type": "application/json",
                                    "Accept": "application/json"
                                },
                                body: JSON.stringify({
                                    task: "checkPaymentAndLimits",
                                    fingerprint: currentFingerprint,
                                    email: email, // Email-first lookup
                                    module: "payment"
                                }),
                                mode: "cors"
                            });
                            
                            if (rateLimitResponse.ok) {
                                const rateLimitData = await rateLimitResponse.json();
                                
                                // Update rateLimitStatus in localStorage immediately
                                const rateLimitStatus = {
                                    allowed: rateLimitData.allowed,
                                    isPaid: rateLimitData.isPaid,
                                    limits: rateLimitData.limits,
                                    remaining: rateLimitData.remaining,
                                    email: rateLimitData.email,
                                    tier: rateLimitData.tier,
                                    lastUpdated: Date.now(),
                                    recoveredViaEmail: true // Track email recovery
                                };
                                
                                localStorage.setItem("rateLimitStatus", JSON.stringify(rateLimitStatus));
                                console.log("[PaymentForm] STAGE 3: Rate limit status updated after email recovery:", rateLimitStatus);
                                
                                // Enhanced success message with cross-device info
                                const limitsText = rateLimitData.isPaid ? `${rateLimitData.limits?.perDay || 'premium'} per day` : `${rateLimitData.remaining?.perDay || 0} remaining today`;
                                const crossDeviceText = data.crossDevice ? " (cross-device recovery)" : "";
                                payStatus.innerHTML = `Access recovered successfully${crossDeviceText}! You now have ${limitsText} generations. Redirecting...`;
                            } else {
                                console.warn("[PaymentForm] STAGE 3: Failed to refresh rate limit status after email recovery");
                                payStatus.innerHTML = "Access recovered successfully! Redirecting...";
                            }
                        } catch (rateLimitError) {
                            console.warn("[PaymentForm] STAGE 3: Error refreshing rate limit status:", rateLimitError);
                            payStatus.innerHTML = "Access recovered successfully! Redirecting...";
                        }
                        
                        // Close modal and redirect after delay
                        setTimeout(() => {
                            closePaymentModal();
                            // Reload to refresh premium features
                            window.location.reload();
                        }, 2000);
                        
                    } else {
                        console.log("[PaymentForm] STAGE 3: Email recovery failed:", data.error);
                        payStatus.innerHTML = sanitizeErrorMessage(data.error) || "Email verification failed. Please check your email or contact support.";
                    }
                    
                } catch (error) {
                    console.error("[PaymentForm] STAGE 3: Recovery error:", error);
                    payStatus.innerHTML = "Error occurred during recovery. Please try again or contact support.";
                } finally {
                    recoverButton.disabled = false;
                }
            });
            
            console.log("Recover access button listener added");
        }
        
        if (cancelRecoveryButton) {
            cancelRecoveryButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Cancel recovery clicked");
                
                // Show main form elements, hide recovery form
                const mainFormElements = document.querySelectorAll("#username, #useremail, #pay-button, .payment-button-row, #terms-button");
                mainFormElements.forEach(el => el.style.display = "");
                recoveryForm.style.display = "none";
                
                // Clear recovery email input
                if (recoveryEmailInput) {
                    recoveryEmailInput.value = "";
                }
                
                // Clear status
                const payStatus = document.querySelector("#status");
                if (payStatus) {
                    payStatus.innerHTML = "";
                }
            });
            
            console.log("Cancel recovery button listener added");
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

    // Get selected subscription tier
    const selectedTier = document.querySelector('input[name="subscription-tier"]:checked');
    const selectedPriceId = selectedTier ? selectedTier.value : 'default';
    console.log("Selected subscription tier:", selectedPriceId);

    const payload = { 
        task: "pay", 
        client_email: email, 
        client_name: name,
        price_id: selectedPriceId === 'default' ? null : selectedPriceId
    };
    console.log("Sending payload to Cloudflare Worker:", payload);

    try {
        console.log("Initiating fetch to:", paymentEndpoint);
        console.log("Current origin:", window.location.origin);
        console.log("Sending origin to backend for dynamic redirect URLs");
        
        // Validate origin before sending
        const currentOrigin = window.location.origin;
        if (!currentOrigin || !currentOrigin.startsWith('http')) {
            console.warn("Invalid origin detected, payment may fail:", currentOrigin);
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
                "Origin": currentOrigin // Dynamic origin for redirect URLs
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