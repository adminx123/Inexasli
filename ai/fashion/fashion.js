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
  MODEL: "grok-3-mini-beta",
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
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

// Build fashion analysis prompt
function buildFashionPrompt(data) {
  const {
    stylePreference,
    bodyType,
    skinTone,
    hairColor,
    occasion,
    age,
    height,
    gender,
    additionalContext,
    images
  } = data;

  let prompt = `You are an expert fashion stylist and personal shopper with years of experience in color theory, body type analysis, and style consulting. Please analyze the outfit photos I'm sharing and provide detailed, honest, and constructive fashion critique.

PERSONAL PROFILE:
`;

  if (age) prompt += `- Age: ${age}\n`;
  if (height) prompt += `- Height: ${height}\n`;
  if (gender) prompt += `- Gender: ${gender}\n`;
  if (skinTone) prompt += `- Skin Tone: ${skinTone}\n`;
  if (hairColor) prompt += `- Hair Color: ${hairColor}\n`;
  if (bodyType) prompt += `- Body Type: ${bodyType}\n`;
  if (stylePreference) prompt += `- Style Preference: ${stylePreference}\n`;
  if (occasion) prompt += `- Intended Occasion: ${occasion}\n`;

  prompt += `
ANALYSIS REQUESTED:
I've uploaded ${images.length} outfit photo${images.length > 1 ? 's' : ''} for your analysis. Please provide:

1. **INDIVIDUAL OUTFIT ANALYSIS**: For each outfit, provide:
   - Overall rating (1-10) and why
   - What works well about this outfit
   - What doesn't work and why
   - How well it suits my body type and personal features
   - Fit assessment (too loose, too tight, just right)
   - Whether it's appropriate for the intended occasion

2. **COLOR ANALYSIS**: Based on my skin tone and hair color:
   - Which colors in my outfits complement me best
   - Which colors should I avoid
   - Specific color recommendations for my complexion
   - How to incorporate my best colors into my wardrobe

3. **STYLING RECOMMENDATIONS**: 
   - How to improve each outfit with simple changes
   - Accessory suggestions that would enhance the looks
   - Alternative ways to style the same pieces
   - Shopping recommendations for missing wardrobe pieces

4. **BODY TYPE OPTIMIZATION**: Based on my body type:
   - Which silhouettes are most flattering on me
   - What styles to emphasize or avoid
   - How the current outfits do or don't flatter my figure
   - Specific fit advice for my body type

5. **OVERALL STYLE ASSESSMENT**:
   - How cohesive is my style across outfits
   - Whether my clothes align with my stated style preference
   - Areas where I could elevate my look
   - Budget-friendly ways to improve my wardrobe

`;

  if (additionalContext) {
    prompt += `\nADDITIONAL CONTEXT: ${additionalContext}\n`;
  }

  prompt += `
Please be honest but constructive in your feedback. I want to improve my style, so specific, actionable advice is more valuable than generic compliments. Consider seasonal appropriateness, current fashion trends, and timeless style principles. 

Format your response with clear sections and bullet points for easy reading. Include specific examples and be as detailed as possible in your recommendations.`;

  return prompt;
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
    
    return {
      type: "image_url",
      image_url: {
        url: imageData,
        detail: "high" // Request high detail analysis
      }
    };
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: Headers.cors(origin)
      });
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return Responses.methodNotAllowed(origin);
    }
    
    // Validate origin
    if (!CONFIG.ALLOWED_ORIGINS.includes(origin)) {
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
      const secretResponse = await env.secret_binding.fetch('https://secret-worker.inexasli.workers.dev/secret/xai_key');
      if (!secretResponse.ok) {
        console.error('Failed to get API key');
        return Responses.apiError('Failed to get API key', origin);
      }
      
      const secretData = await secretResponse.json();
      const apiKey = secretData.value;
      
      if (!apiKey) {
        console.error('API key is empty');
        return Responses.apiError('API key not found', origin);
      }
      
      // Build the prompt
      const prompt = buildFashionPrompt(data);
      console.log('Built fashion prompt, length:', prompt.length);
      
      // Process images for API
      const processedImages = processImagesForAPI(data.images);
      
      // Prepare API request with images
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            ...processedImages
          ]
        }
      ];
      
      const apiRequestBody = {
        model: CONFIG.MODEL,
        messages: messages,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: 0.7,
        stream: false
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
