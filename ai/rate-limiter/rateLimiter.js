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
 * @param {string} rateLimiterUrl
 * @param {string} action - 'check' (default) or 'consume'
 * @returns {Promise<Object>} - { remaining, limits, allowed, ... }
 */
async function getRateLimitStatus(rateLimiterUrl, action = 'check') {
    // Get or create fingerprint/session
    const fingerprint = getOrCreateFingerprint();
    const module = 'datain'; // or dynamically set as needed
    const payload = { fingerprint, module, action };
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
 * @param {string} moduleName - The display name for the module (e.g., 'PhilosophyIQ', 'CalorieIQ')
 */
async function renderRateLimitDisplay(container, rateLimiterUrl, moduleName = 'Module') {
    let utilityBar = container.querySelector('.utility-buttons-container');
    if (!utilityBar) utilityBar = container;
    let display = utilityBar.querySelector('.rate-limit-display');
    if (!display) {
        display = document.createElement('div');
        display.className = 'rate-limit-display';
        display.style = 'margin-right: 12px; align-items: center; display: flex; font-size: 13px; color: #444; font-weight: 500; height: 28px;';
        utilityBar.insertBefore(display, utilityBar.firstChild);
    }
    display.textContent = `${moduleName} Uses Left: ...`;
    try {
        const status = await getRateLimitStatus(rateLimiterUrl, 'check');
        if (status && status.remaining && status.limits) {
            display.textContent = `${moduleName} Uses Left: ${status.remaining.perDay} / ${status.limits.perDay} today`;
        } else {
            display.textContent = `${moduleName} Uses Left: unavailable`;
        }
    } catch (e) {
        display.textContent = `${moduleName} Uses Left: error`;
    }
}

/**
 * Call the centralized rate-limiter worker from a module worker
 * @param {Object} fingerprint - { deviceId, sessionId }
 * @param {string} module - The module name (e.g., 'calorie', 'income')
 * @param {string} rateLimiterUrl - The rate-limiter worker endpoint
 * @returns {Promise<Object>} - The rate-limiter response JSON
 */
export async function consumeRateLimit(fingerprint, module, rateLimiterUrl) {
    const payload = { fingerprint, module, action: 'consume' };
    const response = await fetch(rateLimiterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Rate limit exceeded');
    return await response.json();
}

/**
 * Handle a backend rate limit response: update localStorage, display, and show error if needed
 * @param {HTMLElement} container - The container to update the display in
 * @param {Object} response - The backend response (success or error JSON)
 * @param {boolean} [showError=true] - Whether to show an error message if rate limited
 * @param {string} moduleName - The display name for the module (e.g., 'PhilosophyIQ', 'CalorieIQ')
 */
export function handleRateLimitResponse(container, response, showError = true, moduleName = 'Module') {
    console.log('[RateLimit][Debug] handleRateLimitResponse called with:', response);
    // Find the utility buttons container
    let utilityBar = container.querySelector('.utility-buttons-container');
    if (!utilityBar) {
        // fallback: use main container
        utilityBar = container;
    }
    let display = utilityBar.querySelector('.rate-limit-display');
    if (!display) {
        display = document.createElement('div');
        display.className = 'rate-limit-display';
        display.style = 'margin-right: 12px; align-items: center; display: flex; font-size: 13px; color: #444; font-weight: 500; height: 28px;';
        // Insert as first child so it's always left of the first button (Categories)
        utilityBar.insertBefore(display, utilityBar.firstChild);
    }
    // Prefer rateLimitStatus, fallback to response itself
    const status = response && (response.rateLimitStatus || response);
    console.log('[RateLimit][Debug] status used for display/localStorage:', status);
    if (status && status.remaining && status.limits) {
        const dailyStatus = {
            remaining: { perDay: status.remaining.perDay },
            limits: { perDay: status.limits.perDay }
        };
        localStorage.setItem('rateLimitStatus', JSON.stringify(dailyStatus));
        console.log('[RateLimit][Debug] localStorage.rateLimitStatus set to:', dailyStatus);
        if (typeof updateRateLimitDisplayFromLocal === 'function') {
            updateRateLimitDisplayFromLocal(utilityBar);
        }
        display.textContent = `${moduleName} Uses Left: ${dailyStatus.remaining.perDay} / ${dailyStatus.limits.perDay} today`;
    } else {
        display.textContent = `${moduleName} Uses Left: unavailable`;
    }
    // Show error if present
    if (showError && response && (response.error || response.message) && response.error === 'Rate limit exceeded') {
        alert(response.message || 'You have reached your rate limit. Please try again later.');
    }
}

// Add a global debug log for all backend responses
window._originalFetch = window.fetch;
window.fetch = async function(...args) {
    const res = await window._originalFetch.apply(this, args);
    // Only log for POSTs to the rate-limiter or module workers
    if (args[0] && typeof args[0] === 'string' && /rate-limiter|philosophy|enneagram|event|fashion|quiz|research|social/.test(args[0])) {
        try {
            const clone = res.clone();
            const contentType = clone.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const json = await clone.json();
                console.log('[RateLimit][Debug] Backend response for', args[0], ':', json);
            } else {
                const text = await clone.text();
                console.log('[RateLimit][Debug] Backend response (text) for', args[0], ':', text);
            }
        } catch (e) {
            console.log('[RateLimit][Debug] Could not parse backend response for', args[0]);
        }
    }
    return res;
};

// Export for use in other modules
export { getRateLimitStatus, renderRateLimitDisplay };
