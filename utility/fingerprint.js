/**
 * Digital Fingerprint Utility for Rate Limiting
 * Generates and manages user fingerprints for request tracking
 */

// Fingerprint storage key
const FINGERPRINT_KEY = '_userFingerprint';

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
        const stored = localStorage.getItem(FINGERPRINT_KEY);
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
        localStorage.setItem(FINGERPRINT_KEY, JSON.stringify(fingerprintData));
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
 * Update request count for a module
 * @param {string} module - The module name (income, calorie, etc.)
 */
export function incrementRequestCount(module) {
    try {
        const fingerprint = getFingerprint();
        fingerprint.requestCounts[module] = (fingerprint.requestCounts[module] || 0) + 1;
        fingerprint.lastRequestTimes[module] = new Date().toISOString();
        localStorage.setItem(FINGERPRINT_KEY, JSON.stringify(fingerprint));
    } catch (error) {
        console.error('Error incrementing request count:', error);
    }
}

/**
 * Check if user has exceeded rate limits for a module
 * @param {string} module - The module name
 * @param {number} maxRequests - Maximum requests allowed (default 10)
 * @param {number} timeWindow - Time window in milliseconds (default 1 hour)
 * @returns {boolean} True if rate limit exceeded
 */
export function isRateLimited(module, maxRequests = 10, timeWindow = 60 * 60 * 1000) {
    try {
        const fingerprint = getFingerprint();
        const requestCount = fingerprint.requestCounts[module] || 0;
        const lastRequestTime = fingerprint.lastRequestTimes[module];
        
        if (!lastRequestTime) return false;
        
        const timeSinceLastRequest = Date.now() - new Date(lastRequestTime).getTime();
        
        // Reset count if outside time window
        if (timeSinceLastRequest > timeWindow) {
            fingerprint.requestCounts[module] = 0;
            localStorage.setItem(FINGERPRINT_KEY, JSON.stringify(fingerprint));
            return false;
        }
        
        return requestCount >= maxRequests;
        
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return false; // Allow request if check fails
    }
}

/**
 * Get fingerprint data for sending to worker
 * @returns {Object} Clean fingerprint data for worker
 */
export function getFingerprintForWorker() {
    const fingerprint = getFingerprint();
    return {
        deviceId: fingerprint.deviceId,
        sessionId: fingerprint.sessionId,
        requestCounts: fingerprint.requestCounts,
        lastRequestTimes: fingerprint.lastRequestTimes
    };
}

// Set default export
export default { getFingerprint, incrementRequestCount, isRateLimited, getFingerprintForWorker };
