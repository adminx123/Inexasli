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
  textarea.addEventListener('input', () => {
    autoExpandTextarea(textarea);
    // Dispatch generic save event for modules to handle
    document.dispatchEvent(new CustomEvent('textarea:changed', {
      detail: { textarea, id: newId, value: textarea.value }
    }));
  });
  textarea.addEventListener('paste', () => {
    setTimeout(() => {
      autoExpandTextarea(textarea);
      document.dispatchEvent(new CustomEvent('textarea:changed', {
        detail: { textarea, id: newId, value: textarea.value }
      }));
    }, 0);
  });

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.innerText = '×';
  removeBtn.title = 'Remove this input';
  removeBtn.style.cssText = 'width: 40px; height: 40px; align-self: center; border: 1px solid #4a7c59; box-shadow: 2px 2px 4px rgba(74, 124, 89, 0.15); background-color: #f2f9f3; color: #2d5a3d; border-radius: 5px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; padding: 0; font-family: "Geist", sans-serif; margin-left: 0;';
  removeBtn.addEventListener('click', (e) => {
    // Prevent event bubbling to avoid closing parent containers
    e.preventDefault();
    e.stopPropagation();
    
    inputGroup.remove();
    if (typeof onRemove === 'function') onRemove(newId);
    
    // Trigger form data save after removal to update localStorage
    document.dispatchEvent(new CustomEvent('textarea:changed', {
      detail: { textarea: null, id: newId, value: '', action: 'removed' }
    }));
  });
  inputGroup.appendChild(removeBtn);

  // Append to container
  const container = document.querySelector(containerSelector);
  if (container) {
    // Insert above the add (+) button if it exists, otherwise above the generate button
    const addBtn = container.querySelector('.dynamic-add-btn');
    const generateBtn = container.querySelector('button[id*="generate"]');
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
 * Main initialization function for input functionality
 */
function initInputFunctionality() {
    console.log('[Input Functionality] Initializing...');
    initAutoExpandTextareas();
    initMutationObserver();
}

/**
 * Generic dynamic input creation function
 * @param {string} inputType - Type of input (for placeholder)
 * @param {string} value - Initial value
 * @param {boolean} skipRepositioning - Skip repositioning logic
 * @returns {HTMLTextAreaElement} The created textarea
 */
function addDynamicInput(inputType = null, value = '', skipRepositioning = false) {
  // Generic dynamic input that works for any module
  return addDynamicTextareaInput({
    containerSelector: '.row1:last-child',
    baseId: 'dynamic-',
    value,
    placeholder: inputType ? `${inputType}: Enter details here` : 'Enter details here',
    skipRepositioning
  });
}

/**
 * Delete an entry and trigger form persistence save
 * @param {HTMLElement} entryContainer - The entry container to delete
 */
function deleteEntry(entryContainer) {
    if (!entryContainer) return;
    
    // Get the entry ID for logging
    const entryId = entryContainer.dataset.entryId;
    
    // Optional confirmation dialog
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }
    
    // Remove the container with a smooth animation
    entryContainer.style.transition = 'opacity 0.3s ease, height 0.3s ease';
    entryContainer.style.opacity = '0';
    entryContainer.style.height = '0';
    entryContainer.style.overflow = 'hidden';
    entryContainer.style.marginBottom = '0';
    entryContainer.style.paddingTop = '0';
    entryContainer.style.paddingBottom = '0';
    
    setTimeout(() => {
        entryContainer.remove();
        
        // Trigger form persistence save after deletion
        document.dispatchEvent(new CustomEvent('entry:deleted', {
            detail: { entryId, timestamp: Date.now() }
        }));
        
        console.log('[InputFunctionality] Entry deleted:', entryId);
    }, 300);
}

/**
 * Creates a split textarea component with "when" and "what" fields
 * @param {Object} options - Configuration options
 * @param {string} options.id - Base ID for the component
 * @param {string} options.whenPlaceholder - Placeholder for when field
 * @param {string} options.whatPlaceholder - Placeholder for what field
 * @param {string} options.whenValue - Default value for when field
 * @param {string} options.whatValue - Default value for what field
 * @param {number} options.entryNumber - Entry number for display
 * @returns {HTMLElement} The created split textarea component
 */
function createSplitTextarea(options = {}) {
    const {
        id = 'split-textarea',
        whenPlaceholder = 'When?',
        whatPlaceholder = 'What happened?',
        whenValue = '',
        whatValue = '',
        entryNumber = 1
    } = options;

    // Create container
    const container = document.createElement('div');
    container.className = 'split-textarea-container';
    container.dataset.entryId = id;

    // Create entry header with delete button
    const header = document.createElement('div');
    header.className = 'entry-header';
    header.innerHTML = `
        <span class="entry-number">Entry #${entryNumber}</span>
        <button type="button" class="delete-entry-btn" data-entry-id="${id}" title="Delete this entry">×</button>
    `;

    // Create when field
    const whenField = document.createElement('input');
    whenField.type = 'text';
    whenField.className = 'when-field';
    whenField.id = `${id}-when`;
    whenField.placeholder = whenPlaceholder;
    whenField.value = whenValue;

    // Create what field
    const whatField = document.createElement('textarea');
    whatField.className = 'what-field';
    whatField.id = `${id}-what`;
    whatField.placeholder = whatPlaceholder;
    whatField.value = whatValue;
    whatField.rows = 2;

    // Create fields container
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'split-fields-container';
    
    const whenContainer = document.createElement('div');
    whenContainer.className = 'when-container';
    const whenLabel = document.createElement('label');
    whenLabel.textContent = 'When:';
    whenLabel.htmlFor = whenField.id;
    whenContainer.appendChild(whenLabel);
    whenContainer.appendChild(whenField);

    const whatContainer = document.createElement('div');
    whatContainer.className = 'what-container';
    const whatLabel = document.createElement('label');
    whatLabel.textContent = 'What:';
    whatLabel.htmlFor = whatField.id;
    whatContainer.appendChild(whatLabel);
    whatContainer.appendChild(whatField);

    fieldsContainer.appendChild(whenContainer);
    fieldsContainer.appendChild(whatContainer);

    // Add event listeners
    [whenField, whatField].forEach(field => {
        field.addEventListener('input', () => {
            // Trigger custom event for form persistence
            document.dispatchEvent(new CustomEvent('textarea:changed', {
                detail: { field, container }
            }));
        });
    });

    // Delete button event listener
    const deleteBtn = header.querySelector('.delete-entry-btn');
    deleteBtn.addEventListener('click', () => {
        deleteEntry(container);
    });

    // Auto-expand the textarea
    whatField.addEventListener('input', () => autoExpandTextarea(whatField));

    // Assemble container
    container.appendChild(header);
    container.appendChild(fieldsContainer);

    // Add CSS if not already present
    if (!document.querySelector('#split-textarea-styles')) {
        const style = document.createElement('style');
        style.id = 'split-textarea-styles';
        style.textContent = `
            .split-textarea-container {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: #fafafa;
            }
            
            .entry-header {
                margin-bottom: 10px;
                font-weight: bold;
                color: #666;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .delete-entry-btn {
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .delete-entry-btn:hover {
                background: #cc0000;
            }
            
            .split-fields-container {
                display: flex;
                gap: 15px;
                align-items: flex-start;
            }
            
            .when-container {
                flex: 0 0 180px;
            }
            
            .what-container {
                flex: 1;
            }
            
            .when-container label,
            .what-container label {
                display: block;
                margin-bottom: 5px;
                font-size: 13px;
                font-weight: 600;
                color: #555;
            }
            
            .when-field {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                background: white;
            }
            
            .what-field {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                background: white;
                resize: none;
                overflow: hidden;
                min-height: 40px;
            }
            
            .when-field:focus,
            .what-field:focus {
                outline: none;
                border-color: #ff6b9d;
                box-shadow: 0 0 5px rgba(255, 107, 157, 0.3);
            }
            
            @media (max-width: 480px) {
                .split-fields-container {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .when-container {
                    flex: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    return container;
}

/**
 * Handles conditional input display based on select dropdown value
 * @param {string} selectId - ID of the select dropdown element
 * @param {string} conditionalInputId - ID of the conditional input element
 * @param {Object} placeholderMap - Map of select values to placeholder text
 * @param {string} hideValue - Value that should hide the conditional input (default: 'none')
 * @param {Function} persistenceCallback - Optional callback to save form data
 */
function handleConditionalInput(selectId, conditionalInputId, placeholderMap, hideValue = 'none', persistenceCallback = null) {
    const selectElement = document.getElementById(selectId);
    const conditionalInput = document.getElementById(conditionalInputId);
    
    if (!selectElement || !conditionalInput) {
        console.warn('[Input Functionality] Conditional input elements not found:', selectId, conditionalInputId);
        return null;
    }
    
    function updateConditionalInput() {
        const selectedValue = selectElement.value;
        
        if (selectedValue && selectedValue !== hideValue) {
            conditionalInput.style.display = 'block';
            conditionalInput.placeholder = placeholderMap[selectedValue] || 'Specify details';
        } else {
            conditionalInput.style.display = 'none';
            conditionalInput.value = '';
        }
        
        // Trigger container resize for datain.js
        triggerContainerResize();
        
        // Call persistence callback if provided
        if (persistenceCallback && typeof persistenceCallback === 'function') {
            persistenceCallback();
        }
    }
    
    // Add event listener
    selectElement.addEventListener('change', updateConditionalInput);
    
    return updateConditionalInput;
}

/**
 * Triggers container resize to prevent layout issues when content changes
 */
function triggerContainerResize() {
    console.log('[Input Functionality] Triggering container resize');
    
    // Force a reflow by temporarily changing display
    const containers = document.querySelectorAll('.device-container, .row1');
    containers.forEach(container => {
        const originalDisplay = container.style.display;
        container.style.display = 'none';
        void container.offsetHeight; // Force reflow
        container.style.display = originalDisplay || '';
    });
    
    // Dispatch resize event
    const resizeEvent = new Event('resize');
    document.dispatchEvent(resizeEvent);
    
    // Also try to trigger any global resize handlers
    if (window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
    }
    
    // Force reflow of device container if present
    const deviceContainer = document.querySelector('.device-container');
    if (deviceContainer) {
        deviceContainer.style.height = 'auto';
        void deviceContainer.offsetHeight; // Force reflow
    }
}

/**
 * Adds a generic "Add Entry" button for split textarea entries to a container.
 * @param {Object} options
 * @param {string} options.containerSelector - CSS selector for the container (e.g., '#period-entries-container')
 * @param {string} options.buttonId - ID for the add button (e.g., 'add-period-entry-btn')
 * @param {string} options.buttonText - Text for the button (e.g., 'Add Entry')
 * @param {string} options.entryIdPrefix - Prefix for entry IDs (e.g., 'period-entry')
 * @param {string} options.whenPlaceholder - Placeholder for when field
 * @param {string} options.whatPlaceholder - Placeholder for what field
 * @param {Function} options.onAdd - Optional callback when entry is added
 */
function addEntryButton({
  containerSelector,
  buttonId,
  buttonText = 'Add Entry',
  entryIdPrefix,
  whenPlaceholder = 'When?',
  whatPlaceholder = 'What happened?',
  onAdd = null
}) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('[InputFunctionality] Container not found for add entry button:', containerSelector);
    return;
  }

  // Prevent duplicate buttons
  if (document.getElementById(buttonId)) return;

  let entryCounter = 1;

  function addEntry(whenValue = '', whatValue = '') {
    // Find existing entries to determine counter
    const existingEntries = container.querySelectorAll(`[data-entry-id^="${entryIdPrefix}"]`);
    entryCounter = existingEntries.length + 1;

    // Default "when" value to current time if empty
    if (!whenValue) {
      const now = new Date();
      whenValue = `Today ${now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    }

    const entryDiv = createSplitTextarea({
      id: `${entryIdPrefix}-${entryCounter}`,
      whenPlaceholder: whenPlaceholder,
      whatPlaceholder: whatPlaceholder,
      whenValue: whenValue,
      whatValue: whatValue,
      entryNumber: entryCounter
    });

    container.appendChild(entryDiv);
    
    // Initialize auto-expand for the new textarea
    initAutoExpandTextareas();
    
    // Call callback if provided
    if (typeof onAdd === 'function') {
      onAdd(entryCounter, entryDiv);
    }

    return entryDiv;
  }

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.id = buttonId;
  addBtn.textContent = buttonText;
  addBtn.style.cssText = [
    'padding: 10px 20px',
    'margin: 10px auto',
    'display: block',
    'border: 1px solid #4a7c59',
    'background: #f2f9f3',
    'color: #2d5a3d',
    'border-radius: 5px',
    'font-size: 14px',
    'cursor: pointer',
    'font-family: inherit',
    'box-sizing: border-box'
  ].join(';');
  
  addBtn.onclick = () => addEntry();

  // Insert after the container
  container.parentNode.insertBefore(addBtn, container.nextSibling);

  // Expose the addEntry function globally for module use
  window[`add${entryIdPrefix.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}`] = addEntry;

  return { button: addBtn, addEntry };
}

// Export functions for module use
export { 
    initAutoExpandTextareas, 
    createSplitTextarea, 
    deleteEntry,
    handleConditionalInput, 
    triggerContainerResize,
    addEntryButton
};

