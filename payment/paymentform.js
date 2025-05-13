// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `/* Subscribe Sidebar */
#subscribe-sidebar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f5f5f5;
    padding: 4px;
    border: 2px solid #000;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 0 #000;
    z-index: 10001;
    width: 400px;
    max-height: 36px; /* Match the same proportion as other tabs */
    transition: max-height 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
}

#subscribe-sidebar.initial {
    max-height: 36px; /* Fixed collapsed height to match other tabs */
}

#subscribe-sidebar.expanded {
    max-height: none; /* Allow full height when expanded */
    height: auto;
    top: 0;
}

#subscribe-sidebar a.subscribe-link {
    text-decoration: none;
    color: #000;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 4px;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    height: 100%;
    font-family: "Geist", sans-serif;
}

#subscribe-sidebar:hover {
    background-color:rgb(226, 226, 226);
}

#subscribe-sidebar #close-sidebar {
    position: absolute;
    top: 4px;
    right: 8px;
    font-size: 14px;
    line-height: 1;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    font-family: "Inter", sans-serif;
}

/* Payment form styling - much cleaner now */
.payment-form {
    display: none;
    width: 100%;
    padding: 10px 0 5px 0;
    font-family: "Inter", sans-serif;
}

#subscribe-sidebar.expanded .payment-form {
    display: block;
}

/* Name and email row */
.payment-form .input-row {
    display: flex;
    gap: 5px;
    margin-bottom: 5px;
}

.payment-form .payment-input {
    flex: 1;
    padding: 8px;
    font-size: 12px;
    color: #000;
    background: #f9f9f9;
    border: 2px solid #7b7b7b;
    border-radius: 6px;
    outline: none;
}

/* Pay button row */
.payment-form .pay-button {
    display: block;
    width: 100%;
    padding: 8px;
    margin: 5px 0;
    font-size: 12px;
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
    gap: 5px;
}

.payment-form .contact-support {
    flex: 1;
    padding: 8px;
    font-size: 12px;
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
    #subscribe-sidebar {
        width: 300px;
        max-height: 28px; /* Match mobile tab height */
    }
    
    #subscribe-sidebar.initial {
        max-height: 28px; /* Match mobile tab height */
    }
    
    #subscribe-sidebar.expanded {
        max-height: none; /* Allow full expansion */
        height: auto;
    }
    
    .payment-form {
        max-width: 280px;
    }
    
    .payment-form .payment-input,
    .payment-form .contact-support {
        width: 100%; /* Stack vertically on small screens */
        margin: 3px 0;
    }
    
    #subscribe-sidebar a.subscribe-link {
        font-size: 10px;
        padding: 3px;
        font-family: "Geist", sans-serif;
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

    // Create sidebar HTML
    if (!document.getElementById('subscribe-sidebar')) {
        const sidebar = document.createElement('div');
        sidebar.id = 'subscribe-sidebar';
        sidebar.classList.add('initial');
        sidebar.dataset.state = 'initial';
        sidebar.innerHTML = `
            <span id="close-sidebar">+</span>
            <a class="subscribe-link">Premium</a>
            <div id="status"></div>
            <form class="payment-form" id="payment-form">
                <div class="input-row">
                    <input type="text" class="payment-input" id="username" placeholder="input your name" required>
                    <input type="email" class="payment-input" id="useremail" placeholder="input your email" required>
                </div>
                <button class="pay-button" id="pay-button">$2.99</button>
                <div class="button-row">
                    <a href="mailto:support@inexasli.com" class="contact-support">I have paid</a>
                    <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="contact-support">Customer Portal</a>
                </div>
            </form>
        `;
        document.body.appendChild(sidebar);

        console.log('Payment form injected');

        // Set up sidebar functionality
        const closeButton = document.getElementById('close-sidebar');
        const subscribeLink = document.querySelector('#subscribe-sidebar a.subscribe-link');
        const sidebarElement = document.getElementById('subscribe-sidebar');

        console.log('Sidebar:', sidebarElement);
        console.log('Subscribe Link:', subscribeLink);
        console.log('Close Button:', closeButton);
        console.log('Initial State:', sidebarElement.dataset.state);

        // Function to toggle the sidebar state
        const toggleSidebar = () => {
            const paymentForm = document.querySelector('.payment-form');
            if (sidebarElement.dataset.state === 'initial') {
                sidebarElement.classList.remove('initial');
                sidebarElement.classList.add('expanded');
                sidebarElement.dataset.state = 'expanded';
                closeButton.textContent = '-';
        
                // No need for positioning logic since top is fixed
                console.log('Sidebar expanded downwards from top');
            } else {
                sidebarElement.classList.remove('expanded');
                sidebarElement.classList.add('initial');
                sidebarElement.dataset.state = 'initial';
                closeButton.textContent = '+';
        
                console.log('Sidebar returned to initial state');
            }
        };
        

        // Click handlers for subscribe link and close button
        if (subscribeLink) {
            subscribeLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Subscribe link clicked. Current state:', sidebarElement.dataset.state);
                toggleSidebar();
            });
        } else {
            console.error('Subscribe link not found');
        }

        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Close button clicked. Current state:', sidebarElement.dataset.state);
                toggleSidebar();
            });
        } else {
            console.error('Close button not found');
        }

        // New: Collapse sidebar when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideSidebar = sidebarElement.contains(e.target);
            if (!isClickInsideSidebar && sidebarElement.dataset.state === 'expanded') {
                console.log('Clicked outside sidebar, collapsing it');
                toggleSidebar();
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

    // Add functionality to toggle premium sections
    const premiumHeaders = document.querySelectorAll('.section1-header');

    premiumHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            section.classList.toggle('expanded');
        });
    });
});