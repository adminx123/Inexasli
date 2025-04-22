// Categorization of grid items by tab
const itemCategories = {
    'dataanalysis': [
        'BookIQ',
        'CalorieIQ',
        'ReceiptsIQ',
        'ResearchIQ'
    ],
    'reportgeneration': [
        'EnneagramIQ',
        'SocialIQ',
        'ReportIQ',
        'SymptomIQ'
    ],
    'planningandforecasting': [
        'AdventureIQ',
        'EventIQ',
        'IncomeIQ',
        'NewBusinessIQ',
        'SpeculationIQ'
    ],
    'creative': [
        'AdAgencyIQ',
        'QuizIQ'
    ],
    'decision': [
        'DecisionIQ',
        'EmotionIQ'
    ],
    'workflow': [
        'App',
        'WorkflowIQ'
    ],
    'educational': [
        'General'
    ],
    'personalized': [
        'FitnessIQ'
    ]
};

function filterGridItems(category) {
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach(item => {
        // Split by <hr> or Premium to isolate the item name
        let itemText = item.textContent.split(/<hr>|Premium/)[0].trim().replace(/™/g, '');
        console.log(`Checking item: ${itemText}, Category: ${category}, Included: ${itemCategories[category]?.includes(itemText)}`);
        if (category === 'all' || itemCategories[category]?.includes(itemText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add event listeners to tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        console.log('Tab event listener triggered:', tab.getAttribute('data-location'));
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        const category = tab.getAttribute('data-location');
        console.log(`Tab clicked: ${category}`);
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        filterGridItems(category);
    });
});

// Function to show all items
function showAllItems() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.style.display = 'block';
    });
}

// Initialize with all items shown
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, showing all items');
    console.log(`Found ${document.querySelectorAll('.tab').length} tabs`);
    showAllItems();
});