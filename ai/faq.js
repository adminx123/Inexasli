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
            <h2 style="margin-top:0;font-size:1.4em;color:#4a7c59;text-align:center;margin-bottom:20px;">Tips & FAQ</h2>
            
            <div style="margin-bottom:20px;">
                <h3 style="font-size:1.1em;color:#2d5a3d;margin:0 0 10px 0;text-align:left;">💡 Smart Input Tips</h3>
                <ul style="padding-left:18px;font-size:1em;line-height:1.7;color:#333;text-align:left;margin:0;">
                    <li>Enter information naturally - <b>"180lb"</b>, <b>"80kg"</b>, <b>"5'10"</b> - our AI understands and converts automatically</li>
                    <li>Use any units or formats you prefer - metric, imperial, or mixed</li>
                    <li>Type in any language - our system is multilingual</li>
                    <li>Be conversational - <b>"I run 3 times a week for 30 minutes"</b> works perfectly</li>
                </ul>
            </div>

            <div style="margin-bottom:20px;">
                <h3 style="font-size:1.1em;color:#2d5a3d;margin:0 0 10px 0;text-align:left;">🎯 Getting Better Results</h3>
                <ul style="padding-left:18px;font-size:1em;line-height:1.7;color:#333;text-align:left;margin:0;">
                    <li>Be specific about your goals and preferences</li>
                    <li>Include context - lifestyle, constraints, or special considerations</li>
                    <li>Use voice input for faster, more natural data entry</li>
                    <li>Review and refine your inputs for more personalized results</li>
                </ul>
            </div>

            <div style="margin-bottom:20px;">
                <h3 style="font-size:1.1em;color:#2d5a3d;margin:0 0 10px 0;text-align:left;">❓ Common Questions</h3>
                <div style="font-size:1em;line-height:1.7;color:#333;text-align:left;">
                    <p style="margin:0 0 8px 0;"><b>Q:</b> Is my data saved?</p>
                    <p style="margin:0 0 15px 0;padding-left:15px;color:#666;"><b>A:</b> Data is stored locally on your device and can be cleared anytime using the clear data button.</p>
                    
                    <p style="margin:0 0 8px 0;"><b>Q:</b> Can I use this offline?</p>
                    <p style="margin:0 0 15px 0;padding-left:15px;color:#666;"><b>A:</b> Forms work offline, but AI processing requires an internet connection.</p>
                    
                    <p style="margin:0 0 8px 0;"><b>Q:</b> How accurate are the AI recommendations?</p>
                    <p style="margin:0 0 8px 0;padding-left:15px;color:#666;"><b>A:</b> Our AI provides general guidance. Always consult professionals for important decisions.</p>
                </div>
            </div>

            <div style="margin-top:20px;padding-top:15px;border-top:1px solid rgba(74,124,89,0.2);font-size:0.95em;color:#666;text-align:center;">
                Have questions or suggestions?<br>
                <a href="mailto:info@inexasli.com" style="color:#4a7c59;text-decoration:none;font-weight:500;">info@inexasli.com</a>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <button onclick="window.closeModal()" style="margin: 0;">Got It</button>
            </div>
        `;

        window.openCustomModal(htmlContent, {
            maxWidth: '420px'
        });
    }

    // Expose to window
    window.openFaqModal = createFaqModal;
})();
