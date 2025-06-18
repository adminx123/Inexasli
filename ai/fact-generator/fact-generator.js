export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // CORS headers for all responses
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        try {
            if (url.pathname === '/generate-weekly-facts') {
                return await generateWeeklyFacts(env, corsHeaders);
            }
            
            if (url.pathname === '/status') {
                return new Response(JSON.stringify({
                    status: 'active',
                    lastGeneration: await env.FACT_STORE.get('last_generation_date'),
                    modules: ['calorie', 'decision', 'enneagram', 'event', 'fashion', 'income', 'philosophy', 'quiz', 'research', 'social']
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }

            return new Response('Fact Generator Worker - Use /generate-weekly-facts or /status', {
                status: 200,
                headers: corsHeaders
            });
            
        } catch (error) {
            console.error('Fact Generator Error:', error);
            return new Response(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    },

    // Scheduled event for weekly generation (runs every Sunday at 2 AM UTC)
    async scheduled(controller, env, ctx) {
        console.log('Weekly fact generation triggered by cron');
        await generateWeeklyFacts(env);
    }
};

/**
 * Generate fresh facts for all modules using OpenAI
 */
async function generateWeeklyFacts(env, corsHeaders = {}) {
    console.log('🚀 Starting generateWeeklyFacts function...');
    
    const modules = [
        { name: 'calorie', topic: 'nutrition, calories, metabolism, and healthy eating' },
        { name: 'decision', topic: 'decision making, problem solving, and critical thinking' },
        { name: 'enneagram', topic: 'personality types, self-awareness, and personal growth' },
        { name: 'event', topic: 'event planning, scheduling, organization, and time management' },
        { name: 'fashion', topic: 'fashion, style, clothing, and personal appearance' },
        { name: 'income', topic: 'income, finance, budgeting, and money management' },
        { name: 'philosophy', topic: 'philosophy, wisdom, meaning, and life purpose' },
        { name: 'quiz', topic: 'learning, knowledge, trivia, and cognitive skills' },
        { name: 'research', topic: 'research, science, discovery, and knowledge' },
        { name: 'social', topic: 'social relationships, communication, and human interaction' }
    ];

    console.log(`📋 Processing ${modules.length} modules:`, modules.map(m => m.name).join(', '));

    const allFacts = {};
    let totalGenerated = 0;
    const generationStart = Date.now();

    try {
        // Generate facts for each module
        for (const module of modules) {
            console.log(`🔄 Generating facts for ${module.name}...`);
            
            try {
                const prompt = `Generate exactly 7 educational facts about ${module.topic}. Each fact must be 8-12 words. Format: one fact per line, no numbering, no extra text.`;
                console.log(`📤 Prompt for ${module.name}: ${prompt}`);

                // Get API key from secret binding service
                console.log(`🔑 Getting API key for ${module.name}...`);
                const apiKey = await getApiKey(env);
                if (!apiKey) {
                    console.log(`❌ No API key retrieved for ${module.name}`);
                    throw new Error(`No API key available for ${module.name}`);
                }
                console.log(`✅ API key retrieved for ${module.name}`);
            
            console.log(`📤 Sending API request for ${module.name}...`);
            
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'grok-3-mini-beta',
                    messages: [
                        {
                            role: 'system',
                            content: `## ROLE & TASK
You are an educational content specialist generating facts about ${module.topic}.

## CORE REQUIREMENTS
- Output ONLY valid JSON (complete structure within 500 tokens)
- Generate exactly 7 educational facts
- Each fact must be 8-12 words long
- No explanations, reasoning, or extra text

## PROCESSING RULES
1. **Fact Generation**: Create educational facts based on verified information
2. **Word Count**: Ensure each fact is exactly 8-12 words long
3. **Clarity**: Use simple, clear language suitable for general audiences
4. **Accuracy**: Base facts on established knowledge and research

## OUTPUT SCHEMA
{
  "facts": [
    "Educational fact about the topic (8-12 words)",
    "Another educational fact about the topic (8-12 words)",
    "Third educational fact about the topic (8-12 words)",
    "Fourth educational fact about the topic (8-12 words)",
    "Fifth educational fact about the topic (8-12 words)",
    "Sixth educational fact about the topic (8-12 words)",
    "Seventh educational fact about the topic (8-12 words)"
  ]
}

## VALIDATION
- Verify JSON structure is complete and valid
- Ensure exactly 7 facts are provided
- Confirm each fact meets word count requirements`
                        },
                        {
                            role: 'user',
                            content: `Generate educational facts about: ${module.topic}`
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            console.log(`📥 API response status for ${module.name}: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`X.AI API error for ${module.name}: ${response.status} - ${errorText}`);
                throw new Error(`X.AI API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`📥 Raw API response for ${module.name}:`, JSON.stringify(data, null, 2));
            
            // Get content from either the regular content field or the reasoning_content field (same as calorie.js)
            const factsText = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content;
            console.log(`📥 Facts text for ${module.name}:`, factsText);
            
            if (!factsText || factsText.length === 0) {
                console.log(`❌ Empty or missing content for ${module.name}`);
                throw new Error(`Empty response from X.AI API for ${module.name}`);
            }
            
            console.log(`Generated facts text for ${module.name}:`, factsText);
            
            // Parse JSON response to extract facts array
            let facts;
            try {
                const factsData = JSON.parse(factsText);
                facts = factsData.facts || [];
                console.log(`Parsed facts from JSON for ${module.name}:`, facts);
            } catch (parseError) {
                console.error(`Failed to parse JSON for ${module.name}:`, parseError);
                // Fallback: try to extract facts from text if JSON parsing fails
                facts = factsText.split('\n').filter(fact => fact.trim().length > 0);
                console.log(`Fallback: parsed facts from text for ${module.name}:`, facts);
            }

            // Ensure we have exactly 7 facts
            if (facts.length !== 7) {
                console.warn(`Module ${module.name} generated ${facts.length} facts instead of 7. Facts:`, facts);
                // Only pad if we got some valid facts but not enough
                if (facts.length > 0 && facts.length < 7) {
                    while (facts.length < 7) {
                        // Use the last generated fact as a template instead of generic message
                        const lastFact = facts[facts.length - 1];
                        facts.push(lastFact);
                    }
                } else if (facts.length === 0) {
                    // If no facts were generated, throw an error instead of using fallback
                    throw new Error(`No facts generated for ${module.name}`);
                }
                facts.splice(7); // Keep only first 7
            }

            allFacts[module.name] = facts;
            totalGenerated += facts.length;

            // Store facts in KV store for each module worker
            await env.FACT_STORE.put(`facts_${module.name}`, JSON.stringify(facts));
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
            } catch (moduleError) {
                console.error(`Failed to generate facts for ${module.name}:`, moduleError);
                // Use fallback facts for this module
                const fallbackFacts = Array(7).fill(`${module.topic.split(',')[0]} fact coming soon`);
                allFacts[module.name] = fallbackFacts;
                totalGenerated += fallbackFacts.length;
                
                // Store fallback facts
                await env.FACT_STORE.put(`facts_${module.name}`, JSON.stringify(fallbackFacts));
            }
        }

        // Store generation metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            totalFacts: totalGenerated,
            modules: modules.length,
            generationTimeMs: Date.now() - generationStart,
            weekNumber: getWeekNumber()
        };

        await env.FACT_STORE.put('last_generation_date', new Date().toISOString());
        await env.FACT_STORE.put('generation_metadata', JSON.stringify(metadata));

        console.log(`✅ Generated ${totalGenerated} facts for ${modules.length} modules in ${metadata.generationTimeMs}ms`);

        // Notify all module workers of new facts
        await notifyModuleWorkers(modules, env);

        return new Response(JSON.stringify({
            success: true,
            message: `Generated ${totalGenerated} fresh facts for ${modules.length} modules`,
            facts: allFacts,
            metadata
        }), {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        console.error('Weekly fact generation failed:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}

/**
 * Notify module workers that new facts are available
 */
async function notifyModuleWorkers(modules, env) {
    const notifications = modules.map(async (module) => {
        try {
            const response = await fetch(`https://${module.name}.workers.dev/refresh-facts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.WORKER_SYNC_TOKEN || 'sync-token'}`
                },
                body: JSON.stringify({
                    action: 'refresh',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log(`✅ Notified ${module.name} worker`);
            } else {
                console.warn(`⚠️ Failed to notify ${module.name} worker: ${response.status}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to notify ${module.name} worker:`, error.message);
        }
    });
    
    await Promise.allSettled(notifications);
}

/**
 * Get current week number for tracking
 */
function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const weekNumber = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
}

/**
 * Get API key from secret binding service (same pattern as calorie worker)
 */
async function getApiKey(env) {
    console.log("Attempting to get API key from environment");
    
    // First try to get from secret_binding
    try {
        if (env.secret_binding) {
            console.log("Secret binding exists, attempting to use it");
            
            // Make request to the bound service
            const response = await env.secret_binding.fetch(new Request("https://placeholder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    secretName: "XAI_API_KEY"
                })
            }));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error from secret worker:", errorText);
                throw new Error(`Secret worker error: ${response.status}`);
            }
            
            // Parse the response to get the API key
            const data = await response.json();
            if (data && data.value) {
                console.log("Successfully retrieved API key from secret_binding");
                return data.value;
            }
            
            throw new Error("Invalid response from secret_binding");
        }
    } catch (bindingError) {
        console.error("Error with secret_binding:", bindingError);
        // Continue to next method if this fails
    }
    
    // Fallback to environment variable (if somehow available)
    if (env.XAI_API_KEY) {
        console.log("Using fallback XAI_API_KEY from environment");
        return env.XAI_API_KEY;
    }
    
    throw new Error("No API key available - neither secret_binding nor XAI_API_KEY found");
}
