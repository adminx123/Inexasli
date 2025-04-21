// Categorization of grid items by tab (each item belongs to exactly one category)
const itemCategories = {
    'dataanalysis': [
        'BookIQ™',
        'CalorieIQ™',
        'ReceiptsIQ™',
        'ReportIQ™',
        'Research'
    ],
    'reportgeneration': [
        'EnneagramIQ™',
        'SocialIQ™',
        'SymptomIQ™'
    ],
    'planningandforecasting': [
        'AdventureIQ™',
        'EventIQ™',
        'IncomeIQ™',
        'New Business',
        'SpeculationIQ™'
    ],
    'creativeoutput': [
        'PromotionIQ™',
        'QuizIQ™'
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
        'General'
    ],
    'personalizedexperience': [
        'FitnessIQ™'
    ]
};

// Function to filter grid items based on the selected tab
function filterGridItems(category) {
    const gridItems = document.querySelectorAll('.grid-item');
    
    gridItems.forEach(item => {
        const itemText = item.textContent.split('\n')[0].trim(); // Get the text (e.g., "AdventureIQ™")
        
        // Log for debugging
        console.log(`Checking item: ${itemText}, Category: ${category}, Included: ${itemCategories[category].includes(itemText)}`);
        
        // Show item if it belongs to the selected category, hide otherwise
        if (itemCategories[category].includes(itemText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add event listeners to tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Stop event bubbling
        const category = tab.getAttribute('data-location'); // Get the category (e.g., 'dataanalysis')
        
        // Log for debugging
        console.log(`Tab clicked: ${category}`);
        
        // Update active tab styling
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter grid items
        filterGridItems(category);
        
        // Call sortAll() if defined
        if (typeof sortAll === 'function') {
            console.log('Calling sortAll()');
            sortAll();
        } else {
            console.warn('sortAll() is not defined');
        }
    });
});

// Function to show all items (for initial view)
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
    showAllItems(); // Show all items on page load
});