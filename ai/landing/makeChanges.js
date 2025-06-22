// makeChanges.js
// Monitors localStorage item 'incomeIqInput1' for changes and shows a modal if changed.
// Warns user that AI-generated tax and contribution calculations will be outdated, affecting other metrics.

(function() {
    const STORAGE_KEY = 'incomeIqInput1';
    let lastValue = localStorage.getItem(STORAGE_KEY);
    let modalId = 'income-change-warning-modal';

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
        if (document.getElementById(modalId)) return; // Prevent duplicate modals
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:#fff;padding:2em;border-radius:10px;max-width:400px;text-align:center;box-shadow:0 2px 16px #0002;">
                <h2>Warning: Outdated Calculations</h2>
                <p>The value for <b>Income Input</b> has changed.<br>
                AI-generated <b>tax</b> and <b>contribution</b> calculations will be outdated.<br>
                This will affect the following metrics:</p>
                <ul style="text-align:left;">${affectedMetrics.map(m => `<li>${m}</li>`).join('')}</ul>
                <button id="regen-btn" style="margin:1em 0.5em 0 0.5em;padding:0.5em 1em;">Regenerate Calculations</button>
                <button id="continue-btn" style="margin:1em 0.5em 0 0.5em;padding:0.5em 1em;">Continue Editing</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('regen-btn').onclick = function() {
            // Custom event for regeneration
            window.dispatchEvent(new Event('regenerateIncomeCalculations'));
            closeModal();
        };
        document.getElementById('continue-btn').onclick = closeModal;
    }

    function closeModal() {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }

    // Polling for changes (since localStorage events only fire across tabs)
    setInterval(() => {
        const currentValue = localStorage.getItem(STORAGE_KEY);
        if (currentValue !== lastValue) {
            showModal();
            lastValue = currentValue;
        }
    }, 1000);

    // Optional: Listen for regeneration event elsewhere in your app
    // window.addEventListener('regenerateIncomeCalculations', () => { ... });
})();
