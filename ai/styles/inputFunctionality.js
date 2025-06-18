/**
 * Input Functionality Module
 * Reusable module for various input-related functionality including:
 * - Auto-expanding textareas
 * - Dynamic textarea management
 * - Input validation enhancements
 * - Form field behavior improvements
 */

console.log('[Input Functionality] Script loaded');

/**
 * Auto-expands a textarea to fit its content
 * @param {HTMLTextAreaElement} textarea - The textarea element to expand
 */
function autoExpandTextarea(textarea) {
    console.log('[Input Functionality] Auto-expanding textarea:', textarea.id || 'unnamed');
    textarea.style.minHeight = '';
    textarea.style.height = 'auto';
    void textarea.offsetHeight;
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Advanced debugging: log computed style and parent info
    const computed = window.getComputedStyle(textarea);
    const parent = textarea.parentElement;
    console.log('[InputFunctionality][DEBUG] Computed height:', computed.height, 'Inline style.height:', textarea.style.height, 'Parent:', parent ? parent.className : null, 'Parent computed height:', parent ? window.getComputedStyle(parent).height : null);
    
    // Force reflow on parent container if present
    if (parent) {
        parent.style.display = 'none';
        void parent.offsetHeight;
        parent.style.display = '';
    }
}

/**
 * Initializes auto-expanding functionality for all textareas
 */
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
    
    // Ensure all textareas are expanded after DOM and possible repopulation
    window.addEventListener('load', () => {
        document.querySelectorAll('textarea').forEach(autoExpandTextarea);
    });
    setTimeout(() => {
        document.querySelectorAll('textarea').forEach(autoExpandTextarea);
    }, 100);
    setTimeout(() => {
        document.querySelectorAll('textarea').forEach(autoExpandTextarea);
    }, 500);
    setTimeout(() => {
        document.querySelectorAll('textarea').forEach(autoExpandTextarea);
    }, 1000);
    // Also expand after formPersistence repopulates
    document.addEventListener('formpersistence:repopulated', () => {
        document.querySelectorAll('textarea').forEach(autoExpandTextarea);
    });
}

/**
 * Initializes a mutation observer to handle dynamically added textareas
 * @returns {MutationObserver} The mutation observer instance
 */
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

/**
 * Generic function to add a dynamic textarea input group to a container.
 * @param {Object} options - Options for the dynamic textarea
 * @param {string} options.containerSelector - CSS selector for the container to append to
 * @param {string} options.baseId - Base id for the textarea (e.g. 'calorie-snack')
 * @param {string} [options.value] - Optional initial value
 * @param {string} [options.placeholder] - Optional placeholder text
 * @param {Function} [options.onRemove] - Optional callback when removed
 * @param {boolean} [options.skipRepositioning] - Skip repositioning logic (for repopulation)
 * @returns {HTMLTextAreaElement} The created textarea
 */
function addDynamicTextareaInput({
  containerSelector,
  baseId,
  value = '',
  placeholder = '',
  onRemove = null,
  skipRepositioning = false
}) {
  // Find all existing dynamic textareas for this baseId
  const existing = Array.from(document.querySelectorAll(`textarea[id^="${baseId}"]`));
  let maxNum = 0;
  existing.forEach(el => {
    const match = el.id.match(new RegExp(`^${baseId}(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  const newId = `${baseId}${maxNum + 1}`;

  const inputGroup = document.createElement('div');
  inputGroup.style.cssText = 'display: flex; align-items: center; gap: 8px; margin: 8px auto; max-width: 460px; width: 100%';

  const textarea = document.createElement('textarea');
  textarea.rows = 2;
  textarea.setAttribute('data-dynamic', baseId);
  textarea.id = newId;
  textarea.placeholder = placeholder || `${baseId.charAt(0).toUpperCase() + baseId.slice(1)}: 100g yogurt, 2 oz crackers`;
  if (value) textarea.value = value;
  inputGroup.appendChild(textarea);

  // Auto-expand and add listeners
  autoExpandTextarea(textarea);
  textarea.addEventListener('input', () => autoExpandTextarea(textarea));
  textarea.addEventListener('paste', () => setTimeout(() => autoExpandTextarea(textarea), 0));

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.innerText = '×';
  removeBtn.title = 'Remove this input';
  removeBtn.style.cssText = 'width: 40px; height: 40px; align-self: center; border: 1px solid #4a7c59; box-shadow: 2px 2px 4px rgba(74, 124, 89, 0.15); background-color: #f2f9f3; color: #2d5a3d; border-radius: 5px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; padding: 0; font-family: "Geist", sans-serif; margin-left: 0;';
  removeBtn.addEventListener('click', () => {
    inputGroup.remove();
    if (typeof onRemove === 'function') onRemove(newId);
  });
  inputGroup.appendChild(removeBtn);

  // Append to container
  const container = document.querySelector(containerSelector);
  if (container) {
    // Insert above the add (+) button if it exists, otherwise above the generate button
    const addBtn = container.querySelector('.dynamic-add-btn');
    const generateBtn = container.querySelector('#generate-calorie-btn');
    if (addBtn) {
      container.insertBefore(inputGroup, addBtn);
    } else if (generateBtn) {
      container.insertBefore(inputGroup, generateBtn);
    } else {
      container.appendChild(inputGroup);
    }
  } else {
    console.error('[InputFunctionality] Container not found:', containerSelector);
  }
  return textarea;
}

/**
 * Adds a generic "Add" button for dynamic textarea inputs to a container.
 * @param {Object} options
 * @param {string} options.containerSelector - CSS selector for the container
 * @param {string} options.baseId - Base id for the textarea (e.g. 'calorie-snack')
 * @param {string} [options.placeholder] - Optional placeholder text
 */
function addDynamicTextareaAddButton({
  containerSelector,
  baseId,
  placeholder = ''
}) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('[InputFunctionality] Container not found for add button:', containerSelector);
    return;
  }
  // Prevent duplicate add buttons
  if (container.querySelector('.dynamic-add-btn')) return;

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'dynamic-add-btn';
  addBtn.innerText = '+';
  addBtn.title = 'Add another input';
  addBtn.style.cssText = [
    'width: 40px',
    'height: 40px',
    'margin: 8px auto',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'border: 1px solid #4a7c59',
    'background: #f2f9f3',
    'color: #2d5a3d',
    'border-radius: 5px',
    'font-size: 22px',
    'cursor: pointer',
    'font-family: inherit',
    'box-sizing: border-box'
  ].join(';');
  addBtn.onclick = () => {
    addDynamicTextareaInput({
      containerSelector,
      baseId,
      placeholder
    });
  };
  // Insert above the Generate Now button if it exists
  const generateBtn = container.querySelector('#generate-calorie-btn');
  if (generateBtn) {
    container.insertBefore(addBtn, generateBtn);
  } else {
    container.appendChild(addBtn);
  }
}
/**
 * Debugging function for textarea expansion sequence
 */
function debugTextareaExpansionSequence() {
    console.log('[InputFunctionality][DEBUG] --- Expansion Debug Sequence Start ---');
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((ta, i) => {
        console.log(`[InputFunctionality][DEBUG] Before expand [${i}] id=${ta.id} value=`, JSON.stringify(ta.value), 'scrollHeight=', ta.scrollHeight, 'offsetHeight=', ta.offsetHeight, 'style.height=', ta.style.height);
    });
    textareas.forEach(autoExpandTextarea);
    textareas.forEach((ta, i) => {
        console.log(`[InputFunctionality][DEBUG] After expand [${i}] id=${ta.id} value=`, JSON.stringify(ta.value), 'scrollHeight=', ta.scrollHeight, 'offsetHeight=', ta.offsetHeight, 'style.height=', ta.style.height);
    });
    console.log('[InputFunctionality][DEBUG] --- Expansion Debug Sequence End ---');
}

/**
 * Triggers textarea expansion after form repopulation
 */
function triggerTextareaExpansion() {
    debugTextareaExpansionSequence();
}

/**
 * Legacy compatibility function for CalorieIQ
 * @param {string} mealType - Type of meal
 * @param {string} value - Initial value
 * @param {boolean} skipRepositioning - Skip repositioning logic
 * @returns {HTMLTextAreaElement} The created textarea
 */
function addMealInput(mealType = null, value = '', skipRepositioning = false) {
  // Use calorie- as baseId for all dynamic meal/snack textareas
  return addDynamicTextareaInput({
    containerSelector: '.row1:last-child',
    baseId: 'calorie-',
    value,
    placeholder: mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) + ': 100g yogurt, 2 oz crackers' : '',
    skipRepositioning
  });
}

/**
 * Main initialization function
 */
function initInputFunctionality() {
    console.log('[Text Functionality] Initializing auto-expand for existing textareas...');
    initAutoExpandTextareas();
    initMutationObserver();
    
    // Listen for form repopulation events
    document.addEventListener('formpersistence:repopulated', triggerTextareaExpansion);
}

// ==========================================
// MODULE EXPORTS AND GLOBAL EXPOSURES
// ==========================================

// Core API exports for ES6 modules
export {
    autoExpandTextarea,
    addDynamicTextareaInput,
    addDynamicTextareaAddButton,
    initAutoExpandTextareas,
    initMutationObserver,
    debugTextareaExpansionSequence,
    initInputFunctionality
};

// Global window exposures for backward compatibility and direct script usage
if (typeof window !== 'undefined') {
    window.InputFunctionality = {
        autoExpandTextarea,
        addDynamicTextareaInput,
        addDynamicTextareaAddButton,
        initAutoExpandTextareas,
        initMutationObserver,
        debugTextareaExpansionSequence,
        triggerTextareaExpansion,
        init: initInputFunctionality
    };
    
    // Legacy global functions for existing code compatibility
    window.autoExpandTextarea = autoExpandTextarea;
    window.addDynamicTextareaInput = addDynamicTextareaInput;
    window.addDynamicTextareaAddButton = addDynamicTextareaAddButton;
    window.addMealInput = addMealInput;
    window.debugTextareaExpansionSequence = debugTextareaExpansionSequence;
}

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('[Text Functionality] DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Text Functionality] DOM loaded, initializing...');
        initInputFunctionality();
    });
} else {
    console.log('[Text Functionality] DOM already ready, initializing immediately...');
    initInputFunctionality();
}

// ==========================================
// CALORIE-SPECIFIC INITIALIZATION (Legacy Support)
// ==========================================

// Form persistence initialization for calorie module
if (typeof window !== 'undefined') {
    try {
        // Dynamically import formPersistence if available
        import('../../utility/formPersistence.js').then(({ FormPersistence }) => {
            window.calorieFormPersistence = FormPersistence.getInstance('calorie');
            window.calorieFormPersistence.init();
        }).catch(err => {
            console.log('[InputFunctionality] FormPersistence not available:', err.message);
        });
    } catch (err) {
        console.log('[InputFunctionality] Could not load FormPersistence:', err.message);
    }
}

// CalorieIQ-specific add button initialization
const foodLogSelector = '.row1[data-step-label="Food Log"]';

function initCalorieAddButton() {
    addDynamicTextareaAddButton({
        containerSelector: foodLogSelector,
        baseId: 'calorie-',
        placeholder: 'Snack: 100g yogurt, 2 oz crackers'
    });
}

// Initialize CalorieIQ add button
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalorieAddButton);
} else {
    initCalorieAddButton();
}

// MutationObserver to ensure the add button is always present in the food log section
(function ensureAddButtonObserver() {
    const targetSelector = foodLogSelector;
    const config = { childList: true, subtree: true };
    
    function checkAndInject() {
        const container = document.querySelector(targetSelector);
        if (container && !container.querySelector('.dynamic-add-btn')) {
            addDynamicTextareaAddButton({
                containerSelector: targetSelector,
                baseId: 'calorie-',
                placeholder: 'Snack: 100g yogurt, 2 oz crackers'
            });
        }
    }
    
    // Initial check
    checkAndInject();
    
    // Observe DOM changes
    const observer = new MutationObserver(() => {
        checkAndInject();
    });
    observer.observe(document.body, config);
})();

