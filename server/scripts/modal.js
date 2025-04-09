// Define global handlers for keydown and click outside actions
let handleKeyDown;
let handleClickOutside;

// Function to inject modal styles directly into the document (no CSS file)
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

        /* Span styles for link-like appearance */
        #ROI_MODAL_OPEN {
            color: #007bff;
            cursor: pointer;
            text-decoration: underline;
        }

        #ROI_MODAL_OPEN:hover {
            color: #0056b3;
            text-decoration: none;
        }

        @media (min-width: 800px) {
            .modal {
                padding: 50px;
            }
        }

        /* Disable tooltips when modal is open */
        .modal-open .tooltip, .modal-open .tooltip1 {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';

        // Add class to disable tooltips
        document.body.classList.add('modal-open');  // Disable tooltips

        // Close modal on Escape key
        handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal(modalId);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Close modal when clicking outside
        handleClickOutside = (event) => {
            if (!modal.contains(event.target) && event.target.id !== modalId.replace('-modal', '_MODAL_OPEN')) {
                closeModal(modalId);
            }
        };
        document.addEventListener('click', handleClickOutside);
    }
}

// Function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';

        // Remove class to re-enable tooltips
        document.body.classList.remove('modal-open');  // Enable tooltips again

        // Remove event listeners to prevent memory leaks
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
    }
}

// Function to initialize modal opening triggers
function setupOpenModalTriggers(modalId) {
    const modalOpener = document.getElementById(modalId.replace('-modal', '_MODAL_OPEN'));

    if (modalOpener) {
        modalOpener.addEventListener('click', () => {
            openModal(modalId);
        });

        // Make sure the span behaves like a link using JS
        modalOpener.style.color = '#007bff';
        modalOpener.style.cursor = 'pointer';
        modalOpener.style.textDecoration = 'underline';

        // Change color on hover via JS (no CSS)
        modalOpener.addEventListener('mouseover', () => {
            modalOpener.style.color = '#0056b3';
        });

        modalOpener.addEventListener('mouseout', () => {
            modalOpener.style.color = '#007bff';
        });
    }
}

// Inject modal CSS and setup modal triggers
injectModalCSS();
setupOpenModalTriggers('ROI-modal'); // Set up open triggers for specific modal (ROI-modal in this case)
