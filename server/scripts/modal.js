// Function to open a modal
function openModal(modalId, tooltipClass = '.tooltip') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Show tooltips if needed
        const tooltips = document.querySelectorAll(tooltipClass);
        tooltips.forEach(tooltip => {
            tooltip.classList.add('show');
        });

        // Close modal on Escape key
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal(modalId, tooltipClass);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Close modal when clicking outside
        const handleClickOutside = (event) => {
            if (!modal.contains(event.target) && event.target.id !== modalId.replace('-modal', '_MODAL_OPEN')) {
                closeModal(modalId, tooltipClass);
            }
        };
        document.addEventListener('click', handleClickOutside);
    }
}

// Function to close a modal
function closeModal(modalId, tooltipClass = '.tooltip') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';

        // Hide tooltips if needed
        const tooltips = document.querySelectorAll(tooltipClass);
        tooltips.forEach(tooltip => {
            tooltip.classList.remove('show');
        });

        // Remove event listeners to prevent memory leaks
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
    }
}

// Event listener for opening the modal
document.querySelectorAll('[id$="_MODAL_OPEN"]').forEach(button => {
    button.addEventListener('click', (event) => {
        const modalId = event.target.id.replace('_MODAL_OPEN', '-modal');
        openModal(modalId);
    });
});

// Example usage:
// openModal('TERMS-modal');