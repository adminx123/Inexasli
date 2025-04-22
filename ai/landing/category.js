// categoryform.js
document.addEventListener('DOMContentLoaded', async function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `/* Category Sidebar */
#category-sidebar {
    position: fixed;
    top: 10px;
    left: 0;
    background-color: #f5f5f5;
    padding: 8px;
    border: 2px solid #000;
    border-left: none;
    border-radius: 0 8px 8px 0;
    box-shadow: 4px 4px 0 #000;
    z-index: 1000;
    width: 200px;
    transition: top 0.3s ease-in-out, height 0.3s ease-in-out;
    overflow: hidden;
    font-family: "Inter", sans-serif;
}

#category-sidebar.initial {
    height: auto;
}

#category-sidebar.expanded {
    height: auto;
    top: calc(100% + 10px);
}

#category-sidebar:hover {
    background-color: #D4AF37;
}

#category-sidebar #close-sidebar {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 18px;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    display: block;
    font-family: "Inter", sans-serif;
}

#category-sidebar a.category-link {
    text-decoration: none;
    color: #000;
    font-size: 12px;
    display: block;
    text-align: center;
    padding: 8px 8px;
    cursor: pointer;
    transition: color 0.2s ease;
    line-height: 1.2;
    max-height: auto;
    overflow: hidden;
    font-family: "Geist", sans-serif;
}

.tab-container {
    margin: 20px auto 0;
    max-width: 260px;
    display: none;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 5px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 10px;
    box-shadow: 4px 4px 0 #000000;
    font-family: "Inter", sans-serif;
}

#category-sidebar.expanded .tab-container {
    display: flex;
}

.tab-container .tab {
    width: 100%;
    padding: 8px;
    font-size: 12px;
    color: #000000;
    text-decoration: none;
    background: #f9f9f9;
    border: 2px solid #7b7b7b;
    border-radius: 6px;
    text-align: center;
    transition: background-color 0.2s ease, color 0.2s ease;
    font-family: "Geist", sans-serif;
}

.tab-container .tab:hover {
    background-color: #D4AF37;
    color: #ffffff;
}

.tab-container .tab.active {
    background-color: #D4AF37;
    color: #ffffff;
    border-color: #000000;
}

.tab-container .tooltip {
    position: relative;
}

.tab-container .tooltip1-content {
    visibility: hidden;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #000;
    color: #fff;
    padding: 5px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 1001;
}

.tab-container .tooltip:hover .tooltip1-content {
    visibility: visible;
}

/* Responsive Design */
@media (max-width: 480px) {
    #category-sidebar {
        width: 150px;
    }
    #category-sidebar.initial {
        height: auto;
    }
    #category-sidebar.expanded {
        height: auto;
    }
    .tab-container {
        max-width: 140px;
    }
    #category-sidebar a.category-link {
        font-size: 11px;
        padding: 6px;
    }
    .tab-container .tab {
        font-size: 11px;
        padding: 6px;
    }
}
    `;
    document.head.appendChild(style);

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

    // Function to filter grid items by category
    function filterGridItems(category) {
        const gridItems = document.querySelectorAll('.grid-item');
        
        gridItems.forEach(item => {
            // Extract item name from text content, removing <hr>, Premium, and ™
            let itemText = item.textContent.split(/<hr>|Premium/)[0].trim().replace(/™/g, '');
            console.log(`Checking item: ${itemText}, Category: ${category}, Included: ${itemCategories[category]?.includes(itemText)}`);
            if (category === 'all' || itemCategories[category]?.includes(itemText)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Function to show all grid items
    function showAllItems() {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.style.display = 'block';
        });
    }

    // Create sidebar HTML
    if (!document.getElementById('category-sidebar')) {
        const sidebar = document.createElement('div');
        sidebar.id = 'category-sidebar';
        sidebar.classList.add('initial');
        sidebar.dataset.state = 'initial';
        sidebar.innerHTML = `
            <span id="close-sidebar">+</span>
            <a class="category-link">EXPLORE CATEGORIES</a>
            <div class="tab-container" id="category-tabs">
                <a href="#" class="tab" data-location="all">ALL</a>
                <a href="./dataanalysis.html" class="tab" data-location="dataanalysis">DATA</a>
                <a href="./reportgeneration.html" class="tooltip tab" data-location="reportgeneration" data-tooltip="Generate detailed reports based on your data, including visualizations and insights.">REPORT<span class="tooltip1-content"></span></a>
                <a href="./planningandforecasting.html" class="tab" data-location="planningandforecasting">PLANNING</a>
                <a href="./creativeoutput.html" class="tab" data-location="creative">CREATIVE</a>
                <a href="./decisionsupport.html" class="tab" data-location="decision">DECISION</a>
                <a href="./workflowautomation.html" class="tab" data-location="workflow">WORKFLOW</a>
                <a href="./educationaltraining.html" class="tab" data-location="educational">EDUCATIONAL</a>
                <a href="./personalizedexperience.html" class="tab" data-location="personalized">PERSONALIZED</a>
            </div>
        `;
        document.body.appendChild(sidebar);

        console.log('Category sidebar injected');

        // Set up sidebar functionality
        const closeButton = document.getElementById('close-sidebar');
        const categoryLink = document.querySelector('#category-sidebar a.category-link');
        const sidebarElement = document.getElementById('category-sidebar');

        console.log('Sidebar:', sidebarElement);
        console.log('Category Link:', categoryLink);
        console.log('Close Button:', closeButton);
        console.log('Initial State:', sidebarElement.dataset.state);

        // Function to toggle the sidebar state
        const toggleSidebar = () => {
            const tabContainer = document.querySelector('.tab-container');
            if (sidebarElement.dataset.state === 'initial') {
                // Expand the sidebar downwards
                sidebarElement.classList.remove('initial');
                sidebarElement.classList.add('expanded');
                sidebarElement.dataset.state = 'expanded';
                closeButton.textContent = '-';

                const formHeight = tabContainer.scrollHeight;
                const viewportHeight = window.innerHeight;
                const topOffset = Math.min(viewportHeight - formHeight - 20, 10);
                sidebarElement.style.top = `${topOffset}px`;

                console.log('Sidebar expanded downwards');
            } else {
                // Collapse the sidebar
                sidebarElement.classList.remove('expanded');
                sidebarElement.classList.add('initial');
                sidebarElement.dataset.state = 'initial';
                closeButton.textContent = '+';
                sidebarElement.style.top = '10px';

                console.log('Sidebar returned to initial state');
            }
        };

        // Click handlers for category link and close button
        if (categoryLink) {
            categoryLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Category link clicked. Current state:', sidebarElement.dataset.state);
                toggleSidebar();
            });
        } else {
            console.error('Category link not found');
        }

        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Close button clicked. Current state:', sidebarElement.dataset.state);
                toggleSidebar();
            });
        } else {
            console.error('Close button not found');
        }

        // Collapse sidebar when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideSidebar = sidebarElement.contains(e.target);
            if (!isClickInsideSidebar && sidebarElement.dataset.state === 'expanded') {
                console.log('Clicked outside sidebar, collapsing it');
                toggleSidebar();
            }
        });

        // Add tooltip content dynamically
        const tooltipTabs = document.querySelectorAll('.tooltip.tab');
        tooltipTabs.forEach(tab => {
            const tooltipContent = tab.dataset.tooltip;
            const tooltipElement = tab.querySelector('.tooltip1-content');
            if (tooltipElement && tooltipContent) {
                tooltipElement.textContent = tooltipContent;
            }
        });

        // Add event listeners to tabs for filtering
        const tabs = document.querySelectorAll('.tab');
        console.log(`Found ${tabs.length} tabs`);
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                console.log('Tab event listener triggered:', tab.getAttribute('data-location'));
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Stop event bubbling
                const category = tab.getAttribute('data-location');
                console.log(`Tab clicked: ${category}`);

                // Update active tab styling
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Filter grid items
                filterGridItems(category);
            });
        });

        // Initialize with all items shown
        showAllItems();
    }
});