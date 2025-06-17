/**
 * Input Functionality Module
 * This script contains various input-related functionality including:
 * - Auto-expanding textareas
 * - Input validation enhancements
 * - Form field behavior improvements
 * - Future input-related features can be added here
 */

console.log('[Input Functionality] Script loaded');

function autoExpandTextarea(textarea) {
    console.log('[Input Functionality] Auto-expanding textarea:', textarea.id || 'unnamed');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function initAutoExpandTextareas() {
    const textareas = document.querySelectorAll('textarea');
    console.log('[Text Functionality] Found textareas:', textareas.length);
    textareas.forEach((textarea, index) => {
        console.log(`[Text Functionality] Processing textarea ${index + 1}:`, textarea.id || 'unnamed');
        // Set initial height
        autoExpandTextarea(textarea);
        
        // Add event listeners
        textarea.addEventListener('input', () => {
            console.log('[Text Functionality] Input event on:', textarea.id || 'unnamed');
            autoExpandTextarea(textarea);
        });
        textarea.addEventListener('paste', () => {
            setTimeout(() => autoExpandTextarea(textarea), 0);
        });
    });
    
    // Also trigger auto-expand after delays to catch any programmatically set values
    setTimeout(() => {
        console.log('[Text Functionality] Re-checking textareas for auto-expansion after 500ms...');
        textareas.forEach(textarea => {
            if (textarea.value && textarea.value.trim()) {
                console.log(`[Text Functionality] Found content in ${textarea.id || 'unnamed'}, auto-expanding...`);
                autoExpandTextarea(textarea);
            }
        });
    }, 500); // Wait 500ms for form restoration to complete
    
    // Additional check after longer delay in case form restoration takes longer
    setTimeout(() => {
        console.log('[Text Functionality] Re-checking textareas for auto-expansion after 1000ms...');
        textareas.forEach(textarea => {
            if (textarea.value && textarea.value.trim()) {
                console.log(`[Text Functionality] Found content in ${textarea.id || 'unnamed'}, auto-expanding...`);
                autoExpandTextarea(textarea);
            }
        });
    }, 1000);
}

function initMutationObserver() {
    // Also handle dynamically added textareas
    const textareaObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const textareas = node.querySelectorAll ? node.querySelectorAll('textarea') : [];
                    textareas.forEach(textarea => {
                        autoExpandTextarea(textarea);
                        textarea.addEventListener('input', () => autoExpandTextarea(textarea));
                        textarea.addEventListener('paste', () => {
                            setTimeout(() => autoExpandTextarea(textarea), 0);
                        });
                    });
                    
                    if (node.tagName === 'TEXTAREA') {
                        autoExpandTextarea(node);
                        node.addEventListener('input', () => autoExpandTextarea(node));
                        node.addEventListener('paste', () => {
                            setTimeout(() => autoExpandTextarea(node), 0);
                        });
                    }
                }
            });
        });
    });

    textareaObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return textareaObserver;
}

// Initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    console.log('[Text Functionality] DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Text Functionality] DOM loaded, initializing...');
        console.log('[Text Functionality] Initializing auto-expand for existing textareas...');
        initAutoExpandTextareas();
        initMutationObserver();
    });
} else {
    console.log('[Text Functionality] DOM already ready, initializing immediately...');
    console.log('[Text Functionality] Initializing auto-expand for existing textareas...');
    initAutoExpandTextareas();
    initMutationObserver();
}

