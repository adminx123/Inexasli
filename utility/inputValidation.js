// utility/inputValidation.js
// Shared input validation functions for client-side pre-validation
// This provides consistent validation across all AI modules

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Text input validation (client-side)
export function validateText(text, field = 'text', maxLength = 10000) {
  if (typeof text !== 'string') {
    throw new ValidationError(`${field} must be text`, field);
  }
  
  // Security check: Block obvious XSS attempts but allow natural language
  const dangerousPatterns = [
    /<script[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      throw new ValidationError(`${field} contains potentially harmful content`, field);
    }
  }
  
  if (text.length > maxLength) {
    throw new ValidationError(`${field} is too long (max ${maxLength} characters)`, field);
  }
  
  // Light HTML removal - keep the content natural but remove tags
  const cleaned = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// Numeric validation (client-side)
export function validateNumber(value, field = 'number', min = null, max = null) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new ValidationError(`${field} must be a valid number`, field);
  }
  
  if (min !== null && num < min) {
    throw new ValidationError(`${field} must be at least ${min}`, field);
  }
  
  if (max !== null && num > max) {
    throw new ValidationError(`${field} must be at most ${max}`, field);
  }
  
  return num;
}

// Email validation (client-side)
export function validateEmail(email, field = 'email') {
  if (!email) return null;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(`${field} format is invalid`, field);
  }
  
  if (email.length > 254) {
    throw new ValidationError(`${field} is too long`, field);
  }
  
  return email.toLowerCase();
}

// File size validation (client-side)
export function validateFileSize(file, maxSizeMB = 10) {
  if (!file) return null;
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new ValidationError(`File is too large (max ${maxSizeMB}MB)`, 'file');
  }
  
  return file;
}

// Image validation (client-side)
export function validateImage(imageData, field = 'image') {
  if (!imageData) return null;
  
  if (typeof imageData !== 'string') {
    throw new ValidationError(`${field} must be a base64 string`, field);
  }
  
  const dataUrlMatch = imageData.match(/^data:(.+);base64,(.+)$/);
  if (!dataUrlMatch) {
    throw new ValidationError(`${field} must be a valid image`, field);
  }
  
  const mimeType = dataUrlMatch[1];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(mimeType)) {
    throw new ValidationError(`${field} must be JPEG, PNG, GIF, or WebP`, field);
  }
  
  return imageData;
}

// Form validation helper
export function validateForm(formData, rules) {
  const validated = {};
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    try {
      const value = formData[field];
      
      if (rule.required && (value === null || value === undefined || value === '')) {
        throw new ValidationError(`${field} is required`, field);
      }
      
      if (value !== null && value !== undefined && value !== '') {
        switch (rule.type) {
          case 'text':
            validated[field] = validateText(value, field, rule.maxLength);
            break;
          case 'number':
            validated[field] = validateNumber(value, field, rule.min, rule.max);
            break;
          case 'email':
            validated[field] = validateEmail(value, field);
            break;
          case 'image':
            validated[field] = validateImage(value, field);
            break;
          case 'array':
            if (Array.isArray(value)) {
              validated[field] = value.map(item => {
                if (rule.itemType === 'text') {
                  return validateText(item, field, rule.maxLength);
                }
                return item;
              });
            } else {
              validated[field] = value;
            }
            break;
          default:
            validated[field] = value;
        }
      }
    } catch (error) {
      errors.push({ field, message: error.message });
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Form validation failed', 'form', errors);
  }
  
  return validated;
}

// Display validation errors in UI
export function displayValidationErrors(errors, formElement) {
  // Clear existing errors
  formElement.querySelectorAll('.validation-error').forEach(el => el.remove());
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      const field = formElement.querySelector(`[name="${error.field}"]`);
      if (field) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error text-red-500 text-sm mt-1';
        errorDiv.textContent = error.message;
        field.parentNode.appendChild(errorDiv);
      }
    });
  } else if (typeof errors === 'string') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error text-red-500 text-sm mt-2 p-2 border border-red-300 rounded';
    errorDiv.textContent = errors;
    formElement.appendChild(errorDiv);
  }
}

// Module-specific validation rules - flexible for natural language input
export const MODULE_VALIDATION_RULES = {
  calorie: {
    // Basic numeric validations
    'calorie-age': { type: 'number', required: false, min: 1, max: 120 },
    'age': { type: 'text', required: false, maxLength: 50 }, // Allow text input like "25 years old"
    'calorie-weight': { type: 'text', required: false, maxLength: 50 }, // Allow "70 kg" or "150 lbs"
    'weight': { type: 'text', required: false, maxLength: 50 },
    'calorie-height': { type: 'text', required: false, maxLength: 50 }, // Allow "5'10" or "180cm"
    'height': { type: 'text', required: false, maxLength: 50 },
    'calorie-sex': { type: 'text', required: false, maxLength: 20 },
    'sex': { type: 'text', required: false, maxLength: 20 },
    'calorie-activity-level': { type: 'text', required: false, maxLength: 2000 },
    'activity-level': { type: 'text', required: false, maxLength: 2000 },
    'calorie-goal': { type: 'text', required: false, maxLength: 500 },
    'goal': { type: 'text', required: false, maxLength: 500 },
    // Food log entries
    'calorie-breakfast': { type: 'text', required: false, maxLength: 1000 },
    'calorie-lunch': { type: 'text', required: false, maxLength: 1000 },
    'calorie-dinner': { type: 'text', required: false, maxLength: 1000 },
    'calorie-snacks': { type: 'text', required: false, maxLength: 1000 }
  },
  
  decision: {
    'decision-situation': { type: 'text', required: false, maxLength: 5000 },
    'situation': { type: 'text', required: false, maxLength: 5000 },
    'decision-options': { type: 'text', required: false, maxLength: 2000 },
    'options': { type: 'text', required: false, maxLength: 2000 },
    'decision-criteria': { type: 'text', required: false, maxLength: 2000 },
    'criteria': { type: 'text', required: false, maxLength: 2000 }
  },
  
  fashion: {
    'fashion-personal-style': { type: 'text', required: false, maxLength: 500 },
    'fashion-climate': { type: 'text', required: false, maxLength: 200 },
    'fashion-occasion': { type: 'text', required: false, maxLength: 500 },
    'fashion-inspiration': { type: 'text', required: false, maxLength: 2000 },
    'style': { type: 'text', required: false, maxLength: 500 },
    'occasion': { type: 'text', required: false, maxLength: 500 },
    'budget': { type: 'text', required: false, maxLength: 100 },
    'images': { type: 'array', required: false, itemType: 'image' }
  },
  
  income: {
    'income-current': { type: 'text', required: false, maxLength: 100 },
    'income-desired': { type: 'text', required: false, maxLength: 100 },
    'income-skills': { type: 'text', required: false, maxLength: 2000 },
    'income-industry': { type: 'text', required: false, maxLength: 200 },
    'skills': { type: 'text', required: false, maxLength: 2000 },
    'industry': { type: 'text', required: false, maxLength: 200 }
  },
  
  enneagram: {
    // Enneagram question responses
    'enneagram-responses': { type: 'array', required: false, itemType: 'text', maxLength: 500 },
    'responses': { type: 'array', required: false, itemType: 'text', maxLength: 500 }
  },
  
  event: {
    'event-budget': { type: 'text', required: false, maxLength: 100 },
    'event-people': { type: 'text', required: false, maxLength: 100 },
    'event-occasion': { type: 'text', required: false, maxLength: 500 },
    'event-preferences': { type: 'text', required: false, maxLength: 2000 },
    'budget': { type: 'text', required: false, maxLength: 100 },
    'people': { type: 'text', required: false, maxLength: 100 },
    'occasion': { type: 'text', required: false, maxLength: 500 },
    'preferences': { type: 'text', required: false, maxLength: 2000 }
  },
  
  philosophy: {
    'philosophy-topic': { type: 'text', required: false, maxLength: 1000 },
    'philosophy-context': { type: 'text', required: false, maxLength: 3000 },
    'topic': { type: 'text', required: false, maxLength: 1000 },
    'context': { type: 'text', required: false, maxLength: 3000 }
  },
  
  quiz: {
    'quiz-topic': { type: 'text', required: false, maxLength: 500 },
    'quiz-difficulty': { type: 'text', required: false, maxLength: 100 },
    'quiz-questions': { type: 'text', required: false, maxLength: 100 },
    'topic': { type: 'text', required: false, maxLength: 500 },
    'difficulty': { type: 'text', required: false, maxLength: 100 },
    'questions': { type: 'text', required: false, maxLength: 100 }
  },
  
  period: {
    'period-entries': { type: 'array', required: false, itemType: 'text', maxLength: 500 },
    'entries': { type: 'array', required: false, itemType: 'text', maxLength: 500 }
  }
};

// Validate data for specific module
export function validateModuleData(moduleName, formData) {
  const rules = MODULE_VALIDATION_RULES[moduleName];
  if (!rules) {
    console.warn(`[InputValidation] No validation rules for module: ${moduleName}, using basic validation`);
    // Basic validation for unknown modules - just check for security issues
    const basicValidated = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        basicValidated[key] = validateText(value, key, 10000);
      } else if (Array.isArray(value)) {
        basicValidated[key] = value.map(item => 
          typeof item === 'string' ? validateText(item, key, 10000) : item
        );
      } else {
        basicValidated[key] = value;
      }
    }
    return basicValidated;
  }
  
  // For modules with rules, use flexible validation
  const validated = {};
  const errors = [];
  
  for (const [field, value] of Object.entries(formData)) {
    try {
      const rule = rules[field];
      
      if (rule) {
        // Apply rule-based validation
        if (value !== null && value !== undefined && value !== '') {
          switch (rule.type) {
            case 'text':
              validated[field] = validateText(value, field, rule.maxLength || 10000);
              break;
            case 'number':
              validated[field] = validateNumber(value, field, rule.min, rule.max);
              break;
            case 'email':
              validated[field] = validateEmail(value, field);
              break;
            case 'image':
              validated[field] = validateImage(value, field);
              break;
            case 'array':
              if (Array.isArray(value)) {
                validated[field] = value.map(item => {
                  if (rule.itemType === 'text') {
                    return validateText(item, field, rule.maxLength || 1000);
                  }
                  return item;
                });
              } else {
                validated[field] = value;
              }
              break;
            default:
              validated[field] = value;
          }
        } else {
          validated[field] = value;
        }
      } else {
        // No specific rule - apply basic security validation
        if (typeof value === 'string') {
          validated[field] = validateText(value, field, 10000);
        } else if (Array.isArray(value)) {
          validated[field] = value.map(item => 
            typeof item === 'string' ? validateText(item, field, 1000) : item
          );
        } else {
          validated[field] = value;
        }
      }
    } catch (error) {
      // Don't fail validation for non-critical errors in permissive mode
      console.warn(`[InputValidation] Validation warning for ${field}:`, error.message);
      validated[field] = value; // Keep original value
    }
  }
  
  return validated;
}

/**
 * Sanitize error messages from backend to prevent XSS
 * @param {string} message - The error message to sanitize
 * @returns {string} - Sanitized error message
 */
export function sanitizeErrorMessage(message) {
    if (!message || typeof message !== 'string') {
        return 'An error occurred';
    }
    
    // HTML entity encoding for error messages
    return message.replace(/[<>&"']/g, (char) => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#x27;'
        };
        return entities[char];
    });
}

// Sanitize JSON content recursively for backend responses
export function sanitizeJsonContent(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'string') {
        // Remove script tags, HTML tags, and dangerous attributes
        return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeJsonContent(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeJsonContent(value);
        }
        return sanitized;
    }
    
    return obj;
}
