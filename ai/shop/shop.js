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
export const MODEL = "grok-3-mini-beta";
export const MAX_TOKENS = 4500;
export const RESPONSE_KEY = "shopIqResponse";
export const XAI_API_ENDPOINT = "https://api.x.ai/v1/chat/completions";

// Format the incoming data into a structured prompt for product analysis
export function generatePrompt(shopIqInput) {
  console.log('Generating shop analysis prompt');
  
  const productIdentifier = shopIqInput.barcode || shopIqInput['product-name'];
  const userPrice = shopIqInput['user-price'];
  const budget = shopIqInput['budget-constraints'];
  
  const prompt = `
Role: Act as an expert product analyst and consumer advocate specializing in comprehensive product evaluation, safety analysis, and purchasing guidance.

Task: Analyze the specified product and provide a structured analysis in JSON format that helps consumers make informed purchasing decisions by evaluating safety, quality, value, and brand reputation.

CRITICAL: Output ONLY valid JSON within ${MAX_TOKENS} tokens. Prioritize safety warnings, quality assessment, and price analysis.

Product Identification: ${productIdentifier}
User's Observed Price: ${userPrice || 'Not provided'}
Budget Constraints: ${budget || 'No specific budget mentioned'}

ANALYSIS REQUIREMENTS:

1. PRODUCT IDENTIFICATION & CATEGORIZATION
   - Identify exact product name, brand, and category
   - Determine product type to customize analysis approach
   - Note any variations or specific model details

2. ADAPTIVE SAFETY & HEALTH ANALYSIS (Based on Product Type)
   For Food Products:
   - Analyze ingredients for harmful additives (artificial colors, preservatives, high fructose corn syrup, trans fats)
   - Identify allergens and dietary concerns
   - Note nutritional red flags (excessive sodium, sugar, saturated fat)
   
   For Personal Care/Cosmetics:
   - Check for harmful chemicals (parabens, sulfates, formaldehyde, phthalates)
   - Identify skin/eye irritants and potential carcinogens
   - Note pH balance and ingredient interactions
   
   For Household Products:
   - Identify toxic chemicals (formaldehyde, benzene, chlorine compounds)
   - Note volatile organic compounds (VOCs)
   - Check for carcinogenic or endocrine-disrupting substances
   
   For Electronics/Appliances:
   - Safety certifications and compliance issues
   - Fire hazards, electrical safety concerns
   - Radiation emission levels if applicable
   
   For Children's Products:
   - Choking hazards and age-appropriate safety
   - Toxic materials (lead paint, small parts, sharp edges)
   - Safety recalls and regulatory violations

3. QUALITY ASSESSMENT
   - Materials and construction quality
   - Durability and expected lifespan
   - Manufacturing standards and quality control
   - User experience and functionality

4. PRICE ANALYSIS
   - Average market price range
   - Price comparison with user's observed price
   - Value proposition assessment
   - Better alternatives at similar or lower price points

5. BRAND REPUTATION & HISTORY
   - Company ethics and business practices
   - History of recalls or safety issues
   - Customer satisfaction and complaint patterns
   - Environmental and social responsibility record

6. MISLEADING CLAIMS ANALYSIS
   - Marketing claims vs actual product capabilities
   - Deceptive labeling or advertising practices
   - Industry standard comparisons
   - Truth in advertising assessment

7. RECOMMENDATIONS
   - Overall product rating (1-10 scale)
   - Better alternative products (up to 3 suggestions)
   - Specific warnings and precautions
   - Purchase recommendation (Buy/Avoid/Consider Alternatives)

OUTPUT JSON SCHEMA:
{
  "productInfo": {
    "name": "string - exact product name",
    "brand": "string - manufacturer/brand name",
    "category": "string - product category",
    "productType": "string - food/personal-care/household/electronics/children/other"
  },
  "safetyAnalysis": {
    "overallSafetyRating": "number 1-10 (10 = safest)",
    "criticalWarnings": ["array of serious safety concerns"],
    "harmfulIngredients": [
      {
        "ingredient": "string - harmful substance name",
        "risk": "string - health risk description",
        "severity": "string - low/medium/high/critical"
      }
    ],
    "regulatoryIssues": ["array of compliance or recall issues"],
    "safetyRecommendations": ["array of safety precautions"]
  },
  "qualityAssessment": {
    "overallQualityRating": "number 1-10",
    "materials": "string - materials and construction quality",
    "durability": "string - expected lifespan and wear patterns",
    "manufacturing": "string - manufacturing standards assessment",
    "userExperience": "string - functionality and usability evaluation"
  },
  "priceAnalysis": {
    "averageMarketPrice": "string - typical price range",
    "userPriceAssessment": "string - evaluation of user's observed price",
    "valueRating": "number 1-10 (10 = excellent value)",
    "priceWarnings": ["array of price-related concerns"]
  },
  "brandReputation": {
    "reputationScore": "number 1-10 (10 = excellent reputation)",
    "trustworthiness": "string - brand reliability assessment",
    "ethicsRating": "number 1-10",
    "historyHighlights": ["array of notable brand history points"],
    "customerSatisfaction": "string - general customer experience summary"
  },
  "misleadingClaims": {
    "deceptivePractices": ["array of misleading marketing claims"],
    "truthfulnessRating": "number 1-10 (10 = completely truthful)",
    "industryComparison": "string - how claims compare to industry standards"
  },
  "alternatives": [
    {
      "name": "string - alternative product name",
      "brand": "string - alternative brand",
      "priceRange": "string - typical price",
      "advantages": "string - why this is better",
      "availability": "string - where to find it"
    }
  ],
  "recommendation": {
    "overallRating": "number 1-10",
    "verdict": "string - Buy/Avoid/Consider Alternatives",
    "primaryReasons": ["array of main reasons for recommendation"],
    "bottomLine": "string - concise final recommendation"
  }
}

IMPORTANT NOTES:
- Adapt analysis depth based on product type (food safety vs electronics safety)
- Prioritize user safety over all other factors
- Be specific about risks and provide actionable guidance
- Include price context relative to user's budget if provided
- Focus on factual analysis, avoid speculation
- When uncertain about specific product details, clearly state limitations
`;

  return prompt;
}
