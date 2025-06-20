/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * makeChanges.js - Centralized modal system for detecting outdated calculations
 */

class MakeChangesModal {
    constructor() {
        this.moduleName = null;
        this.modal = null;
        this.checkInterval = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // Determine current module from lastGridItemUrl
        this.moduleName = this.determineCurrentModule();
        if (!this.moduleName) {
            console.log('[MakeChanges] Could not determine current module, skipping initialization');
            return;
        }

        console.log(`[MakeChanges] Initializing for module: ${this.moduleName}`);
        
        this.createModal();
        this.setupEventListeners();
        this.startMonitoring();
        this.isInitialized = true;
    }

    determineCurrentModule() {
        const lastGridItemUrl = localStorage.getItem('lastGridItemUrl');
        if (!lastGridItemUrl) return null;

        // Extract module name from URL like "/ai/income/incomeiq.html" -> "income"
        const match = lastGridItemUrl.match(/\/ai\/([^\/]+)\//);
        return match ? match[1] : null;
    }

    createModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('makeChangesModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add CSS styles
        this.addStyles();

        // Create modal HTML
        const modalHTML = `
            <div id="makeChangesModal" class="make-changes-overlay">
                <div class="make-changes-modal">
                    <div class="make-changes-header">
                        <i class="fas fa-exclamation-triangle make-changes-icon"></i>
                        <h2 class="make-changes-title">${this.getModalTitle()}</h2>
                        <p class="make-changes-subtitle">${this.getModalSubtitle()}</p>
                    </div>
                    <div class="make-changes-body">
                        <p class="make-changes-message">
                            ${this.getModalMessage()}
                        </p>
                        <div class="make-changes-buttons">
                            <button id="regenerateBtn" class="make-changes-btn make-changes-btn-primary">
                                <i class="fas fa-sync-alt"></i> Regenerate Report
                            </button>
                            <button id="makeMoreChangesBtn" class="make-changes-btn make-changes-btn-secondary">
                                <i class="fas fa-edit"></i> Make More Changes
                            </button>
                            <button id="viewAnywayBtn" class="make-changes-btn make-changes-btn-tertiary">
                                <i class="fas fa-eye"></i> View Current Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into page
        document.body.insertAdjacentHTML('afterbegin', modalHTML);
        this.modal = document.getElementById('makeChangesModal');
    }

    addStyles() {
        // Check if styles already exist
        if (document.getElementById('makeChangesModalStyles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'makeChangesModalStyles';
        styleElement.textContent = `
            .make-changes-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .make-changes-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            
            .make-changes-modal {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 520px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .make-changes-overlay.show .make-changes-modal {
                transform: scale(1) translateY(0);
            }
            
            .make-changes-header {
                background: linear-gradient(135deg, #fef3c7, #fcd34d);
                padding: 24px;
                border-radius: 16px 16px 0 0;
                text-align: center;
                border-bottom: 2px solid #f59e0b;
            }
            
            .make-changes-icon {
                font-size: 3em;
                color: #f59e0b;
                margin-bottom: 12px;
            }
            
            .make-changes-title {
                margin: 0 0 8px 0;
                color: #92400e;
                font-size: 1.4em;
                font-weight: 600;
            }
            
            .make-changes-subtitle {
                margin: 0;
                color: #92400e;
                font-size: 1em;
                opacity: 0.9;
            }
            
            .make-changes-body {
                padding: 24px;
            }
            
            .make-changes-message {
                color: #374151;
                font-size: 1.1em;
                line-height: 1.6;
                margin-bottom: 24px;
                text-align: center;
            }
            
            .make-changes-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .make-changes-btn {
                padding: 14px 20px;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                text-align: center;
                display: block;
            }
            
            .make-changes-btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .make-changes-btn-primary:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }
            
            .make-changes-btn-secondary {
                background: #6b7280;
                color: white;
            }
            
            .make-changes-btn-secondary:hover {
                background: #4b5563;
                transform: translateY(-1px);
            }
            
            .make-changes-btn-tertiary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .make-changes-btn-tertiary:hover {
                background: #e5e7eb;
                transform: translateY(-1px);
            }
            
            @media (min-width: 640px) {
                .make-changes-buttons {
                    flex-direction: row;
                    justify-content: center;
                }
                
                .make-changes-btn {
                    flex: 1;
                    max-width: 150px;
                }
            }
        `;

        document.head.appendChild(styleElement);
    }

    getModalTitle() {
        switch (this.moduleName) {
            case 'income':
                return 'Tax Calculations May Be Outdated';
            case 'calorie':
                return 'Calorie Calculations May Be Outdated';
            case 'decision':
                return 'Decision Analysis May Be Outdated';
            default:
                return 'Analysis May Be Outdated';
        }
    }

    getModalSubtitle() {
        switch (this.moduleName) {
            case 'income':
                return 'Changes detected that affect your financial analysis';
            case 'calorie':
                return 'Changes detected that affect your nutrition analysis';
            case 'decision':
                return 'Changes detected that affect your decision analysis';
            default:
                return 'Changes detected that affect your analysis';
        }
    }

    getModalMessage() {
        switch (this.moduleName) {
            case 'income':
                return `You've made changes to your income or tax residency information that may have 
                       <strong>material implications</strong> on your tax and contribution calculations. 
                       The current report may no longer be accurate.`;
            case 'calorie':
                return `You've made changes to your dietary information that may affect your calorie calculations. 
                       The current report may no longer be accurate.`;
            case 'decision':
                return `You've made changes to your decision criteria that may affect your analysis. 
                       The current report may no longer be accurate.`;
            default:
                return `You've made changes that may affect your analysis. 
                       The current report may no longer be accurate.`;
        }
    }

    getInputPageUrl() {
        switch (this.moduleName) {
            case 'income':
                return './incomeiq.html';
            case 'calorie':
                return './calorieiq.html';
            case 'decision':
                return './decisioniq.html';
            case 'enneagram':
                return './enneagramiq.html';
            case 'event':
                return './eventiq.html';
            case 'fashion':
                return './fashioniq.html';
            case 'philosophy':
                return './philosophyiq.html';
            case 'quiz':
                return './quiziq.html';
            case 'research':
                return './researchiq.html';
            case 'social':
                return './socialiq.html';
            default:
                return './input.html';
        }
    }

    setupEventListeners() {
        // Set up button click handlers
        this.modal.addEventListener('click', (e) => {
            if (e.target.id === 'regenerateBtn') {
                this.handleRegenerate();
            } else if (e.target.id === 'makeMoreChangesBtn') {
                this.handleMakeChanges();
            } else if (e.target.id === 'viewAnywayBtn') {
                this.handleViewAnyway();
            } else if (e.target === this.modal) {
                // Click on overlay to close
                this.hideModal();
            }
        });
    }

    handleRegenerate() {
        // Navigate back to input page to regenerate
        window.location.href = this.getInputPageUrl();
    }

    handleMakeChanges() {
        // Navigate back to input page to make more changes
        window.location.href = this.getInputPageUrl();
    }

    handleViewAnyway() {
        // Hide modal and continue viewing current report
        this.hideModal();
    }

    showModal(minutesAgo = 0) {
        if (!this.modal) return;

        // Update message with timing if provided
        if (minutesAgo > 0) {
            const messageEl = this.modal.querySelector('.make-changes-message');
            if (messageEl) {
                let updatedMessage = this.getModalMessage();
                if (this.moduleName === 'income') {
                    updatedMessage = `You've made changes to your income or tax residency information 
                                    <strong>${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago</strong> that may have 
                                    <strong>material implications</strong> on your tax and contribution calculations. 
                                    The current report may no longer be accurate.`;
                }
                messageEl.innerHTML = updatedMessage;
            }
        }

        // Show modal
        this.modal.classList.add('show');
        console.log(`[MakeChanges] Modal shown for ${this.moduleName}`);
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            console.log(`[MakeChanges] Modal hidden for ${this.moduleName}`);
        }
    }

    startMonitoring() {
        // Check every 2 seconds for changes
        this.checkInterval = setInterval(() => {
            this.checkForChanges();
        }, 2000);

        // Initial check after a short delay
        setTimeout(() => this.checkForChanges(), 500);
    }

    checkForChanges() {
        if (!this.moduleName) return;

        // Check if response exists
        const responseKey = `${this.moduleName}IqResponse`;
        const response = this.getJSON(responseKey);
        
        if (!response || !response.generatedAt) {
            console.log(`[MakeChanges] No response found for ${this.moduleName}, skipping check`);
            return;
        }

        const responseTime = new Date(response.generatedAt);
        console.log(`[MakeChanges] Response generated at: ${responseTime}`);

        // Check input timestamp
        const inputKey = `${this.moduleName}input`;
        const inputData = this.getJSON(inputKey);
        
        if (!inputData || !inputData.timestamp) {
            console.log(`[MakeChanges] No input timestamp found for ${inputKey}, skipping check`);
            return;
        }

        const inputTime = new Date(inputData.timestamp);
        console.log(`[MakeChanges] Input last modified at: ${inputTime}`);

        // If input is newer than response, show modal
        if (inputTime > responseTime) {
            const minutesAgo = Math.floor((Date.now() - inputTime.getTime()) / (1000 * 60));
            console.log(`[MakeChanges] Input is newer than response! Showing modal (${minutesAgo} minutes ago)`);
            this.showModal(minutesAgo);
            clearInterval(this.checkInterval); // Stop checking once shown
        } else {
            console.log(`[MakeChanges] Input is older than response, no modal needed`);
        }
    }

    // Utility function to get JSON from localStorage
    getJSON(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`[MakeChanges] Error parsing JSON for key ${key}:`, error);
            return null;
        }
    }

    // Static method to create and initialize modal
    static create() {
        const modal = new MakeChangesModal();
        modal.init();
        return modal;
    }
}

// Export for ES modules
export { MakeChangesModal };

// Global function for compatibility
window.createMakeChangesModal = () => MakeChangesModal.create();
