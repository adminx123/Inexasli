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
export function validateFileSize(file, maxSizeMB = 5) {
  if (!file) return null;
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new ValidationError(`File is too large (max ${maxSizeMB}MB)`, 'file');
  }
  
  return file;
}

// Magic number validation for image files (client-side)
export async function validateImageMagicNumbers(file, field = 'image') {
  if (!file) return null;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const arr = new Uint8Array(e.target.result);
        const header = Array.from(arr.subarray(0, 8))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        const validMagicNumbers = {
          'ffd8ffe0': 'image/jpeg',  // JPEG/JFIF
          'ffd8ffe1': 'image/jpeg',  // JPEG/EXIF
          'ffd8ffe2': 'image/jpeg',  // JPEG/EXIF
          'ffd8ffe3': 'image/jpeg',  // JPEG/EXIF
          'ffd8ffe8': 'image/jpeg',  // JPEG/SPIFF
          'ffd8ffdb': 'image/jpeg',  // JPEG/quantization
          '89504e47': 'image/png',   // PNG
          '47494638': 'image/gif',   // GIF87a/89a
          '52494646': 'image/webp'   // WebP (RIFF)
        };
        
        // Check first 8 bytes for full match
        let detectedType = validMagicNumbers[header];
        
        // If no match, check first 6 bytes (for some JPEG variants)
        if (!detectedType) {
          const header6 = header.substring(0, 12);
          detectedType = validMagicNumbers[header6];
        }
        
        // If no match, check first 4 bytes
        if (!detectedType) {
          const header4 = header.substring(0, 8);
          detectedType = validMagicNumbers[header4];
        }
        
        if (!detectedType) {
          reject(new ValidationError(`${field} file signature is not a valid image format`, field));
          return;
        }
        
        // Verify detected type matches file MIME type if available
        if (file.type && file.type !== detectedType) {
          reject(new ValidationError(`${field} file type mismatch: detected ${detectedType} but file claims ${file.type}`, field));
          return;
        }
        
        resolve({
          file,
          detectedType,
          magicNumber: header
        });
        
      } catch (error) {
        reject(new ValidationError(`${field} could not be validated`, field));
      }
    };
    
    reader.onerror = () => {
      reject(new ValidationError(`${field} could not be read`, field));
    };
    
    // Read first 8 bytes for magic number check
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

// Image validation (client-side) - for base64 data URLs
// Note: For File objects, use validateImageWithMagicNumbers() for enhanced security
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

// Enhanced image validation with magic number check (client-side)
export async function validateImageWithMagicNumbers(file, field = 'image') {
  if (!file) return null;
  
  // First validate file size
  validateFileSize(file, 5); // 5MB max for raw uploads
  
  // Validate magic numbers
  const magicValidation = await validateImageMagicNumbers(file, field);
  
  // Convert to data URL for further validation
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const dataUrl = e.target.result;
        
        // Validate the data URL format
        const dataUrlMatch = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!dataUrlMatch) {
          reject(new ValidationError(`${field} must be a valid image`, field));
          return;
        }
        
        const mimeType = dataUrlMatch[1];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(mimeType)) {
          reject(new ValidationError(`${field} must be JPEG, PNG, GIF, or WebP`, field));
          return;
        }
        
        // Verify consistency between magic number detection and data URL
        if (magicValidation.detectedType !== mimeType) {
          reject(new ValidationError(`${field} type inconsistency detected`, field));
          return;
        }
        
        resolve({
          dataUrl,
          file,
          detectedType: magicValidation.detectedType,
          magicNumber: magicValidation.magicNumber,
          validated: true
        });
        
      } catch (error) {
        reject(new ValidationError(`${field} validation failed: ${error.message}`, field));
      }
    };
    
    reader.onerror = () => {
      reject(new ValidationError(`${field} could not be processed`, field));
    };
    
    reader.readAsDataURL(file);
  });
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
    'decision-goal': { type: 'text', required: false, maxLength: 5000 },
    'decision-analysis-type': { type: 'text', required: false, maxLength: 100 },
    'decision-options': { type: 'text', required: false, maxLength: 2000 },
    'decision-priorities': { type: 'text', required: false, maxLength: 1000 },
    'decision-constraints': { type: 'text', required: false, maxLength: 1000 },
    'decision-timeline': { type: 'text', required: false, maxLength: 500 },
    'decision-technical': { type: 'text', required: false, maxLength: 1000 },
    'decision-stakeholders': { type: 'text', required: false, maxLength: 1000 },
    'decision-compliance': { type: 'text', required: false, maxLength: 1000 }
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
    // Date fields
    'last-period-start-date': { type: 'text', required: false, maxLength: 20 },
    'last-period-end-date': { type: 'text', required: false, maxLength: 20 },
    'hormonal-method-start-date': { type: 'text', required: false, maxLength: 20 },
    'iud-insertion-date': { type: 'text', required: false, maxLength: 20 },
    
    // Cycle info
    'natural-cycle-length': { type: 'text', required: false, maxLength: 50 },
    
    // Birth control
    'contraceptive-type': { type: 'text', required: false, maxLength: 100 },
    'barrier-method-type': { type: 'text', required: false, maxLength: 100 },
    'fertility-awareness-method': { type: 'text', required: false, maxLength: 100 },
    
    // Legacy fields
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
        basicValidated[key] = validateText(value, key, 500);
      } else if (Array.isArray(value)) {
        basicValidated[key] = value.map(item => 
          typeof item === 'string' ? validateText(item, key, 500) : item
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
              validated[field] = validateText(value, field, rule.maxLength || 500);
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
          validated[field] = validateText(value, field, 500);
        } else if (Array.isArray(value)) {
          validated[field] = value.map(item => 
            typeof item === 'string' ? validateText(item, field, 500) : item
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
