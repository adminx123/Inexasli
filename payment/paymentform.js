// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Import modal system
    await import('../utility/modal.js');
    
    // Create payment corner button - this is now the primary payment interface
    createPaymentCornerButton();
    
    // Inject CSS styles for payment interface
    const style = document.createElement('style');
    style.textContent = `
/* Payment Modal Styles */
#payment-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #f5f5f5;
    padding: 15px;
    border: 2px solid #000;
    border-radius: 8px;
    box-shadow: 4px 4px 0 #000;
    z-index: 15000;
    width: 400px;
    font-family: "Inter", sans-serif;
    display: none;
    max-width: 90vw;
}

#payment-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

#payment-modal-title {
    font-weight: bold;
    font-size: 16px;
    font-family: "Geist", sans-serif;
}

#close-payment-modal {
    font-size: 18px;
    cursor: pointer;
    font-weight: bold;
}

#payment-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 14000;
    display: none;
}

/* Payment form styling */
.payment-form {
    width: 100%;
    padding: 5px 0;
    font-family: "Inter", sans-serif;
}

/* Name and email row */
.payment-form .input-row {
    display: flex;
    gap: 5px;
    margin-bottom: 10px;
}

.payment-form .payment-input {
    flex: 1;
    padding: 8px !important;
    font-size: 12px !important;
    color: #000 !important;
    background: #f9f9f9 !important;
    border: 2px solid #7b7b7b !important;
    border-radius: 6px !important;
    outline: none !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    font-family: "Inter", sans-serif !important;
    line-height: 1.2 !important;
    height: 36px !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    margin: 0 !important;
    vertical-align: baseline !important;
}

.payment-form input[type="text"].payment-input,
.payment-form input[type="email"].payment-input {
    flex: 1 !important;
    padding: 8px !important;
    font-size: 12px !important;
    font-family: "Inter", sans-serif !important;
    line-height: 1.2 !important;
    border: 2px solid #7b7b7b !important;
    background: #f9f9f9 !important;
    color: #000 !important;
    height: 36px !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    border-radius: 6px !important;
    outline: none !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    vertical-align: baseline !important;
}

/* Pay button row */
.payment-form .pay-button {
    display: block;
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    font-size: 14px;
    font-weight: bold;
    color: #000 !important;
    background: #fff !important;
    border: 2px solid #000 !important;
    border-radius: 6px;
    box-shadow: 4px 4px 0 #000 !important;
    cursor: pointer;
    font-family: "Geist", sans-serif;
    position: relative !important; /* Add positioning context */
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.payment-form .pay-button:hover {
    background-color: #f5f5f5 !important;
}

.payment-form .pay-button:active {
    transform: translate(2px, 2px) !important;
    box-shadow: 2px 2px 0 #000 !important;
}

/* Bottom buttons row */
.payment-form .button-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    Margin-top: 55px;
}

.payment-form .contact-support {
    flex: 1;
    padding: 8px;
    font-size: 11px;
    font-weight: bold;
    color: #000 !important;
    background: #fff !important;
    border: 2px solid #000 !important;
    border-radius: 6px;
    box-shadow: 4px 4px 0 #000 !important;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    font-family: "Geist", sans-serif;
    position: relative !important; /* Add positioning context */
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    min-width: 0; /* Allow flex items to shrink */
    display: flex;
    align-items: center;
    justify-content: center;
}
}

.payment-form .contact-support:hover {
    background-color: #f5f5f5 !important;
    color: #000 !important;
    text-decoration: none !important;
}

.payment-form .contact-support:active {
    transform: translate(2px, 2px) !important;
    box-shadow: 2px 2px 0 #000 !important;
}

/* Responsive adjustments */
@media (max-width: 480px) {
    #payment-modal {
        width: 90%;
        max-width: 300px;
        padding: 12px;
    }
    
    .payment-form {
        max-width: 100%;
    }
    
    .payment-form .input-row {
        flex-direction: column;
    }
    
    .payment-form .payment-input,
    .payment-form .contact-support {
        width: 100%;
        margin: 3px 0;
    }
    
    .payment-form .button-row {
        flex-direction: column;
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

    // Create modal HTML for payment form
    if (!document.getElementById('payment-modal')) {
        // Create overlay for modal
        const overlay = document.createElement('div');
        overlay.id = 'payment-modal-overlay';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'payment-modal';
        modal.innerHTML = `
            <div id="payment-modal-header">
                <div id="payment-modal-title">Premium Features</div>
                <div id="close-payment-modal">×</div>
            </div>
            <div id="status"></div>
            <form class="payment-form" id="payment-form">
                <div class="input-row">
                    <input type="text" class="payment-input" id="username" placeholder="Input your name" required>
                    <input type="email" class="payment-input" id="useremail" placeholder="Input your email" required>
                </div>
                <button class="pay-button" id="pay-button">Subscribe - $2.99</button>
                <div class="button-row">
                    <a href="mailto:support@inexasli.com" class="contact-support">I have paid</a>
                    <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="contact-support">Customer Portal</a>
                </div>
                <button id="terms-button" class="contact-support">Terms of Service</button>
             
            </form>
        `;
        
        // Add overlay and modal to the document
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        console.log('Payment modal created');

        // Set up modal close functionality
        const closeButton = document.getElementById('close-payment-modal');
        const modalElement = document.getElementById('payment-modal');
        const overlayElement = document.getElementById('payment-modal-overlay');

        // Function to open payment modal
        window.openPaymentModal = function() {
            modalElement.style.display = 'block';
            overlayElement.style.display = 'block';
            console.log('Payment modal opened');
        };

        // Function to close payment modal
        window.closePaymentModal = function() {
            modalElement.style.display = 'none';
            overlayElement.style.display = 'none';
            console.log('Payment modal closed');
        };

        // Click handler for close button
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.closePaymentModal();
            });
        } else {
            console.error('Close button not found');
        }

        // Close modal when clicking on overlay
        overlayElement.addEventListener('click', function(e) {
            if (e.target === overlayElement) {
                window.closePaymentModal();
            }
        });

        // Import and initialize payment.js
        try {
            const { initializePayment } = await import('./payment.js');
            initializePayment();
            console.log('payment.js initialized');
        } catch (error) {
            console.error('Failed to import and initialize payment.js:', error);
        }
    }

    // Create legal modal function using the modal system
    window.openLegalModal = async function() {
        try {
            // Close payment modal if it's open
            if (typeof window.closePaymentModal === 'function') {
                window.closePaymentModal();
            }
            
            // Fetch legal.txt content
            const response = await fetch('/legal.txt');
            const legalText = await response.text();
            
            // Create modal using the .js system
            const modal = document.querySelector('.modal') || createModal();
            const modalContent = modal.querySelector('.modal-content');
            
            // Clear existing content and add legal content
            modalContent.innerHTML = `
                <div style="width: 100%; height: 100%; overflow-y: auto; font-family: 'Inter', sans-serif;">
                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000;">
                        <h2 style="color: #333; font-size: 24px; margin: 0; font-family: 'Geist', sans-serif; text-align: center;">Terms of Service</h2>
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #333; height: calc(100% - 80px); overflow-y: auto;">${legalText}</div>
                </div>
            `;
            
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            
            // Add custom click-outside handler specifically for legal modal
            const clickOutsideHandler = (event) => {
                // Check if the click is on the modal background (not on modal-content)
                if (event.target === modal) {
                    window.closeModal();
                    // Remove our custom handler
                    modal.removeEventListener('click', clickOutsideHandler);
                }
            };
            
            // Add click listener to the modal itself
            modal.addEventListener('click', clickOutsideHandler);
            
            console.log('Legal modal opened using modal.js system');
        } catch (error) {
            console.error('Failed to load legal content:', error);
            alert('Failed to load Terms of Service. Please try again.');
        }
    };

    // Helper function to create modal if it doesn't exist (from modal.js)
    function createModal() {
        let modal = document.querySelector('.modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal';
            const content = document.createElement('div');
            content.className = 'modal-content';
            modal.appendChild(content);
            document.body.appendChild(modal);
        }
        return modal;
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
 * Create and display a floating button tucked into the top right corner of the screen
 * that triggers payment functionality when clicked
 */
function createPaymentCornerButton() {
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
    
    // Apply 3D tab styling - matching dataOverwrite button
    button.style.backgroundColor = 'transparent';
    button.style.color = '#000';
    button.style.border = 'none';
    button.style.borderRadius = '0';
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
    
    // Add hover effect matching the tab style
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = '#FFFFFF';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#f5f5f5';
    });
    
    // Add active/click effect
    button.addEventListener('mousedown', function() {
        button.style.transform = 'translate(-2px, 2px)';
        button.style.boxShadow = '-2px 2px 0 #000';
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'translate(0, 0)';
        button.style.boxShadow = '-4px 4px 0 #000';
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