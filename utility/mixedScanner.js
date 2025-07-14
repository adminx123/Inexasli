/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// Mixed Scanner Utility - Supports Barcodes and QR Codes
// For physical products, digital services, businesses, and apps

export class MixedScanner {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            maxItems: options.maxItems || 3,
            scanTypes: options.scanTypes || 'both', // 'barcode', 'qr', 'both'
            autoStart: options.autoStart || false,
            simulationDelay: options.simulationDelay || 3000,
            ...options
        };
        
        this.scannedItems = [];
        this.cameraStream = null;
        this.isScanning = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            throw new Error(`Scanner container with ID '${this.containerId}' not found`);
        }
        
        this.createScannerUI();
        this.attachEventListeners();
        
        // Expose scanner instance globally for easy access
        window[`scanner_${this.containerId}`] = this;
    }
    
    createScannerUI() {
        this.container.innerHTML = `
            <div class="mixed-scanner">
                <div class="scanner-controls">
                    <button type="button" class="scan-toggle-btn" id="${this.containerId}-toggle">
                        <i class="fas fa-qrcode"></i> Start Scanning
                    </button>
                    <div class="scan-type-indicator">
                        <span class="scan-type-text">Scans barcodes & QR codes</span>
                    </div>
                </div>
                
                <div class="camera-section" style="display: none;">
                    <video class="camera-preview" autoplay playsinline></video>
                    <div class="camera-overlay">
                        <div class="scan-frame"></div>
                        <div class="scan-instruction">Position code within frame</div>
                    </div>
                    <button type="button" class="stop-scan-btn">
                        <i class="fas fa-stop"></i> Stop Scanning
                    </button>
                </div>
                
                <div class="scanned-items-container">
                    <div class="scanned-items-list"></div>
                    <div class="scan-limit-indicator">
                        <span class="items-count">0</span> of ${this.options.maxItems} items scanned
                    </div>
                </div>
            </div>
        `;
        
        this.addScannerStyles();
    }
    
    addScannerStyles() {
        if (document.getElementById('mixed-scanner-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mixed-scanner-styles';
        style.textContent = `
            .mixed-scanner {
                width: 100%;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .scanner-controls {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .scan-toggle-btn {
                padding: 12px 24px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s ease;
                width: 100%;
                max-width: 200px;
            }
            
            .scan-toggle-btn:hover {
                background: #0056b3;
            }
            
            .scan-toggle-btn.scanning {
                background: #28a745;
            }
            
            .scan-type-indicator {
                margin-top: 8px;
                font-size: 12px;
                color: #666;
            }
            
            .camera-section {
                position: relative;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .camera-preview {
                width: 100%;
                max-width: 350px;
                border-radius: 8px;
                background: #000;
            }
            
            .camera-overlay {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                max-width: 350px;
                height: 100%;
                pointer-events: none;
            }
            
            .scan-frame {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border: 2px solid #00ff00;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            }
            
            .scan-instruction {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
            }
            
            .stop-scan-btn {
                margin-top: 10px;
                padding: 8px 16px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .stop-scan-btn:hover {
                background: #c82333;
            }
            
            .scanned-items-container {
                margin-top: 20px;
            }
            
            .scanned-items-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 10px;
            }
            
            .scanned-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 10px 12px;
                transition: all 0.2s ease;
            }
            
            .scanned-item:hover {
                background: #e9ecef;
            }
            
            .item-info {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
            }
            
            .item-type-icon {
                font-size: 16px;
                width: 20px;
                text-align: center;
            }
            
            .item-type-icon.barcode {
                color: #007bff;
            }
            
            .item-type-icon.qr {
                color: #28a745;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-value {
                font-family: monospace;
                font-size: 14px;
                color: #333;
                margin-bottom: 2px;
            }
            
            .item-category {
                font-size: 12px;
                color: #666;
                text-transform: capitalize;
            }
            
            .remove-item-btn {
                background: none;
                border: none;
                color: #dc3545;
                font-size: 16px;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s ease;
            }
            
            .remove-item-btn:hover {
                background: rgba(220, 53, 69, 0.1);
            }
            
            .scan-limit-indicator {
                text-align: center;
                font-size: 12px;
                color: #666;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            
            .scan-limit-indicator.max-reached {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    attachEventListeners() {
        const toggleBtn = this.container.querySelector('.scan-toggle-btn');
        const stopBtn = this.container.querySelector('.stop-scan-btn');
        
        toggleBtn.addEventListener('click', () => this.toggleScanning());
        stopBtn.addEventListener('click', () => this.stopScanning());
    }
    
    async toggleScanning() {
        if (this.isScanning) {
            this.stopScanning();
        } else {
            await this.startScanning();
        }
    }
    
    async startScanning() {
        if (this.scannedItems.length >= this.options.maxItems) {
            alert(`Maximum of ${this.options.maxItems} items can be scanned. Remove an item to scan more.`);
            return;
        }
        
        try {
            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            const video = this.container.querySelector('.camera-preview');
            const cameraSection = this.container.querySelector('.camera-section');
            const toggleBtn = this.container.querySelector('.scan-toggle-btn');
            
            video.srcObject = this.cameraStream;
            cameraSection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-camera"></i> Scanning...';
            toggleBtn.classList.add('scanning');
            
            this.isScanning = true;
            
            // Emit scanning started event
            this.emitEvent('scanning-started');
            
            // Simulate barcode/QR detection (in real implementation, integrate scanning library)
            setTimeout(() => {
                if (this.isScanning) {
                    this.simulateCodeDetection();
                }
            }, this.options.simulationDelay);
            
        } catch (error) {
            console.error('Camera access error:', error);
            alert('Unable to access camera. Please ensure camera permissions are granted.');
        }
    }
    
    stopScanning() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const cameraSection = this.container.querySelector('.camera-section');
        const toggleBtn = this.container.querySelector('.scan-toggle-btn');
        
        cameraSection.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-qrcode"></i> Start Scanning';
        toggleBtn.classList.remove('scanning');
        
        this.isScanning = false;
        
        // Emit scanning stopped event
        this.emitEvent('scanning-stopped');
    }
    
    simulateCodeDetection() {
        // Simulate different types of codes being detected
        const simulationTypes = [
            { type: 'barcode', value: '123456789012', category: 'product' },
            { type: 'qr', value: 'https://menu.restaurant.com/qr/abc123', category: 'business' },
            { type: 'qr', value: 'https://apps.apple.com/app/example', category: 'app' },
            { type: 'barcode', value: '987654321098', category: 'product' }
        ];
        
        const randomCode = simulationTypes[Math.floor(Math.random() * simulationTypes.length)];
        this.addScannedItem(randomCode.value, randomCode.type, randomCode.category);
        this.stopScanning();
    }
    
    addScannedItem(value, type, category = null) {
        if (this.scannedItems.length >= this.options.maxItems) {
            alert(`Maximum of ${this.options.maxItems} items allowed.`);
            return false;
        }
        
        // Check for duplicates
        if (this.scannedItems.some(item => item.value === value)) {
            alert('This code has already been scanned.');
            return false;
        }
        
        // Auto-detect category if not provided
        if (!category) {
            category = this.detectCategory(value, type);
        }
        
        const item = {
            id: Date.now() + Math.random(),
            value,
            type,
            category,
            timestamp: new Date(),
            displayName: this.generateDisplayName(value, type, category)
        };
        
        this.scannedItems.push(item);
        this.updateUI();
        this.emitEvent('item-scanned', item);
        
        return true;
    }
    
    removeScannedItem(itemId) {
        const index = this.scannedItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const removedItem = this.scannedItems.splice(index, 1)[0];
            this.updateUI();
            this.emitEvent('item-removed', removedItem);
            return true;
        }
        return false;
    }
    
    detectCategory(value, type) {
        if (type === 'barcode') {
            return 'product';
        }
        
        if (type === 'qr') {
            const url = value.toLowerCase();
            if (url.includes('menu') || url.includes('restaurant') || url.includes('cafe')) {
                return 'business';
            }
            if (url.includes('app') || url.includes('play.google') || url.includes('apps.apple')) {
                return 'app';
            }
            if (url.includes('service') || url.includes('booking') || url.includes('appointment')) {
                return 'service';
            }
            return 'digital';
        }
        
        return 'unknown';
    }
    
    generateDisplayName(value, type, category) {
        if (type === 'barcode') {
            return `Product ${value.substring(0, 8)}...`;
        }
        
        if (type === 'qr') {
            if (category === 'business') return 'Restaurant/Business';
            if (category === 'app') return 'Mobile App';
            if (category === 'service') return 'Digital Service';
            return 'QR Code';
        }
        
        return 'Scanned Item';
    }
    
    updateUI() {
        const listContainer = this.container.querySelector('.scanned-items-list');
        const countIndicator = this.container.querySelector('.scan-limit-indicator');
        const itemsCount = this.container.querySelector('.items-count');
        
        // Update items list
        listContainer.innerHTML = this.scannedItems.map(item => `
            <div class="scanned-item" data-item-id="${item.id}">
                <div class="item-info">
                    <i class="item-type-icon ${item.type} ${item.type === 'barcode' ? 'fas fa-barcode' : 'fas fa-qrcode'}"></i>
                    <div class="item-details">
                        <div class="item-value">${item.displayName}</div>
                        <div class="item-category">${item.category}</div>
                    </div>
                </div>
                <button type="button" class="remove-item-btn" onclick="window.scanner_${this.containerId}.removeScannedItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Update count indicator
        itemsCount.textContent = this.scannedItems.length;
        
        if (this.scannedItems.length >= this.options.maxItems) {
            countIndicator.classList.add('max-reached');
        } else {
            countIndicator.classList.remove('max-reached');
        }
    }
    
    getScannedItems() {
        return [...this.scannedItems];
    }
    
    clearAllItems() {
        this.scannedItems = [];
        this.updateUI();
        this.emitEvent('all-items-cleared');
    }
    
    emitEvent(eventName, data = null) {
        const event = new CustomEvent(`scanner-${eventName}`, {
            detail: {
                scannerId: this.containerId,
                data,
                allItems: this.getScannedItems()
            }
        });
        document.dispatchEvent(event);
    }
    
    destroy() {
        this.stopScanning();
        if (this.container) {
            this.container.innerHTML = '';
        }
        delete window[`scanner_${this.containerId}`];
    }
}

// Convenience function for easy initialization
export function initializeMixedScanner(containerId, options = {}) {
    return new MixedScanner(containerId, options);
}

// Export for global access
window.MixedScanner = MixedScanner;
window.initializeMixedScanner = initializeMixedScanner;
