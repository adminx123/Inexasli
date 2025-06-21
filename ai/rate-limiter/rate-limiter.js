/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * Centralized Rate Limiting Worker for All AI Modules
 * Handles fingerprint validation and rate limiting across income, calorie, decision, etc.
 */

// Configuration
const CONFIG = {
  ALLOWED_ORIGINS: [
    'http://127.0.0.1:5500',
    'https://inexasli.com',
    'https://income.4hm7q4q75z.workers.dev',
    'https://calorie.4hm7q4q75z.workers.dev',
    'https://decision.4hm7q4q75z.workers.dev',
    'https://rate-limiter.4hm7q4q75z.workers.dev'
    // Add other AI module worker URLs
  ],
  RATE_LIMITS: {
    // Per module limits
    income: { perMinute: 2, perHour: 10, perDay: 50 },
    calorie: { perMinute: 2, perHour: 8, perDay: 40 },
    decision: { perMinute: 2, perHour: 12, perDay: 60 },
    enneagram: { perMinute: 1, perHour: 5, perDay: 25 },
    event: { perMinute: 2, perHour: 8, perDay: 40 },
    fashion: { perMinute: 2, perHour: 10, perDay: 50 },
    philosophy: { perMinute: 1, perHour: 6, perDay: 30 },
    quiz: { perMinute: 3, perHour: 15, perDay: 75 },
    research: { perMinute: 2, perHour: 8, perDay: 40 },
    social: { perMinute: 2, perHour: 10, perDay: 50 }
  },
  SUSPICIOUS_ACTIVITY: {
    rapidRequestsThreshold: 5,
    rapidRequestsWindow: 30000, // 30 seconds
    maxRequestTimesStored: 20
  }
};

// CORS headers helper
const Headers = {
  cors(origin) {
    // Fix: handle null/undefined/empty origin safely
    if (typeof origin !== 'string' || !origin) {
      return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      };
    }
    const matchedOrigin = CONFIG.ALLOWED_ORIGINS.find(allowed => 
      origin.startsWith(allowed)) || "*";
    return {
      "Access-Control-Allow-Origin": matchedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
  }
};

// Response helpers
const Responses = {
  success(data, origin) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: Headers.cors(origin)
    });
  },
  
  rateLimited(message, resetTime, origin) {
    return new Response(JSON.stringify({
      allowed: false,
      message,
      resetTime,
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }), {
      status: 429,
      headers: Headers.cors(origin)
    });
  },
  
  badRequest(message, origin) {
    return new Response(JSON.stringify({
      allowed: false,
      error: message
    }), {
      status: 400,
      headers: Headers.cors(origin)
    });
  },
  
  cors(request) {
    const origin = request.headers.get("Origin") || "";
    return new Response(null, {
      status: 204,
      headers: Headers.cors(origin)
    });
  }
};

/**
 * Advanced rate limiting with fingerprint validation
 * @param {Object} fingerprint - User fingerprint data
 * @param {string} module - AI module name (income, calorie, etc.)
 * @param {Object} env - Cloudflare environment with KV binding
 * @returns {Object} Rate limiting result
 */
async function validateRateLimit(fingerprint, module, env) {
  try {
    // Validate fingerprint structure
    if (!fingerprint || !fingerprint.deviceId || !fingerprint.sessionId) {
      return {
        allowed: false,
        error: "Invalid fingerprint data",
        code: "INVALID_FINGERPRINT"
      };
    }
    
    // Validate module
    if (!CONFIG.RATE_LIMITS[module]) {
      return {
        allowed: false,
        error: `Unknown module: ${module}`,
        code: "INVALID_MODULE"
      };
    }
    
    // Create secure hash of fingerprint for privacy
    const fingerprintString = `${fingerprint.deviceId}:${fingerprint.sessionId}:${module}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const limits = CONFIG.RATE_LIMITS[module];
    const now = Date.now();
    
    // Define rate limiting windows
    const rateLimitChecks = [
      { 
        key: `m:${hashString}`, 
        limit: limits.perMinute, 
        ttl: 60, 
        window: 60000,
        name: "per minute"
      },
      { 
        key: `h:${hashString}`, 
        limit: limits.perHour, 
        ttl: 3600, 
        window: 3600000,
        name: "per hour"
      },
      { 
        key: `d:${hashString}`, 
        limit: limits.perDay, 
        ttl: 86400, 
        window: 86400000,
        name: "per day"
      }
    ];
    
    // Check each rate limit
    for (const check of rateLimitChecks) {
      const count = parseInt(await env.RATE_LIMIT_KV.get(check.key)) || 0;
      
      if (count >= check.limit) {
        const resetTime = now + check.window;
        return {
          allowed: false,
          error: `Rate limit exceeded: ${check.limit} requests ${check.name}`,
          code: "RATE_LIMITED",
          limit: check.limit,
          window: check.name,
          resetTime,
          current: count
        };
      }
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
    
    // All checks passed - increment counters
    const promises = [];
    
    // Increment rate limit counters
    for (const check of rateLimitChecks) {
      const currentCount = parseInt(await env.RATE_LIMIT_KV.get(check.key)) || 0;
      promises.push(
        env.RATE_LIMIT_KV.put(check.key, (currentCount + 1).toString(), {
          expirationTtl: check.ttl
        })
      );
    }
    
    // Store request times
    promises.push(
      env.RATE_LIMIT_KV.put(timesKey, JSON.stringify(recentTimes), {
        expirationTtl: 3600 // 1 hour
      })
    );
    
    // Execute all KV operations
    await Promise.all(promises);
    
    // Calculate remaining requests
    const remaining = {
      perMinute: limits.perMinute - (parseInt(await env.RATE_LIMIT_KV.get(`m:${hashString}`)) || 0),
      perHour: limits.perHour - (parseInt(await env.RATE_LIMIT_KV.get(`h:${hashString}`)) || 0),
      perDay: limits.perDay - (parseInt(await env.RATE_LIMIT_KV.get(`d:${hashString}`)) || 0)
    };
    
    return {
      allowed: true,
      message: "Request allowed",
      module,
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
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return Responses.cors(request);
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return Responses.badRequest("Only POST requests allowed", request.headers.get("Origin"));
    }
    
    const origin = request.headers.get("Origin") || "";
    
    try {
      // Parse request data
      const requestData = await request.json();
      
      if (!requestData.fingerprint || !requestData.module) {
        return Responses.badRequest("Missing fingerprint or module", origin);
      }
      
      // Validate rate limit
      const result = await validateRateLimit(requestData.fingerprint, requestData.module, env);
      
      if (!result.allowed) {
        if (result.code === "RATE_LIMITED" || result.code === "SUSPICIOUS_ACTIVITY") {
          return Responses.rateLimited(result.error, result.resetTime, origin);
        } else {
          return Responses.badRequest(result.error, origin);
        }
      }
      
      // Return success with rate limit info
      return Responses.success(result, origin);
      
    } catch (error) {
      console.error('Rate limiter worker error:', error);
      return Responses.badRequest("Invalid request format", origin);
    }
  }
};
