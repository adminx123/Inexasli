// filepath: /Users/dallasp/Library/Mobile Documents/com~apple~CloudDocs/Finance/Inexasli/utility/modal.js
// Define global variables to track active event listeners
let activeKeyDownHandler = null;
let activeClickOutsideHandler = null;

// Function to inject modal styles
function injectModalCSS() {
    const style = document.createElement('style');
    style.textContent = `.modal {
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
    z-index: 20000;
    overflow-y: auto;
    font-family: "Inter", sans-serif;
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
    font-family: "Inter", sans-serif;
    border: 2px solid #000;
    border-radius: 8px;
    box-shadow: 4px 4px 0 #000;
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
    color: #444;
    text-decoration: none;
}

/* Button styling */
.modal-content button {
    padding: 10px 20px;
    background-color: #fff;
    color: #000;
    border: 2px solid #000;
    border-radius: 6px;
    box-shadow: 4px 4px 0 #000;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    font-family: "Geist", sans-serif;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.modal-content button:hover {
    background-color: #f5f5f5;
}

.modal-content button:active {
    transform: translate(2px, 2px);
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

// Make openModal globally accessible
window.openModal = openModal;

// Make openGeneratedPromptModal globally accessible
window.openGeneratedPromptModal = openGeneratedPromptModal;

// Educational Loading Overlay System
// ===================================

/**
 * Shows a minimal educational overlay during API loading that keeps users 
 * focused purely on waiting while providing subtle learning content. 
 * Designed to feel like a passive loading state, not an interactive feature.
 * 
 * @param {string} moduleName - Name of the module for targeted facts
 * @returns {Object} Control object with close() method
 */
function showEducationalLoadingOverlay(moduleName) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'educational-loading-overlay';
    overlay.innerHTML = `
        <div class="waiting-content">
            <div class="simple-spinner"></div>
            <div class="wait-title">Generating your ${moduleName} report...</div>
            <div class="wait-subtitle">This will take a moment</div>
            <div class="learning-fact">
                <div class="fact-text">Loading...</div>
            </div>
        </div>
    `;
    
    // Inject overlay styles if not already present
    if (!document.querySelector('style[data-id="educational-overlay"]')) {
        const style = document.createElement('style');
        style.dataset.id = 'educational-overlay';
        style.textContent = `
            .educational-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 15000;
                font-family: "Inter", sans-serif;
            }
            
            .waiting-content {
                background: white;
                border-radius: 8px;
                padding: 40px 32px;
                max-width: 400px;
                width: 85%;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .simple-spinner {
                width: 24px;
                height: 24px;
                border: 2px solid #f0f0f0;
                border-top: 2px solid #666;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
            }
            
            .wait-title {
                color: #333;
                font-size: 18px;
                margin-bottom: 8px;
                font-weight: 600;
                text-transform: capitalize;
            }
            
            .wait-subtitle {
                color: #888;
                font-size: 14px;
                margin-bottom: 32px;
            }
            
            .learning-fact {
                border-top: 1px solid #f0f0f0;
                padding-top: 24px;
                margin-top: 24px;
            }
            
            .fact-text {
                color: #555;
                font-size: 15px;
                line-height: 1.5;
                font-style: italic;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.3s ease;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Start simple fact rotation (fewer distractions)
    const factRotation = startSimpleFactRotation(overlay, moduleName);
    
    return {
        close: () => {
            clearInterval(factRotation.interval);
            if (overlay.parentNode) {
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.98)';
                overlay.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                setTimeout(() => {
                    overlay.parentNode.removeChild(overlay);
                }, 200);
            }
        }
    };
}

/**
 * Manages simple fact rotation - focused purely on learning while waiting
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} moduleName - Module name for targeted facts
 * @returns {Object} Control object with interval ID
 */
function startSimpleFactRotation(overlay, moduleName) {
    const factText = overlay.querySelector('.fact-text');
    
    let factIndex = 0;
    const facts = [];
    
    // Curated learning facts - shorter and more digestible for waiting
    const modulesFacts = {
        'calorie': [
            "Your brain uses 20% of daily calories",
            "Protein burns 30% more calories to digest", 
            "Muscle burns 3x more calories than fat",
            "Green tea boosts metabolism by 4-5%",
            "Eating slowly reduces overeating by 25%"
        ],
        'fitness': [
            "HIIT boosts metabolism for 24 hours",
            "Walking 10,000 steps burns ~400 calories",
            "Recovery is when muscles grow stronger",
            "Consistency beats intensity long-term",
            "Proper form prevents 90% of injuries"
        ],
        'emotion': [
            "Deep breathing activates your calming system",
            "Exercise is as effective as medication for mild depression",
            "Gratitude practice rewires brain for positivity",
            "Social connections boost immune function",
            "Sleep deprivation amplifies negative emotions"
        ],
        'decision': [
            "Sleep on big decisions for better clarity",
            "Writing pros/cons clarifies complex choices",
            "Most decisions are reversible with effort",
            "Time constraints can improve decision quality",
            "Gut feelings often contain valuable information"
        ],
        'research': [
            "Questions lead to better insights than assumptions",
            "Primary sources are more reliable than summaries",
            "Credible sources cite other credible sources",
            "Evidence-based thinking improves decisions",
            "Diverse perspectives reveal hidden biases"
        ],
        'quiz': [
            "Testing yourself is better than re-reading",
            "Spaced repetition improves retention",
            "Mistakes help strengthen neural pathways",
            "Active recall beats passive review",
            "Teaching others reinforces learning"
        ],
        'social': [
            "Active listening builds stronger relationships",
            "Body language conveys 55% of communication",
            "Shared experiences create lasting bonds",
            "Empathy can be learned and improved",
            "Vulnerability often increases trust"
        ],
        'enneagram': [
            "Self-awareness is the first step to growth",
            "Each type has unique strengths and challenges",
            "Understanding others reduces conflict",
            "Growth happens through conscious effort",
            "Stress affects behavior patterns"
        ],
        'philosophy': [
            "Wisdom comes from questioning assumptions",
            "Ethics guide us when rules fall short",
            "Authenticity requires knowing yourself",
            "Purpose gives direction to actions",
            "Growth happens outside comfort zones"
        ],
        'event': [
            "Planning reduces stress and improves outcomes",
            "Clear communication sets expectations",
            "Simple logistics work better than complex",
            "Preparation enables spontaneous moments",
            "Guest experience matters more than perfection"
        ]
    };
    
    // Get facts for this module or default to calorie facts
    const moduleFacts = modulesFacts[moduleName] || modulesFacts['calorie'];
    facts.push(...moduleFacts);
    
    // Start with first fact
    if (facts.length > 0) {
        factText.textContent = facts[0];
    }
    
    // Simple rotation every 5 seconds (slower, less distracting)
    const interval = setInterval(() => {
        if (facts.length > 0) {
            factIndex = (factIndex + 1) % facts.length;
            
            // Simple fade transition
            factText.style.opacity = '0.3';
            setTimeout(() => {
                factText.textContent = facts[factIndex];
                factText.style.opacity = '1';
            }, 150);
        }
    }, 5000);
    
    return { interval };
}

// Make the function globally accessible
window.showEducationalLoadingOverlay = showEducationalLoadingOverlay;
