
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
                prompt += `Goal: ${generalGoal.value}\n\n`;

                prompt += formatGrid('#general-purpose .grid-item.selected', 'Consider the following details & then output for');

                const generalInfoReturn = document.getElementById('general-info-return');
                const selectedFormat = generalInfoReturn.querySelector('.grid-item.selected');
                if (selectedFormat) {
                    const formatValue = selectedFormat.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }

                const generalContext = document.getElementById('general-context');
                if (generalContext && generalContext.value) {
                    prompt += formatList(generalContext.value, 'Context');
                }
            }
            break;

        case 'incident':

        prompt += ('Goal: To have you analyze the following information');

        prompt += formatGrid('#incident-purpose .grid-item.selected', 'Purpose for analyzation');


            const incidentDetails = document.getElementById('incident-details');
            if (incidentDetails && incidentDetails.value) {


                const incidentFormatReturn = document.getElementById('incident-format-return');
                const selectedFormatIncident = incidentFormatReturn.querySelector('.grid-item.selected');
                if (selectedFormatIncident) {
                    const formatValue = selectedFormatIncident.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }

                prompt += formatGrid('#incident-warnings .grid-item.selected', 'My personality traits');
                prompt += formatList(incidentDetails.value, 'What Happened');
                prompt += formatGrid('#incident-mood .grid-item.selected', 'Perceived mood/tone of other people involved');

                const incidentMoments = document.getElementById('incident-moments');
                if (incidentMoments && incidentMoments.value) prompt += formatList(incidentMoments.value, 'Key moments');

                const incidentThoughts = document.getElementById('incident-thoughts');
                if (incidentThoughts && incidentThoughts.value) prompt += formatList(incidentThoughts.value, 'My initial thoughts');
            }
            break;

        case 'event':

        prompt += formatGrid('#event-purpose .grid-item.selected', 'Consider the following event details. Then output for');

            const eventTypesSelected = document.querySelectorAll('#event-types .grid-item.selected');
            if (eventTypesSelected.length > 0) {
                prompt += formatGrid('#event-types .grid-item.selected', 'Event Type');


                const eventFormatReturn = document.getElementById('event-format-return');
                const selectedFormatEvent = eventFormatReturn.querySelector('.grid-item.selected');
                if (selectedFormatEvent) {
                    const formatValue = selectedFormatEvent.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }

                const location = document.getElementById('event-location');
                if (location && location.value) {
                    prompt += `Indoor/Outdoor: ${location.value === 'indoors' ? 'Indoors' : 'Outdoors'}\n\n`;

                    if (location.value === 'indoors') {
                        prompt += formatGrid('#event-indoor-setup .grid-item.selected', 'Venue Setup Needs');
                    } else {
                        prompt += formatGrid('#event-weather .grid-item.selected', 'Weather Considerations');
                    }

                    prompt += formatGrid('#event-elements .grid-item.selected', 'Elements');

                    const guests = document.getElementById('event-guests');
                    if (guests && guests.value) prompt += formatList(guests.value, 'Guest Count');

                    const budget = document.getElementById('event-budget');
                    if (budget && budget.value) prompt += formatList(budget.value, 'Budget');

                    const timeline = document.getElementById('event-timeline');
                    if (timeline && timeline.value) prompt += formatList(timeline.value, 'Timeline');

                    const specificContext = document.getElementById('event-specific-context');
                    if (specificContext && specificContext.value) prompt += `Context Dump: ${specificContext.value}\n\n`;
                }
            }
            break;

            case 'fitness':

            prompt += formatGrid('#fitness-purpose .grid-item.selected', 'Consider the following fitness details. Then output for');


const fitnessGoalsSelected = document.querySelectorAll('#fitness-goal .grid-item.selected');
if (fitnessGoalsSelected.length > 0) {
prompt += formatGrid('#fitness-goal .grid-item.selected', 'My fitness goal is');


const locationSelection = document.querySelector('#fitness-home-exercises .grid-item.selected');
if (locationSelection) {
    const locationValue = locationSelection.getAttribute('data-value');
    prompt += `Location: ${locationValue === 'Home' ? 'Home' : 'Gym'}\n\n`;
}

const age = document.getElementById('fitness-age');
if (age && age.value) prompt += formatList(age.value, 'Age');

const height = document.getElementById('fitness-height');
if (height && height.value) prompt += formatList(height.value, 'Height');

const weight = document.getElementById('fitness-weight');
if (weight && weight.value) prompt += formatList(weight.value, 'Weight');

prompt += formatGrid('#fitness-level .grid-item.selected', 'Fitness Level');

const injuries = document.getElementById('fitness-injuries');
if (injuries && injuries.value) prompt += formatList(injuries.value, 'Injuries/Health Conditions');

const frequency = document.getElementById('fitness-frequency');
if (frequency && frequency.value) prompt += formatList(frequency.value, 'Amount of times that I can workout a week');

const duration = document.getElementById('fitness-duration');
if (duration && duration.value) prompt += formatList(duration.value, 'Length of workout session I can perform');
}
break;

        case 'calorie':

            prompt += formatGrid('#calorie-purpose .grid-item.selected', 'The purpose of this prompt is to display the users calorie & macronutrient deficit/surplus relative to their food log for the following purpose(s)');

            const calorieFormatReturn = document.getElementById('calorie-format-return');
            const selectedCalorieFormat = calorieFormatReturn.querySelector('.grid-item.selected');
            if (selectedCalorieFormat) {
                const formatValue = selectedCalorieFormat.getAttribute('data-value');
                prompt += `Format for output: ${formatValue}\n\n`;
            }

            prompt += formatGrid('#calorie-goal .grid-item.selected', 'My Goal');

            const weight = document.getElementById('calorie-weight');
            if (weight && weight.value) prompt += formatList(weight.value, 'Weight');
            const height = document.getElementById('calorie-height');
            if (height && height.value) prompt += formatList(height.value, 'Height');
            const age = document.getElementById('calorie-age');
            if (age && age.value) prompt += formatList(age.value, 'Age');

            prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');

            const foodLog = document.getElementById('calorie-food-log');
            if (foodLog && foodLog.value) {
                prompt += `Today's Food Log:\n${foodLog.value}\n\n`;
            }
            break;

        case 'trip':
            
        prompt += formatGrid('#trip-purpose .grid-item.selected', 'Consider the following trip details. Then output for');

        
        const tripSpecifics = document.getElementById('trip-specifics');
            if (tripSpecifics && tripSpecifics.value) {
                prompt += formatGrid('#trip-activities .grid-item.selected', 'The main activities of this trip will be');
                prompt += `Activity specific information sought:\n${tripSpecifics.value}\n\n`;

                const tripFormatReturn = document.getElementById('trip-format-return');
                const selectedTripFormat = tripFormatReturn.querySelector('.grid-item.selected');
                if (selectedTripFormat) {
                    const formatValue = selectedTripFormat.getAttribute('data-value');
                    prompt += `Return the information in this format: ${formatValue}\n\n`;
                }

                const plans = document.getElementById('trip-plans');
                if (plans && plans.value) prompt += formatList(plans.value, 'Confirmed Schedule');

                const packing = document.getElementById('trip-packing');
                if (packing && packing.value) {
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
                if (people && people.value) prompt += formatList(people.value, 'Number of People on Trip');

                const days = document.getElementById('trip-days');
                if (days && days.value) prompt += formatList(days.value, 'Trip Length');


                prompt += formatGrid('#trip-relationship .grid-item.selected', 'Relationship to People on Trip');

                const cost = document.getElementById('trip-cost');
                if (cost && cost.value) prompt += formatList(cost.value, 'Budget');
            }
            break;

        case 'business':
            const vision = document.getElementById('business-vision');
            if (vision && vision.value) {
                prompt += `Analyze the following data and create a logical business plan for starting a new business. Include actionable steps tailored to my strengths, weaknesses, and resources.\n\n`;
                prompt += `Business Idea: ${vision.value}\n\n`;

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
                if (organization && organization.value) prompt += formatList(organization.value, 'Business Tools & Equipment');

                const network = document.getElementById('business-network');
                if (network && network.value) prompt += formatList(network.value, 'Business Network');
            }
            break;

        case 'app':
            const appPurpose = document.getElementById('app-purpose');
            if (appPurpose && appPurpose.value) {
                prompt += `I want to develop an app. The purpose is: ${appPurpose.value}\n\n`;
                prompt += formatGrid('#app-code-status .grid-item.selected', 'Code Status');
                const currentCode = document.getElementById('app-current-code');
                if (currentCode && currentCode.value) prompt += formatList(currentCode.value, 'Current Code');
                prompt += formatGrid('#app-features .grid-item.selected', 'Features');
                const platform = document.getElementById('app-platform');
                if (platform && platform.value) prompt += formatList(platform.value, 'Platform');
                const budget = document.getElementById('app-budget');
                if (budget && budget.value) prompt += formatList(budget.value, 'Budget');
                const timeline = document.getElementById('app-timeline');
                if (timeline && timeline.value) prompt += formatList(timeline.value, 'Timeline');
            }
            break;

        case 'marketing':
            const marketGoal = document.getElementById('market-goal');
            if (marketGoal && marketGoal.value) {
                prompt += `I want to create a marketing campaign. The goal is: ${marketGoal.value}\n\n`;
                prompt += formatGrid('#market-channels .grid-item.selected', 'Channels');
                const audience = document.getElementById('market-audience');
                if (audience && audience.value) prompt += formatList(audience.value, 'Audience');
                const budget = document.getElementById('market-budget');
                if (budget && budget.value) prompt += formatList(budget.value, 'Budget');
                const metrics = document.getElementById('market-metrics');
                if (metrics && metrics.value) prompt += formatList(metrics.value, 'Metrics');
            }
            break;

        case 'business-strategy':
            const bizGoal = document.getElementById('biz-goal');
            if (bizGoal && bizGoal.value) {
                prompt += `I want to develop a business strategy. The goal is: ${bizGoal.value}\n\n`;
                prompt += formatGrid('#biz-tactics .grid-item.selected', 'Tactics');
                const market = document.getElementById('biz-market');
                if (market && market.value) prompt += formatList(market.value, 'Market');
                const resources = document.getElementById('biz-resources');
                if (resources && resources.value) prompt += formatList(resources.value, 'Resources');
                const milestones = document.getElementById('biz-milestones');
                if (milestones && milestones.value) prompt += formatList(milestones.value, 'Milestones');
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

function openAIApp(appLink, fallbackUrl) {
    window.location = appLink;
    setTimeout(() => {
        if (document.visibilityState === 'visible') {
            window.location = fallbackUrl;
        }
    }, 1000);
}
