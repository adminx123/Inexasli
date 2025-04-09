// Define global handlers for keydown and click outside actions
let handleKeyDown;
let handleClickOutside;

// Function to inject modal styles
function injectModalCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            background-color: rgba(0, 0, 0, 0.5);
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            justify-content: center;
            align-items: center;
            padding: 30px;
            z-index: 1000;
            overflow-y: auto;
        }

        .modal-content {
            background-color: white;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
            gap: 20px;
            width: 90%;
            max-width: 800px;
            height: 90%;
            max-height: 90vh;
            overflow: auto;
            position: relative;
        }

        .modal-content iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        .modal-trigger {
            color: #007bff;
            cursor: pointer;
            text-decoration: underline;
        }

        .modal-trigger:hover {
            color: #0056b3;
            text-decoration: none;
        }

        @media (min-width: 800px) {
            .modal {
                padding: 50px;
            }
        }

        
    `;
    document.head.appendChild(style);
}

// Create a single modal element if it doesn’t exist
function createModal() {
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        const content = document.createElement('div');
        content.className = 'modal-content';
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    return modal;
}

// Function to open the modal with specified content
function openModal(contentSrc) {
    const modal = createModal();
    const modalContent = modal.querySelector('.modal-content');
    
    // Clear existing content and load new content via iframe
    modalContent.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = contentSrc;
    modalContent.appendChild(iframe);

    modal.style.display = 'flex';

    // Add class to disable tooltips
    document.body.classList.add('modal-open');

    // Close modal on Escape key
    handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Close modal when clicking outside
    handleClickOutside = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    document.addEventListener('click', handleClickOutside);
}

// Function to close the modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
    }
}

// Function to setup modal triggers
function setupModalTriggers() {
    const triggers = document.querySelectorAll('.modal-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const contentSrc = trigger.getAttribute('data-modal-src');
            if (contentSrc) {
                openModal(contentSrc);
            }
        });
    });
}

// Initialize modal system
injectModalCSS();
setupModalTriggers();

// Make closeModal globally accessible
window.closeModal = closeModal;