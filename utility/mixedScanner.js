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

// Html5QrcodeScanner will be loaded from CDN via script tag

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
        this.html5QrcodeScanner = null;
        
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
                    <div id="${this.containerId}-scanner" class="scanner-container"></div>
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
            
            .scanner-container {
                width: 100%;
                max-width: 350px;
                margin: 0 auto;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .scanner-container video {
                width: 100% !important;
                height: auto !important;
                border-radius: 8px;
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
            const cameraSection = this.container.querySelector('.camera-section');
            const toggleBtn = this.container.querySelector('.scan-toggle-btn');
            const scannerId = `${this.containerId}-scanner`;
            
            // Show camera section
            cameraSection.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-camera"></i> Scanning...';
            toggleBtn.classList.add('scanning');
            
            this.isScanning = true;
            
            // Check if Html5QrcodeScanner is available
            if (typeof Html5QrcodeScanner === 'undefined') {
                throw new Error('Html5QrcodeScanner not loaded. Please include the library via CDN.');
            }
            
            // Initialize Html5QrcodeScanner with basic configuration
            this.html5QrcodeScanner = new Html5QrcodeScanner(scannerId, {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true
            });
            
            // Start scanning
            this.html5QrcodeScanner.render(
                (decodedText, decodedResult) => {
                    this.onScanSuccess(decodedText, decodedResult);
                },
                (error) => {
                    // Ignore scanning errors (they happen frequently)
                    // console.warn('Scan error:', error);
                }
            );
            
            // Emit scanning started event
            this.emitEvent('scanning-started');
            
        } catch (error) {
            console.error('Scanner initialization error:', error);
            alert('Unable to initialize scanner. Please ensure camera permissions are granted.');
            this.stopScanning();
        }
    }
    
    stopScanning() {
        if (this.html5QrcodeScanner) {
            try {
                this.html5QrcodeScanner.clear();
            } catch (error) {
                console.warn('Error clearing scanner:', error);
            }
            this.html5QrcodeScanner = null;
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
    
    onScanSuccess(decodedText, decodedResult) {
        // Determine scan type based on the format
        let scanType = 'qr';
        if (decodedResult.result && decodedResult.result.format) {
            const format = decodedResult.result.format.formatName;
            if (format.includes('CODE') || format.includes('UPC') || format.includes('EAN') || format.includes('CODABAR')) {
                scanType = 'barcode';
            }
        }
        
        // Add the scanned item
        const success = this.addScannedItem(decodedText, scanType);
        
        if (success) {
            // Stop scanning after successful scan
            this.stopScanning();
            
            // Show success feedback
            this.showScanFeedback('success', `${scanType.toUpperCase()} scanned successfully!`);
        }
    }
    
    showScanFeedback(type, message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = `scan-feedback scan-feedback-${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(feedback);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.remove();
            style.remove();
        }, 3000);
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
