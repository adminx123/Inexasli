/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * Centralized Rate Limiting Worker for All AI Modules
 * Handles fingerprint validation and rate limiting across income, calorie, decision, etc.
 */

// Configuration
const CONFIG = {
  // Global rate limit config (adjust as needed)
  GLOBAL_RATE_LIMITS: {
    perDay: 13 // Only daily limit is enforced
  },
  SUSPICIOUS_ACTIVITY: {
    rapidRequestsThreshold: 5,
    rapidRequestsWindow: 30000, // 30 seconds
    maxRequestTimesStored: 20
  }
};

// Response helpers (no CORS, only Content-Type)
const Responses = {
  success(data) {
    return new Response(JSON.stringify({
      ...data,
      ...(data.limits ? { limits: data.limits } : {}),
      ...(data.remaining ? { remaining: data.remaining } : {})
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },
  
  rateLimited(message, resetTime, rateLimitStatus) {
    return new Response(JSON.stringify({
      allowed: false,
      message,
      resetTime,
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      ...(rateLimitStatus || {})
    }), {
      status: 429,
      headers: { "Content-Type": "application/json" }
    });
  },
  
  badRequest(message) {
    return new Response(JSON.stringify({
      allowed: false,
      error: message
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  },
  
  options() {
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" }
    });
  }
};

/**
 * Advanced rate limiting with fingerprint validation
 * @param {Object} fingerprint - User fingerprint data
 * @param {string} module - AI module name (income, calorie, etc.)
 * @param {Object} env - Cloudflare environment with KV binding
 * @param {string} action - Action type ('consume' or 'check')
 * @returns {Object} Rate limiting result
 */
async function validateRateLimit(fingerprint, module, env, action = 'consume') {
  try {
    // Validate fingerprint structure
    if (!fingerprint || !fingerprint.deviceId || !fingerprint.sessionId) {
      return {
        allowed: false,
        error: "Invalid fingerprint data",
        code: "INVALID_FINGERPRINT"
      };
    }

    // Use only deviceId and sessionId for global limit
    const fingerprintString = `${fingerprint.deviceId}:${fingerprint.sessionId}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const limits = CONFIG.GLOBAL_RATE_LIMITS;
    const now = Date.now();

    // Only daily limit
    const dayKey = `d:${hashString}`;
    const dayCount = parseInt(await env.RATE_LIMIT_KV.get(dayKey)) || 0;
    if (dayCount >= limits.perDay) {
      const resetTime = now + 86400000; // 24 hours
      return {
        allowed: false,
        error: `Global rate limit exceeded: ${limits.perDay} requests per day`,
        code: "RATE_LIMITED",
        limit: limits.perDay,
        window: "per day",
        resetTime,
        current: dayCount
      };
    }

    // Check for suspicious activity patterns
    const timesKey = `times:${hashString}`;
    const requestTimesStr = await env.RATE_LIMIT_KV.get(timesKey);
    const requestTimes = requestTimesStr ? JSON.parse(requestTimesStr) : [];
    
    // Add current request time
    requestTimes.push(now);
    
    // Keep only recent requests
    const recentTimes = requestTimes
      .filter(time => time > now - CONFIG.SUSPICIOUS_ACTIVITY.rapidRequestsWindow)
      .slice(-CONFIG.SUSPICIOUS_ACTIVITY.maxRequestTimesStored);
    
    // Check for rapid requests (suspicious activity)
    if (recentTimes.length >= CONFIG.SUSPICIOUS_ACTIVITY.rapidRequestsThreshold) {
      return {
        allowed: false,
        error: "Suspicious activity detected - too many rapid requests",
        code: "SUSPICIOUS_ACTIVITY",
        resetTime: now + 300000 // 5 minute cooldown
      };
    }

    // Increment counters if action is 'consume'
    const promises = [];
    if (action === 'consume') {
      promises.push(
        env.RATE_LIMIT_KV.put(dayKey, (dayCount + 1).toString(), {
          expirationTtl: 86400 // 1 day
        })
      );
      promises.push(
        env.RATE_LIMIT_KV.put(timesKey, JSON.stringify(recentTimes), {
          expirationTtl: 3600 // 1 hour
        })
      );
    }
    await Promise.all(promises);
    const remaining = {
      perDay: limits.perDay - (parseInt(await env.RATE_LIMIT_KV.get(dayKey)) || 0)
    };
    
    return {
      allowed: true,
      message: "Request allowed",
      limits,
      remaining,
      fingerprint: {
        deviceId: fingerprint.deviceId.slice(0, 8) + '...',
        sessionId: fingerprint.sessionId.slice(0, 8) + '...'
      }
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return {
      allowed: false,
      error: "Internal rate limiting error",
      code: "INTERNAL_ERROR"
    };
  }
}

// Main worker handler
export default {
  async fetch(request, env) {
    // Log every incoming request for debugging
    console.log('[RateLimiter] Incoming request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers),
      time: Date.now()
    });
    
    // OPTIONS preflight (not needed, but respond for robustness)
    if (request.method === 'OPTIONS') {
      return Responses.options();
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return Responses.badRequest("Only POST requests allowed");
    }
    
    try {
      // Parse request data
      const requestData = await request.json();
      
      if (!requestData.fingerprint || !requestData.module) {
        return Responses.badRequest("Missing fingerprint or module");
      }
      
      // Use action field, default to 'consume'
      const action = requestData.action || 'consume';
      
      // Validate rate limit
      const result = await validateRateLimit(requestData.fingerprint, requestData.module, env, action);
      
      if (!result.allowed) {
        if (result.code === "RATE_LIMITED" || result.code === "SUSPICIOUS_ACTIVITY") {
          // Get latest status for response
          const latestStatus = await validateRateLimit(requestData.fingerprint, requestData.module, env, 'check');
          return Responses.rateLimited(result.error, result.resetTime, {
            limits: latestStatus.limits,
            remaining: latestStatus.remaining
          });
        } else {
          return Responses.badRequest(result.error);
        }
      }
      
      // Return success with rate limit info
      return Responses.success(result);
      
    } catch (error) {
      console.error('Rate limiter worker error:', error);
      return Responses.badRequest("Invalid request format");
    }
  }
};
