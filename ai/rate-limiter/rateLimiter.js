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
function getOrCreateFingerprint() {
    let deviceId = localStorage.getItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY);
    if (!deviceId) {
        deviceId = generateDeviceFingerprint();
        localStorage.setItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY, deviceId);
    }
    let sessionId = localStorage.getItem('_userSessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('_userSessionId', sessionId);
    }
    return { deviceId, sessionId };
}

/**
 * Get the current rate limit status for the user (async)
 * @returns {Promise<Object>} - { remaining, limits, allowed, ... }
 */
async function getRateLimitStatus(rateLimiterUrl) {
    // Get or create fingerprint/session
    const fingerprint = getOrCreateFingerprint();
    const module = 'datain'; // or dynamically set as needed
    const payload = { fingerprint, module };
    console.log('[RateLimit] Sending payload:', payload);
    const response = await fetch(rateLimiterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to fetch rate limit status');
    const data = await response.json();
    return data;
}

/**
 * Render the RateLimit display in a container
 * @param {HTMLElement} container - The container to inject the display into
 * @param {string} rateLimiterUrl - The endpoint for the rate limiter worker
 */
async function renderRateLimitDisplay(container, rateLimiterUrl) {
    let display = container.querySelector('.rate-limit-display');
    if (!display) {
        display = document.createElement('div');
        display.className = 'rate-limit-display';
        display.style = 'padding: 4px 0; font-size: 13px; color: #444; font-weight: 500;';
        container.prepend(display);
    }
    display.textContent = 'RateLimit: ...';
    try {
        const status = await getRateLimitStatus(rateLimiterUrl);
        if (status && status.remaining && status.limits) {
            display.textContent = `RateLimit: ${status.remaining.perDay}/${status.limits.perDay} (day)`;
        } else {
            display.textContent = 'RateLimit: unavailable';
        }
    } catch (e) {
        display.textContent = 'RateLimit: error';
    }
}

// Export for use in other modules
export { getRateLimitStatus, renderRateLimitDisplay };
