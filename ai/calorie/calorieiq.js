/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

(function () {
    // Wait for DOM to be ready and handle dynamic content
    document.addEventListener('DOMContentLoaded', function () {
        initializeForm();
    });

    // Use event delegation to handle dynamic elements
    document.addEventListener('click', function (e) {
        const target = e.target;

        // Handle grid item clicks
        if (target.classList.contains('grid-item')) {
            const container = target.closest('.grid-container');
            if (container.id === 'calorie-activity' || container.id === 'calorie-diet-type') {
                container.querySelectorAll('.grid-item').forEach(item => item.classList.remove('selected'));
                target.classList.add('selected');
            } else {
                target.classList.toggle('selected');
            }
            saveGridItem(target);
        }

        // Handle generate button
        // if (target.classList.contains('generate-btn')) {
        //     saveFormData();
        //     const promptType = target.getAttribute('data-prompt');
        //     generatePrompt(promptType);
        // }

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

    // Initialize form (repopulate from localStorage)
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


    async function handleGetCalorieIq(e) {
        const btn = e.target
        const initialText = btn.innerText;
        btn.innerText = 'Loading...';
        btn.setAttribute('disabled', 'true');

        console.log('Debug: handleGetCalorieIq function called');
        const formData = getFormData();
        if (!formData) {
            console.error('Form data is invalid or incomplete.');
            btn.innerText = initialText;
            btn.removeAttribute('disabled');
            return;
        }

        console.log('Processed form data:', formData);

        const apiUrl = 'https://ocejuhqqla5zdps4uaiogwswki0vaclp.lambda-url.us-east-1.on.aws/';

        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }


            
            const data = await response.json();
            if (data.message !== 'Success') {
                throw new Error(`An error occurred: ${data.message || data.error || ''}`);

            } else{
            console.log('API response:', data);
            btn.innerText = "success";
            
            // localStorage.setItem('calorieIqResponse', JSON.stringify(data));

            
            toggleDataOutcontainer()
            toggleDatainContainer()

            function waitForElement(selector) {
                let tries = 0;
                return new Promise((resolve, reject) => {
                  const attempt = () => {
                    const el = document.querySelector(selector);
                    if (el) {
                    //   console.log(`Element found: ${selector}`);
                      resolve(el);
                    } else {
                      tries++;
                      if (tries > 50) {
                        reject(new Error(`Element not found after waiting: ${selector}`));
                        return;
                      }
                      setTimeout(attempt, 100);
                    }
                  };
                  attempt();
                });
              }
              
              async function findAllElements() {
                const selectors = {
                  caloriesTarget: '#calories-target',
                  caloriesIntake: '#calories-intake',
                  caloriesPercent: '#calories-percent',
                  proteinTarget: '#protein-target',
                  proteinIntake: '#protein-intake',
                  proteinPercent: '#protein-percent',
                  carbsTarget: '#carbs-target',
                  carbsIntake: '#carbs-intake',
                  carbsPercent: '#carbs-percent',
                  fatTarget: '#fat-target',
                  fatIntake: '#fat-intake',
                  fatPercent: '#fat-percent',
                  fiberTarget: '#fiber-target',
                  fiberIntake: '#fiber-intake',
                  fiberPercent: '#fiber-percent',
                  vitaminDTarget: '#vitaminD-target',
                  vitaminDIntake: '#vitaminD-intake',
                  vitaminDPercent: '#vitaminD-percent',
                  ironTarget: '#iron-target',
                  ironIntake: '#iron-intake',
                  ironPercent: '#iron-percent',
                  calciumTarget: '#calcium-target',
                  calciumIntake: '#calcium-intake',
                  calciumPercent: '#calcium-percent',
                  mealRecommendation: '#meal-recommendation',
                  bmi: '#BMI'
                };
              
                const entries = await Promise.all(
                  Object.entries(selectors).map(async ([key, selector]) => {
                    const element = await waitForElement(selector);
                    return [key, element];
                  })
                );
              
                const elements = Object.fromEntries(entries);
                return elements;
              }



              const spans = await findAllElements();
            //   console.log('All elements ready:', spans);
            // console.log("calorieiqresponse", data);
            
            // Populate the spans with data
            spans.caloriesTarget.innerText = data.data.nutritionTable[0].targetAmount.trim();
            spans.caloriesIntake.innerText = data.data.nutritionTable[0].intake.trim();
            spans.caloriesPercent.innerText = data.data.nutritionTable[0].percentReached.trim();
            spans.proteinTarget.innerText = data.data.nutritionTable[1].targetAmount.trim();
            spans.proteinIntake.innerText = data.data.nutritionTable[1].intake.trim();
            spans.proteinPercent.innerText = data.data.nutritionTable[1].percentReached.trim();
            spans.carbsTarget.innerText = data.data.nutritionTable[2].targetAmount.trim();
            spans.carbsIntake.innerText = data.data.nutritionTable[2].intake.trim();
            spans.carbsPercent.innerText = data.data.nutritionTable[2].percentReached.trim();
            spans.fatTarget.innerText = data.data.nutritionTable[3].targetAmount.trim();
            spans.fatIntake.innerText = data.data.nutritionTable[3].intake.trim();
            spans.fatPercent.innerText = data.data.nutritionTable[3].percentReached.trim();
            spans.fiberTarget.innerText = data.data.nutritionTable[4].targetAmount.trim();
            spans.fiberIntake.innerText = data.data.nutritionTable[4].intake.trim();
            spans.fiberPercent.innerText = data.data.nutritionTable[4].percentReached.trim();
            spans.vitaminDTarget.innerText = data.data.nutritionTable[5].targetAmount.trim();
            spans.vitaminDIntake.innerText = data.data.nutritionTable[5].intake.trim();
            spans.vitaminDPercent.innerText = data.data.nutritionTable[5].percentReached.trim();
            spans.ironTarget.innerText = data.data.nutritionTable[6].targetAmount.trim();
            spans.ironIntake.innerText = data.data.nutritionTable[6].intake.trim();
            spans.ironPercent.innerText = data.data.nutritionTable[6].percentReached.trim();
            spans.calciumTarget.innerText = data.data.nutritionTable[7].targetAmount.trim();
            spans.calciumIntake.innerText = data.data.nutritionTable[7].intake.trim();
            spans.calciumPercent.innerText = data.data.nutritionTable[7].percentReached.trim();
            spans.mealRecommendation.innerText = data?.data?.mealRecommendations?.trim() ?? '';
            spans.bmi.innerText = data.data.metrics.bmi.trim();


            setTimeout(() => {
                btn.innerText = initialText;
                btn.removeAttribute('disabled');
            }, 3000);

            }
            
        } catch (error) {
            console.error('Error fetching data from API:', error);
            alert('An error occurred while fetching data. Please try again later.');
            btn.innerText = error.message;
            btn.removeAttribute('disabled');

            setTimeout(() => {
                btn.innerText = initialText;
                btn.removeAttribute('disabled');
            }, 4000);

            
        }
    }

    function getFormData() {
        // console.clear();
        console.log('Debug: getFormData function called');
    
        const formData = {
            goals: [],
            activityLevel: null,
            needMealRecommendation: false,
            dietRestriction: null,
            age: null,
            height: null,
            weight: {
                weight: null,
                unit: null
            },
            sex: null,
            foodLog: null
        };
    
        //goals
        const selectedGoals = document.querySelectorAll('#calorie-goal .grid-item.selected');
        if (selectedGoals.length === 0) {
            alert('Please select at least one goal.');
            return;
        }
        selectedGoals.forEach(item => {
            formData.goals.push(item.dataset.value);
        });
    
        //activity level
        const activityLevel = document.querySelector('#calorie-activity .grid-item.selected');
        if (!activityLevel) {
            alert('Please select your activity level.');
            return;
        }
        formData.activityLevel = activityLevel.dataset.value;
    
        //meal recommendation
        const mealRecommendation = document.querySelector('#calorie-recommendations .grid-item.selected');
        if (mealRecommendation) {
            formData.needMealRecommendation = true;
        }
    
        // diet restriction
        const dietRestriction = document.querySelector('#calorie-diet-type .grid-item.selected');
        if (!dietRestriction) {
            alert('Please select your diet restriction.');
            return;
        }
        formData.dietRestriction = dietRestriction.dataset.value;
    
        // age
        const ageInput = document.getElementById('calorie-age');
        if (!ageInput?.value || isNaN(ageInput.value) || parseInt(ageInput.value, 10) <= 0) {
            alert('Please enter a valid age.');
            return;
        }
        formData.age = parseInt(ageInput.value, 10);
    
        // height
        const heightInput = document.getElementById('calorie-height');
        if (!heightInput?.value || isNaN(heightInput.value) || parseFloat(heightInput.value) <= 0) {
            alert('Please enter a valid height.');
            return;
        }
        formData.height = parseFloat(heightInput.value);
    
        //  weight and unit
        const weightInput = document.getElementById('calorie-weight');
        const weightUnitInput = document.getElementById('calorie-weight-unit');
        if (!weightInput?.value || isNaN(weightInput.value) || parseFloat(weightInput.value) <= 0) {
            alert('Please enter a valid weight.');
            return;
        }
        if (!weightUnitInput?.value) {
            alert('Please select a weight unit.');
            return;
        }
        formData.weight.weight = parseFloat(weightInput.value);
        formData.weight.unit = weightUnitInput.value;
    
        // sex
        const sexInput = document.getElementById('calorie-measure');
        if (!sexInput?.value) {
            alert('Please select your sex.');
            return;
        }
        formData.sex = sexInput.value;
    
        // food log
        const foodLogInput = document.getElementById('calorie-food-log');
        if (foodLogInput?.value.trim()) {

            formData.foodLog = foodLogInput.value.trim();
        } else {
            formData.foodLog = '';


        }
    
        // console.log('Form data:', formData);
        return formData;
    }

    function saveFormData() {
        document.querySelectorAll('.grid-container .grid-item').forEach(saveGridItem);
        document.querySelectorAll('input, textarea, select').forEach(saveInput);
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

        document.querySelectorAll('input, textarea').forEach(input => {
            const key = `input_${input.id}`;
            const value = localStorage.getItem(key);
            if (value !== null) {
                input.value = value;
                console.log(`Restored ${key}: ${value}`);
            }
        });

        document.querySelectorAll('select').forEach(select => {
            const key = `input_${select.id}`;
            const value = localStorage.getItem(key);
            if (value !== null) {
                const optionExists = Array.from(select.options).some(opt => opt.value === value);
                if (optionExists) {
                    select.value = value;
                    console.log(`Restored ${key}: ${value}`);
                } else {
                    console.warn(`Skipped restoring ${key}: value "${value}" not found in options`);
                }
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
            try {
                localStorage.removeItem(key);
                item.classList.remove('selected');
                console.log(`Cleared ${key}`);
            } catch (error) {
                console.error(`Error clearing ${key}:`, error);
            }
        });
        document.querySelectorAll('input, textarea, select').forEach(input => {
            const key = `input_${input.id}`;
            try {
                localStorage.removeItem(key);
                input.value = '';
                console.log(`Cleared ${key}`);
            } catch (error) {
                console.error(`Error clearing ${key}:`, error);
            }
        });
        const weightUnit = document.getElementById('calorie-weight-unit');
        if (weightUnit) weightUnit.value = 'lbs';
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

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Prompt copied to clipboard successfully!');
        }).catch(err => {
            console.error('Failed to copy prompt to clipboard:', err);
        });
    }

    function generatePrompt(promptType) {
        console.log('Debug: generatePrompt function called with argument:', promptType);
        let prompt = '';
        if (promptType === 'CalorieIQ™') {
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
            if (height?.value) {
                prompt += formatList(`${height.value} ft`, 'Height');
            }
            const weight = document.getElementById('calorie-weight');
            const weightUnit = document.getElementById('calorie-weight-unit');
            if (weight?.value && weightUnit?.value) {
                prompt += formatList(`${weight.value} ${weightUnit.value}`, 'Weight');
            }
            const sex = document.getElementById('calorie-measure');
            if (sex?.value) prompt += formatList(sex.value, 'Sex');
            prompt += formatGrid('#calorie-activity .grid-item.selected', 'Activity Level');
            prompt += formatGrid('#calorie-diet-type .grid-item.selected', 'Diet Type');
            const foodLog = document.getElementById('calorie-food-log');
            if (foodLog?.value) prompt += `Day's Food Log (do not break down in summary):\n${foodLog.value}\n\n`;
        }
        if (prompt) {
            console.log('Debug: Generated prompt content:', prompt);
            copyToClipboard(prompt);
            openCustomModal(prompt);
        } else {
            console.error('No prompt generated for type:', promptType);
        }
    }

    function openCustomModal(content) {
        console.log('Debug: openCustomModal called with content:', content);
        try {
            if (typeof openGeneratedPromptModal === 'function') {
                openGeneratedPromptModal(content);
            } else {
                // Fallback: Display a simple alert or log
                console.warn('openGeneratedPromptModal not found, using fallback');
                alert('Generated prompt:\n' + content);
            }
        } catch (error) {
            console.error('Error opening modal:', error);
            alert('Generated prompt:\n' + content);
        }
    }


    function toggleDataOutcontainer() {
        const dataContainer = document.querySelector('.data-container-right');
        if (!dataContainer) {
            console.error('Data container not found.');
            return;
        }
    
        const isExpanded = dataContainer.dataset.state === 'expanded';
    
        if (isExpanded) {
            // Collapse the container
            dataContainer.classList.remove('expanded');
            dataContainer.classList.add('initial');
            dataContainer.dataset.state = 'initial';
            setLocal('dataOutContainerState', 'initial');
            dataContainer.innerHTML = `
                <span class="close-data-container">+</span>
                <span class="data-label">DATA OUT</span>
            `;
            console.log('Right data container collapsed and reset (calorieiq.js)');
        } else {
            // Expand the container
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            setLocal('dataOutContainerState', 'expanded');
    
            const lastGridItemUrl = getLocal('lastGridItemUrl');
            const outputMap = {
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
            console.log('Right data container expanded (calorieiq.js)');
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
            // Collapse the container
            dataContainer.classList.remove('expanded');
            dataContainer.classList.add('initial');
            dataContainer.dataset.state = 'initial';
            setLocal('dataContainerState', 'initial');
    
            dataContainer.innerHTML = `
                <span class="close-data-container">+</span>
                <span class="data-label">DATA IN</span>
            `;
    
            console.log('Left data container collapsed and reset (calorieiq.js)');
        } else {
            dataContainer.classList.remove('initial');
            dataContainer.classList.add('expanded');
            dataContainer.dataset.state = 'expanded';
            setLocal('dataContainerState', 'expanded');
    
            console.log('Left data container expanded (calorieiq.js)');
    
            const storedUrl = getLocal('lastGridItemUrl');
            if (storedUrl) {
                loadStoredContent(dataContainer, storedUrl);
            }
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
    window.openCustomModal = openCustomModal;
    window.generatePrompt = generatePrompt;
    window.handleGetCalorieIq = handleGetCalorieIq;
})();


function setLocal(name, value, days) {
    // Handle undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
        if (name.includes('_frequency')) {
            value = 'annually';
        } else if (name === 'RegionDropdown') {
            value = 'NONE';
        } else if (name === 'SubregionDropdown') {
            value = '';
        } else {
            value = '0'; // General default
        }
    } else {
        // Specific validation for RegionDropdown
        if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(value)) {
            value = 'NONE';
        }
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
            if (name.includes('_frequency')) return 'annually';
            return '';
        }
        
        if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(decodedValue)) {
            console.log(`Invalid RegionDropdown value '${decodedValue}', returning 'NONE'`);
            return 'NONE';
        }
        
        return decodedValue;
    } else {
        console.log(`No value found for ${name}`);
        if (name.includes('_frequency')) return 'annually';
        if (name === 'RegionDropdown') return 'NONE';
        if (name === 'SubregionDropdown') return '';
        return '';
    }
}

async function loadStoredContent(dataContainer, url) {
    try {
        console.log(`Attempting to load stored content from ${url} (calorieiq.js)`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch content from ${url}`);
        const content = await response.text();
        console.log('Stored content fetched successfully (calorieiq.js)');

        dataContainer.classList.remove('initial');
        dataContainer.classList.add('expanded');
        dataContainer.dataset.state = 'expanded';
        dataContainer.innerHTML = `
            <span class="close-data-container">-</span>
            <span class="data-label">DATA OUT</span>
            <div class="data-content">${content}</div>
        `;
        console.log(`Stored content loaded from ${url} into dataout container (calorieiq.js)`);

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
                console.log(`Loaded and executed script: ${scriptUrl} (calorieiq.js)`);
            }
        } catch (error) {
            console.log(`No script found or error loading ${scriptUrl}, skipping (calorieiq.js):`, error);
        }
    } catch (error) {
        console.error(`Error loading stored content (calorieiq.js):`, error);
        dataContainer.innerHTML = `
            <span class="close-data-container">-</span>
            <span class="data-label">DATA OUT</span>
            <div class="data-content">Error loading content</div>
        `;
    }
}