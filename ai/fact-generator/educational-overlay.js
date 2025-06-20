// ai/fact-generator/educational-overlay.js
// Educational loading overlay that uses modal.js for AI generation waiting periods

/**
 * Shows an educational loading overlay during AI generation
 * Uses the generic modal.js system and provides educational facts
 * 
 * @param {string} moduleName - Name of the module for targeted facts
 * @returns {Object} Control object with close() method
 */
async function showEducationalLoadingOverlay(moduleName) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'educational-loading-overlay';
    overlay.innerHTML = `
        <div class="waiting-content">
            <div class="simple-spinner"></div>
            <div class="wait-title">Generating ${moduleName}...</div>
            <div class="wait-subtitle">This may take up to 25 seconds</div>
            <div class="learning-fact">
                <div class="fact-text">Loading...</div>
            </div>
        </div>
    `;
    
    // Inject overlay styles if not already present
    if (!document.querySelector('style[data-id="educational-overlay"]')) {
        const style = document.createElement('style');
        style.dataset.id = 'educational-overlay';
        style.textContent = `
            .educational-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 15000;
                font-family: "Inter", sans-serif;
            }
            
            .waiting-content {
                background: white;
                border-radius: 8px;
                padding: 40px 32px;
                max-width: 400px;
                width: 85%;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .simple-spinner {
                width: 24px;
                height: 24px;
                border: 2px solid #f0f0f0;
                border-top: 2px solid #666;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
            }
            
            .wait-title {
                color: #333;
                font-size: 18px;
                margin-bottom: 8px;
                font-weight: 600;
                text-transform: capitalize;
            }
            
            .wait-subtitle {
                color: #888;
                font-size: 14px;
                margin-bottom: 32px;
            }
            
            .learning-fact {
                border-top: 1px solid #f0f0f0;
                padding-top: 24px;
                margin-top: 24px;
            }
            
            .fact-text {
                color: #555;
                font-size: 15px;
                line-height: 1.5;
                font-style: italic;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.3s ease;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Start fact rotation (await it to handle async facts loading)
    const factRotation = await startFactRotation(overlay, moduleName);
    
    return {
        close: () => {
            clearInterval(factRotation.interval);
            if (overlay.parentNode) {
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.98)';
                overlay.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                setTimeout(() => {
                    overlay.parentNode.removeChild(overlay);
                }, 200);
            }
        }
    };
}

/**
 * Manages fact rotation during loading
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} moduleName - Module name for targeted facts
 * @returns {Object} Control object with interval ID
 */
async function startFactRotation(overlay, moduleName) {
    const factText = overlay.querySelector('.fact-text');
    
    let factIndex = 0;
    let facts = [];
    
    // Load facts asynchronously
    try {
        facts = await getFactsForModule(moduleName);
    } catch (error) {
        console.warn('[Educational Overlay] Failed to load facts, using fallback');
        facts = getFallbackFactsForModule(moduleName);
    }
    
    // Start with first fact
    if (facts.length > 0) {
        factText.textContent = facts[0];
    }
    
    // Rotate facts every 5 seconds
    const interval = setInterval(() => {
        if (facts.length > 0) {
            factIndex = (factIndex + 1) % facts.length;
            
            // Fade transition
            factText.style.opacity = '0.3';
            setTimeout(() => {
                factText.textContent = facts[factIndex];
                factText.style.opacity = '1';
            }, 150);
        }
    }, 5000);
    
    return { interval };
}

/**
 * Returns educational facts for a specific module
 * Now fetches facts from KV storage via API calls instead of hardcoded facts
 * @param {string} moduleName - The module name
 * @returns {Promise<Array>} Array of educational facts
 */
async function getFactsForModule(moduleName) {
    try {
        // Try to fetch facts from the module's API endpoint
        const apiUrl = getModuleApiUrl(moduleName);
        if (apiUrl) {
            const response = await fetch(`${apiUrl}/facts`);
            if (response.ok) {
                const data = await response.json();
                if (data.facts && Array.isArray(data.facts) && data.facts.length > 0) {
                    console.log(`[Educational Overlay] Fetched ${data.facts.length} facts from KV for ${moduleName}`);
                    return data.facts;
                }
            }
        }
    } catch (error) {
        console.warn(`[Educational Overlay] Failed to fetch facts for ${moduleName} from KV:`, error.message);
    }
    
    // Fallback to hardcoded facts if KV fetch fails
    console.log(`[Educational Overlay] Using fallback hardcoded facts for ${moduleName}`);
    return getFallbackFactsForModule(moduleName);
}

/**
 * Gets the API URL for a specific module
 * @param {string} moduleName - The module name
 * @returns {string|null} The API URL or null if not found
 */
function getModuleApiUrl(moduleName) {
    const moduleUrls = {
        'calorie': 'https://calorie.4hm7q4q75z.workers.dev',
        'decision': 'https://decision.4hm7q4q75z.workers.dev',
        'research': 'https://research.4hm7q4q75z.workers.dev',
        'social': 'https://social.4hm7q4q75z.workers.dev',
        'enneagram': 'https://enneagram.4hm7q4q75z.workers.dev',
        'philosophy': 'https://philosophy.4hm7q4q75z.workers.dev',
        'event': 'https://event.4hm7q4q75z.workers.dev',
        'fashion': 'https://fashion.4hm7q4q75z.workers.dev',
        'quiz': 'https://quiz.4hm7q4q75z.workers.dev',
        'income': 'https://income.4hm7q4q75z.workers.dev'
    };
    
    return moduleUrls[moduleName] || null;
}

/**
 * Fallback hardcoded facts (kept as backup)
 * @param {string} moduleName - The module name
 * @returns {Array} Array of educational facts
 */
function getFallbackFactsForModule(moduleName) {
    const modulesFacts = {
        'calorie': [
            "Your brain uses 20% of daily calories",
            "Protein burns 30% more calories to digest", 
            "Muscle burns 3x more calories than fat",
            "Green tea boosts metabolism by 4-5%",
            "Eating slowly reduces overeating by 25%"
        ],
        'emotion': [
            "Deep breathing activates your calming system",
            "Exercise is as effective as medication for mild depression",
            "Gratitude practice rewires brain for positivity",
            "Social connections boost immune function",
            "Sleep deprivation amplifies negative emotions"
        ],
        'decision': [
            "Sleep on big decisions for better clarity",
            "Writing pros/cons clarifies complex choices",
            "Most decisions are reversible with effort",
            "Time constraints can improve decision quality",
            "Gut feelings often contain valuable information"
        ],
        'research': [
            "Questions lead to better insights than assumptions",
            "Primary sources are more reliable than summaries",
            "Credible sources cite other credible sources",
            "Evidence-based thinking improves decisions",
            "Diverse perspectives reveal hidden biases"
        ],
        'quiz': [
            "Testing yourself is better than re-reading",
            "Spaced repetition improves retention",
            "Mistakes help strengthen neural pathways",
            "Active recall beats passive review",
            "Teaching others reinforces learning"
        ],
        'social': [
            "Active listening builds stronger relationships",
            "Body language conveys 55% of communication",
            "Shared experiences create lasting bonds",
            "Empathy can be learned and improved",
            "Vulnerability often increases trust"
        ],
        'enneagram': [
            "Self-awareness is the first step to growth",
            "Each type has unique strengths and challenges",
            "Understanding others reduces conflict",
            "Growth happens through conscious effort",
            "Stress affects behavior patterns"
        ],
        'philosophy': [
            "Wisdom comes from questioning assumptions",
            "Ethics guide us when rules fall short",
            "Authenticity requires knowing yourself",
            "Purpose gives direction to actions",
            "Growth happens outside comfort zones"
        ],
        'event': [
            "Planning reduces stress and improves outcomes",
            "Clear communication sets expectations",
            "Simple logistics work better than complex",
            "Preparation enables spontaneous moments",
            "Guest experience matters more than perfection"
        ],
        'fashion': [
            "Confidence is the best accessory you can wear",
            "Good fit matters more than expensive brands",
            "Color psychology affects mood and perception",
            "Classic pieces create timeless style",
            "Personal style reflects authentic self-expression"
        ],
        'income': [
            "Compound interest works best over long periods",
            "Diversification reduces investment risk",
            "Emergency funds provide financial security",
            "Small consistent savings create wealth",
            "Financial literacy empowers better decisions"
        ],
        'quiz': [
            "Testing yourself is better than re-reading",
            "Spaced repetition improves retention",
            "Mistakes help strengthen neural pathways",
            "Active recall beats passive review",
            "Teaching others reinforces learning"
        ]
    };
    
    // Return facts for this module or default to calorie facts
    return modulesFacts[moduleName] || modulesFacts['calorie'];
}

// Make the function globally accessible
window.showEducationalLoadingOverlay = showEducationalLoadingOverlay;
