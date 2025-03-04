 /*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */



let activeScope = null;

function toggleSection(header) {
    const section = header.parentElement;
    section.classList.toggle('expanded');
}

function toggleScope(scope) {
    const personalBtn = document.getElementById('personal-btn');
    const businessBtn = document.getElementById('business-btn');
    const personalPrompts = document.getElementById('personal-prompts');
    const businessPrompts = document.getElementById('business-prompts');

    if (activeScope === scope) {
        personalPrompts.classList.add('hidden');
        businessPrompts.classList.add('hidden');
        personalBtn.classList.remove('selected');
        businessBtn.classList.remove('selected');
        activeScope = null;
    } else {
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

function toggleMealDetails() {
    const scopeEl = document.getElementById('meal-scope');
    if (scopeEl) {
        const scope = scopeEl.value;
        document.getElementById('meal-details').classList.toggle('hidden', !scope);
        document.getElementById('meal-multiple-days').classList.toggle('hidden', scope !== 'multiple');
    }
}

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

document.getElementById('personal-btn').addEventListener('click', () => toggleScope('personal'));
document.getElementById('business-btn').addEventListener('click', () => toggleScope('business'));

document.querySelectorAll('.grid-container:not(#scope-selector):not(#app-code-status) .grid-item').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('selected'));
});

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

            prompt += 'Purpose of analysis: Maximize the efficiency, productivity, and safety of the workplace\n\n';

            const incidentDetails = document.getElementById('incident-details');
            if (incidentDetails?.value) {
                

                prompt += formatGrid('#incident-warnings .grid-item.selected', 'My personality traits');
                prompt += formatList(incidentDetails.value, 'What Happened');
                prompt += formatGrid('#incident-mood .grid-item.selected', 'Perceived mood/tone of other people involved');

                const incidentMoments = document.getElementById('incident-moments');
                if (incidentMoments?.value) prompt += formatList(incidentMoments.value, 'Key moments');

                const incidentThoughts = document.getElementById('incident-thoughts');
                if (incidentThoughts?.value) prompt += formatList(incidentThoughts.value, 'My initial thoughts');
            }
            break;

            case 'event':
                const eventTypesSelected = document.querySelectorAll('#event-types .grid-item.selected');
                if (eventTypesSelected.length > 0) {
                    prompt += formatGrid('#event-types .grid-item.selected', 'I want to host the following event');
            
                    prompt += 'Purpose of Analysis: To generate a clear and actionable checklist with options for hosting a feasible event, considering all relevant factors (such as budget, guest count, and timeline). If any aspect of the event is deemed unfeasible, the analysis will immediately highlight the issue and provide recommendations for adjustments or additional resources required. The AI should return suggestions only in a logical and actionable checklist format for planning, setting up, hosting, and ending the event.';
            
            
                    const eventFormatReturn = document.getElementById('event-format-return');
                    const selectedFormatEvent = eventFormatReturn?.querySelector('.grid-item.selected');
                    if (selectedFormatEvent) {
                        const formatValue = selectedFormatEvent.getAttribute('data-value');
                        prompt += `Return the information in this format: ${formatValue}\n\n`;
                    }
            
                    prompt += formatGrid('#event-elements .grid-item.selected', 'Elements');
            
                    // Venue Section
                    const venueStatus = document.getElementById('event-venue').value;
                    if (venueStatus) {
                        prompt += `Venue Status: ${venueStatus}\n\n`;
                    }
            
                    const location = document.getElementById('event-location');
                    if (location?.value) {
                        prompt += `Indoor/Outdoor: ${location.value === 'indoors' ? 'Indoors' : 'Outdoors'}\n\n`;
            
                        if (location.value === 'indoors') {
                            prompt += formatGrid('#event-indoor-setup .grid-item.selected', 'Venue Setup Needs');
                        } else {
                            prompt += formatGrid('#event-outdoor .grid-item.selected', 'Setup Considerations');
                        }
            
                        const guests = document.getElementById('event-guests');
                        if (guests?.value) prompt += formatList(guests.value, 'Guest Count');
            
                        const budget = document.getElementById('event-budget');
                        if (budget?.value) prompt += formatList(budget.value, 'Budget');
            
                        const timeline = document.getElementById('event-timeline');
                        if (timeline?.value) prompt += formatList(timeline.value, 'Timeline');
            
                        const specificContext = document.getElementById('event-specific-context');
                        if (specificContext?.value) prompt += `Context Dump: ${specificContext.value}\n\n`;
                    }
                }
                break;
            

        case 'fitness':
            const fitnessGoalsSelected = document.querySelectorAll('#fitness-goal .grid-item.selected');
            if (fitnessGoalsSelected.length > 0) {
                prompt += formatGrid('#fitness-goal .grid-item.selected', 'Consider the following input relative to my fitness goal');

                prompt += 'Purpose of analysis: Create a personalized fitness plan to achieve my goal in checklist format with headings of Workout 1, 2, etc., and subcategories\n\n';

                const locationSelection = document.querySelector('#fitness-home-exercises .grid-item.selected');
                if (locationSelection) {
                    const locationValue = locationSelection.getAttribute('data-value');
                    prompt += `Location: ${locationValue === 'Home' ? 'Home' : 'Gym'}\n\n`;
                }

                const age = document.getElementById('fitness-age');
                if (age?.value) prompt += formatList(age.value, 'Age');

                const height = document.getElementById('fitness-height');
                if (height?.value) prompt += formatList(height.value, 'Height');

                const weight = document.getElementById('fitness-weight');
                if (weight?.value) prompt += formatList(weight.value, 'Weight');

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
            prompt += formatGrid('#calorie-goal .grid-item.selected', 'Estimate calories and macronutrients for the following input as a percentage of daily requirements relative to my goal');

            prompt += `
The purpose of the estimates is to create a report in the following format:
Your Goal: Gain Muscle
Daily Requirements (Target for Muscle Gain):
Calories: 2587 kcal/day
Protein: 158.8 g
Carbs: 317.6 g
Fats: 79.4 g

Food Log Intake:
Calories: 1104 kcal (43% of goal)
Protein: 80 g (50% of goal)
Carbs: 86 g (27% of goal)
Fats: 50 g (63% of goal)

Recommendations:
Increase calories by 1483 kcal to hit your target.
Add approximately 79 g of protein to reach your goal.
Boost carbs by 232 g.
Add 29 g more fats to meet your daily fat requirement.
`;

            const weight = document.getElementById('calorie-weight');
            if (weight?.value) prompt += formatList(weight.value, 'Weight');
            const height = document.getElementById('calorie-height');
            if (height?.value) prompt += formatList(height.value, 'Height');
            const age = document.getElementById('calorie-age');
            if (age?.value) prompt += formatList(age.value, 'Age');

            prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');

            const foodLog = document.getElementById('calorie-food-log');
            if (foodLog?.value) {
                prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
            }
            break;

        case 'trip':
            prompt += formatGrid('#trip-purpose .grid-item.selected', 'Review the following activities I want to do on my trip');

            prompt += 'Purpose of review: To build a logical timeline for my trip in checklist format\n\n';

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

                const businessFormatReturn = document.getElementById('business-format-return');
                const selectedBusinessFormat = businessFormatReturn ? businessFormatReturn.querySelector('.grid-item.selected') : null;
                if (selectedBusinessFormat) {
                    const formatValue = selectedBusinessFormat.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }

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
            }
            break;

        case 'business-strategy':
            const bizGoal = document.getElementById('biz-goal');
            if (bizGoal?.value) {
                prompt += `I want to develop a business strategy. The goal is: ${bizGoal.value}\n\n`;
                prompt += formatGrid('#biz-tactics .grid-item.selected', 'Tactics');
                const market = document.getElementById('biz-market');
                if (market?.value) prompt += formatList(market.value, 'Market');
                const resources = document.getElementById('biz-resources');
                if (resources?.value) prompt += formatList(resources.value, 'Resources');
                const milestones = document.getElementById('biz-milestones');
                if (milestones?.value) prompt += formatList(milestones.value, 'Milestones');
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
            
                if (prompt) {
                    // Show the generated prompt in the result div
                    document.getElementById('result').textContent = prompt;
            
                    // Copy to clipboard
                    navigator.clipboard.writeText(prompt).then(() => alert('Prompt copied to clipboard!'));
                } else {
                    alert('Please fill in the necessary details for the research prompt.');
                }
                break;
            
            
            


    }

    document.getElementById('result').textContent = prompt;
    navigator.clipboard.writeText(prompt).then(() => alert('Prompt copied to clipboard!'));
}

document.querySelectorAll('.generate-btn').forEach(button => {
    button.addEventListener('click', () => {
        const promptType = button.getAttribute('data-prompt');
        generatePrompt(promptType);
    });
});

function openApp(appScheme, fallbackUrl) {
    // Check if the device is Android or iOS
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var isAndroid = /android/i.test(userAgent);
    var isiOS = /iPhone|iPad|iPod/i.test(userAgent);

    // If it's Android, try opening with the app scheme
    if (isAndroid) {
        window.location = "intent://" + appScheme + "#Intent;package=" + appScheme + ";end";
    }
    // If it's iOS, use the custom URL scheme for deep linking
    else if (isiOS) {
        window.location = "yourappscheme://" + appScheme;
    }

    // If the app isn't installed, redirect to the fallback URL (such as App Store or Google Play)
    setTimeout(function () {
        window.location = fallbackUrl;
    }, 3000);  // Wait for 3 seconds to see if the app opens; then fallback to URL
}