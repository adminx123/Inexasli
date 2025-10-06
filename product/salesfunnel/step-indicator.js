// Step Indicator Component - Self-contained module
// Includes HTML, CSS, and JS for the sales funnel step navigation

(function() {
    'use strict';

    // Configuration
    const stepPages = {
        1: 'packages.html',
        2: 'customization.html',
        3: 'quote.html',
        4: 'payment.html'
    };

    const stepTitles = {
        1: 'Choose Base Package',
        2: 'Customize Content',
        3: 'Review Order',
        4: 'Payment'
    };

    // HTML Template
    const stepIndicatorHTML = `
        <div class="step-indicator">
            <a href="packages.html" class="step" data-step="1">
                <div class="step-number">1</div>
                <span>Base</span>
            </a>
            <a href="customization.html" class="step" data-step="2">
                <div class="step-number">2</div>
                <span>Info</span>
            </a>
            <a href="quote.html" class="step" data-step="3">
                <div class="step-number">3</div>
                <span>Review</span>
            </a>
            <a href="payment.html" class="step" data-step="4">
                <div class="step-number">4</div>
                <span>Pay</span>
            </a>
        </div>
    `;

    // CSS Styles
    const stepIndicatorCSS = `
        .step-indicator {
            display: flex;
            justify-content: center;
            margin: 10px 0 20px 0;
            gap: 8px;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 0 5px;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 1.5px 3px;
            background: rgba(255,255,255,0.1);
            border-radius: 25px;
            font-size: 13px;
            color: #ccc;
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            white-space: nowrap;
            min-width: 0;
            flex-shrink: 0;
            text-decoration: none;
        }

        .step:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.4);
            transform: translateY(-2px);
        }

        .step.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-color: #667eea;
        }

        .step.active:hover {
            background: linear-gradient(135deg, #5a67d8, #6b46c1);
            transform: translateY(-2px);
        }

        .step.completed {
            background: rgba(40, 167, 69, 0.3);
            color: #90ee90;
            border-color: #28a745;
        }

        .step.completed:hover {
            background: rgba(40, 167, 69, 0.5);
            transform: translateY(-2px);
        }

        .step.disabled {
            background: rgba(255,255,255,0.05);
            color: #666;
            cursor: not-allowed;
            border-color: rgba(255,255,255,0.1);
        }

        .step.disabled:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(0);
        }

        .step-number {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10px;
            flex-shrink: 0;
        }

        .step.completed .step-number {
            background: #28a745;
            color: white;
        }

        .step.active .step-number {
            background: rgba(255,255,255,0.3);
            color: white;
        }

        .step.disabled .step-number {
            background: rgba(255,255,255,0.1);
        }
    `;

    // Main initialization function
    function initStepIndicator() {
        // Inject CSS
        injectCSS();

        // Inject HTML
        injectHTML();

        // Initialize functionality
        setupStepNavigation();
    }

    // Inject CSS into head
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = stepIndicatorCSS;
        document.head.appendChild(style);
    }

    // Inject HTML into placeholder
    function injectHTML() {
        const placeholder = document.querySelector('.step-indicator-placeholder');
        if (placeholder) {
            placeholder.innerHTML = stepIndicatorHTML;
        }
    }

    // Setup navigation functionality
    function setupStepNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        let currentStep = 1;

        // Determine current step
        Object.entries(stepPages).forEach(([step, page]) => {
            if (currentPage === page) {
                currentStep = parseInt(step);
            }
        });

        // Update step states
        updateStepStates(currentStep);

        // Add click handlers
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);

            // Determine if step is navigable
            const isCompleted = step.classList.contains('completed');
            const isActive = step.classList.contains('active');
            const isPrevious = stepNumber < currentStep;
            const isNavigable = isCompleted || isActive || isPrevious;

            if (isNavigable) {
                step.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Add confirmation for going backwards
                    if (stepNumber < currentStep && !this.classList.contains('completed')) {
                        if (confirm('This will take you back to a previous step. Any unsaved progress may be lost. Continue?')) {
                            navigateToStep(stepNumber);
                        }
                    } else {
                        navigateToStep(stepNumber);
                    }
                });
            } else {
                step.classList.add('disabled');
                step.addEventListener('click', function(e) {
                    e.preventDefault();
                    showMessage('Complete previous steps first');
                });
            }
        });
    }

    // Update visual states of steps
    function updateStepStates(currentStep) {
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            const stepNumber = parseInt(step.dataset.step);

            // Remove existing classes
            step.classList.remove('completed', 'active', 'disabled');

            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }

    // Navigation function
    function navigateToStep(stepNumber) {
        const targetPage = stepPages[stepNumber];
        if (targetPage) {
            document.body.style.opacity = '0.8';
            document.body.style.transition = 'opacity 0.2s ease';

            setTimeout(() => {
                window.location.href = targetPage;
            }, 100);
        }
    }

    // Show message function
    function showMessage(message) {
        // Remove existing messages
        const existing = document.querySelector('.step-navigation-message');
        if (existing) existing.remove();

        // Create message
        const msgDiv = document.createElement('div');
        msgDiv.className = 'step-navigation-message';
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(220, 38, 38, 0.3);
            animation: slideInDown 0.3s ease-out;
        `;

        // Add animation
        const animStyle = document.createElement('style');
        animStyle.textContent = `
            @keyframes slideInDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-100%); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(animStyle);

        document.body.appendChild(msgDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.remove();
            }
        }, 3000);
    }

    // Get step title (for tooltips)
    function getStepTitle(stepNumber) {
        return stepTitles[stepNumber] || `Step ${stepNumber}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStepIndicator);
    } else {
        initStepIndicator();
    }

    // Expose functions globally if needed
    window.StepIndicator = {
        navigateToStep: navigateToStep,
        updateStepStates: updateStepStates
    };

})();