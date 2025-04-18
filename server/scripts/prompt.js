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
    // Function to get authenticated status from localStorage and check expiration
    function getAuthStatus(name) {
        const now = Date.now();
        const status = JSON.parse(window.localStorage.getItem(name));
        if (status && now > status.time) {
            localStorage.removeItem(name); // Remove expired item
            return false;
        }
        return status ? status.isPaid : false;
    }

    // Function to set authenticated status in localStorage with expiration
    function setAuthStatus(name, value) {
        const date = new Date();
        window.localStorage.setItem(name, JSON.stringify({
            isPaid: value,
            time: date.setTime(date.getTime() + 30 * 60 * 1000) // 30 minutes expiration
        }));
    }

    // Check if user is authenticated
    const isPaid = getAuthStatus("authenticated");

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

    // Set the "prompt" cookie on page load (unchanged)
    setCookie("prompt", Date.now(), 32);

    // Attach toggleSection to section headers (free and premium)
    document.querySelectorAll('.section > h2, .section1-header').forEach(header => {
        header.addEventListener('click', () => toggleSection(header));
    });

    // Monitor terms checkbox state
    const termsCheckbox = document.getElementById('termscheckbox');
    const introDiv = document.getElementById('intro');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function () {
            const personalPrompts = document.getElementById('personal-prompts');
            const personalBtn = document.getElementById('personal-btn');
            const promptContainer = personalPrompts?.parentElement;

            if (!this.checked) {
                // When terms are unchecked, hide personal prompts and show intro
                if (personalPrompts) personalPrompts.classList.add('hidden');
                if (personalBtn) personalBtn.classList.remove('selected');
                if (promptContainer) promptContainer.classList.add('hidden');
                if (introDiv) introDiv.classList.remove('hidden');
                activeScope = null; // Reset active scope
            }
            // No action when terms are checked; wait for personal-btn click
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

    // Personal button event listener
    const personalBtn = document.getElementById('personal-btn');
    if (personalBtn) {
        personalBtn.addEventListener('click', (e) => {
            const termsChecked = document.getElementById('termscheckbox')?.checked;
            if (!termsChecked) {
                e.preventDefault();
                alert("Please agree to the Terms of Service before accessing the Promptemplates™");
                return;
            }
            // Show personal prompts, hide intro, and set button state
            toggleScope('personal');
            const personalPrompts = document.getElementById('personal-prompts');
            const promptContainer = personalPrompts?.parentElement;
            if (personalPrompts) personalPrompts.classList.remove('hidden');
            if (promptContainer) promptContainer.classList.remove('hidden');
            if (introDiv) introDiv.classList.add('hidden');
            personalBtn.classList.add('selected');

            // Scroll to personal prompts
            const targetSection = document.getElementById('personal-prompts');
            if (targetSection) {
                const sectionHeight = targetSection.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollPosition = targetSection.getBoundingClientRect().top + window.scrollY - (windowHeight - sectionHeight) / 2;
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        });
    }

    // Generate prompt buttons
    document.querySelectorAll('.generate-btn').forEach(button => {
        button.addEventListener('click', () => {
            const promptType = button.getAttribute('data-prompt');
            generatePrompt(promptType);
        });
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
    const personalPrompts = document.getElementById('personal-prompts');
    const promptContainer = personalPrompts?.parentElement;

    if (!personalBtn || !personalPrompts || !promptContainer) {
        console.error('Missing elements:', { personalBtn, personalPrompts, promptContainer });
        return;
    }

    if (activeScope === scope) {
        // Hide personal prompts
        personalPrompts.classList.add('hidden');
        personalBtn.classList.remove('selected');
        promptContainer.classList.add('hidden');
        activeScope = null;
    } else {
        // Show personal prompts
        promptContainer.classList.remove('hidden');
        personalPrompts.classList.remove('hidden');
        personalBtn.classList.add('selected');

        // Ensure all <details> in personal sections are closed
        const sections = personalPrompts.querySelectorAll('.section, .section1');
        sections.forEach(section => {
            const type = section.getAttribute('data-type');
            if (type === 'personal') {
                section.classList.add('visible');
                const details = section.querySelector('details');
                if (details) {
                    details.open = false; // Keep dropdown closed
                }
            }
        });

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

        case 'SocialIQ™':
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

        case 'EventIQ™':
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

        case 'EmotionIQ™':
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

        case 'FitnessIQ™':
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
                }
                const weight = document.getElementById('fitness-weight');
                const weightUnit = document.getElementById('fitness-weight-unit');
                if (weight?.value && weightUnit?.value) {
                    prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
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

        case 'CalorieIQ™':
            prompt += formatGrid('#calorie-goal .grid-item.selected', 'Estimate calories and macronutrients for the following input as a percentage of daily requirements relative to my goal. Also analyze my height, weight, and age to compare me against the average person at my height, age, and weight. ');
            prompt += `
                Output only a text-based table in a code block with these exact columns: Nutrient, Target Amount, Food Log Intake, Percentage Reached. Use this header format in the code block:
                Include no text outside the code block—no comments, explanations, or recommendations unless specified below.
                `;
            const recommendations = document.querySelector('#calorie-recommendations .grid-item.selected');
            if (recommendations) {
                prompt += `
                    If there are deficits in calories or macronutrients based on my goal and food log, suggest meal recommendations to meet the remaining needs. Output meal suggestions in a separate text-based table in a code block with columns: Meal, Calories, Protein (g), Carbs (g), Fat (g). Use this header format:
                    Include no text outside the code blocks.
                    `;
            }
            prompt += `
                Add any future amounts I provide to the running totals unless I request a new estimate.
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

        case 'AdventureIQ™':
            prompt += formatGrid('#trip-activities .grid-item.selected', 'Review the following activities I want to do on my trip');
            prompt += 'Purpose of review: To build a logical timeline for my trip in checklist format code block. If available include the weather forecast for the location(s)\n\n';
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

        case 'SymptomIQ™':
            const rootoutSymptoms = document.getElementById('rootout-symptoms');
            if (rootoutSymptoms?.value) {
                prompt += `Analyze the following input to identify potential causes of my symptoms, with the goal of eliminating the cause to stop the effect:\n\n`;
                prompt += formatList(rootoutSymptoms.value, 'Symptoms');
                prompt += formatGrid('#rootout-triggers .grid-item.selected', 'Potential Triggers');
                const rootoutDiet = document.getElementById('rootout-diet');
                if (rootoutDiet?.value) prompt += formatList(rootoutDiet.value, 'Diet (Past 48 Hours)');
                const rootoutTiming = document.getElementById('rootout-timing');
                if (rootoutTiming?.value) prompt += formatList(rootoutTiming.value, 'Timing of Symptoms');
                const rootoutPatterns = document.getElementById('rootout-patterns');
                if (rootoutPatterns?.value) prompt += formatList(rootoutPatterns.value, 'Observed Patterns');
                const rootoutContext = document.getElementById('rootout-context');
                if (rootoutContext?.value) prompt += formatList(rootoutContext.value, 'Additional Context');
                prompt += `Purpose of analysis: Identify likely causes of my symptoms by analyzing patterns, timing, and triggers. Provide a structured response in checklist format with headings like "Potential Causes" (list possible triggers with reasoning) and "Elimination Plan" (steps to test each cause, e.g., avoid specific foods for a week). Highlight any delayed correlations (e.g., symptoms 24 hours after a trigger). Suggest consulting a professional for medical concerns.`;
            }
            break;

        case 'EnneagramIQ™':
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
    }

    if (prompt) {
        document.getElementById('result').textContent = prompt;
        navigator.clipboard.writeText(prompt).then(() => {
            openGeneratedPromptModal();
        }).catch(err => {
            console.error('Failed to copy prompt:', err);
            openGeneratedPromptModal();
        });
    } else {
        openGeneratedPromptModal();
    }
}

function openCustomModal(content) {
    const modal = document.createElement('div');
    modal.className = 'prompt-modal';
    modal.innerHTML = `
        <p>${content}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    document.body.appendChild(modal);
}

window.openCustomModal = openCustomModal;

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