// faq.js - FAQ and Tips Modal for INEXASLI

(function() {
    // Ensure BoxIcons is loaded
    if (!document.querySelector('link[href*="boxicons"]')) {
        const boxIconsLink = document.createElement('link');
        boxIconsLink.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
        boxIconsLink.rel = 'stylesheet';
        document.head.appendChild(boxIconsLink);
    }

    // Create modal HTML
    function createFaqModal() {
        if (document.getElementById('faq-modal-backdrop')) return; // Only one modal
        const backdrop = document.createElement('div');
        backdrop.id = 'faq-modal-backdrop';
        backdrop.style = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.25); z-index: 9999; display: flex; align-items: center; justify-content: center;`;
        const modal = document.createElement('div');
        modal.id = 'faq-modal-content';
        modal.style = `
            background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            max-width: 95vw; width: 370px; padding: 28px 22px 18px 22px; position: relative; font-family: 'Inter', sans-serif;`;
        modal.innerHTML = `
            <button id="faq-modal-close" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:22px;cursor:pointer;color:#4a7c59;">
                <i class="bx bx-x"></i>
            </button>
            <h2 style="margin-top:0;font-size:1.3em;color:#4a7c59;">Tips & FAQ</h2>
            <ul style="padding-left:18px;font-size:1em;line-height:1.6;color:#222;">
                <li>You can enter information naturally, e.g. <b>"180lb"</b> or <b>"80kg"</b>—the AI will understand and convert it for you.</li>
                <li>Use any common units, formats, or phrasing. The system is designed to be flexible and intelligent.</li>
                <li>Enter information in any language</li>

                <li>Look for more tips and help in this section as we add new features!</li>
            </ul>
            <div style="margin-top:18px;font-size:0.95em;color:#666;">Have a question or suggestion? Contact <a href="mailto:info@inexasli.com">info@inexasli.com</a></div>
        `;
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        document.getElementById('faq-modal-close').onclick = function() {
            document.body.removeChild(backdrop);
        };
        backdrop.onclick = function(e) {
            if (e.target === backdrop) document.body.removeChild(backdrop);
        };
    }

    // Expose to window
    window.openFaqModal = createFaqModal;
})();
