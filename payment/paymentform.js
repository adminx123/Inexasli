// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `/* Subscribe Sidebar */
#subscribe-sidebar {
    position: fixed;
    bottom: 10px;
    right: 0;
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-right: none;
    border-radius: 8px 0 0 8px;
    box-shadow: -4px 4px 0 #000;
    z-index: 1000;
    width: 150px;
    transition: bottom 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
}

#subscribe-sidebar.initial {
    height: auto;
}

#subscribe-sidebar.expanded {
    height: auto;
    bottom: calc(100% + 10px);
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
    margin: 20px auto 0;
    max-width: 260px;
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 5px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #000000;
    font-family: "Inter", sans-serif;
}

#subscribe-sidebar.expanded .payment-form {
    display: flex;
}

.payment-form .payment-input {
    width: 100%;
    padding: 8px 8px;
    font-size: 12px;
    color: #000000;
    background: #f9f9f9;
    border: 2px solid #7b7b7b;
    border-radius: 6px;
    outline: none;
    font-family: "Inter", sans-serif;
}

.payment-form .pay-button {
    width: 100%;
    padding: 8px 8px;
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    background: #000000;
    border: 2px solid #D4AF37;
    border-radius: 6px;
    cursor: pointer;
    font-family: "Geist", sans-serif;
}

.payment-form .contact-support {
    font-size: 12px;
    color: rgb(0, 0, 0);
    text-decoration: none;
    font-family: "Geist", sans-serif;
}

/* Premium Section Styling */
.premium-blur {
    filter: blur(3px);
    color: #888;
    pointer-events: none;
    transition: filter 0.3s ease, color 0.3s ease;
    font-family: "Inter", sans-serif;
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
        width: 150px;
    }
    #subscribe-sidebar.initial {
        height: auto;
    }
    #subscribe-sidebar.expanded {
        height: auto;
    }
    .payment-form {
        max-width: 220px;
    }
    #subscribe-sidebar a.subscribe-link {
        font-size: 12px;
        padding: 8px 8px;
        font-family: "Geist", sans-serif;
    }
    .premium-notice {
        font-size: 0.65em;
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
            <a class="subscribe-link">SUBSCRIBE</a>
            <div id="status"></div>
            <form class="payment-form" id="payment-form">
                <input type="text" class="payment-input" id="username" placeholder="input your name" required>
                <input type="email" class="payment-input" id="useremail" placeholder="input your email" required>
                <button class="pay-button" id="pay-button">$2.99</button>
                <a href="mailto:support@inexasli.com" class="contact-support">I have paid</a>
                <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="contact-support" style="margin-bottom: 20px;">Customer portal</a>
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
                // Expand the sidebar upwards
                sidebarElement.classList.remove('initial');
                sidebarElement.classList.add('expanded');
                sidebarElement.dataset.state = 'expanded';
                closeButton.textContent = '-';

                const formHeight = paymentForm.scrollHeight;
                const viewportHeight = window.innerHeight;
                const bottomOffset = Math.min(viewportHeight - formHeight - 20, 10);
                sidebarElement.style.bottom = `${bottomOffset}px`;

                console.log('Sidebar expanded upwards');
            } else {
                // Collapse the sidebar
                sidebarElement.classList.remove('expanded');
                sidebarElement.classList.add('initial');
                sidebarElement.dataset.state = 'initial';
                closeButton.textContent = '+';
                sidebarElement.style.bottom = '10px';

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