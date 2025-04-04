// paymentform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        #subscribe-sidebar {
            position: fixed;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            background-color: #f5f5f5;
            padding: 10px;
            border: 2px solid #000;
            border-right: none;
            border-radius: 8px 0 0 8px;
            box-shadow: -4px 4px 0 #000;
            z-index: 1000;
            width: 300px;
            transition: height 0.3s ease-in-out;
            overflow: hidden;
        }

        #subscribe-sidebar.initial {
            height: auto; /* Increased to fit full text */
        }

        #subscribe-sidebar.expanded {
            height: auto; /* Adjust based on form height */
        }

        #subscribe-sidebar a.subscribe-link {
            text-decoration: none;
            color: #000;
            font-size: 14px;
            display: block;
            text-align: center;
            padding: 10px 20px;
            cursor: pointer;
            transition: color 0.2s ease;
            line-height: 1.2; /* Better text wrapping */
            max-height: 50px; /* Limits text height in initial state */
            overflow: hidden; /* Prevents text overflow */
        }

        #subscribe-sidebar a.subscribe-link:hover {
            color: #caa81f; /* Gold on hover */
        }

        #subscribe-sidebar #close-sidebar {
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 16px;
            color: #000;
            cursor: pointer;
            font-weight: bold;
            display: block; /* Always visible to show + or - */
        }

        .payment-form {
            margin: 20px auto 0;
            max-width: 260px;
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            padding: 20px;
            background: #ffffff;
            border: 2px solid #000000;
            border-radius: 10px;
            box-shadow: 4px 4px 0 #000000;
        }

        #subscribe-sidebar.expanded .payment-form {
            display: flex;
        }

        .payment-form .payment-input {
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            color: #000000;
            background: #f9f9f9;
            border: 2px solid #7b7b7b;
            border-radius: 6px;
            outline: none;
        }

        .payment-form .pay-button {
            width: 100%;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: bold;
            color: #ffffff;
            background: #000000;
            border: 2px solid #caa81f;
            border-radius: 6px;
            cursor: pointer;
        }

        .payment-form .contact-support {
            font-size: 12px;
            color: #000000;
            text-decoration: none;
        }

        @media (max-width: 480px) {
            #subscribe-sidebar {
                width: 250px;
            }
            #subscribe-sidebar.initial {
                height: 65px; /* Adjusted for smaller screens */
            }
            #subscribe-sidebar.expanded {
                height: 380px;
            }
            .payment-form {
                max-width: 220px;
            }
            #subscribe-sidebar a.subscribe-link {
                font-size: 12px;
                padding: 8px 15px;
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
            <a class="subscribe-link">SUBSCRIBE HERE TO UNLOCK PREMIUM CONTENT 💳</a>
            <form class="payment-form" id="payment-form">
                <input type="text" class="payment-input" id="username" placeholder="input your name" required>
                <input type="email" class="payment-input" id="useremail" placeholder="input your email" required>
                <div id="status"></div>
                <button class="pay-button" id="pay-button">Subscribe for Premium Educational Insights!</button>
                <a href="mailto:support@inexasli.com" class="contact-support">I have paid</a>
                <a href="https://billing.stripe.com/p/login/3cs2a0d905QE71mbII" class="contact-support" style="margin-bottom: 20px;">Customer portal</a>
            </form>
        `;
        document.body.appendChild(sidebar);

        console.log('Payment form injected');

        // Set up sidebar functionality after the DOM is updated
        const closeButton = document.getElementById('close-sidebar');
        const subscribeLink = document.querySelector('#subscribe-sidebar a.subscribe-link');
        const sidebarElement = document.getElementById('subscribe-sidebar');

        console.log('Sidebar:', sidebarElement);
        console.log('Subscribe Link:', subscribeLink);
        console.log('Close Button:', closeButton);
        console.log('Initial State:', sidebarElement.dataset.state);

        // Function to toggle the sidebar state
        const toggleSidebar = () => {
            if (sidebarElement.dataset.state === 'initial') {
                // Expand the sidebar
                sidebarElement.classList.remove('initial');
                sidebarElement.classList.add('expanded');
                sidebarElement.dataset.state = 'expanded';
                closeButton.textContent = '-'; // Change to minus when expanded
                console.log('Sidebar expanded downward');
            } else {
                // Collapse the sidebar
                sidebarElement.classList.remove('expanded');
                sidebarElement.classList.add('initial');
                sidebarElement.dataset.state = 'initial';
                closeButton.textContent = '+'; // Change to plus when collapsed
                console.log('Sidebar returned to initial state');
            }
        };

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

        // Import and initialize payment.js
        try {
            const { initializePayment } = await import('./payment.js');
            initializePayment();
            console.log('payment.js initialized');
        } catch (error) {
            console.error('Failed to import and initialize payment.js:', error);
        }
    }
});