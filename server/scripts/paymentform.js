// paymentform.js
document.addEventListener('DOMContentLoaded', function() {
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
            height: 70px; /* Increased to fit full text */
        }

        #subscribe-sidebar.expanded {
            height: 400px; /* Adjust based on form height */
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
            display: none;
        }

        #subscribe-sidebar.expanded #close-sidebar {
            display: block;
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
            <span id="close-sidebar">X</span>
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
    }

    // Sidebar functionality
    const sidebar = document.getElementById('subscribe-sidebar');
    const closeButton = document.getElementById('close-sidebar');
    const subscribeLink = document.querySelector('#subscribe-sidebar a.subscribe-link');

    console.log('Sidebar:', sidebar);
    console.log('Subscribe Link:', subscribeLink);
    console.log('Close Button:', closeButton);
    console.log('Initial State:', sidebar.dataset.state);

    if (subscribeLink) {
        subscribeLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Subscribe link clicked. Current state:', sidebar.dataset.state);
            if (sidebar.dataset.state === 'initial') {
                sidebar.classList.remove('initial');
                sidebar.classList.add('expanded');
                sidebar.dataset.state = 'expanded';
                console.log('Sidebar expanded downward');
            }
        });
    } else {
        console.error('Subscribe link not found');
    }

    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Close button clicked. Current state:', sidebar.dataset.state);
            if (sidebar.dataset.state === 'expanded') {
                sidebar.classList.remove('expanded');
                sidebar.classList.add('initial');
                sidebar.dataset.state = 'initial';
                console.log('Sidebar returned to initial state');
            }
        });
    } else {
        console.error('Close button not found');
    }
});