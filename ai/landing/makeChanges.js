// makeChanges.js
// Monitors localStorage item 'incomeIqInput1' for changes and shows a modal if changed.
// Warns user that AI-generated tax and contribution calculations will be outdated, affecting other metrics.

(function() {
    // Use the exact key as saved elsewhere in the app
    const STORAGE_KEY = 'incomeIqinput1'; // Note lowercase 'i' in 'input1'
    let lastValue = localStorage.getItem(STORAGE_KEY);

    // Metrics affected by outdated calculations
    const affectedMetrics = [
        'Net Income',
        'Tax Owed',
        'Contributions',
        'Disposable Income',
        'Savings Rate',
        'Retirement Projections'
    ];

    function showModal() {
        if (document.querySelector('.modal[style*="flex"]')) return; // Prevent duplicate modals
        
        const htmlContent = `
            <div style="text-align: center; font-family: 'Inter', sans-serif;">
                <h2 style="margin: 0 0 1em 0; color: #1a1a1a; font-size: 18px; font-weight: 500;">Warning: Outdated Calculations</h2>
                <p style="margin: 0 0 1em 0; color: #555; line-height: 1.5;">
                    The value for <b>Income Input</b> has changed.<br>
                    AI-generated <b>tax</b> and <b>contribution</b> calculations will be outdated.<br>
                    This will affect the following metrics:
                </p>
                <ul style="text-align: left; margin: 0 0 1.5em 0; padding-left: 1.2em; color: #555; line-height: 1.4;">
                    ${affectedMetrics.map(m => `<li>${m}</li>`).join('')}
                </ul>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button id="regen-btn" style="
                        background: #4a7c59;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        font-family: 'Inter', sans-serif;
                    ">Regenerate Calculations</button>
                    <button id="continue-btn" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        font-family: 'Inter', sans-serif;
                    ">Continue Editing</button>
                </div>
            </div>
        `;
        
        window.openCustomModal(htmlContent, {
            maxWidth: '400px',
            onOpen: function(modal, modalContent) {
                modalContent.querySelector('#regen-btn').onclick = function() {
                    window.dispatchEvent(new Event('regenerateIncomeCalculations'));
                    window.closeModal();
                };
                modalContent.querySelector('#continue-btn').onclick = function() {
                    window.closeModal();
                };
            }
        });
    }

    // Polling for changes (since localStorage events only fire across tabs)
    setInterval(() => {
        const currentValue = localStorage.getItem(STORAGE_KEY);
        const hasResponse = !!localStorage.getItem('incomeIqResponse');
        if (currentValue !== lastValue) {
            console.log('[makeChanges.js] Detected change in incomeIqinput1.');
            if (hasResponse) {
                console.log('[makeChanges.js] incomeIqResponse exists, showing modal.');
                showModal();
            } else {
                console.log('[makeChanges.js] No incomeIqResponse found, not showing modal.');
            }
            lastValue = currentValue;
        }
    }, 1000);

    // Optional: Listen for regeneration event elsewhere in your app
    // window.addEventListener('regenerateIncomeCalculations', () => { ... });
})();
