// makeChanges.js
// Generic module for monitoring localStorage changes and handling stale AI responses
// Configurable for any module that needs response invalidation on input changes

(function() {
    // Configuration - can be customized per module
    const config = {
        // Default configuration for income module
        watchKey: 'incomeIqinput1',
        responseKey: 'incomeIqResponse',
        eventName: 'income-response-deleted',
        warningText: 'Changes to this section will invalidate your AI calculations',
        affectedSections: ['Tax Residency', 'Income Sources']
    };

    let lastValue = localStorage.getItem(config.watchKey);

    function createWarningElement(sectionSelector, warningText) {
        const section = document.querySelector(sectionSelector);
        if (!section) return null;

        const warning = document.createElement('div');
        warning.className = 'ai-response-warning';
        warning.style.cssText = `
            background: linear-gradient(135deg, #fef3c7, #fbbf24);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 10px 0;
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Inter', sans-serif;
        `;
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 16px;"></i>
            <span>${warningText}</span>
        `;

        return warning;
    }

    function showWarningElements() {
        const hasResponse = !!localStorage.getItem(config.responseKey);
        console.log('[makeChanges.js] Checking for warnings - hasResponse:', hasResponse);
        
        if (!hasResponse) {
            console.log('[makeChanges.js] No AI response found, not showing warnings');
            return;
        }
        
        console.log('[makeChanges.js] AI response found, attempting to show warning elements');

        // Helper function to add warning with retry logic
        function addWarningToSection(sectionLabel, retryCount = 0) {
            const section = document.querySelector(`.row1[data-step-label="${sectionLabel}"]`);
            console.log(`[makeChanges.js] Looking for section "${sectionLabel}":`, section ? 'FOUND' : 'NOT FOUND');
            
            if (section && !section.querySelector('.ai-response-warning')) {
                console.log(`[makeChanges.js] Adding warning to ${sectionLabel} section`);
                const warning = createWarningElement(`.row1[data-step-label="${sectionLabel}"]`, config.warningText);
                if (warning) {
                    const h3 = section.querySelector('h3');
                    if (h3) {
                        section.insertBefore(warning, h3.nextSibling);
                    } else {
                        section.insertBefore(warning, section.firstChild);
                    }
                    console.log(`[makeChanges.js] Successfully added warning to ${sectionLabel}`);
                }
            } else if (!section && retryCount < 5) {
                // Retry if section not found yet (might be loading)
                console.log(`[makeChanges.js] Section "${sectionLabel}" not found, retrying in 500ms (attempt ${retryCount + 1})`);
                setTimeout(() => addWarningToSection(sectionLabel, retryCount + 1), 500);
            }
        }

        // Add warnings to configured sections
        config.affectedSections.forEach(sectionLabel => {
            addWarningToSection(sectionLabel);
        });
    }

    function hideWarningElements() {
        document.querySelectorAll('.ai-response-warning').forEach(warning => {
            warning.remove();
        });
    }

    function handleDataChange() {
        const hasResponse = !!localStorage.getItem(config.responseKey);
        if (hasResponse) {
            console.log(`[makeChanges.js] AI response invalidated, removing response data for ${config.responseKey}`);
            localStorage.removeItem(config.responseKey);
            hideWarningElements();
            
            // Trigger refresh for output modules in the same tab
            console.log(`[makeChanges.js] Dispatching ${config.eventName} event`);
            const event = new CustomEvent(config.eventName, {
                detail: {
                    responseKey: config.responseKey,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(event);
        }
    }

    // Polling for changes (since localStorage events only fire across tabs)
    setInterval(() => {
        const currentValue = localStorage.getItem(config.watchKey);
        if (currentValue !== lastValue) {
            console.log(`[makeChanges.js] Detected change in ${config.watchKey}.`);
            handleDataChange();
            lastValue = currentValue;
        }
    }, 1000);

    // Initialize warnings on page load if response exists
    document.addEventListener('DOMContentLoaded', () => {
        showWarningElements();
    });

    // Also check warnings when page becomes visible (in case user navigates back)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            showWarningElements();
        }
    });

    // Listen for new AI responses to show warnings
    document.addEventListener('api-response-received', function(e) {
        console.log('[makeChanges.js] API response received event:', e.detail);
        if (e.detail?.module === 'income') {
            setTimeout(() => {
                showWarningElements();
            }, 100);
        }
    });

    // Listen for dynamic content loading events from datain.js
    document.addEventListener('data-in-loaded', function(e) {
        console.log('[makeChanges.js] Data-in content loaded:', e.detail);
        if (e.detail?.moduleType === 'income') {
            setTimeout(() => {
                showWarningElements();
            }, 200); // Give a bit more time for DOM to settle
        }
    });

    // Also listen for guided forms step changes (when user navigates between steps)
    document.addEventListener('guided-forms-step-changed', function(e) {
        console.log('[makeChanges.js] Guided forms step changed');
        setTimeout(() => {
            showWarningElements();
        }, 100);
    });

    // Export configuration function for other modules
    window.makeChangesConfig = function(newConfig) {
        Object.assign(config, newConfig);
        lastValue = localStorage.getItem(config.watchKey);
    };

    // Export functions for debugging and testing
    window.makeChangesDebug = {
        showWarnings: showWarningElements,
        hideWarnings: hideWarningElements,
        checkResponse: () => !!localStorage.getItem(config.responseKey),
        config: config,
        lastValue: () => lastValue
    };

    console.log('[makeChanges.js] Utility loaded and configured for:', config);

})();
