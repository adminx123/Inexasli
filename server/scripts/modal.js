let handleKeyDown; // Define handleKeyDown outside of any function
let handleClickOutside; // Define handleClickOutside outside of any function

// Function to inject CSS styles into the document
function injectModalCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            background-color: rgba(0, 0, 0, 0.5);
            top: 3%;
            left: 3%;
            right: 3%;
            bottom: 3%;
            justify-content: stretch;
            align-items: stretch;
            padding: 30px;
            z-index: 1000;
        }
      
        .modal-content {
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 10px;
            gap: 20px;
            width: 100%;
            height: 100%;
            overflow: auto;
        }
      
        .modal-content button {
            align-self: flex-end;
        }
      
        #ROI_MODAL_OPEN {
            color: rgb(14, 72, 92);
            cursor: pointer;
        }
      
        #ROI-modal {
            display: none;
            overflow-y: scroll;
            position: fixed;
            background-color: rgba(0, 0, 0, 0.5);
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 30px;
        }
      
        @media (min-width: 800px) {
            .modal {
                padding: 50px;
            }
        }
    `;
    document.head.appendChild(style);
}

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

// Inject the CSS styles when the script runs
injectModalCSS();
