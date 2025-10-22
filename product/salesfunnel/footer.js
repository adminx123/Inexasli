// Legal Footer Component
// Dynamically injects footer with legal links into pages

(function() {
    function createFooter() {
        const footer = document.createElement('div');
        footer.style.cssText = 'text-align: center; margin: 10px 0 20px 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);';
        
        footer.innerHTML = `
            <p style="color: #ccc; font-size: 12px; margin: 0;">
                <a href="#" onclick="showSocialTerms(); return false;" style="color: #4CAF50; text-decoration: none;">Terms of Service</a>
                • 
                <a href="#" onclick="showSocialPrivacy(); return false;" style="color: #4CAF50; text-decoration: none;">Privacy Policy</a>
                • 
                <a href="/product/legal/dpa.html" style="color: #4CAF50; text-decoration: none;" target="_blank">Data Processing Agreement</a>
                • <a href="mailto:support@inexasli.com" style="color: #4CAF50; text-decoration: none;">support@inexasli.com</a>
            </p>
        `;
        
        return footer;
    }

    // Auto-inject footer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const targetContainer = document.querySelector('.device-container') || document.body;
            targetContainer.appendChild(createFooter());
        });
    } else {
        const targetContainer = document.querySelector('.device-container') || document.body;
        targetContainer.appendChild(createFooter());
    }

    // Export for manual insertion if needed
    window.createLegalFooter = createFooter;
})();
