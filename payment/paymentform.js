// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Skip external button creation - now integrated into datain.js
    console.log('[PaymentForm] Button creation skipped - integrated into datain.js');
    // createPaymentCornerButton();

    // Create modal HTML for payment form using self-contained modal system
    if (!document.getElementById('payment-modal')) {
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

        // Set up modal functionality
        setupPaymentModalFunctionality(modal);

        // Import and initialize payment.js
        try {
            const { initializePayment } = await import('./payment.js');
            initializePayment();
            console.log('payment.js initialized');
        } catch (error) {
            console.error('Failed to import and initialize payment.js:', error);
        }
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

/**
 * Create and display a floating button tucked into the top right corner of the screen
 * that triggers payment functionality when clicked
 */
function createPaymentCornerButton() {
    // Button is now integrated into datain.js - skip external creation
    console.log('[PaymentForm] Button creation skipped - integrated into datain.js');
    return;
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '0'; // Position at the very top
    buttonContainer.style.right = '0'; // Position at the very right
    buttonContainer.style.transform = 'none';
    buttonContainer.style.zIndex = '12000'; // Higher z-index than dataout tab (11000) when expanded
    buttonContainer.style.padding = '0'; // Remove any padding
    buttonContainer.style.margin = '0'; // Remove any margin
    buttonContainer.style.display = 'block'; // Use block instead of flex
    
    // Create the button with the 3D tab styling
    const button = document.createElement('button');
    button.id = 'paymentButton';
    button.title = 'Premium Features'; // Add title for accessibility
    
    // Apply styling - no borders, just icon
    button.style.backgroundColor = 'transparent';
    button.style.color = '#000';
    button.style.border = 'none';
    button.style.boxShadow = 'none';
    button.style.padding = '0'; // Reduced padding
    button.style.width = '36px'; // Match dataOverwrite button
    button.style.height = '36px'; // Match dataOverwrite button
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.cursor = 'pointer';
    button.style.margin = '0'; // Remove any margin
    button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
    button.style.position = 'relative'; // Add position relative
    button.style.top = '0'; // Ensure it's at the very top
    button.style.right = '0'; // Ensure it's at the very right
    
    // Create the $ symbol
    const icon = document.createElement('span');
    icon.textContent = '$';
    icon.style.fontSize = '18px'; // Match dataOverwrite icon size
    icon.style.fontWeight = 'bold';
    button.appendChild(icon);
    
    // Add hover effect
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#FFFFFF';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = 'transparent';
    });
    
    // Add active/click effect
    button.addEventListener('mousedown', function() {
        button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'scale(1)';
    });
    
    // Add click event to open payment modal
    button.addEventListener('click', function() {
        if (typeof window.openPaymentModal === 'function') {
            window.openPaymentModal();
        } else {
            console.error('Payment modal function not found');
        }
    });
    
    // Add media query for mobile devices
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const adjustForMobile = (query) => {
        if (query.matches) { // If media query matches (mobile)
            button.style.width = '28px'; // Match mobile tab width
            button.style.height = '28px'; // Match mobile tab height
            icon.style.fontSize = '14px'; // Smaller icon for mobile
        } else {
            button.style.width = '36px'; // Desktop size
            button.style.height = '36px'; // Desktop size
            icon.style.fontSize = '18px'; // Desktop icon size
        }
    };
    
    // Initial check
    adjustForMobile(mobileQuery);
    
    // Listen for changes (like rotation)
    mobileQuery.addListener(adjustForMobile);
    
    // Append button to container, and container to body
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    return buttonContainer;
}