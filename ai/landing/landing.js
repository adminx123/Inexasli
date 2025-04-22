const itemCategories = {
    'dataanalysis': [
        'BookIQ™',
        
        'ReceiptsIQ™',
        
        'ResearchIQ™'
    ],
    'reportgeneration': [
        'EnneagramIQ™',
        'SocialIQ™',
        'ReportIQ™'
    ],
    'planningandforecasting': [
        'AdventureIQ™',
        'EventIQ™',
        'IncomeIQ™',
        'NewBusinessIQ™',
        'SpeculationIQ™'
    ],
    'creativeoutput': [
        'AdAgencyIQ™'
        
    ],
    'decisionsupport': [
        'DecisionIQ™',
        'EmotionIQ™'
    ],
    'workflowautomation': [
        'App',
        'WorkflowIQ™'
    ],
    'educationaltraining': [
        'General',
        'QuizIQ™'
    ],
    'personalizedexperience': [
        'FitnessIQ™',
        'CalorieIQ™',
        'SymptomIQ™'

    ]
};

// Function to filter grid items based on the selected tab
function filterGridItems(category) {
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach(item => {
        const itemText = item.textContent.split('\n')[0].trim(); // Get text (e.g., "AdventureIQ™")
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
        
        if (typeof sortAll === 'function') {
            console.log('Calling sortAll()');
            sortAll();
        } else {
            console.warn('sortAll() is not defined');
        }
    });
});

// Function to show all items (for initial view and "ALL" tab)
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