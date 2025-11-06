// faq.js - FAQ and Tips Modal for INEXASLI

(function() {
    // Ensure BoxIcons is loaded
    if (!document.querySelector('link[href*="boxicons"]')) {
        const boxIconsLink = document.createElement('link');
        boxIconsLink.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
        boxIconsLink.rel = 'stylesheet';
        document.head.appendChild(boxIconsLink);
    }

    // Create FAQ modal content
    function createFaqModal() {
        if (document.querySelector('.modal[style*="flex"]')) return; // Prevent multiple modals
        
        const htmlContent = `
            <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="
                    font-size: 20px;
                    font-weight: 400;
                    color: #1a1a1a;
                    margin: 0;
                    font-family: 'Geist', sans-serif;
                    letter-spacing: -0.01em;
                ">Tips & FAQ</h2>
            </div>

            <div style="margin-bottom: 28px;">
                <h3 style="
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a7c59;
                    margin: 0 0 16px 0;
                    font-family: 'Inter', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                ">Smart Input</h3>
                <div style="color: #555; font-size: 15px; line-height: 1.6; font-family: 'Inter', sans-serif;">
                    <p style="margin: 0 0 12px 0;">Enter naturally: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">180lb</code>, <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">5'10"</code>, <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">80kg</code></p>
                    <p style="margin: 0 0 12px 0;">Any language, any format</p>
                    <p style="margin: 0;">Be conversational: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px;">"I run 3x weekly"</code></p>
                </div>
            </div>

            <div style="margin-bottom: 28px;">
                <h3 style="
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a7c59;
                    margin: 0 0 16px 0;
                    font-family: 'Inter', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                ">Better Results</h3>
                <div style="color: #555; font-size: 15px; line-height: 1.6; font-family: 'Inter', sans-serif;">
                    <p style="margin: 0 0 12px 0;">Double-check spelling and typos</p>
                    <p style="margin: 0 0 12px 0;">Fill out all relevant form fields</p>
                    <p style="margin: 0;">Review your inputs before generating</p>
                </div>
            </div>

            <div style="margin-bottom: 32px;">
                <h3 style="
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a7c59;
                    margin: 0 0 16px 0;
                    font-family: 'Inter', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                ">FAQ</h3>
                <div style="font-size: 15px; line-height: 1.6; font-family: 'Inter', sans-serif;">
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 4px 0; font-weight: 500; color: #1a1a1a;">Is my data saved?</p>
                        <p style="margin: 0; color: #777; font-size: 14px;">Forms stored locally. Emails & usage tracked on servers.</p>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 4px 0; font-weight: 500; color: #1a1a1a;">Offline support?</p>
                        <p style="margin: 0; color: #777; font-size: 14px;">Forms yes, AI processing requires internet</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px 0; font-weight: 500; color: #1a1a1a;">How accurate?</p>
                        <p style="margin: 0; color: #777; font-size: 14px;">General guidance—consult professionals</p>
                    </div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; color: #777; font-size: 14px; font-family: 'Inter', sans-serif;">Questions?</p>
                <a href="mailto:info@inexasli.com" style="
                    color: #4a7c59;
                    text-decoration: none;
                    font-size: 15px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                ">info@inexasli.com</a>
            </div>

            <div style="text-align: center;">
                <button onclick="window.closeModal()" style="
                    background: #4a7c59;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    Got it
                </button>
            </div>
        `;

        window.openCustomModal(htmlContent, {
            maxWidth: '400px'
        });
    }

    // Expose to window
    window.openFaqModal = createFaqModal;
})();
