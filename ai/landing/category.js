document.addEventListener('DOMContentLoaded', async function() {
    // Function to check if sidebar should be shown
    function canShowSidebar() {
        const termsCheckbox = document.getElementById('termscheckbox');
        const gridContainer = document.querySelector('.containerround:not(#intro .containerround)');
        const result = termsCheckbox?.checked && gridContainer && !gridContainer.classList.contains('hidden');
        console.log('canShowSidebar:', {
            termsChecked: termsCheckbox?.checked,
            gridContainerExists: !!gridContainer,
            gridHidden: gridContainer?.classList.contains('hidden'),
            result
        });
        return result;
    }

    // Function to initialize the sidebar
    function initializeSidebar() {
        if (document.getElementById('category-sidebar')) {
            console.log('Sidebar already exists, skipping initialization');
            return;
        }

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
    background-color: rgb(255, 255, 255);
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

#category-sidebar .tab {
    width: 100%;
    padding: 8px;
    font-size: 12px;
    color: #000000;
    text-decoration: none;
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    box-shadow: 3px 3px 5px rgba(80, 80, 80, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: all 0.3s ease;
    font-family: "Geist", sans-serif;
    margin: 5px 0;
    display: none;
}

#category-sidebar.expanded .tab {
    display: block;
}

#category-sidebar .tab:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(80, 80, 80, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #f8f8f8, #e8e8e8);
    color: #000000;
}

#category-sidebar .tab.active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(80, 80, 80, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
    color: #000000;
    border-color: #d0d0d0;
}

#category-sidebar .tooltip {
    position: relative;
}

#category-sidebar .tooltip1-content {
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

#category-sidebar .tooltip:hover .tooltip1-content {
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
    #category-sidebar a.category-link {
        font-size: 11px;
        padding: 6px;
    }
    #category-sidebar .tab {
        font-size: 11px;
        padding: 6px;
        margin: 3px 0;
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
                'ResearchIQ',
                'EmotionIQ'
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
                'FitnessIQ',
                'IncomeIQ',
                'Newnewbiziq',
                'SpeculationIQ'
            ],
            'creative': [
                'AdAgencyIQ',
                'QuizIQ'
            ],
            'decision': [
                'DecisionIQ'
            ],
            'workflow': [
                'App',
                'WorkflowIQ'
            ],
            'educational': [
                'General'
            ]
        };

        // Function to filter grid items by category
        function filterGridItems(category) {
            const gridItems = document.querySelectorAll('.grid-item');
            gridItems.forEach(item => {
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
        const sidebar = document.createElement('div');
        sidebar.id = 'category-sidebar';
        sidebar.classList.add('initial');
        sidebar.dataset.state = 'initial';
        sidebar.innerHTML = `
            <span id="close-sidebar">+</span>
            <a class="category-link">ALL</a>
            <a href="#" class="tab" data-location="all">ALL</a>
            <a href="./dataanalysis.html" class="tab" data-location="dataanalysis">DATA</a>
            <a href="./reportgeneration.html" class="tooltip tab" data-location="reportgeneration">REPORT<span class="tooltip1-content"></span></a>
            <a href="./planningandforecasting.html" class="tab" data-location="planningandforecasting">PLANNING</a>
            <a href="./creativeoutput.html" class="tab" data-location="creative">CREATIVE</a>
            <a href="./decisionsupport.html" class="tab" data-location="decision">DECISION</a>
            <a href="./workflowautomation.html" class="tab" data-location="workflow">WORKFLOW</a>
            <a href="./educationaltraining.html" class="tab" data-location="educational">EDUCATIONAL</a>
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
            const tabs = document.querySelectorAll('#category-sidebar .tab');
            if (sidebarElement.dataset.state === 'initial') {
                sidebarElement.classList.remove('initial');
                sidebarElement.classList.add('expanded');
                sidebarElement.dataset.state = 'expanded';
                closeButton.textContent = '-';
                const tabHeight = Array.from(tabs).reduce((sum, tab) => sum + tab.offsetHeight + 5, 0);
                const viewportHeight = window.innerHeight;
                const topOffset = Math.min(viewportHeight - tabHeight - 20, 10);
                sidebarElement.style.top = `${topOffset}px`;
                console.log('Sidebar expanded downwards');
            } else {
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
                e.preventDefault();
                e.stopPropagation();
                const category = tab.getAttribute('data-location');
                const categoryText = tab.textContent.toUpperCase();
                console.log(`Tab clicked: ${category}`);

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (categoryLink) {
                    categoryLink.textContent = categoryText;
                }

                filterGridItems(category);

                if (sidebarElement.dataset.state === 'expanded') {
                    toggleSidebar();
                    console.log('Sidebar closed after category selection');
                }
            });
        });

        // Initialize with all items shown
        showAllItems();
    }

    // Skip initial check on load to avoid premature initialization
    // console.log('Skipping initial canShowSidebar check on load');

    // Listen for personal-btn click to initialize sidebar
    const personalBtn = document.getElementById('personal-btn');
    if (personalBtn) {
        personalBtn.addEventListener('click', () => {
            // Delay slightly to ensure DOM updates from second script
            setTimeout(() => {
                if (canShowSidebar()) {
                    initializeSidebar();
                    console.log('Sidebar initialized after personal-btn click');
                } else {
                    console.error('Cannot show sidebar after personal-btn click');
                }
            }, 100); // 100ms delay to allow DOM updates
        });
    } else {
        console.error('personal-btn not found');
    }

    // Monitor terms checkbox changes
    const termsCheckbox = document.getElementById('termscheckbox');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            const sidebar = document.getElementById('category-sidebar');
            if (!termsCheckbox.checked && sidebar) {
                sidebar.remove();
                console.log('Sidebar removed due to terms unchecked');
            }
        });
    } else {
        console.error('termscheckbox not found');
    }
});