// filepath: /Users/dallasp/Library/Mobile Documents/com~apple~CloudDocs/Finance/Inexasli/utility/modal.js
//
// Generic modal system for the application. Direct uses:
// - /utility/termsConsentManager.js - Uses window.openModal() for displaying terms and conditions
// - /utility/dataConsentManager.js - Uses window.openModal() for legal/consent displays
//
// Educational loading overlay moved to: /ai/fact-generator/educational-overlay.js
// Note: paymentform.js has its own separate modal system and does NOT use this file.

// Define global variables to track active event listeners
let activeKeyDownHandler = null;
let activeClickOutsideHandler = null;

// Function to inject modal styles
function injectModalCSS() {
    const style = document.createElement('style');
    style.textContent = `.modal {
    display: none;
    position: fixed;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    padding: 30px;
    z-index: 1000000;
    overflow-y: auto;
    font-family: "Inter", sans-serif;
}

.modal-content {
    background-color: rgba(242, 249, 243, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
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
    font-family: "Inter", sans-serif;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(74, 124, 89, 0.12), 0 4px 16px rgba(74, 124, 89, 0.08), 0 1px 4px rgba(74, 124, 89, 0.04);
    transform: scale(0.95);
    transition: all 0.3s ease;
}

.modal-content.device-container {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.modal-content.custom-content {
    height: auto;
    max-height: 85vh;
    align-items: center;
    text-align: center;
}

.modal-content iframe {
    width: 100%;
    height: 100%;
    border: none;
}

.modal-trigger {
    color: #000;
    cursor: pointer;
    text-decoration: underline;
    font-family: "Geist", sans-serif;
}

.modal-trigger:hover {
    color: #4a7c59;
    text-decoration: none;
}

/* Button styling */
.modal-content button {
    background: rgba(45, 90, 61, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 1em;
    cursor: pointer;
    font-weight: bold;
    font-family: "Geist", sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
}

.modal-content button:hover {
    background: rgba(74, 124, 89, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
}

.modal-content button:disabled {
    background: rgba(178, 178, 178, 0.7);
    cursor: not-allowed;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
}

.modal-content button:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 #000;
}

@media (min-width: 800px) {
    .modal {
        padding: 50px;
    }
}

@media (max-width: 480px) {
    .modal-content {
        padding: 15px;
        width: 90%;
        max-width: 300px;
    }
    
    .modal-content button {
        padding: 8px 14px;
        font-size: 0.9em;
    }
}`;
    document.head.appendChild(style);
}

// Create a single modal element if it doesn't exist
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
    // For all content, use the regular iframe modal
    openModalWithIframe(contentSrc);
}

// Separate function for iframe-based modals
function openModalWithIframe(contentSrc) {
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

    // Clean up previous event listeners if they exist
    removeExistingEventListeners();

    // Close modal on Escape key
    activeKeyDownHandler = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', activeKeyDownHandler);

    // Close modal when clicking outside
    activeClickOutsideHandler = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    document.addEventListener('click', activeClickOutsideHandler);

    // Use device-container class for legal modals (legacy support)
    if (contentSrc === '/legal.txt') {
        modalContent.classList.add('device-container');
    } else {
        modalContent.classList.remove('device-container');
    }
}

// Function to open the modal with auto height for generated prompts
function openGeneratedPromptModal() {
    const modal = createModal();
    const modalContent = modal.querySelector('.modal-content');

    // Add a specific class to differentiate this modal
    modal.classList.add('generated-prompt-modal');

    // Clear existing content and inject styled content
    modalContent.innerHTML = `
        <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 10px; font-family: 'Geist', sans-serif;">Your Promptemplate™ is Ready!</h2>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">It's copied to your clipboard—paste it into your favorite AI chat with Ctrl+V (Cmd+V on Mac) or right-click > Paste.</p>
            <div class="button-container" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <button class="ai-button" style="background: none; border: none; cursor: pointer;" onclick="window.open('https://grok.com', '_blank')">
                    <img src="/images/grok.png" alt="Grok" style="width: 60px; height: 60px;">
                </button>
                <button class="ai-button" style="background: none; border: none; cursor: pointer;" onclick="window.open('https://chat.openai.com', '_blank')">
                    <img src="/images/openai.png" alt="ChatGPT" style="width: 60px; height: 60px;">
                </button>
                <button class="ai-button" style="background: none; border: none; cursor: pointer;" onclick="window.open('https://deepseek.com', '_blank')">
                    <img src="/images/deep.png" alt="DeepSeek" style="width: 60px; height: 60px;">
                </button>
                <button class="ai-button" style="background: none; border: none; cursor: pointer;" onclick="window.open('https://gemini.google.com/app', '_blank')">
                    <img src="/images/gemini.png" alt="Gemini" style="width: 60px; height: 60px;">
                </button>
            </div>
            <button onclick="closeModal()" style="padding: 10px 20px; background: #fff; color: #000; border: 2px solid #000; border-radius: 6px; box-shadow: 4px 4px 0 #000; cursor: pointer; font-weight: bold; font-family: 'Geist', sans-serif; transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;">Got It</button>
        </div>
    `;

    modal.style.display = 'flex';
    modalContent.style.height = 'auto'; // Set auto height for the modal content

    // Add class to disable tooltips
    document.body.classList.add('modal-open');

    // Clean up previous event listeners if they exist
    removeExistingEventListeners();

    // Close modal on Escape key
    activeKeyDownHandler = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', activeKeyDownHandler);

    // Close modal when clicking outside
    activeClickOutsideHandler = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    document.addEventListener('click', activeClickOutsideHandler);
}

// Function to open modal with custom HTML content
function openCustomModal(htmlContent, options = {}) {
    const modal = createModal();
    const modalContent = modal.querySelector('.modal-content');
    
    // Clear existing content and add custom content
    modalContent.innerHTML = htmlContent;
    
    // Apply custom content styling
    modalContent.classList.add('custom-content');
    
    // Apply any custom styling options
    if (options.maxWidth) {
        modalContent.style.maxWidth = options.maxWidth;
    }
    if (options.backgroundColor) {
        modalContent.style.backgroundColor = options.backgroundColor;
    }
    
    modal.style.display = 'flex';

    // Add class to disable tooltips
    document.body.classList.add('modal-open');

    // Clean up previous event listeners if they exist
    removeExistingEventListeners();

    // Close modal on Escape key
    activeKeyDownHandler = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', activeKeyDownHandler);

    // Close modal when clicking outside
    activeClickOutsideHandler = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    document.addEventListener('click', activeClickOutsideHandler);
    
    // Execute callback if provided
    if (options.onOpen) {
        options.onOpen(modal, modalContent);
    }
    
    return modal;
}

// Helper function to remove existing event listeners
function removeExistingEventListeners() {
    if (activeKeyDownHandler) {
        document.removeEventListener('keydown', activeKeyDownHandler);
        activeKeyDownHandler = null;
    }
    if (activeClickOutsideHandler) {
        document.removeEventListener('click', activeClickOutsideHandler);
        activeClickOutsideHandler = null;
    }
}

// Function to close the modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Clean up event listeners
        removeExistingEventListeners();
        
        // Dispatch custom event when modal closes
        document.dispatchEvent(new CustomEvent('modalClosed'));
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

// Make setupModalTriggers globally accessible
window.setupModalTriggers = setupModalTriggers;

// Make closeModal globally accessible
window.closeModal = closeModal;

// Make openGeneratedPromptModal globally accessible
window.openGeneratedPromptModal = openGeneratedPromptModal;

// Make the modal functions globally accessible
window.openModal = openModal;
window.openCustomModal = openCustomModal;
window.closeModal = closeModal;
window.openGeneratedPromptModal = openGeneratedPromptModal;
