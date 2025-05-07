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
    padding: 8px;
    border: 2px solid #000;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 0 #000;
    z-index: 10001;
    width: 400px;
    transition: top 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
}


#subscribe-sidebar.initial {
    height: auto;
}

#subscribe-sidebar.expanded {
    height: auto;
    top: 0;
}

#subscribe-sidebar a.subscribe-link {
    text-decoration: none;
    color: #000;
    font-size: 12px;
    display: block;
    text-align: center;
    padding: 8px 8px;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    max-height: auto;
    overflow: hidden;
    font-family: "Geist", sans-serif;
}

#subscribe-sidebar:hover {
    background-color: #D4AF37;
}

#subscribe-sidebar #close-sidebar {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 18px;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    display: block;
    font-family: "Inter", sans-serif;
}

.payment-form {
    margin: 10px auto 0;
    max-width: 380px;
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 5px; /* Minimal gap between rows */
    padding: 10px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #000000;
    font-family: "Inter", sans-serif;
}

#subscribe-sidebar.expanded .payment-form {
    display: flex;
}

/* Create a row container for inputs and buttons that should be side by side */
.form-row {
    display: flex;
    width: 100%;
    gap: 4px; /* Very tight gap between items in a row */
}

.payment-form .payment-input {
    flex: 1; /* Share available space equally */
    padding: 8px;
    font-size: 12px;
    color: #000000;
    background: #f9f9f9;
    border: 2px solid #7b7b7b;
    border-radius: 6px;
    outline: none;
    font-family: "Inter", sans-serif;
    margin: 0; /* No margin on inputs */
}

.payment-form .pay-button {
    width: 100%;
    padding: 8px;
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    background: #000000;
    border: 2px solid #D4AF37;
    border-radius: 6px;
    cursor: pointer;
    font-family: "Geist", sans-serif;
    margin: 2px 0; /* Very small vertical margin */
}

.payment-form .contact-support {
    flex: 1; /* Share available space equally */
    padding: 8px;
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    background: #000000;
    border: 2px solid #D4AF37;
    border-radius: 6px;
    cursor: pointer;
    font-family: "Geist", sans-serif;
    text-align: center;
    margin: 0; /* No margin on buttons */
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

/* Responsive Design */
@media (max-width: 480px) {
    #subscribe-sidebar {
        width: 300px;
    }
    #subscribe-sidebar.initial {
        height: auto;
    }
    #subscribe-sidebar.expanded {
        height: auto;
    }
    .payment-form {
        max-width: 280px;
    }
    #subscribe-sidebar a.subscribe-link {
        font-size: 12px;
        padding: 3px;
        font-family: "Geist", sans-serif;
    }

.premium-notice {
    padding: 4px 8px;
    background-color:rgb(0, 0, 0);
    color: #D4AF37;
    font-size: 0.75em;
    border-radius: 2px;
    font-weight: bold;
    font-family: "Geist", sans-serif;
    margin-left: auto; /* Push to right in flex context */
}



    .premium-notice {
        font-size: 0.65em;
        padding: 3px 6px;


    }


.premium-notice1 {
    padding: 4px 8px;
    background-color:rgb(0, 0, 0);
    color: #D4AF37;
    font-size: 0.75em;
    border-radius: 2px;
    font-weight: bold;
    font-family: "Geist", sans-serif;
    margin-left: auto; /* Push to right in flex context */
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
    
    /* On very small screens, stack all elements */
    @media (max-width: 320px) {
        .form-row {
            flex-direction: column;
            gap: 3px;
        }
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
                <div class="form-row">
                    <input type="text" class="payment-input" id="username" placeholder="input your name" required>
                    <input type="email" class="payment-input" id="useremail" placeholder="input your email" required>
                </div>
                <button class="pay-button" id="pay-button">$2.99</button>
                <div class="form-row">
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