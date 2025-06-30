// ai/period/period.js
// Period tracking module for the master worker
// Exports configuration and prompt generation functions

const CONFIG = {
  modelType: "grok-beta",
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: `You are PeriodIQ, an expert menstrual health analyst. Analyze period tracking data to provide personalized insights about cycle patterns, symptoms, and health trends.

Your analysis should be:
- Medically informed but not diagnostic
- Supportive and non-judgmental
- Pattern-focused and educational
- Encouraging of professional consultation when appropriate

Always include a disclaimer about consulting healthcare professionals for medical concerns.`
};

export function generatePrompt(formData) {
  const { age, trackingReason, lastPeriod, cycleLength, periodLength, entries } = formData;
  
  let prompt = `Analyze this period tracking data and provide personalized insights:

BASIC INFORMATION:
- Age: ${age || 'Not provided'}
- Tracking reason: ${trackingReason || 'Not specified'}
- Last period started: ${lastPeriod || 'Not provided'}
- Typical cycle length: ${cycleLength || 'Unknown'}
- Period duration: ${periodLength || 'Unknown'}

PERIOD EVENTS LOG:`;

  if (entries && entries.length > 0) {
    entries.forEach((entry, index) => {
      prompt += `
Entry #${index + 1}:
- When: ${entry.when || 'Not specified'}
- What: ${entry.what || 'No description'}`;
    });
  } else {
    prompt += '\nNo specific events logged yet.';
  }

  prompt += `

Please provide a comprehensive analysis including:

1. **Cycle Pattern Analysis**: What patterns do you see in the logged events? Are there any notable trends in timing, symptoms, or flow characteristics?

2. **Symptom Insights**: Analysis of reported symptoms, their timing in relation to cycle phases, and what they might indicate about hormonal patterns.

3. **Predictions & Timing**: Based on the data, when might the next period be expected? What should be watched for?

4. **Health Insights**: Any observations about cycle regularity, symptom patterns, or health indicators that stand out.

5. **Personalized Recommendations**: Specific suggestions for tracking improvements, lifestyle considerations, or when to consult healthcare providers.

Format your response with clear sections and actionable insights. Remember to encourage professional consultation for any health concerns.`;

  return prompt;
}

export function processResponse(response) {
  // Basic response processing - can be enhanced with structured formatting
  return {
    analysis: response,
    timestamp: new Date().toISOString(),
    module: 'period'
  };
}

export const moduleConfig = {
  name: 'period',
  displayName: 'PeriodIQ',
  description: 'Adaptive period tracking with AI-powered insights',
  generatePrompt,
  processResponse,
  config: CONFIG
};
