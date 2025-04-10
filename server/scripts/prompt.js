/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setCookie } from '/server/scripts/setcookie.js';

let activeScope = null;

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is authenticated
    const paid = localStorage.getItem("authenticated");
    const isPaid = paid === "paid";

    // If user is authenticated, unblur premium content
    if (isPaid) {
        document.querySelectorAll('.premium-blur').forEach(el => {
            el.classList.remove('premium-blur');
        });
    } else {
        // If not authenticated, disable interaction with premium sections
        document.querySelectorAll('.premium-section .generate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Please subscribe to a premium plan to access this feature.\nClick 'SUBSCRIBE & UNLOCK' below to upgrade.");
            });
        });
    }

    // Set the "prompt" cookie on page load
    setCookie("prompt", "loaded", 32, Date.now());

    // Attach toggleSection to section headers (free and premium)
    document.querySelectorAll('.section > h2, .section1-header').forEach(header => {
        header.addEventListener('click', () => toggleSection(header));
    });

    // Monitor terms checkbox state
    const termsCheckbox = document.getElementById('termscheckbox');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function () {
            if (!this.checked) {
                // Hide prompts and reset scope if terms are unchecked
                const personalPrompts = document.getElementById('personal-prompts');
                const businessPrompts = document.getElementById('business-prompts');
                const personalBtn = document.getElementById('personal-btn');
                const businessBtn = document.getElementById('business-btn');
                const promptContainer = personalPrompts?.parentElement;

                if (personalPrompts) personalPrompts.classList.add('hidden');
                if (businessPrompts) businessPrompts.classList.add('hidden');
                if (personalBtn) personalBtn.classList.remove('selected');
                if (businessBtn) businessBtn.classList.remove('selected');
                if (promptContainer) promptContainer.classList.add('hidden');
                activeScope = null; // Reset active scope
            }
        });
    }

    // Attach toggleEventDetails to event-location dropdown
    const locationEl = document.getElementById('event-location');
    if (locationEl) {
        locationEl.addEventListener('change', toggleEventDetails);
    }

    // Attach toggleCodeInput to app-code-status grid items
    const codeStartedBtn = document.querySelector('#app-code-status .grid-item[data-value="code-started"]');
    const noCodeBtn = document.querySelector('#app-code-status .grid-item[data-value="no-code"]');
    if (codeStartedBtn) {
        codeStartedBtn.addEventListener('click', () => toggleCodeInput('code-started'));
    }
    if (noCodeBtn) {
        noCodeBtn.addEventListener('click', () => toggleCodeInput('no-code'));
    }

    // Grid item selection for all non-scope/non-code-status grids
    document.querySelectorAll('.grid-container:not(#scope-selector):not(#app-code-status) .grid-item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('selected'));
    });
});

window.toggleSection = function (header) {
    const section = header.parentElement;
    const allSections = document.querySelectorAll('.section, .section1');
    allSections.forEach(otherSection => {
        if (otherSection !== section && otherSection.classList.contains('expanded')) {
            otherSection.classList.remove('expanded');
        }
    });
    section.classList.toggle('expanded');
};

function toggleScope(scope) {
    const personalBtn = document.getElementById('personal-btn');
    const businessBtn = document.getElementById('business-btn');
    const personalPrompts = document.getElementById('personal-prompts');
    const businessPrompts = document.getElementById('business-prompts');
    const promptContainer = document.getElementById('personal-prompts')?.parentElement;

    if (!personalBtn || !businessBtn || !personalPrompts || !businessPrompts || !promptContainer) {
        console.error('Missing elements:', {
            personalBtn, businessBtn, personalPrompts, businessPrompts, promptContainer
        });
        return;
    }

    if (activeScope === scope) {
        personalPrompts.classList.add('hidden');
        businessPrompts.classList.add('hidden');
        personalBtn.classList.remove('selected');
        businessBtn.classList.remove('selected');
        promptContainer.classList.add('hidden');
        activeScope = null;
    } else {
        promptContainer.classList.remove('hidden');
        personalPrompts.classList.add('hidden');
        businessPrompts.classList.add('hidden');
        personalBtn.classList.remove('selected');
        businessBtn.classList.remove('selected');

        if (scope === 'personal') {
            personalPrompts.classList.remove('hidden');
            personalBtn.classList.add('selected');
        } else if (scope === 'business') {
            businessPrompts.classList.remove('hidden');
            businessBtn.classList.add('selected');
        }
        activeScope = scope;
    }
}

const formatList = (items, prefix) => items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
const formatGrid = (selector, prefix) => {
    const items = Array.from(document.querySelectorAll(selector))
        .filter(el => el.classList.contains('selected'))
        .map(el => el.dataset.value)
        .join('\n');
    return items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
};

function toggleEventDetails() {
    const locationEl = document.getElementById('event-location');
    if (locationEl) {
        const location = locationEl.value;
        document.getElementById('event-indoors').classList.toggle('hidden', location !== 'indoors');
        document.getElementById('event-outdoors').classList.toggle('hidden', location !== 'outdoors');
    }
}

function toggleCodeInput(selected) {
    const codeRow = document.getElementById('app-current-code-row');
    const codeStartedBtn = document.querySelector('#app-code-status .grid-item[data-value="code-started"]');
    const noCodeBtn = document.querySelector('#app-code-status .grid-item[data-value="no-code"]');
    if (codeRow) {
        if (selected === 'code-started') {
            codeRow.classList.remove('hidden');
            if (codeStartedBtn) codeStartedBtn.classList.add('selected');
            if (noCodeBtn) noCodeBtn.classList.remove('selected');
        } else if (selected === 'no-code') {
            codeRow.classList.add('hidden');
            if (codeStartedBtn) codeStartedBtn.classList.remove('selected');
            if (noCodeBtn) noCodeBtn.classList.add('selected');
        }
    }
}

function generatePrompt(promptType) {
    let prompt = '';

    switch (promptType) {
        case 'general':
            const generalGoal = document.getElementById('general-goal');
            if (generalGoal && generalGoal.value) {
                prompt += `Analyze the following input relative to the goal: ${generalGoal.value}\n\n`;
                prompt += formatGrid('#general-purpose .grid-item.selected', 'Purpose of this analysis');
                const generalInfoReturn = document.getElementById('general-info-return');
                const selectedFormat = generalInfoReturn?.querySelector('.grid-item.selected');
                if (selectedFormat) {
                    const formatValue = selectedFormat.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }
                const generalContext = document.getElementById('general-context');
                if (generalContext?.value) {
                    prompt += formatList(generalContext.value, 'Context');
                }
            }
            break;

        case 'incident':
            prompt += formatGrid('#incident-goal .grid-item.selected', 'Analyze the following incident details input relative to my goal');
            prompt += formatGrid('#area-goal .grid-item.selected', 'Incident Area');
            prompt += 'Purpose of analysis: Maximize the efficiency, productivity, safety and understanding of social dynamics for the workplace or personal life.\n\n';
            const incidentDetails = document.getElementById('incident-details');
            if (incidentDetails?.value) {
                prompt += formatGrid('#incident-warnings .grid-item.selected', 'My general personality traits');
                prompt += formatList(incidentDetails.value, 'What Happened');
                prompt += formatGrid('#incident-mood .grid-item.selected', 'Perceived mood/tone of other people involved');
                const incidentMoments = document.getElementById('incident-moments');
                if (incidentMoments?.value) prompt += formatList(incidentMoments.value, 'Key moments that stood out');
                const incidentThoughts = document.getElementById('incident-thoughts');
                if (incidentThoughts?.value) prompt += formatList(incidentThoughts.value, 'My initial thoughts');
            }
            break;

        case 'event':
            const eventTypesSelected = document.querySelectorAll('#event-types .grid-item.selected');
            if (eventTypesSelected.length > 0) {
                prompt += formatGrid('#event-types .grid-item.selected', 'I want to host the following event');
                prompt += 'Purpose of Analysis: To generate a clear and actionable checklist in code block format with options for hosting a feasible event, considering all relevant factors (such as budget, guest count, and timeline). If any aspect of the event is deemed unfeasible, the analysis will immediately highlight the issue and provide recommendations for adjustments or additional resources required. The AI should return suggestions only in a logical and actionable checklist format for planning, setting up, hosting, and ending the event. If available include a weather forecast for the location of the event.\n\n';
            } else {
                prompt += 'No event type selected. Assuming a generic event for planning purposes.\n\n';
            }
            prompt += formatGrid('#event-elements .grid-item.selected', 'Elements');
            const venueStatus = document.getElementById('event-venue')?.value;
            if (venueStatus) prompt += `Venue Status: ${venueStatus}\n\n`;
            const location = document.getElementById('event-location');
            if (location?.value) {
                prompt += `Indoor/Outdoor: ${location.value === 'indoors' ? 'Indoors' : 'Outdoors'}\n\n`;
                if (location.value === 'indoors') {
                    prompt += formatGrid('#event-indoor-setup .grid-item.selected', 'Venue Setup Needs');
                } else if (location.value === 'outdoors') {
                    prompt += formatGrid('#event-outdoor .grid-item.selected', 'Setup Considerations');
                }
            }
            const guests = document.getElementById('event-guests')?.value;
            if (guests) prompt += formatList(guests, 'Guest Count');
            const budget = document.getElementById('event-budget')?.value;
            if (budget) prompt += formatList(budget, 'Budget');
            const startTime = document.getElementById('event-start')?.value || '';
            const endTime = document.getElementById('event-end')?.value || '';
            let timeString = '';
            if (startTime) timeString += `Start: ${startTime}`;
            if (endTime) timeString += `${timeString ? ' - ' : ''}End: ${endTime}`;
            if (startTime || endTime) prompt += formatList(timeString || 'No specific times provided', 'Timeline');
            else prompt += 'Timeline: Not specified\n\n';
            const specificLocation = document.getElementById('event-specific-location')?.value;
            if (specificLocation) prompt += formatList(specificLocation, 'Specific Location');
            const specificContext = document.getElementById('event-specific-context')?.value;
            if (specificContext) prompt += formatList(specificContext, 'Context Dump');
            break;

        case 'therapy':
            const therapyGoal = document.getElementById('therapy-goal');
            if (therapyGoal?.value) {
                prompt += `Act as a compassionate and professional counselor/therapist. Use the following input to provide me with empathetic guidance, insights, and actionable steps to support my emotional well-being and work toward my therapy goal: ${therapyGoal.value}\n\n`;
                prompt += `Purpose of this session: Respond as a therapist would, offering a structured response in checklist format with headings like "Reflections" (for observations on my input) and "Suggestions" (for practical next steps), using a warm and supportive tone. Avoid clinical jargon unless it’s clearly explained.\n\n`;
                prompt += formatGrid('#therapy-emotions .grid-item.selected', 'Current Emotional State');
                prompt += formatGrid('#therapy-triggers .grid-item.selected', 'Triggers or Stressors');
                const recentEvents = document.getElementById('therapy-recent');
                if (recentEvents?.value) prompt += formatList(recentEvents.value, 'Recent Events or Feelings');
                prompt += formatGrid('#therapy-coping .grid-item.selected', 'Coping Strategies I’ve Tried');
                const therapyHistory = document.getElementById('therapy-history');
                if (therapyHistory?.value) prompt += formatList(therapyHistory.value, 'Therapy History or Context');
                const therapyContext = document.getElementById('therapy-context');
                if (therapyContext?.value) prompt += formatList(therapyContext.value, 'Additional Context (Past or Future)');
            }
            break;

  case 'fitness':
    const fitnessGoalsSelected = document.querySelectorAll('#fitness-goal .grid-item.selected');
    if (fitnessGoalsSelected.length > 0) {
        prompt += formatGrid('#fitness-goal .grid-item.selected', 'Consider the following input relative to my fitness goal');
        prompt += 'Purpose of analysis: Create a personalized fitness plan to achieve my goal in checklist format with headings of Workout 1, 2, etc., and subcategories in code block format.\n\n';
        const locationSelection = document.querySelector('#fitness-home-exercises .grid-item.selected');
        if (locationSelection) {
            const locationValue = locationSelection.getAttribute('data-value');
            prompt += `Location: ${locationValue === 'Home' ? 'Home' : 'Gym'}\n\n`;
        }
        const age = document.getElementById('fitness-age');
        if (age?.value) prompt += formatList(age.value, 'Age');
        
        const height = document.getElementById('fitness-height');
        const heightUnit = document.getElementById('fitness-height-unit');
        if (height?.value && heightUnit?.value) {
            prompt += formatList(`${height.value} ${heightUnit.value}`, 'Height');
            console.log(`Height: ${height.value} ${heightUnit.value}`); // Debug
        }
        
        const weight = document.getElementById('fitness-weight');
        const weightUnit = document.getElementById('fitness-weight-unit');
        if (weight?.value && weightUnit?.value) {
            prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
            console.log(`Weight: ${weight.value} ${weightUnit.value}`); // Debug
        } else {
            console.log('Weight or unit missing:', { weight: weight?.value, weightUnit: weightUnit?.value });
        }
        
        prompt += formatGrid('#fitness-level .grid-item.selected', 'Fitness Level');
        const injuries = document.getElementById('fitness-injuries');
        if (injuries?.value) prompt += formatList(injuries.value, 'Injuries/Health Conditions');
        const frequency = document.getElementById('fitness-frequency');
        if (frequency?.value) prompt += formatList(frequency.value, 'Number of weekly workouts I can do');
        const duration = document.getElementById('fitness-duration');
        if (duration?.value) prompt += formatList(duration.value, 'Length of workout sessions I can perform');
    }
    break;
    
    

    case 'calorie':
        prompt += formatGrid('#calorie-goal .grid-item.selected', 'Estimate calories and macronutrients for the following input as a percentage of daily requirements relative to my goal. Also analyze my height, weight, and age to compare me against the average person at my height, age, and weight. ');
        prompt += `
        Output only a text-based table in a code block with these exact columns: Nutrient, Target Amount, Food Log Intake, Percentage Reached. Use this header format in the code block:
    Include no text outside the code block—no comments, explanations, or recommendations. Add any future amounts I provide to the running totals unless I request a new estimate.
        `;
        const age = document.getElementById('calorie-age');
        if (age?.value) prompt += formatList(age.value, 'Age');
        const height = document.getElementById('calorie-height');
        const heightUnit = document.getElementById('calorie-height-unit');
        if (height?.value && heightUnit?.value) {
            prompt += formatList(`${height.value} ${heightUnit.value}`, 'Height');
        }
        const weight = document.getElementById('calorie-weight');
        const weightUnit = document.getElementById('calorie-weight-unit');
        if (weight?.value && weightUnit?.value) {
            prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
        }
        prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');
        const foodLog = document.getElementById('calorie-food-log');
        if (foodLog?.value) prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
        break;

      
      
      
            case 'trip':
            prompt += formatGrid('#trip-activities .grid-item.selected', 'Review the following activities I want to do on my trip');
            prompt += 'Purpose of review: To build a logical timeline for my trip in checklist format code block. If available include the weather forcast for the location(s)\n\n';
            const tripSpecifics = document.getElementById('trip-specifics');
            if (tripSpecifics?.value) {
                prompt += formatGrid('#trip-activities .grid-item.selected', 'The main activities of this trip will be');
                prompt += `Activity-specific information requested:\n${tripSpecifics.value}\n\n`;
                const plans = document.getElementById('trip-plans');
                if (plans?.value) prompt += formatList(plans.value, 'Confirmed Schedule');
                const packing = document.getElementById('trip-packing');
                if (packing?.value) {
                    let packingDescription = '';
                    switch (packing.value) {
                        case 'YM': packingDescription = 'Yes, for Male'; break;
                        case 'YF': packingDescription = 'Yes, for Female'; break;
                        case 'YMF': packingDescription = 'Yes, for Male & Female'; break;
                        case 'NN': packingDescription = 'No'; break;
                    }
                    prompt += `${packingDescription}\n\n`;
                }
                const people = document.getElementById('trip-people');
                if (people?.value) prompt += formatList(people.value, 'Number of People on Trip');
                const days = document.getElementById('trip-days');
                if (days?.value) prompt += formatList(days.value, 'Trip Length');
                const location = document.getElementById('trip-location');
                if (location?.value) prompt += formatList(location.value, 'Trip Location');
                prompt += formatGrid('#trip-relationship .grid-item.selected', 'Relationship to People on Trip');
                const cost = document.getElementById('trip-cost');
                if (cost?.value) prompt += formatList(cost.value, 'Budget');
            }
            break;

        case 'business':
            const vision = document.getElementById('business-vision');
            if (vision?.value) {
                prompt += `Analyze the following data for starting the following new business: ${vision.value}\n\n`;
                prompt += 'Purpose of analysis: To review the feasibility, risks, rewards, and potential of the business idea\n\n';
                prompt += formatGrid('#business-knowledge-level .grid-item.selected', 'Experience Level');
                prompt += formatGrid('#business-general-skills .grid-item.selected', 'Business Skills');
                prompt += formatGrid('#business-weaknesses .grid-item.selected', 'Challenges');
                const organization = document.getElementById('business-organization');
                if (organization?.value) prompt += formatList(organization.value, 'Business Tools & Equipment');
                const network = document.getElementById('business-network');
                if (network?.value) prompt += formatList(network.value, 'Business Network');
            }
            break;

        case 'app':
            const appPurpose = document.getElementById('app-purpose');
            if (appPurpose?.value) {
                prompt += `Analyze the following input relative to the app I want to build that: ${appPurpose.value}\n\n`;
                prompt += 'Purpose of analysis: Create code for the user to start or continue the development of their app\n\n';
                prompt += formatGrid('#app-code-status .grid-item.selected', 'Code Status');
                const currentCode = document.getElementById('app-current-code');
                if (currentCode?.value) prompt += formatList(currentCode.value, 'Current Code');
                prompt += formatGrid('#app-features .grid-item.selected', 'Features');
                const platform = document.getElementById('app-platform');
                if (platform?.value) prompt += formatList(platform.value, 'Platform');
                const budget = document.getElementById('app-budget');
                if (budget?.value) prompt += formatList(budget.value, 'Budget');
                const timeline = document.getElementById('app-timeline');
                if (timeline?.value) prompt += formatList(timeline.value, 'Timeline');
            }
            break;

        case 'marketing':
            const marketGoal = document.getElementById('market-goal');
            if (marketGoal?.value) {
                prompt += `I want to create a marketing campaign. The goal is: ${marketGoal.value}\n\n`;
                prompt += formatGrid('#market-channels .grid-item.selected', 'Channels');
                const audience = document.getElementById('market-audience');
                if (audience?.value) prompt += formatList(audience.value, 'Audience');
                const budget = document.getElementById('market-budget');
                if (budget?.value) prompt += formatList(budget.value, 'Budget');
                const metrics = document.getElementById('market-metrics');
                if (metrics?.value) prompt += formatList(metrics.value, 'Metrics');
                const message = document.getElementById('market-message');
                if (message?.value) prompt += formatList(message.value, 'Key Messages');
                const timeline = document.getElementById('market-timeline');
                if (timeline?.value) prompt += formatList(timeline.value, 'Timeline');
                const competitors = document.getElementById('market-competitors');
                if (competitors?.value) prompt += formatList(competitors.value, 'Competitors');
                prompt += formatGrid('#market-visuals .grid-item.selected', 'Visual Assets');
            }
            break;

        case 'enneagram-questionnaire':
            const enneagramSelf = document.getElementById('enneagram-self');
            if (enneagramSelf?.value) {
                prompt += `Here’s my completed Enneagram questionnaire:\n\n`;
                prompt += `Self-Description:\n${enneagramSelf.value}\n\n`;
                const traits = Array.from(document.querySelectorAll('#enneagram-traits .grid-item.selected'))
                    .map(el => el.getAttribute('data-value'))
                    .join('\n');
                if (traits) prompt += `Core Traits I Identify With:\n${traits}\n\n`;
                const behaviors = Array.from(document.querySelectorAll('#enneagram-behaviors .grid-item.selected'))
                    .map(el => el.getAttribute('data-value'))
                    .join('\n');
                if (behaviors) prompt += `Behavioral Responses:\n${behaviors}\n\n`;
                const motivations = document.getElementById('enneagram-motivations');
                if (motivations?.value) prompt += `Core Motivations:\n${motivations.value}\n\n`;
                const fears = document.getElementById('enneagram-fears');
                if (fears?.value) prompt += `Core Fears:\n${fears.value}\n\n`;
                const stress = document.getElementById('enneagram-stress');
                if (stress?.value) prompt += `Behavior Under Stress:\n${stress.value}\n\n`;
                const growth = document.getElementById('enneagram-growth');
                if (growth?.value) prompt += `Behavior at My Best:\n${growth.value}\n\n`;
                const childhood = document.getElementById('enneagram-childhood');
                if (childhood?.value) prompt += `Influential Childhood Memory:\n${childhood.value}\n\n`;
                prompt += `Please analyze this to determine my primary Enneagram type, potential wing(s), stress and growth directions, and any additional insights based on Enneagram theory output in a code block formatted chart.`;
            }
            break;

        case 'expense':
            const locationsSelected = document.querySelectorAll('#expense-location .grid-item.selected');
            if (locationsSelected.length > 0) {
                prompt += formatGrid('#expense-location .grid-item.selected', 'Location');
                const selectedLocations = Array.from(locationsSelected).map(item => item.getAttribute('data-value'));
                if (selectedLocations.includes('Canada')) {
                    prompt += `I have included separate attachments of receipts. Please review all receipts and create a table for the receipts, categorizing the items into the following expense categories:
                    Advertising, Insurance, Interest, Maintenance and Repairs, Management and Administration Fees, Motor Vehicle Expenses, Office Expenses, Legal, Accounting, and Other Professional Fees, 
                    Property Taxes, Salaries/Wages/and Benefits, Travel, Utilities, Other Expenses (for miscellaneous items)
                    Ensure that all items on all receipts are accounted for and categorized appropriately.\n\n`;
                } else if (selectedLocations.includes('USA')) {
                    prompt += `I have included separate attachments of receipts. Please review all receipts and create a table for the receipts, categorizing the items into the following expense categories:
                    Advertising, Insurance (other than health), Interest, Repairs and Maintenance, Other Expenses (for management/admin fees or miscellaneous items), 
                    Car and Truck Expenses, Office Expense, Legal and Professional Services, Taxes and Licenses, Wages, Travel, Utilities
                    Ensure that all items on all receipts are accounted for and categorized appropriately.\n\n`;
                }
            }
            break;

        case 'research':
            prompt += formatList(document.getElementById('research-goal')?.value, 'Research Goal');
            prompt += formatList(document.getElementById('research-purpose')?.value, 'Purpose of this research');
            prompt += formatList(document.getElementById('research-type')?.value?.charAt(0).toUpperCase() + document.getElementById('research-type')?.value.slice(1), 'Type of research');
            prompt += formatList(document.getElementById('research-scope')?.value, 'Scope of the research');
            prompt += formatList(document.getElementById('data-collection-method')?.value, 'Data collection method');
            prompt += formatList(document.getElementById('research-audience')?.value, 'Target audience for research');
            prompt += formatList(document.getElementById('research-context')?.value, 'Context of research');
            prompt += formatList(document.getElementById('research-deliverables')?.value, 'Expected deliverables');
            prompt += formatList(document.getElementById('additional-details')?.value, 'Additional details');
            break;

        case 'speculation':
            prompt += formatList(document.getElementById('speculation-goal')?.value, 'Speculation Goal');
            prompt += formatList(document.getElementById('speculation-purpose')?.value, 'Purpose of this speculation');
            prompt += formatList(
                document.getElementById('speculation-type')?.value?.charAt(0).toUpperCase() +
                document.getElementById('speculation-type')?.value.slice(1),
                'Type of speculation'
            );
            prompt += formatList(document.getElementById('speculation-scope')?.value, 'Scope of the speculation');
            prompt += formatList(document.getElementById('speculation-approach')?.value, 'Approach to speculation');
            prompt += formatList(document.getElementById('speculation-audience')?.value, 'Focus of speculation');
            prompt += formatList(document.getElementById('speculation-context')?.value, 'Context of speculation');
            prompt += formatList(document.getElementById('speculation-outcomes')?.value, 'Expected outcomes');
            prompt += formatList(document.getElementById('additional-details')?.value, 'Additional details');
            break;
    }

    const style = document.createElement('style');
    style.textContent = `
        .prompt-modal {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: #fff;
            padding: 20px;
            border: 2px solid #000;
            box-shadow: 4px 4px 0 #000;
            z-index: 1000;
            text-align: center;
            font-size: 16px;
            color: #000;
            width: 80%;
            max-width: 500px;
        }
        .prompt-modal button {
            margin-top: 10px;
            padding: 10px 20px;
            background: #000;
            color: #fff;
            border: 2px solid #000;
            border-radius: 5px;
            cursor: pointer;
        }
        .prompt-modal button:hover {
            background: #333;
        }
        .button-container {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .ai-button {
            background: none;
            border: none;
            cursor: pointer;
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .ai-logo {
            width: 40px;
            height: 40px;
            display: block;
        }
    `;
    document.head.appendChild(style);

    if (prompt) {
        document.getElementById('result').textContent = prompt;
        navigator.clipboard.writeText(prompt).then(() => {
            const modal = document.createElement('div');
            modal.className = 'prompt-modal';
            modal.innerHTML = `
                <p>Your Promptemplate™ is ready! It’s copied to your clipboard—paste it into your favorite AI chat with Ctrl+V (Cmd+V on Mac) or right-click > Paste.</p>
                <div class="button-container">
                    <button class="ai-button" onclick="openApp('grok', 'https://grok.com')">
                        <img src="/images/grok.png" alt="Grok" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.openai.chat', 'https://chat.openai.com')">
                        <img src="/images/openai.png" alt="ChatGPT" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.deepseek.app', 'https://deepseek.com')">
                        <img src="/images/deep.png" alt="DeepSeek" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.google.gemini', 'https://gemini.google.com/app')">
                        <img src="/images/gemini.png" alt="Gemini" class="ai-logo">
                    </button>
                </div>
                <button onclick="this.parentElement.remove()">Got It</button>
            `;
            document.body.appendChild(modal);
        }).catch(err => {
            console.error('Failed to copy prompt:', err);
            const modal = document.createElement('div');
            modal.className = 'prompt-modal';
            modal.innerHTML = `
                <p>Prompt generated but failed to copy. Copy it manually from the page.</p>
                <div class="button-container">
                    <button class="ai-button" onclick="openApp('grok', 'https://grok.com')">
                        <img src="/images/grok.png" alt="Grok" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.openai.chat', 'https://chat.openai.com')">
                        <img src="/images/openai.png" alt="ChatGPT" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.deepseek.app', 'https://deepseek.com')">
                        <img src="/images/deep.png" alt="DeepSeek" class="ai-logo">
                    </button>
                    <button class="ai-button" onclick="openApp('com.google.gemini', 'https://gemini.google.com/app')">
                        <img src="/images/gemini.png" alt="Gemini" class="ai-logo">
                    </button>
                </div>
                <button onclick="this.parentElement.remove()">Got It</button>
            `;
            document.body.appendChild(modal);
        });
    } else {
        const modal = document.createElement('div');
        modal.className = 'prompt-modal';
        modal.innerHTML = `
            <p>No prompt generated. Please fill in the required fields.</p>
            <button onclick="this.parentElement.remove()">Got It</button>
        `;
        document.body.appendChild(modal);
    }
}

document.querySelectorAll('#personal-btn, #business-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const termsChecked = document.getElementById('termscheckbox')?.checked;
        const scope = button.getAttribute('data-scope');

        if (!termsChecked) {
            e.preventDefault();
            alert("Please agree to the Terms of Service before accessing the Promptemplates™");
            return;
        }

        toggleScope(scope);
        const targetSection = document.getElementById(`${scope}-prompts`);
        if (targetSection) {
            const sectionHeight = targetSection.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollPosition = targetSection.getBoundingClientRect().top + window.scrollY - (windowHeight - sectionHeight) / 2;
            window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }
    });
});



document.querySelectorAll('.generate-btn').forEach(button => {
    button.addEventListener('click', () => {
        const promptType = button.getAttribute('data-prompt');
        generatePrompt(promptType);
    });
});

function openApp(appScheme, fallbackUrl) {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var isAndroid = /android/i.test(userAgent);
    var isiOS = /iPhone|iPad|iPod/i.test(userAgent);

    var startTime = Date.now();
    if (isAndroid) {
        window.location.href = `intent://app/#Intent;package=${appScheme};end`;
    } else if (isiOS) {
        window.location.href = `${appScheme}://`;
    } else {
        window.location.href = fallbackUrl;
        return;
    }

    setTimeout(function () {
        if (Date.now() - startTime < 2000) {
            window.location.href = fallbackUrl;
        }
    }, 1500);
}