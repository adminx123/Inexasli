// Step Navigation Handler for INEXASLI Sales Flow
// Enables clicking on step indicators to navigate between pages

document.addEventListener('DOMContentLoaded', function() {
    // Step navigation configuration
    const stepPages = {
        1: 'packages.html',
        2: 'addons.html', 
        3: 'customization.html',
        4: 'quote.html',
        5: 'payment.html'
    };

    // Get current page to determine which step we're on
    const currentPage = window.location.pathname.split('/').pop();
    let currentStep = 1;
    
    // Determine current step based on page
    Object.entries(stepPages).forEach(([step, page]) => {
        if (currentPage === page) {
            currentStep = parseInt(step);
        }
    });

    // Add click handlers to all step elements
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        // Determine if step is navigable
        const isCompleted = step.classList.contains('completed');
        const isActive = step.classList.contains('active');
        const isPrevious = stepNumber < currentStep;
        const isNavigable = isCompleted || isActive || isPrevious;
        
        if (isNavigable) {
            // Make step clickable
            step.style.cursor = 'pointer';
            step.setAttribute('title', `Click to go to: ${getStepTitle(stepNumber)}`);
            
            step.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add confirmation for going backwards beyond current step
                if (stepNumber < currentStep && !step.classList.contains('completed')) {
                    if (confirm('This will take you back to a previous step. Any unsaved progress may be lost. Continue?')) {
                        navigateToStep(stepNumber);
                    }
                } else {
                    navigateToStep(stepNumber);
                }
            });
            
            // Add hover effect
            step.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            step.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateY(0)';
                }
            });
            
        } else {
            // Mark step as disabled
            step.classList.add('disabled');
            step.style.cursor = 'not-allowed';
            step.setAttribute('title', 'Complete previous steps to access this step');
            
            step.addEventListener('click', function(e) {
                e.preventDefault();
                showStepMessage('Complete previous steps first');
            });
        }
    });

    function getStepTitle(stepNumber) {
        const titles = {
            1: 'Choose Base Package',
            2: 'Add Enhancements', 
            3: 'Customize Content',
            4: 'Review Order',
            5: 'Payment'
        };
        return titles[stepNumber] || `Step ${stepNumber}`;
    }

    function navigateToStep(stepNumber) {
        const targetPage = stepPages[stepNumber];
        if (targetPage) {
            // Add smooth transition effect
            document.body.style.opacity = '0.8';
            document.body.style.transition = 'opacity 0.2s ease';
            
            // Small delay for visual feedback
            setTimeout(() => {
                window.location.href = targetPage;
            }, 100);
        }
    }

    function showStepMessage(message) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.step-navigation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'step-navigation-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
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
        
        // Add slide animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideInDown 0.3s ease-out reverse';
                setTimeout(() => {
                    messageDiv.remove();
                    style.remove();
                }, 300);
            }
        }, 2500);
    }

    // Initialize step states
    updateStepStates();
    
    function updateStepStates() {
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            // Clear existing states
            step.classList.remove('completed', 'active', 'disabled');
            
            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
            // Future steps remain in default state (will be marked disabled if not navigable)
        });
    }
});

// Global utilities for step management
window.stepNavigation = {
    // Function to programmatically navigate to a step
    goToStep: function(stepNumber) {
        const stepPages = {
            1: 'packages.html',
            2: 'addons.html',
            3: 'customization.html',
            4: 'quote.html',
            5: 'payment.html'
        };
        
        const targetPage = stepPages[stepNumber];
        if (targetPage) {
            window.location.href = targetPage;
        }
    },
    
    // Function to mark a step as completed
    markStepCompleted: function(stepNumber) {
        const steps = document.querySelectorAll('.step');
        if (steps[stepNumber - 1]) {
            steps[stepNumber - 1].classList.add('completed');
            steps[stepNumber - 1].classList.remove('active');
        }
    },
    
    // Function to set active step
    setActiveStep: function(stepNumber) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
            }
        });
    }
};
