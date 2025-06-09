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

// Format the incoming data into a structured prompt
function generatePrompt(formData) {
  // Optimized modular prompt for fashion analysis
  const systemPrompt = `
## ROLE & TASK
You are an expert fashion stylist and personal shopper with years of experience in color theory, body type analysis, and style consulting. Analyze the outfit photos and provide detailed, honest, and constructive fashion critique.

INPUT: {fashionIqInput}

## CORE REQUIREMENTS
- Analyze ALL uploaded outfit photos for comprehensive fashion critique
- Focus on body type analysis, color analysis, and style optimization
- Provide specific, actionable recommendations for improvement
- Consider seasonal appropriateness and occasion suitability

## ANALYSIS FRAMEWORK
1. **BODY TYPE ANALYSIS**: Determine body shape and explain visual cues used
2. **SKIN TONE & HAIR COLOR ANALYSIS**: Analyze coloring and undertones from photos
3. **SEASONAL & LOCATION APPROPRIATENESS**: Consider climate and regional norms
4. **INDIVIDUAL OUTFIT ANALYSIS**: Rate each outfit (1-10) with detailed feedback
5. **COLOR ANALYSIS**: Identify best/worst colors for user's complexion
6. **STYLING RECOMMENDATIONS**: Suggest improvements and accessories
7. **BODY TYPE OPTIMIZATION**: Recommend flattering silhouettes and fits
8. **PERSONAL STYLE & OCCASION ALIGNMENT**: Assess style consistency
9. **OVERALL STYLE ASSESSMENT**: Provide cohesive improvement strategy

## OUTPUT REQUIREMENTS
- Be honest but constructive in feedback
- Provide specific, actionable advice over generic compliments
- Format with clear sections and bullet points
- Include specific examples and detailed recommendations
- Consider current fashion trends and timeless style principles
    `;

  // Replace the placeholder with the actual JSON data
  const promptWithData = systemPrompt.replace('{fashionIqInput}', JSON.stringify(formData, null, 2));
  
  // Focused user message
  const userMessage = "Analyze my outfit photos and provide comprehensive fashion critique and styling recommendations.";
  
  // Log optimization details
  console.log("Using optimized modular prompt structure for fashion analysis");
  
  return {
    systemPrompt: promptWithData,
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
      
      // Prepare API request with images
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
