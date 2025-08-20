// OAuth Worker for X.com (Twitter) Authentication
// Handles user connection flow and token storage

// Utility: log to console with timestamp
function logDebug(...args) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[OAUTH DEBUG ${timestamp}]`, ...args);
  } catch (e) {
    console.error('Logging error:', e);
  }
}

function logError(...args) {
  try {
    const timestamp = new Date().toISOString();
    console.error(`[OAUTH ERROR ${timestamp}]`, ...args);
  } catch (e) {
    console.error('Error logging error:', e);
  }
}

// X.com OAuth 1.0a endpoints
const OAUTH_REQUEST_TOKEN_URL = 'https://api.x.com/oauth/request_token';
const OAUTH_AUTHORIZE_URL = 'https://api.x.com/oauth/authorize';
const OAUTH_ACCESS_TOKEN_URL = 'https://api.x.com/oauth/access_token';

// Generate OAuth signature for Twitter API
async function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret = '') {
  // Create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Create signature base string
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Generate HMAC-SHA1 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const messageData = encoder.encode(signatureBaseString);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = new Uint8Array(signature);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < signatureArray.byteLength; i++) {
    binary += String.fromCharCode(signatureArray[i]);
  }
  
  return btoa(binary);
}

// Step 1: Get request token from Twitter
async function getRequestToken(env, callbackUrl) {
  logDebug('=== GET REQUEST TOKEN START ===');
  logDebug('Callback URL:', callbackUrl);
  
  try {
    const oauthParams = {
      oauth_callback: callbackUrl,
      oauth_consumer_key: env.X_CONSUMER_KEY,
      oauth_nonce: Math.random().toString(36).substring(2, 15),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0'
    };
    
    logDebug('OAuth params before signature:', oauthParams);
    
    // Generate signature
    const signature = await generateOAuthSignature('POST', OAUTH_REQUEST_TOKEN_URL, oauthParams, env.X_CONSUMER_SECRET);
    oauthParams.oauth_signature = signature;
    
    logDebug('OAuth signature generated:', signature);
    
    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    logDebug('Making request token API call...');
    const response = await fetch(OAUTH_REQUEST_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    logDebug('Request token response status:', response.status);
    const responseText = await response.text();
    logDebug('Request token response body:', responseText);
    
    if (!response.ok) {
      logError('Failed to get request token:', responseText);
      return null;
    }
    
    // Parse response
    const params = new URLSearchParams(responseText);
    const requestToken = params.get('oauth_token');
    const requestTokenSecret = params.get('oauth_token_secret');
    const callbackConfirmed = params.get('oauth_callback_confirmed');
    
    logDebug('Parsed request token:', requestToken);
    logDebug('Callback confirmed:', callbackConfirmed);
    logDebug('=== GET REQUEST TOKEN END ===');
    
    return {
      token: requestToken,
      tokenSecret: requestTokenSecret,
      callbackConfirmed
    };
    
  } catch (error) {
    logError('Request token exception:', error.message);
    logError('Request token exception stack:', error.stack);
    return null;
  }
}

// Step 2: Exchange authorization code for access token with retry logic
async function getAccessToken(env, requestToken, requestTokenSecret, oauthVerifier) {
  logDebug('=== GET ACCESS TOKEN START ===');
  logDebug('Request token:', requestToken);
  logDebug('OAuth verifier:', oauthVerifier);
  
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logDebug(`Access token attempt ${attempt}/${maxRetries}`);
      
      const oauthParams = {
        oauth_consumer_key: env.X_CONSUMER_KEY,
        oauth_nonce: Math.random().toString(36).substring(2, 15),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: requestToken,
        oauth_verifier: oauthVerifier,
        oauth_version: '1.0'
      };
      
      logDebug('OAuth params before signature:', oauthParams);
      
      // Generate signature
      const signature = await generateOAuthSignature('POST', OAUTH_ACCESS_TOKEN_URL, oauthParams, env.X_CONSUMER_SECRET, requestTokenSecret);
      oauthParams.oauth_signature = signature;
      
      logDebug('OAuth signature generated:', signature);
      
      // Build Authorization header
      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');
      
      logDebug('Making access token API call...');
      const response = await fetch(OAUTH_ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      logDebug('Access token response status:', response.status);
      const responseText = await response.text();
      logDebug('Access token response body:', responseText);
      
      if (response.ok) {
        // Success - parse response
        const params = new URLSearchParams(responseText);
        const accessToken = params.get('oauth_token');
        const accessTokenSecret = params.get('oauth_token_secret');
        const userId = params.get('user_id');
        const screenName = params.get('screen_name');
        
        logDebug('Access token retrieved for user:', screenName);
        logDebug('User ID:', userId);
        logDebug('=== GET ACCESS TOKEN END ===');
        
        return {
          accessToken,
          accessTokenSecret,
          userId,
          screenName
        };
      } else if (response.status >= 500 && attempt < maxRetries) {
        // Server error - retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logError(`Access token attempt ${attempt} failed with status ${response.status}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        // Client error or final retry attempt failed
        logError('Failed to get access token:', responseText);
        return null;
      }
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logError(`Access token attempt ${attempt} exception: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        logError('Access token final attempt exception:', error.message);
        logError('Access token final attempt exception stack:', error.stack);
        return null;
      }
    }
  }
}

// Store user tokens in KV
async function storeUserTokens(env, userId, tokenData) {
  logDebug('=== STORE USER TOKENS START ===');
  logDebug('Storing tokens for user ID:', userId);
  
  try {
    const tokenRecord = {
      accessToken: tokenData.accessToken,
      accessTokenSecret: tokenData.accessTokenSecret,
      userId: tokenData.userId,
      screenName: tokenData.screenName,
      connectedAt: new Date().toISOString()
    };
    
    logDebug('Token record to store:', {
      userId: tokenRecord.userId,
      screenName: tokenRecord.screenName,
      connectedAt: tokenRecord.connectedAt,
      hasAccessToken: !!tokenRecord.accessToken,
      hasAccessTokenSecret: !!tokenRecord.accessTokenSecret
    });
    
    await env.CLIENT_TOKENS.put(`user:${userId}`, JSON.stringify(tokenRecord));
    logDebug('Tokens stored successfully for user:', userId);
    logDebug('=== STORE USER TOKENS END ===');
    
    return true;
    
  } catch (error) {
    logError('Store tokens exception:', error.message);
    logError('Store tokens exception stack:', error.stack);
    return false;
  }
}

// Generate HTML pages
function generateConnectPage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Connect Your X Account</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .button { background: #1d9bf0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; }
        .button:hover { background: #1a8cd8; }
    </style>
</head>
<body>
    <h1>Connect Your X Account</h1>
    <p>Click the button below to authorize our app to post to your X account.</p>
    <a href="/oauth/start" class="button">Connect X Account</a>
</body>
</html>`;
}

function generateSuccessPage(screenName) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Connection Successful</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { color: #059669; }
    </style>
    <script>
        // Redirect back to oauth-connect page with success parameters
        setTimeout(() => {
            const params = new URLSearchParams();
            params.set('x', 'connected');
            params.set('screen_name', '${screenName}');
            window.location.href = 'https://inexasli.com/business/oauth-connect.html?' + params.toString();
        }, 2000);
    </script>
</head>
<body>
    <h1 class="success">✅ Success!</h1>
    <p>Your X account <strong>@${screenName}</strong> has been successfully connected.</p>
    <p>Redirecting you back to the setup page...</p>
</body>
</html>`;
}

function generateErrorPage(error) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Connection Failed</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .error { color: #dc2626; }
    </style>
</head>
<body>
    <h1 class="error">❌ Connection Failed</h1>
    <p>There was an error connecting your X account:</p>
    <p><code>${error}</code></p>
    <a href="/oauth/connect">Try Again</a>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    logDebug('=== OAUTH FETCH HANDLER START ===');
    logDebug('Request method:', request.method);
    logDebug('Request URL:', request.url);
    
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    logDebug('Pathname:', pathname);
    
    try {
      // Route: Show connect page
      if (pathname === '/oauth/connect' || pathname === '/') {
        logDebug('Serving connect page');
        return new Response(generateConnectPage(), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Route: Start OAuth flow
      if (pathname === '/oauth/start') {
        logDebug('Starting OAuth flow');
        
        const callbackUrl = `${url.origin}/oauth/callback`;
        logDebug('Callback URL:', callbackUrl);
        
        const requestTokenData = await getRequestToken(env, callbackUrl);
        if (!requestTokenData) {
          logError('Failed to get request token');
          return new Response(generateErrorPage('Failed to get request token'), {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Store request token secret using the oauth_token as key (Twitter preserves this)
        const kvKey = `request_token_secret:${requestTokenData.token}`;
        const kvValue = requestTokenData.tokenSecret;
        logDebug('Storing request token secret with key:', kvKey);
        logDebug('Storing request token secret value:', kvValue);
        
        await env.CLIENT_TOKENS.put(kvKey, kvValue, { expirationTtl: 900 }); // 15 minutes
        logDebug('Request token secret stored successfully');
        
        // Verify storage by immediately reading it back
        const verifyStored = await env.CLIENT_TOKENS.get(kvKey);
        logDebug('Verification - stored value retrieval:', verifyStored ? 'SUCCESS' : 'FAILED');
        logDebug('Verification - retrieved value:', verifyStored);
        
        // Redirect to Twitter authorization (no custom state needed)
        const authUrl = `${OAUTH_AUTHORIZE_URL}?oauth_token=${requestTokenData.token}`;
        logDebug('Redirecting to:', authUrl);
        
        return Response.redirect(authUrl, 302);
      }
      
      // Route: Handle OAuth callback
      if (pathname === '/oauth/callback') {
        logDebug('Handling OAuth callback');
        
        const oauthToken = url.searchParams.get('oauth_token');
        const oauthVerifier = url.searchParams.get('oauth_verifier');
        
        logDebug('OAuth token:', oauthToken);
        logDebug('OAuth verifier:', oauthVerifier);
        
        if (!oauthToken || !oauthVerifier) {
          logError('Missing OAuth parameters');
          return new Response(generateErrorPage('Missing OAuth parameters'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Retrieve request token secret using oauth_token as key
        logDebug('Looking for request token secret with key:', `request_token_secret:${oauthToken}`);
        const requestTokenSecret = await env.CLIENT_TOKENS.get(`request_token_secret:${oauthToken}`);
        logDebug('Retrieved request token secret:', requestTokenSecret ? 'FOUND' : 'NOT FOUND');
        logDebug('Request token secret value:', requestTokenSecret);
        
        if (!requestTokenSecret) {
          logError('Request token secret not found or expired for token:', oauthToken);
          
          // Debug: List all keys in KV to see what's actually stored
          logDebug('Checking KV storage...');
          try {
            const listResult = await env.CLIENT_TOKENS.list({ prefix: 'request_token_secret:' });
            logDebug('KV keys with request_token_secret prefix:', listResult.keys.map(k => k.name));
          } catch (e) {
            logDebug('Failed to list KV keys:', e.message);
          }
          
          return new Response(generateErrorPage('Request token not found or expired'), {
            status: 400,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Clean up the stored secret
        await env.CLIENT_TOKENS.delete(`request_token_secret:${oauthToken}`);
        
        // Exchange for access token
        const accessTokenData = await getAccessToken(env, oauthToken, requestTokenSecret, oauthVerifier);
        if (!accessTokenData) {
          logError('Failed to get access token');
          return new Response(generateErrorPage('Failed to get access token'), {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Store user tokens
        const stored = await storeUserTokens(env, accessTokenData.userId, accessTokenData);
        if (!stored) {
          logError('Failed to store user tokens');
          return new Response(generateErrorPage('Failed to store user tokens'), {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        logDebug('OAuth flow completed successfully');
        return new Response(generateSuccessPage(accessTokenData.screenName), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Route: API endpoint to check if user is connected
      if (pathname === '/oauth/status' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        if (!userId) {
          return new Response(JSON.stringify({ error: 'user_id required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const tokenData = await env.CLIENT_TOKENS.get(`user:${userId}`);
        const isConnected = !!tokenData;
        
        return new Response(JSON.stringify({ 
          connected: isConnected,
          userId: userId
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Route: API endpoint to disconnect user
      if (pathname === '/oauth/disconnect' && request.method === 'POST') {
        const reqData = await request.json();
        const userId = reqData.user_id;
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'user_id required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        await env.CLIENT_TOKENS.delete(`user:${userId}`);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'User disconnected successfully'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 404 for unknown routes
      logError('Unknown route:', pathname);
      return new Response('Not Found', { status: 404 });
      
    } catch (error) {
      logError('OAuth handler exception:', error.message);
      logError('OAuth handler exception stack:', error.stack);
      return new Response(generateErrorPage(`Server error: ${error.message}`), {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
};
