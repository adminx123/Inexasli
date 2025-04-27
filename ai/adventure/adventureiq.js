/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

(function () {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        initializeForm();
    });

    // Event delegation for dynamic elements
    document.addEventListener('click', function (e) {
        const target = e.target;

        // Handle grid item clicks
        if (target.classList.contains('grid-item')) {
            target.classList.toggle('selected');
            saveGridItem(target);
        }

        // Handle generate button
        if (target.classList.contains('generate-btn')) {
            handleGenerateAdventureIq(e);
        }

        // Handle clear button
        if (target.classList.contains('clear-btn')) {
            clearLocalStorage();
        }
    });

    // Handle input changes
    document.addEventListener('change', function (e) {
        const target = e.target;
        if (target.matches('input, textarea, select')) {
            saveInput(target);
        }
    });

    // Initialize form
    function initializeForm() {
        repopulateForm();

        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', function () {
                this.style.height = '100px';
                this.style.height = `${this.scrollHeight}px`;
            });
        });
    }

    function saveGridItem(item) {
        const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
        const value = item.classList.contains('selected') ? 'true' : 'false';
        try {
            localStorage.setItem(key, value);
            console.log(`Saved ${key}: ${value}`);
        } catch (error) {
            console.error(`Error saving grid item ${key}:`, error);
        }
    }

    function saveInput(input) {
        const key = `input_${input.id}`;
        const value = input.value;
        try {
            localStorage.setItem(key, value);
            console.log(`Saved ${key}: ${value}`);
        } catch (error) {
            console.error(`Error saving input ${key}:`, error);
        }
    }

    async function handleGenerateAdventureIq(e) {
        const btn = e.target;
        const initialText = btn.innerText;
        btn.innerText = 'Loading...';
        btn.setAttribute('disabled', 'true');

        console.log('Debug: handleGenerateAdventureIq function called');
        const formData = getFormData();
        if (!formData) {
            btn.innerText = initialText;
            btn.removeAttribute('disabled');
            return;
        }

        console.log('Processed form data:', formData);

        // Simulate API call (replace with actual API if available)
        try {
            // Example API call (uncomment and configure if needed)
            /*
            const apiUrl = 'https://your-api-endpoint';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (data.message !== 'Success') throw new Error(`API error: ${data.message || data.error}`);
            */

            // Simulate successful response
            const data = { message: 'Success', data: generatePrompt('AdventureIQ™') };
            console.log('Simulated API response:', data);

            btn.innerText = 'Success';
            toggleDataOutcontainer();
            toggleDatainContainer();

            setTimeout(() => {
                btn.innerText = initialText;
                btn.removeAttribute('disabled');
            }, 3000);
        } catch (error) {
            console.error('Error processing request:', error);
            btn.innerText = error.message;
            setTimeout(() => {
                btn.innerText = initialText;
                btn.removeAttribute('disabled');
            }, 4000);
        }
    }

    function getFormData() {
        console.log('Debug: getFormData function called');
        const formData = {
            activities: [],
            relationships: [],
            location: null,
            specifics: null,
            plans: null,
            packing: null,
            people: null,
            days: null,
            budget: null
        };

        // Activities
        const selectedActivities = document.querySelectorAll('#trip-activities .grid-item.selected');
        if (selectedActivities.length === 0) {
            alert('Please select at least one activity.');
            return;
        }
        selectedActivities.forEach(item => formData.activities.push(item.dataset.value));

        // Relationships
        const selectedRelationships = document.querySelectorAll('#trip-relationship .grid-item.selected');
        selectedRelationships.forEach(item => formData.relationships.push(item.dataset.value));

        // Location
        const location = document.getElementById('trip-location');
        if (location?.value.trim()) formData.location = location.value.trim();

        // Specifics
        const specifics = document.getElementById('trip-specifics');
        if (specifics?.value.trim()) formData.specifics = specifics.value.trim();

        // Plans
        const plans = document.getElementById('trip-plans');
        if (plans?.value.trim()) formData.plans = plans.value.trim();

        // Packing
        const packing = document.getElementById('trip-packing');
        if (packing?.value) formData.packing = packing.value;

        // People
        const people = document.getElementById('trip-people');
        if (people?.value && !isNaN(people.value) && parseInt(people.value) > 0) {
            formData.people = parseInt(people.value);
        } else {
            alert('Please enter a valid number of people.');
            return;
        }

        // Days
        const days = document.getElementById('trip-days');
        if (days?.value && !isNaN(days.value) && parseInt(days.value) > 0) {
            formData.days = parseInt(days.value);
        } else {
            alert('Please enter a valid number of days.');
            return;
        }

        // Budget
        const budget = document.getElementById('trip-budget');
        if (budget?.value.trim()) formData.budget = budget.value.trim();

        return formData;
    }

    function repopulateForm() {
        document.querySelectorAll('.grid-container .grid-item').forEach(item => {
            const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
            const value = localStorage.getItem(key);
            if (value === 'true') {
                item.classList.add('selected');
                console.log(`Restored ${key}: true`);
            } else if (value === 'false') {
                item.classList.remove('selected');
                console.log(`Restored ${key}: false`);
            }
        });

        document.querySelectorAll('input, textarea, select').forEach(input => {
            const key = `input_${input.id}`;
            const value = localStorage.getItem(key);
            if (value !== null) {
                input.value = value;
                console.log(`Restored ${key}: ${value}`);
            }
        });
    }

    function clearLocalStorage() {
        if (!confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) {
            console.log("User canceled the clear action.");
            return;
        }
        document.querySelectorAll('.grid-container .grid-item').forEach(item => {
            const key = `grid_${item.parentElement.id}_${item.dataset.value.replace(/\s+/g, '_')}`;
            localStorage.removeItem(key);
            item.classList.remove('selected');
            console.log(`Cleared ${key}`);
        });
        document.querySelectorAll('input, textarea, select').forEach(input => {
            const key = `input_${input.id}`;
            localStorage.removeItem(key);
            input.value = '';
            console.log(`Cleared ${key}`);
        });
        const packing = document.getElementById('trip-packing');
        if (packing) packing.value = 'NN';
        console.log("All saved data cleared and form reset.");
    }

    const formatList = (items, prefix) => items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
    const formatGrid = (selector, prefix) => {
        const items = Array.from(document.querySelectorAll(selector))
            .filter(el => el.classList.contains('selected'))
            .map(el => el.dataset.value)
            .join('\n');
        return items ? `${prefix}:\n${items.split('\n').map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\n` : '';
    };

    function generatePrompt(promptType) {
        console.log('Debug: generatePrompt function called with argument:', promptType);
        let prompt = '';
        if (promptType === 'AdventureIQ™') {
            prompt += formatGrid('#trip-activities .grid-item.selected', 'Review the following activities I want to do on my trip');
            prompt += 'Purpose of review: To build a logical timeline for my trip in checklist format code block. If available, include the weather forecast for the location(s).\n\n';
            const tripSpecifics = document.getElementById('trip-specifics');
            if (tripSpecifics?.value) {
                prompt += formatGrid('#trip-activities .grid-item.selected', 'The main activities of this trip will be');
                prompt += `Activity-specific information requested:\n${tripSpecifics.value}\n\n`;
            }
            const plans = document.getElementById('trip-plans');
            if (plans?.value) prompt += formatList(plans.value, 'Confirmed Schedule');
            const packing = document.getElementById('trip-packing');
            if (packing?.value) {
                let packingDescription = '';
                switch (packing.value) {
                    case 'YM': packingDescription = 'Packing tips needed for Male'; break;
                    case 'YF': packingDescription = 'Packing tips needed for Female'; break;
                    case 'YMF': packingDescription = 'Packing tips needed for Male & Female'; break;
                    case 'NN': packingDescription = 'Packing tips not needed'; break;
                }
                prompt += formatList(packingDescription, 'Packing Requirements');
            }
            const people = document.getElementById('trip-people');
            if (people?.value) prompt += formatList(people.value, 'Number of People on Trip');
            const days = document.getElementById('trip-days');
            if (days?.value) prompt += formatList(days.value, 'Trip Length (days)');
            const location = document.getElementById('trip-location');
            if (location?.value) prompt += formatList(location.value, 'Trip Location');
            prompt += formatGrid('#trip-relationship .grid-item.selected', 'Relationship to People on Trip');
            const budget = document.getElementById('trip-budget');
            if (budget?.value) prompt += formatList(budget.value, 'Trip Budget');
            prompt += `
                Output the trip timeline in a text-based checklist format in a code block with the following columns: Day, Time, Activity, Location, Notes. Use this header format:
                \`\`\`
                | Day       | Time      | Activity         | Location        | Notes           |
                |-----------|-----------|------------------|-----------------|-----------------|
                \`\`\`
                If packing tips are requested, provide them in a separate text-based list in a code block with the following format:
                \`\`\`
                Packing Tips:
                1. Item 1
                2. Item 2
                ...
                \`\`\`
                If weather forecast is available, include it in a separate text-based table in a code block with columns: Day, Location, Weather, Temperature (°C). Use this header format:
                \`\`\`
                | Day       | Location  | Weather          | Temperature (°C) |
                |-----------|-----------|------------------|------------------|
                \`\`\`
                Include no text outside the code blocks unless specified.
            `;
        }
        return prompt;
    }

    function openCustomModal(content) {
        console.log('Debug: openCustomModal called with content:', content);
        if (typeof openGeneratedPromptModal === 'function') {
            openGeneratedPromptModal(content);
        } else {
            console.warn('openGeneratedPromptModal not found, using fallback');
            alert('Generated prompt:\n' + content);
        }
    }

    function toggleDataOutcontainer() {
        const dataContainer = document.querySelector('.data-container-right');
        if (!dataContainer) {
            console.error('Data OUT container not found.');
            return;
        }

        const isExpanded = dataContainer.dataset.state === 'expanded';
        if (isExpanded) {
            dataContainer.classList.remove('expanded');
            dataContainer.classList.add('initial');
            dataContainer.dataset.state = 'initial';
            setLocal('dataOutContainerState', 'initial');
            dataContainer.innerHTML = `
                <span class="close-data-container">+</span>
                <span class="data-label">DATA OUT</span>
            `;
            console.log('Right data container collapsed and reset (adventureiq.js)');
        } else {
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            setLocal('dataOutContainerState', 'expanded');
            const lastGridItemUrl = getLocal('lastGridItemUrl');
            const outputMap = {
                '/ai/adventure/adventure.html': '/ai/adventure/adventureiqout.html',
                '/ai/calorie/calorieiq.html': '/ai/calorie/calorieiqout.html',
                '/ai/symptom/symptomiq.html': '/apioutput.html?gridItem=symptomiq',
                '/ai/book/bookiq.html': '/apioutput.html?gridItem=bookiq'
            };
            const outUrl = outputMap[lastGridItemUrl];
            if (outUrl) {
                setLocal('lastDataOutUrl', outUrl);
                loadStoredContent(dataContainer, outUrl);
            } else {
                dataContainer.innerHTML = `
                    <span class="close-data-container">-</span>
                    <span class="data-label">DATA OUT</span>
                    <div class="data-content">No relevant content available</div>
                `;
            }
            console.log('Right data container expanded (adventureiq.js)');
        }

        const newClose = dataContainer.querySelector('.close-data-container');
        const newLabel = dataContainer.querySelector('.data-label');
        if (newClose) {
            newClose.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataOutcontainer();
            });
        }
        if (newLabel) {
            newLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDataOutcontainer();
            });
        }
    }

    function toggleDatainContainer() {
        const dataContainer = document.querySelector('.data-container-left');
        if (!dataContainer) {
            console.error('Left data container not found.');
            return;
        }

        const isExpanded = dataContainer.dataset.state === 'expanded';
        if (isExpanded) {
            dataContainer.classList.remove('expanded');
            dataContainer.classList.add('initial');
            dataContainer.dataset.state = 'initial';
            setLocal('dataContainerState', 'initial');
            dataContainer.innerHTML = `
                <span class="close-data-container">+</span>
                <span class="data-label">DATA IN</span>
            `;
            console.log('Left data container collapsed and reset (adventureiq.js)');
        } else {
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            setLocal('dataContainerState', 'expanded');
            const storedUrl = getLocal('lastGridItemUrl');
            if (storedUrl) {
                loadStoredContent(dataContainer, storedUrl);
            } else {
                dataContainer.innerHTML = `
                    <span class="close-data-container">-</span>
                    <span class="data-label">DATA IN</span>
                    <div class="data-content">No content selected. Please select a grid item.</div>
                `;
            }
            console.log('Left data container expanded (adventureiq.js)');
        }

        const newClose = dataContainer.querySelector('.close-data-container');
        const newLabel = dataContainer.querySelector('.data-label');
        if (newClose) {
            newClose.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDatainContainer();
            });
        }
        if (newLabel) {
            newLabel.addEventListener('click', function (e) {
                e.preventDefault();
                toggleDatainContainer();
            });
        }
    }

    async function loadStoredContent(dataContainer, url) {
        try {
            console.log(`Attempting to load stored content from ${url} (adventureiq.js)`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
            const content = await response.text();
            console.log('Stored content fetched successfully (adventureiq.js)');

            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">${dataContainer.classList.contains('data-container-right') ? 'DATA OUT' : 'DATA IN'}</span>
                <div class="data-content">${content}</div>
            `;
            console.log(`Stored content loaded from ${url} into ${dataContainer.classList.contains('data-container-right') ? 'DATA OUT' : 'DATA IN'} container (adventureiq.js)`);

            const scriptUrl = url.replace('.html', '.js');
            try {
                const existingScripts = document.querySelectorAll(`script[data-source="${scriptUrl}"]`);
                existingScripts.forEach(script => script.remove());
                const scriptResponse = await fetch(scriptUrl);
                if (scriptResponse.ok) {
                    const scriptContent = await scriptResponse.text();
                    const script = document.createElement('script');
                    script.textContent = scriptContent;
                    script.dataset.source = scriptUrl;
                    document.body.appendChild(script);
                    console.log(`Loaded and executed script: ${scriptUrl} (adventureiq.js)`);
                }
            } catch (error) {
                console.log(`No script found or error loading ${scriptUrl}, skipping (adventureiq.js):`, error);
            }
        } catch (error) {
            console.error(`Error loading stored content (adventureiq.js):`, error);
            dataContainer.innerHTML = `
                <span class="close-data-container">-</span>
                <span class="data-label">${dataContainer.classList.contains('data-container-right') ? 'DATA OUT' : 'DATA IN'}</span>
                <div class="data-content">Error loading content</div>
            `;
        }
    }

    function setLocal(name, value, days) {
        // Handle undefined, null, or empty values
        if (value === undefined || value === null || value === '') {
            value = '0'; // General default
        }
        // Store in localStorage (days ignored as localStorage doesn't expire)
        localStorage.setItem(name, encodeURIComponent(value));
    }

    function getLocal(name) {
        const value = localStorage.getItem(name);
        console.log(`getLocal called for ${name}, stored value: ${value}`);
        if (value !== null) {
            const decodedValue = decodeURIComponent(value);
            console.log(`Decoded value for ${name}: ${decodedValue}`);
            if (decodedValue === '' || decodedValue === '0') {
                return '';
            }
            return decodedValue;
        } else {
            console.log(`No value found for ${name}`);
            return '';
        }
    }

    window.openCustomModal = openCustomModal;
    window.handleGenerateAdventureIq = handleGenerateAdventureIq;
})();