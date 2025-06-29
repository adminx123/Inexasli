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
        
    } catch (error) {
        console.error('Error incrementing request count:', error);
    }
}

/**
 * Handle rate limit response from backend and update UI display
 * @param {HTMLElement} container - The container to update the display in
 * @param {Object} response - The backend response containing rate limit data
 * @param {boolean} [showError=true] - Whether to show an error message if rate limited
 * @param {string} moduleName - The display name for the module (e.g., 'PhilosophyIQ', 'CalorieIQ')
 */
export function handleRateLimitResponse(container, response, showError = true, moduleName = 'Module') {
    console.log('[RateLimit][Debug] handleRateLimitResponse called with:', response);
    
    // Check if user is authenticated as paid but rateLimitStatus doesn't exist
    const authenticated = localStorage.getItem('authenticated');
    const isPaidUser = authenticated && decodeURIComponent(authenticated) === 'paid';
    
    // Find the utility buttons container
    let utilityBar = container.querySelector('.utility-buttons-container');
    if (!utilityBar) {
        // fallback: use main container
        utilityBar = container;
    }
    let paymentBtn = utilityBar.querySelector('#datain-payment-btn');
    if (!paymentBtn) paymentBtn = utilityBar;
    // Remove any previous token count
    let oldBadge = utilityBar.querySelector('.token-count-badge');
    if (oldBadge) oldBadge.remove();
    // Remove bold from the $ icon if present
    if (paymentBtn && paymentBtn.querySelector('span')) {
        paymentBtn.querySelector('span').style.fontWeight = 'normal';
        paymentBtn.querySelector('span').style.fontSize = '14px';
    }
    // Prefer rateLimitStatus, fallback to response itself
    const status = response && (response.rateLimitStatus || response);
    let badge = document.createElement('span');
    badge.className = 'token-count-badge';
    badge.style.display = 'inline';
    badge.style.fontSize = '14px';
    badge.style.fontWeight = 'normal';
    badge.style.color = '#000';
    badge.style.marginLeft = '2px';
    badge.style.verticalAlign = 'middle';
    
    if (status && status.remaining && status.limits) {
        const dailyStatus = {
            remaining: { perDay: status.remaining.perDay },
            limits: { perDay: status.limits.perDay },
            isPaid: status.isPaid || isPaidUser,
            allowed: status.allowed,
            email: status.email,
            lastUpdated: Date.now()
        };
        localStorage.setItem('rateLimitStatus', JSON.stringify(dailyStatus));
        badge.textContent = `${dailyStatus.remaining.perDay}`;
        console.log('[RateLimit] rateLimitStatus created from backend response:', dailyStatus);
    } else if (isPaidUser) {
        // Create rateLimitStatus for paid users even if backend response is empty
        const paidUserStatus = {
            remaining: { perDay: 5 }, // Default paid user limit
            limits: { perDay: 5 },
            isPaid: true,
            allowed: true,
            email: localStorage.getItem('userEmail') ? decodeURIComponent(localStorage.getItem('userEmail')) : null,
            lastUpdated: Date.now()
        };
        localStorage.setItem('rateLimitStatus', JSON.stringify(paidUserStatus));
        badge.textContent = '5'; // Show paid user limit
        console.log('[RateLimit] rateLimitStatus created for paid user (empty backend response):', paidUserStatus);
    } else {
        badge.textContent = '...';
    }
    // Insert after the payment button's span (the $ icon)
    if (paymentBtn && paymentBtn.querySelector('span')) {
        paymentBtn.querySelector('span').after(badge);
    } else if (paymentBtn && paymentBtn.appendChild) {
        paymentBtn.appendChild(badge);
    } else {
        utilityBar.appendChild(badge);
    }
    // Show error if present
    if (showError && response && (response.error || response.message) && response.error === 'Rate limit exceeded') {
        // Only show a minimal alert if needed, no warning message or extra UI
        alert(response.message || 'You have reached your rate limit. Please try again later.');
    }
}

/**
 * Simple per-minute rate limit check (client-side only, not secure)
 * @returns {boolean} True if request can be sent
 */
export function canSendRequest() {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxPerMinute = 2; // You can use RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE if you want
    let timestamps = [];
    try {
        timestamps = JSON.parse(localStorage.getItem('rateLimitTimestamps') || '[]');
    } catch (e) {
        timestamps = [];
    }
    // Remove timestamps older than 1 minute
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    if (timestamps.length >= maxPerMinute) {
        alert('Too many requests. Please wait a minute before trying again.');
        return false;
    }
    // Add current timestamp and save
    timestamps.push(now);
    localStorage.setItem('rateLimitTimestamps', JSON.stringify(timestamps));
    return true;
}

/**
 * Render the RateLimit display in a container
 * @param {HTMLElement} container - The container to inject the display into
 * @param {string} rateLimiterUrl - The endpoint for the rate limiter worker (unused)
 * @param {string} moduleName - The display name for the module (e.g., 'PhilosophyIQ', 'CalorieIQ')
 */
export function renderRateLimitDisplay(container, rateLimiterUrl, moduleName = 'Module') {
    let utilityBar = container.querySelector('.utility-buttons-container');
    if (!utilityBar) utilityBar = container;
    let paymentBtn = utilityBar.querySelector('#datain-payment-btn');
    if (!paymentBtn) paymentBtn = utilityBar;
    let oldBadge = utilityBar.querySelector('.token-count-badge');
    if (oldBadge) oldBadge.remove();
    let dailyStatus = null;
    try {
        dailyStatus = JSON.parse(localStorage.getItem('rateLimitStatus'));
    } catch (e) {
        dailyStatus = null;
    }
    // Remove bold from the $ icon if present
    if (paymentBtn && paymentBtn.querySelector('span')) {
        paymentBtn.querySelector('span').style.fontWeight = 'normal';
        paymentBtn.querySelector('span').style.fontSize = '14px';
    }
    let badge = document.createElement('span');
    badge.className = 'token-count-badge';
    badge.style.display = 'inline';
    badge.style.fontSize = '14px';
    badge.style.fontWeight = 'normal';
    badge.style.color = '#000';
    badge.style.marginLeft = '2px';
    badge.style.verticalAlign = 'middle';
    if (dailyStatus && dailyStatus.remaining && dailyStatus.limits) {
        badge.textContent = `${dailyStatus.remaining.perDay}`;
    } else {
        badge.textContent = '...';
    }
    // Insert after the payment button's span (the $ icon)
    if (paymentBtn && paymentBtn.querySelector('span')) {
        paymentBtn.querySelector('span').after(badge);
    } else if (paymentBtn && paymentBtn.appendChild) {
        paymentBtn.appendChild(badge);
    } else {
        utilityBar.appendChild(badge);
    }
}

/**
 * Update rateLimitStatus in localStorage from backend response
 * @param {Object} rateLimitData - Backend response containing rate limit status
 */
export function updateRateLimitStatus(rateLimitData) {
    try {
        const rateLimitStatus = {
            allowed: rateLimitData.allowed,
            isPaid: rateLimitData.isPaid,
            limits: rateLimitData.limits,
            remaining: rateLimitData.remaining,
            email: rateLimitData.email,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem('rateLimitStatus', JSON.stringify(rateLimitStatus));
        console.log('[RateLimit] rateLimitStatus updated:', rateLimitStatus);
        return rateLimitStatus;
    } catch (error) {
        console.error('[RateLimit] Error updating rateLimitStatus:', error);
        return null;
    }
}

/**
 * Ensure rateLimitStatus exists for authenticated paid users
 * Call this when user is authenticated but rateLimitStatus might be missing
 */
export function ensureRateLimitStatusForPaidUser() {
    console.log('[RateLimit][DEBUG] 🔍 ensureRateLimitStatusForPaidUser() called');
    
    try {
        const authenticated = localStorage.getItem('authenticated');
        console.log('[RateLimit][DEBUG] 🔍 Raw authenticated value:', authenticated);
        
        const isPaidUser = authenticated && decodeURIComponent(authenticated) === 'paid';
        console.log('[RateLimit][DEBUG] 🔍 isPaidUser:', isPaidUser);
        
        const existingStatus = localStorage.getItem('rateLimitStatus');
        console.log('[RateLimit][DEBUG] 🔍 Existing rateLimitStatus:', existingStatus);
        
        if (isPaidUser && !existingStatus) {
            console.log('[RateLimit][DEBUG] 🚀 CREATING rateLimitStatus for paid user!');
            
            const paidUserStatus = {
                remaining: { perDay: 5 }, // Default paid user limit
                limits: { perDay: 5 },
                isPaid: true,
                allowed: true,
                email: localStorage.getItem('userEmail') ? decodeURIComponent(localStorage.getItem('userEmail')) : null,
                lastUpdated: Date.now()
            };
            
            console.log('[RateLimit][DEBUG] 🚀 About to set rateLimitStatus:', paidUserStatus);
            localStorage.setItem('rateLimitStatus', JSON.stringify(paidUserStatus));
            console.log('[RateLimit][DEBUG] ✅ localStorage.setItem() completed');
            
            // Verify it was actually set
            const verification = localStorage.getItem('rateLimitStatus');
            console.log('[RateLimit][DEBUG] 🔍 Verification - rateLimitStatus after setting:', verification);
            
            console.log('[RateLimit] rateLimitStatus created for authenticated paid user:', paidUserStatus);
            return paidUserStatus;
        } else {
            console.log('[RateLimit][DEBUG] ❌ NOT creating rateLimitStatus. isPaidUser:', isPaidUser, 'existingStatus:', !!existingStatus);
        }
        
        return existingStatus ? JSON.parse(existingStatus) : null;
    } catch (error) {
        console.error('[RateLimit][DEBUG] 💥 ERROR in ensureRateLimitStatusForPaidUser:', error);
        return null;
    }
}
