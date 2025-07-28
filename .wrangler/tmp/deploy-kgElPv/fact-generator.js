var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ai/fact-generator/fact-generator.js
var fact_generator_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    try {
      if (url.pathname === "/generate-weekly-facts") {
        return await generateWeeklyFacts(env, corsHeaders);
      }
      if (url.pathname === "/status") {
        return new Response(JSON.stringify({
          status: "active",
          lastGeneration: await env.FACT_STORE.get("last_generation_date"),
          modules: ["calorie", "decision", "enneagram", "event", "fashion", "income", "philosophy", "quiz"]
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (url.pathname === "/facts") {
        const modules = ["calorie", "decision", "enneagram", "event", "fashion", "income", "philosophy", "quiz"];
        const moduleParam = url.searchParams.get("module");
        if (moduleParam && modules.includes(moduleParam)) {
          const data = await env.FACT_STORE.get(`facts_${moduleParam}`);
          console.log(`[DEBUG] Raw KV data for facts_${moduleParam}:`, data);
          const facts = data ? JSON.parse(data) : [];
          console.log(`[DEBUG] Parsed facts for ${moduleParam}:`, facts);
          return new Response(JSON.stringify({ facts }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } else {
          const facts = {};
          for (const module of modules) {
            const data = await env.FACT_STORE.get(`facts_${module}`);
            console.log(`[DEBUG] Raw KV data for facts_${module}:`, data);
            facts[module] = data ? JSON.parse(data) : [];
            console.log(`[DEBUG] Parsed facts for ${module}:`, facts[module]);
          }
          return new Response(JSON.stringify({ facts }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
      }
      return new Response("Fact Generator Worker - Use /generate-weekly-facts, /facts, or /status", {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error("Fact Generator Error:", error);
      return new Response(JSON.stringify({
        error: "Internal server error",
        message: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  },
  // Scheduled event for weekly generation (runs every Sunday at 2 AM UTC)
  async scheduled(controller, env, ctx) {
    console.log("Weekly fact generation triggered by cron");
    await generateWeeklyFacts(env);
  }
};
async function generateWeeklyFacts(env, corsHeaders = {}) {
  console.log("\u{1F680} Starting generateWeeklyFacts function...");
  const modules = [
    { name: "calorie", topic: "nutrition, calories, metabolism, and healthy eating" },
    { name: "decision", topic: "decision making, problem solving, and critical thinking" },
    { name: "enneagram", topic: "personality types, self-awareness, and personal growth" },
    { name: "event", topic: "event planning, scheduling, organization, and time management" },
    { name: "fashion", topic: "fashion, style, clothing, and personal appearance" },
    { name: "income", topic: "income, finance, budgeting, and money management" },
    { name: "philosophy", topic: "philosophy, wisdom, meaning, and life purpose" },
    { name: "quiz", topic: "learning, knowledge, trivia, and cognitive skills" }
  ];
  console.log(`\u{1F4CB} Processing ${modules.length} modules:`, modules.map((m) => m.name).join(", "));
  const allFacts = {};
  let totalGenerated = 0;
  const generationStart = Date.now();
  try {
    for (const module of modules) {
      console.log(`\u{1F504} Generating facts for ${module.name}...`);
      try {
        const prompt = `Generate exactly 7 educational facts about ${module.topic}. Each fact must be 8-12 words. Format: one fact per line, no numbering, no extra text.`;
        console.log(`\u{1F4E4} Prompt for ${module.name}: ${prompt}`);
        console.log(`\u{1F511} Getting API key for ${module.name}...`);
        const apiKey = await getApiKey(env);
        if (!apiKey) {
          console.log(`\u274C No API key retrieved for ${module.name}`);
          throw new Error(`No API key available for ${module.name}`);
        }
        console.log(`\u2705 API key retrieved for ${module.name}`);
        console.log(`\u{1F4E4} Sending API request for ${module.name}...`);
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "grok-3-mini-beta",
            messages: [
              {
                role: "system",
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
                role: "user",
                content: `Generate educational facts about: ${module.topic}`
              }
            ],
            max_tokens: 4e3,
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        });
        console.log(`\u{1F4E5} API response status for ${module.name}: ${response.status}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`X.AI API error for ${module.name}: ${response.status} - ${errorText}`);
          throw new Error(`X.AI API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log(`\u{1F4E5} Raw API response for ${module.name}:`, JSON.stringify(data, null, 2));
        const factsText = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content;
        console.log(`\u{1F4E5} Facts text for ${module.name}:`, factsText);
        if (!factsText || factsText.length === 0) {
          console.log(`\u274C Empty or missing content for ${module.name}`);
          throw new Error(`Empty response from X.AI API for ${module.name}`);
        }
        console.log(`Generated facts text for ${module.name}:`, factsText);
        let facts;
        try {
          const factsData = JSON.parse(factsText);
          facts = factsData.facts || [];
          console.log(`Parsed facts from JSON for ${module.name}:`, facts);
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${module.name}:`, parseError);
          facts = factsText.split("\n").filter((fact) => fact.trim().length > 0);
          console.log(`Fallback: parsed facts from text for ${module.name}:`, facts);
        }
        if (facts.length !== 7) {
          console.warn(`Module ${module.name} generated ${facts.length} facts instead of 7. Facts:`, facts);
          if (facts.length > 0 && facts.length < 7) {
            while (facts.length < 7) {
              const lastFact = facts[facts.length - 1];
              facts.push(lastFact);
            }
          } else if (facts.length === 0) {
            throw new Error(`No facts generated for ${module.name}`);
          }
          facts.splice(7);
        }
        allFacts[module.name] = facts;
        totalGenerated += facts.length;
        await env.FACT_STORE.put(`facts_${module.name}`, JSON.stringify(facts));
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (moduleError) {
        console.error(`Failed to generate facts for ${module.name}:`, moduleError);
        const fallbackFacts = Array(7).fill(`${module.topic.split(",")[0]} fact coming soon`);
        allFacts[module.name] = fallbackFacts;
        totalGenerated += fallbackFacts.length;
        await env.FACT_STORE.put(`facts_${module.name}`, JSON.stringify(fallbackFacts));
      }
    }
    const metadata = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      totalFacts: totalGenerated,
      modules: modules.length,
      generationTimeMs: Date.now() - generationStart,
      weekNumber: getWeekNumber()
    };
    await env.FACT_STORE.put("last_generation_date", (/* @__PURE__ */ new Date()).toISOString());
    await env.FACT_STORE.put("generation_metadata", JSON.stringify(metadata));
    console.log(`\u2705 Generated ${totalGenerated} facts for ${modules.length} modules in ${metadata.generationTimeMs}ms`);
    await notifyModuleWorkers(modules, env);
    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${totalGenerated} fresh facts for ${modules.length} modules`,
      facts: allFacts,
      metadata
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Weekly fact generation failed:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}
__name(generateWeeklyFacts, "generateWeeklyFacts");
async function notifyModuleWorkers(modules, env) {
  const notifications = modules.map(async (module) => {
    try {
      const response = await fetch(`https://${module.name}.workers.dev/refresh-facts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.WORKER_SYNC_TOKEN || "sync-token"}`
        },
        body: JSON.stringify({
          action: "refresh",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (response.ok) {
        console.log(`\u2705 Notified ${module.name} worker`);
      } else {
        console.warn(`\u26A0\uFE0F Failed to notify ${module.name} worker: ${response.status}`);
      }
    } catch (error) {
      console.warn(`\u26A0\uFE0F Failed to notify ${module.name} worker:`, error.message);
    }
  });
  await Promise.allSettled(notifications);
}
__name(notifyModuleWorkers, "notifyModuleWorkers");
function getWeekNumber() {
  const now = /* @__PURE__ */ new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const weekNumber = Math.ceil(diff / (7 * 24 * 60 * 60 * 1e3));
  return weekNumber;
}
__name(getWeekNumber, "getWeekNumber");
async function getApiKey(env) {
  if (env.XAI_API_KEY) {
    console.log("Using XAI_API_KEY from environment");
    return env.XAI_API_KEY;
  }
  throw new Error("No API key available in environment");
}
__name(getApiKey, "getApiKey");
export {
  fact_generator_default as default
};
//# sourceMappingURL=fact-generator.js.map
