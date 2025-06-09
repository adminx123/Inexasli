/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// Configuration
const CONFIG = {
  ALLOWED_ORIGINS: [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'https://inexasli.com'
  ],
  XAI_API_ENDPOINT: "https://api.x.ai/v1/chat/completions",
  MODEL: "grok-2-vision-1212",
  MAX_TOKENS: 4000,
  RESPONSE_KEY: "fashionIQResponse"
};

// Response helper functions
const Responses = {
  unauthorized() {
    return new Response(JSON.stringify({ message: 'unauthorized access' }), {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  },
  
  methodNotAllowed(origin) {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: Headers.cors(origin)
    });
  },
  
  badRequest(message, origin) {
    return new Response(JSON.stringify({ error: message || "invalid or no request body" }), {
      status: 400,
      headers: Headers.cors(origin)
    });
  },
  
  apiError(errorText, origin) {
    return new Response(JSON.stringify({ 
      error: "External API error", 
      details: errorText 
    }), {
      status: 502,
      headers: Headers.cors(origin)
    });
  },
  
  success(data, origin) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: Headers.cors(origin)
    });
  }
};

// Headers helper
const Headers = {
  cors(origin) {
    return {
      'Access-Control-Allow-Origin': '*', // Always allow for now to debug
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
      'Content-Type': 'application/json'
    };
  }
};

// Request validation
function validateRequest(data) {
  const errors = [];
  
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    errors.push("At least one outfit image is required");
  }
  
  if (data.images && data.images.length > 5) {
    errors.push("Maximum 5 images allowed");
  }
  
  // Validate image data format
  if (data.images) {
    for (let i = 0; i < data.images.length; i++) {
      if (!data.images[i] || !data.images[i].startsWith('data:image/')) {
        errors.push(`Image ${i + 1} has invalid format`);
      }
    }
  }
  
  return errors;
}

// Format the incoming data into a structured prompt
function generatePrompt(formData) {
  // Create a concise prompt without including image data
  const systemPrompt = `You are an expert fashion stylist and personal shopper. Analyze the outfit photos and provide comprehensive fashion critique and styling recommendations.

## USER CONTEXT
- Gender: ${formData.gender || 'not specified'}
- Age: ${formData.age || 'not specified'}
- Height: ${formData.height || 'not specified'}
- Occasion: ${formData.occasion || 'general'}
- Climate: ${formData.climate || 'not specified'}
- Personal Style: ${formData['personal-style'] || 'not specified'}

## ANALYSIS REQUIREMENTS
1. **BODY TYPE ANALYSIS**: Determine body shape and styling recommendations
2. **COLOR ANALYSIS**: Assess colors that complement skin tone and hair
3. **FIT & SILHOUETTE**: Evaluate garment fit and suggest improvements
4. **STYLE CONSISTENCY**: Rate outfit coherence and personal style alignment
5. **OCCASION APPROPRIATENESS**: Assess suitability for stated occasion and climate
6. **IMPROVEMENT SUGGESTIONS**: Provide specific, actionable recommendations

## OUTPUT FORMAT
- Rate each outfit (1-10) with detailed explanation
- Provide specific improvement suggestions
- Recommend complementary pieces and accessories
- Be honest but constructive in feedback
- Focus on actionable advice over generic compliments`;
  
  // Focused user message
  const userMessage = "Please analyze my outfit photos and provide detailed fashion critique and styling recommendations based on my profile.";
  
  console.log("Using optimized concise prompt structure for fashion analysis");
  
  return {
    systemPrompt: systemPrompt,
    userMessage: userMessage
  };
}

// Process images for API
function processImagesForAPI(images) {
  return images.map((imageData, index) => {
    // Extract base64 data and mime type
    const matches = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error(`Invalid image format for image ${index + 1}`);
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Try X.AI's specific format - maybe they want just the base64 without data URL
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType,
        data: base64Data
      }
    };
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const method = request.method;
    
    console.log(`Incoming ${method} request from origin: ${origin}`);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return new Response(null, {
        status: 200,
        headers: Headers.cors(origin)
      });
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      console.log(`Method ${method} not allowed`);
      return Responses.methodNotAllowed(origin);
    }
    
    console.log('Processing POST request...');
    
    // Validate origin (temporarily more permissive for debugging)
    console.log('Request origin:', origin);
    if (origin && !CONFIG.ALLOWED_ORIGINS.includes(origin) && !origin.includes('127.0.0.1') && !origin.includes('localhost')) {
      console.log('Unauthorized origin:', origin);
      return Responses.unauthorized();
    }
    
    try {
      // Parse request body
      const data = await request.json();
      console.log('Received fashion data:', {
        ...data,
        images: data.images ? `${data.images.length} images` : 'no images'
      });
      
      // Validate request
      const validationErrors = validateRequest(data);
      if (validationErrors.length > 0) {
        return Responses.badRequest(validationErrors.join(', '), origin);
      }
      
      // Get API key from secret service
      console.log('Attempting to fetch API key from secret service...');
      const secretResponse = await env.secret_binding.fetch(new Request("https://placeholder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secretName: "XAI_API_KEY"
        })
      }));
      
      if (!secretResponse.ok) {
        console.error('Failed to get API key. Status:', secretResponse.status);
        const errorText = await secretResponse.text();
        console.error('Secret service error:', errorText);
        return Responses.apiError(`Failed to get API key: ${secretResponse.status}`, origin);
      }
      
      const secretData = await secretResponse.json();
      const apiKey = secretData.value;
      
      if (!apiKey) {
        console.error('API key is empty');
        return Responses.apiError('API key not found', origin);
      }
      
      // Build the prompt
      const prompt = generatePrompt(data);
      console.log('Built fashion prompt, length:', prompt.systemPrompt.length);
      
      // Process images for API
      const processedImages = processImagesForAPI(data.images);
      
      // Prepare API request with images - try simpler structure for X.AI
      const messages = [
        {
          role: "system",
          content: prompt.systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt.userMessage
            },
            ...processedImages
          ]
        }
      ];

      const apiRequestBody = {
        model: CONFIG.MODEL,
        messages: messages,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: 0.7
        // Remove stream parameter as it might not be supported
      };
      
      console.log('Making API request with', processedImages.length, 'images');
      
      // Make API request
      const apiResponse = await fetch(CONFIG.XAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiRequestBody)
      });
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API error:', apiResponse.status, errorText);
        return Responses.apiError(`API responded with ${apiResponse.status}: ${errorText}`, origin);
      }
      
      const apiResult = await apiResponse.json();
      console.log('API response received, tokens used:', apiResult.usage?.total_tokens || 'unknown');
      
      // Validate API response
      if (!apiResult.choices || apiResult.choices.length === 0) {
        console.error('Invalid API response structure:', apiResult);
        return Responses.apiError('Invalid response from AI service', origin);
      }
      
      // Return successful response
      return Responses.success(apiResult, origin);
      
    } catch (error) {
      console.error('Request processing error:', error);
      return Responses.apiError(`Request processing failed: ${error.message}`, origin);
    }
  }
};
