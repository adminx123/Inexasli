// ai/fact-generator/educational-overlay.js
// Educational loading overlay that uses modal.js for AI generation waiting periods

/**
 * Shows an educational loading overlay during AI generation
 * Uses the generic modal.js system and provides educational facts
 * 
 * @param {string} moduleName - Name of the module for targeted facts
 * @returns {Object} Control object with close() method
 */
function showEducationalLoadingOverlay(moduleName) {
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
    
    // Start fact rotation
    const factRotation = startFactRotation(overlay, moduleName);
    
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
function startFactRotation(overlay, moduleName) {
    const factText = overlay.querySelector('.fact-text');
    
    let factIndex = 0;
    const facts = getFactsForModule(moduleName);
    
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
 * @param {string} moduleName - The module name
 * @returns {Array} Array of educational facts
 */
function getFactsForModule(moduleName) {
    const modulesFacts = {
        'calorie': [
            "Your brain uses 20% of daily calories",
            "Protein burns 30% more calories to digest", 
            "Muscle burns 3x more calories than fat",
            "Green tea boosts metabolism by 4-5%",
            "Eating slowly reduces overeating by 25%"
        ],
        'fitness': [
            "HIIT boosts metabolism for 24 hours",
            "Walking 10,000 steps burns ~400 calories",
            "Recovery is when muscles grow stronger",
            "Consistency beats intensity long-term",
            "Proper form prevents 90% of injuries"
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
        ]
    };
    
    // Return facts for this module or default to calorie facts
    return modulesFacts[moduleName] || modulesFacts['calorie'];
}

// Make the function globally accessible
window.showEducationalLoadingOverlay = showEducationalLoadingOverlay;
