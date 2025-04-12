// hideShow.js
// Existing imports or setup (if any, e.g., localStorage handling)
function updateVisibility() {
    const fillingStatus = localStorage.getItem('fillingStatus');
    const partnerRows = document.querySelectorAll('.partner-clone');
    const styleElement = document.getElementById('hide-show-styles') || document.createElement('style');

    styleElement.id = 'hide-show-styles';
    let styles = '';

    if (fillingStatus === 'partner') {
        styles += `
            .partner-clone {
                display: flex !important;
            }
        `;
    } else {
        styles += `
            .partner-clone {
                display: none !important;
            }
        `;
    }

    styleElement.textContent = styles;
    if (!document.getElementById('hide-show-styles')) {
        document.head.appendChild(styleElement);
    }

    // Debug row visibility
    try {
        console.log(`[hideShow.js] Debugging on ${window.location.pathname}, fillingStatus: ${fillingStatus}`);
        
        // Partner-clone rows
        partnerRows.forEach(row => {
            const display = getComputedStyle(row).display;
            const parent = row.closest('.checkboxrow-container') || row.parentElement;
            const parentDisplay = parent ? getComputedStyle(parent).display : 'N/A';
            console.log(`Partner row: ${row.id || row.className}, display: ${display}, parent display: ${parentDisplay}`);
            
            const inputs = row.querySelectorAll('input[type="number"], .checkbox-button-group');
            inputs.forEach(input => {
                const inputDisplay = getComputedStyle(input).display;
                const inputWidth = getComputedStyle(input).width;
                console.log(`  Partner input: ${input.id || input.className}, display: ${inputDisplay}, width: ${inputWidth}`);
            });
        });

        // Non-partner rows
        const nonPartnerRows = document.querySelectorAll('.checkboxrow:not(.partner-clone)');
        nonPartnerRows.forEach(row => {
            const display = getComputedStyle(row).display;
            const parent = row.closest('.checkboxrow-container') || row.parentElement;
            const parentDisplay = parent ? getComputedStyle(parent).display : 'N/A';
            console.log(`Non-partner row: ${row.id || row.className}, display: ${display}, parent display: ${parentDisplay}`);
            
            const inputs = row.querySelectorAll('input[type="number"], .checkbox-button-group');
            inputs.forEach(input => {
                const inputDisplay = getComputedStyle(input).display;
                const inputWidth = getComputedStyle(input).width;
                console.log(`  Non-partner input: ${input.id || input.className}, display: ${inputDisplay}, width: ${inputWidth}`);
            });
        });
    } catch (error) {
        console.error(`[hideShow.js] Debugging error: ${error.message}`);
    }
}

// Run visibility update on DOM load or status change
document.addEventListener('DOMContentLoaded', updateVisibility);

// Optional: Re-run if fillingStatus changes (e.g., via user toggle)
window.addEventListener('storage', (event) => {
    if (event.key === 'fillingStatus') {
        updateVisibility();
    }
});