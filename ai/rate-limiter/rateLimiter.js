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
 * Generate an enhanced device fingerprint with IP component
 * @returns {string} A unique composite fingerprint
 */
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint test', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    
    // Enhanced fingerprint components
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.platform,
        navigator.cookieEnabled,
        canvasFingerprint.slice(-50), // Last 50 chars of canvas fingerprint
        // Additional stability indicators
        navigator.hardwareConcurrency || 'unknown',
        navigator.deviceMemory || 'unknown',
        window.screen.availWidth + 'x' + window.screen.availHeight
    ];
    
    const fingerprint = components.join('|');
    
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
            const sessionAge = Date.now() - fingerprintData.sessionCreated;
            if (sessionAge > 24 * 60 * 60 * 1000) {
                fingerprintData.sessionId = generateSessionId();
                fingerprintData.sessionCreated = Date.now();
                fingerprintData.requestCounts = {};
                fingerprintData.lastRequestTimes = [];
            }
        }
        if (!stored || !fingerprintData || typeof fingerprintData.deviceId !== 'string' || !fingerprintData.deviceId) {
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
        if (!fingerprintData.deviceId || typeof fingerprintData.deviceId !== 'string') {
            fingerprintData.deviceId = generateDeviceFingerprint();
        }
        if (!Array.isArray(fingerprintData.lastRequestTimes)) {
            fingerprintData.lastRequestTimes = [];
        }
        localStorage.setItem(RATE_LIMIT_CONFIG.FINGERPRINT_KEY, JSON.stringify(fingerprintData));
        return fingerprintData;
    } catch (error) {
        console.error('Error getting fingerprint:', error);
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
        // Get existing rateLimitStatus to preserve email if it exists
        let existingUsername = null;
        try {
            const existingStatus = localStorage.getItem('rateLimitStatus');
            if (existingStatus) {
                const parsed = JSON.parse(existingStatus);
                existingUsername = parsed.username;
            }
        } catch (e) {
            // Ignore parsing errors
        }
        
        const dailyStatus = {
            remaining: { perDay: status.remaining.perDay },
            limits: { perDay: status.limits.perDay },
            isPaid: status.isPaid || isPaidUser,
            allowed: status.allowed,
            username: status.username || response.username || existingUsername || null, // Preserve existing username if backend doesn't provide one
            lastUpdated: Date.now()
        };
        localStorage.setItem('rateLimitStatus', JSON.stringify(dailyStatus));
        console.log('[RateLimit] rateLimitStatus created from backend response:', dailyStatus);
        
        // Trigger updatePaymentButtonDisplay to refresh the button text
        if (typeof window.updatePaymentButtonDisplay === 'function') {
            window.updatePaymentButtonDisplay();
        }
    } else {
        // Don't create hardcoded rateLimitStatus for paid users with empty backend response
        // Let the backend be the source of truth for rate limits
        console.log('[RateLimit] No backend rate limit data - displaying placeholder until backend provides status');
    }
    // Don't create extra badges - let updatePaymentButtonDisplay handle the display
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
 * Check rateLimitStatus for authenticated paid users
 * Returns existing status only - does not create hardcoded values
 * Backend is the source of truth for rate limits after payment or generation
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
        
        // Only return existing status - do not create hardcoded localStorage entries
        // Let the backend be the source of truth for rate limits after payment or generation
        if (isPaidUser && !existingStatus) {
            console.log('[RateLimit][DEBUG] ❌ No rateLimitStatus found for paid user - backend should provide this after payment/generation');
        } else {
            console.log('[RateLimit][DEBUG] ❌ NOT creating rateLimitStatus. isPaidUser:', isPaidUser, 'existingStatus:', !!existingStatus);
        }
        
        return existingStatus ? JSON.parse(existingStatus) : null;
    } catch (error) {
        console.error('[RateLimit][DEBUG] 💥 ERROR in ensureRateLimitStatusForPaidUser:', error);
        return null;
    }
}

/**
 * Create a standardized worker payload with email for paid users
 * This eliminates duplicate code across all AI modules
 * @param {string} module - The module name (e.g., 'income', 'philosophy', etc.)
 * @param {Object} formData - The form data to send
 * @returns {Object} Complete payload ready for API call
 */
export function createWorkerPayload(module, formData) {
    // Get fingerprint data for rate limiting
    const fingerprintData = getFingerprintForWorker();
    
    // Create base payload
    const payload = {
        module,
        formData,
        fingerprint: fingerprintData
    };
    
    // Get username ONLY from localStorage.rateLimitStatus
    let userName = null;
    try {
        const rateLimitStatus = localStorage.getItem('rateLimitStatus');
        if (rateLimitStatus) {
            const status = JSON.parse(rateLimitStatus);
            if (status.username) {
                userName = status.username;
                console.log(`[RateLimit] Found username in rateLimitStatus: ${userName}`);
            }
        }
    } catch (error) {
        console.error(`[RateLimit] Error parsing rateLimitStatus:`, error);
    }
    // Add username to payload if found
    if (userName) {
        payload.username = userName;
        console.log(`[RateLimit] ✅ Username added to payload: ${userName}`);
    } else {
        console.log(`[RateLimit] ⚠️ No username in rateLimitStatus - using fingerprint-based limits`);
    }
    
    return payload;
}

// Export functions to global window object for module access
if (typeof window !== 'undefined') {
    window.rateLimiter = {
        getFingerprint,
        getFingerprintForWorker,
        isRateLimited,
        incrementRequestCount,
        handleRateLimitResponse,
        canSendRequest,
        renderRateLimitDisplay,
        updateRateLimitStatus,
        ensureRateLimitStatusForPaidUser,
        createWorkerPayload
    };
}

/*equence when clicking Generate button:

Button Click - User clicks generate/submit button in form
Rate Limit Check - canSendRequest() or isRateLimited() is called first
Check Request Count - Looks at localStorage timestamps for recent requests
Rate Limit Logic - If user has made 2+ requests in last minute:
timestamps.length >= maxPerMinute (where maxPerMinute = 2)
Shows "Too many requests" alert
Returns false to block request
Add Timestamp - If allowed, adds current timestamp to localStorage
Create Payload - createWorkerPayload() builds request with form data + fingerprint
Send to Worker - Fetch request sent to master.js worker
Worker Processing - Master.js handles request and calls AI API
Response Handling - handleRateLimitResponse() processes backend response
Update UI - Payment button updated with usage count */