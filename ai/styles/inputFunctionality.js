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
    // Remove any inline height/minHeight that could interfere
    textarea.style.minHeight = '';
    textarea.style.height = 'auto';
    // Force a reflow to ensure scrollHeight is correct
    void textarea.offsetHeight;
    // Set height to fit content, even if value is set programmatically
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
export function addDynamicTextareaInput({
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
    container.appendChild(inputGroup);
  } else {
    console.error('[InputFunctionality] Container not found:', containerSelector);
  }
  return textarea;
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

// Ensure this script imports and initializes formPersistence for the calorie module
import { FormPersistence } from '../../utility/formPersistence.js';
window.calorieFormPersistence = FormPersistence.getInstance('calorie');
window.calorieFormPersistence.init();

// Expose a generic addDynamicTextareaInput for use by formPersistence and other modules
window.addDynamicTextareaInput = addDynamicTextareaInput;
// For backward compatibility, alias addMealInput for CalorieIQ
window.addMealInput = function(mealType = null, value = '', skipRepositioning = false) {
  // Use calorie- as baseId for all dynamic meal/snack textareas
  return addDynamicTextareaInput({
    containerSelector: '.row1:last-child',
    baseId: 'calorie-',
    value,
    placeholder: mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) + ': 100g yogurt, 2 oz crackers' : '',
    skipRepositioning
  });
};

// Expose autoExpandTextarea globally for use by formPersistence and other modules
window.autoExpandTextarea = autoExpandTextarea;

