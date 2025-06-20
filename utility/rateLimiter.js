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
        
        if (stored) {
            fingerprintData = JSON.parse(stored);
            // Check if session expired (24 hours)
            const sessionAge = Date.now() - fingerprintData.sessionCreated;
            if (sessionAge > 24 * 60 * 60 * 1000) {
                // Create new session but keep device ID
                fingerprintData.sessionId = generateSessionId();
                fingerprintData.sessionCreated = Date.now();
                fingerprintData.requestCounts = {};
                fingerprintData.lastRequestTimes = {};
            }
        } else {
            // Create new fingerprint
            fingerprintData = {
                deviceId: generateDeviceFingerprint(),
                sessionId: generateSessionId(),
                sessionCreated: Date.now(),
                requestCounts: {},
                lastRequestTimes: {},
                rateLimitStatus: {}
            };
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
            lastRequestTimes: {},
            rateLimitStatus: {}
        };
    }
}

/**
 * Get fingerprint for worker requests
 * @returns {string} Combined fingerprint string
 */
export function getFingerprintForWorker() {
    const fingerprint = getFingerprint();
    return `${fingerprint.deviceId}_${fingerprint.sessionId}`;
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
        
    } catch (error) {
        console.error('Error incrementing request count:', error);
    }
}
