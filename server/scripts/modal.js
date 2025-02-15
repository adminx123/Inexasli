let handleKeyDown; // Define handleKeyDown outside of any function
let handleClickOutside; // Define handleClickOutside outside of any function

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
        handleKeyDown = (event) => { // Assign to the global variable
            if (event.key === 'Escape') {
                closeModal(modalId, tooltipClass);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Close modal when clicking outside
        handleClickOutside = (event) => {
            console.log('Click event target:', event.target);
            if (!modal.contains(event.target) && event.target.id !== modalId.replace('-modal', '_MODAL_OPEN')) {
                console.log('Click is outside modal');
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