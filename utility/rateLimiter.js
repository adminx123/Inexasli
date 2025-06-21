/**
 * Rate Limiting and Fingerprint Utility
 * Combined client-side rate limiting with device fingerprinting
 * Works with centralized rate-limiter worker for robust protection
 */

// Configuration
const RATE_LIMIT_CONFIG = {
  FINGERPRINT_KEY: '_userFingerprint',
  // Simple client-side limits (real enforcement happens server-side)
  MAX_REQUESTS_PER_MINUTE: 5,
  REQUEST_WINDOW: 60000 // 1 minute
};

/**
 * Generate a device fingerprint based on browser characteristics
 * @returns {string} A unique device fingerprint
 */
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint test', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.platform,
        navigator.cookieEnabled,
        canvasFingerprint.slice(-50) // Last 50 chars of canvas fingerprint
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
}

/**
 * Generate a session ID
 * @returns {string} A unique session identifier
 */
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get or create user fingerprint data
 * @returns {Object} The fingerprint data object
 */
export function getFingerprint() {
    try {
        const stored = localStorage.getItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY);
        let fingerprintData;
        let legacyCorrupt = false;
        
        if (stored) {
            try {
                fingerprintData = JSON.parse(stored);
            } catch (e) {
                // Corrupt JSON, treat as legacy/corrupt
                legacyCorrupt = true;
            }
            // Check if session expired (24 hours)
            if (!legacyCorrupt && fingerprintData) {
                const sessionAge = Date.now() - fingerprintData.sessionCreated;
                if (sessionAge > 24 * 60 * 60 * 1000) {
                    // Create new session but keep device ID
                    fingerprintData.sessionId = generateSessionId();
                    fingerprintData.sessionCreated = Date.now();
                    fingerprintData.requestCounts = {};
                    fingerprintData.lastRequestTimes = [];
                }
            }
        }
        if (!stored || legacyCorrupt || !fingerprintData || typeof fingerprintData.deviceId !== 'string' || !fingerprintData.deviceId) {
            // Legacy/corrupt/missing: clear and regenerate
            localStorage.removeItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY);
            fingerprintData = {
                deviceId: generateDeviceFingerprint(),
                sessionId: generateSessionId(),
                sessionCreated: Date.now(),
                requestCounts: {},
                lastRequestTimes: [],
                rateLimitStatus: {}
            };
        }
        // --- HARDENING PATCH ---
        // Always ensure deviceId exists and is a string
        if (!fingerprintData.deviceId || typeof fingerprintData.deviceId !== 'string') {
            fingerprintData.deviceId = generateDeviceFingerprint();
        }
        // Always ensure lastRequestTimes is an array
        if (!Array.isArray(fingerprintData.lastRequestTimes)) {
            fingerprintData.lastRequestTimes = [];
        }
        // Save updated fingerprint
        localStorage.setItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY, JSON.stringify(fingerprintData));
        return fingerprintData;
        
    } catch (error) {
        console.error('Error getting fingerprint:', error);
        // Return minimal fingerprint if storage fails
        return {
            deviceId: generateDeviceFingerprint(),
            sessionId: generateSessionId(),
            sessionCreated: Date.now(),
            requestCounts: {},
            lastRequestTimes: [],
            rateLimitStatus: {}
        };
    }
}

/**
 * Get fingerprint for worker requests
 * @returns {string} Combined fingerprint string
 */
export function getFingerprintForWorker() {
    // Return the full fingerprint object for compatibility with all modules
    return getFingerprint();
}

/**
 * Simple client-side rate limit check
 * This is a quick pre-check; real enforcement happens server-side
 * @returns {boolean} True if rate limited
 */
export function isRateLimited() {
    try {
        const fingerprint = getFingerprint();
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_CONFIG.REQUEST_WINDOW;
        
        // Clean old request times
        if (fingerprint.lastRequestTimes) {
            const recentRequests = fingerprint.lastRequestTimes.filter(time => time > windowStart);
            fingerprint.lastRequestTimes = recentRequests;
            
            // Check if over limit
            if (recentRequests.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return false; // Don't block on error
    }
}

/**
 * Increment request count after successful API call
 */
export function incrementRequestCount() {
    try {
        const fingerprint = getFingerprint();
        const now = Date.now();
        
        // Initialize if needed
        if (!fingerprint.lastRequestTimes) {
            fingerprint.lastRequestTimes = [];
        }
        
        // Add this request time
        fingerprint.lastRequestTimes.push(now);
        
        // Keep only recent requests (last hour for cleanup)
        const oneHourAgo = now - (60 * 60 * 1000);
        fingerprint.lastRequestTimes = fingerprint.lastRequestTimes.filter(time => time > oneHourAgo);
        
        // Save updated fingerprint
        localStorage.setItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY, JSON.stringify(fingerprint));
        
        // Update rate limit display if it exists
        updateRateLimitDisplay();
        
    } catch (error) {
        console.error('Error incrementing request count:', error);
    }
}

/**
 * Operation X: Rate Limit Display System
 * Injects and manages rate limit status display for AI modules
 */

// Module-specific rate limits (client-side estimates)
const MODULE_LIMITS = {
    income: { perDay: 50, perHour: 10, perMinute: 2 },
    calorie: { perDay: 40, perHour: 8, perMinute: 2 },
    decision: { perDay: 60, perHour: 12, perMinute: 2 },
    enneagram: { perDay: 25, perHour: 5, perMinute: 1 },
    event: { perDay: 40, perHour: 8, perMinute: 2 },
    fashion: { perDay: 50, perHour: 10, perMinute: 2 },
    philosophy: { perDay: 30, perHour: 6, perMinute: 1 },
    quiz: { perDay: 75, perHour: 15, perMinute: 3 },
    research: { perDay: 40, perHour: 8, perMinute: 2 },
    social: { perDay: 50, perHour: 10, perMinute: 2 }
};

/**
 * Detect current module based on URL or page context
 * @returns {string} Module name
 */
function detectCurrentModule() {
    const path = window.location.pathname;
    for (const module of Object.keys(MODULE_LIMITS)) {
        if (path.includes(`/${module}/`) || path.includes(`${module}iq.html`)) {
            return module;
        }
    }
    return 'unknown';
}

/**
 * Calculate remaining requests for current module
 * @param {string} moduleType - The AI module type
 * @returns {Object} Rate limit status
 */
function calculateRemainingRequests(moduleType = null) {
    if (!moduleType) moduleType = detectCurrentModule();
    
    const limits = MODULE_LIMITS[moduleType] || MODULE_LIMITS.decision;
    const fingerprint = getFingerprint();
    const now = Date.now();
    
    // Count recent requests in different time windows
    const requests = fingerprint.lastRequestTimes || [];
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    
    const requestsLastMinute = requests.filter(time => time > oneMinuteAgo).length;
    const requestsLastHour = requests.filter(time => time > oneHourAgo).length;
    const requestsLastDay = requests.filter(time => time > oneDayAgo).length;
    
    return {
        minute: {
            used: requestsLastMinute,
            limit: limits.perMinute,
            remaining: Math.max(0, limits.perMinute - requestsLastMinute)
        },
        hour: {
            used: requestsLastHour,
            limit: limits.perHour,
            remaining: Math.max(0, limits.perHour - requestsLastHour)
        },
        day: {
            used: requestsLastDay,
            limit: limits.perDay,
            remaining: Math.max(0, limits.perDay - requestsLastDay)
        }
    };
}

/**
 * Inject rate limit display above generate button
 * @param {string} moduleType - The AI module type
 */
export function injectRateLimitDisplay(moduleType = null) {
    if (!moduleType) moduleType = detectCurrentModule();
    
    // Find generate button (try multiple common patterns)
    const generateBtn = document.querySelector('[id*="generate"]') || 
                      document.querySelector('.generate-btn') ||
                      document.querySelector('button[id$="-btn"]');
    
    if (!generateBtn) {
        console.warn('[RateLimiter] Generate button not found for rate limit display');
        return;
    }
    
    // Check if display already exists
    let displayElement = document.getElementById('rate-limit-display');
    
    if (!displayElement) {
        // Create rate limit display element
        displayElement = document.createElement('div');
        displayElement.id = 'rate-limit-display';
        displayElement.style.cssText = `
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            text-align: center;
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            border: 1px solid #d4e3ff;
            color: #4a5568;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;
        
        // Insert before generate button
        generateBtn.parentNode.insertBefore(displayElement, generateBtn);
    }
    
    // Update display content
    updateRateLimitDisplay(moduleType, displayElement);
}

/**
 * Update rate limit display content
 * @param {string} moduleType - The AI module type
 * @param {HTMLElement} displayElement - The display element
 */
function updateRateLimitDisplay(moduleType = null, displayElement = null) {
    if (!moduleType) moduleType = detectCurrentModule();
    if (!displayElement) displayElement = document.getElementById('rate-limit-display');
    
    if (!displayElement) return;
    
    const status = calculateRemainingRequests(moduleType);
    const mostRestrictive = Math.min(status.minute.remaining, status.hour.remaining, status.day.remaining);
    
    let message = '';
    let bgColor = '';
    
    if (mostRestrictive === 0) {
        message = '⏳ Rate limit reached. Please wait before making another request.';
        bgColor = 'linear-gradient(135deg, #fff2f2 0%, #ffe8e8 100%)';
        displayElement.style.borderColor = '#fecaca';
        displayElement.style.color = '#dc2626';
    } else if (mostRestrictive <= 2) {
        message = `⚠️ ${mostRestrictive} requests remaining. Use wisely!`;
        bgColor = 'linear-gradient(135deg, #fffbf2 0%, #fef3e2 100%)';
        displayElement.style.borderColor = '#fed7aa';
        displayElement.style.color = '#d97706';
    } else {
        message = `✅ ${status.day.remaining} requests remaining today (${status.hour.remaining}/hour, ${status.minute.remaining}/minute)`;
        bgColor = 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)';
        displayElement.style.borderColor = '#d4e3ff';
        displayElement.style.color = '#4a5568';
    }
    
    displayElement.style.background = bgColor;
    displayElement.textContent = message;
}

/**
 * Auto-initialize rate limit display when page loads
 */
function autoInitializeRateLimitDisplay() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => injectRateLimitDisplay(), 100);
        });
    } else {
        setTimeout(() => injectRateLimitDisplay(), 100);
    }
    
    // Also try after a longer delay in case elements load dynamically
    setTimeout(() => injectRateLimitDisplay(), 1000);
}

// Auto-initialize when this module is imported
autoInitializeRateLimitDisplay();
