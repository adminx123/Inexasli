/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

/**
 * Comprehensive Image Upload Utility
 * Supports camera capture, file uploads, drag & drop on mobile and desktop
 * Features:
 * - Camera access with front/back switching on mobile
 * - File input with drag & drop support
 * - Image preview and editing
 * - Base64 encoding for API submissions
 * - Mobile-first responsive design
 * - Accessibility features
 */

class ImageUploadUtility {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'image-upload-container',
            maxFiles: options.maxFiles || 5,
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            quality: options.quality || 0.8,
            maxWidth: options.maxWidth || 1920,
            maxHeight: options.maxHeight || 1080,
            enableCamera: options.enableCamera !== false,
            enableDragDrop: options.enableDragDrop !== false,
            showPreview: options.showPreview !== false,
            ...options
        };

        this.images = [];
        this.currentStream = null;
        this.currentFacingMode = 'environment'; // Start with back camera
        this.isInitialized = false;
        this.container = null;
        this.video = null;
        this.canvas = null;
        this.fileInput = null;

        this.init();
    }

    init() {
        this.createHTML();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('[ImageUpload] Initialized successfully');
        
        // Auto-initialize if container is found
        const targetContainer = document.getElementById(this.options.containerId);
        if (targetContainer) {
            this.render(targetContainer);
        }
    }

    createHTML() {
        this.htmlTemplate = `
            <div class="image-upload-utility" data-max-files="${this.options.maxFiles}">
                <style>
                    .image-upload-utility {
                        width: 100%;
                        max-width: 460px;
                        margin: 0 auto;
                        font-family: 'Inter', sans-serif;
                        border: 2px dashed #4a7c59;
                        border-radius: 8px;
                        background:rgb(73, 94, 76);
                        padding: 16px;
                        box-sizing: border-box;
                        transition: all 0.3s ease;
                    }
                    
                    .image-upload-utility.drag-over {
                        border-color: #2d5a3d;
                        background:rgb(76, 102, 82);
                        transform: scale(1.02);
                    }
                    
                    .upload-controls {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    
                    .upload-buttons {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                    }
                    
                    .upload-btn {
                        flex: 1;
                        min-width: 120px;
                        background: #4a7c59;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        padding: 12px 16px;
                        font-size: 14px;
                        font-family: 'Inter', sans-serif;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                    }
                    
                    .upload-btn:hover {
                        background: #3d6b4a;
                        transform: translateY(-1px);
                    }
                    
                    .upload-btn:disabled {
                        background: #ccc;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .camera-section {
                        margin: 12px 0;
                        display: none;
                    }
                    
                    .camera-section.active {
                        display: block;
                    }
                    
                    .camera-container {
                        position: relative;
                        background: #000;
                        border-radius: 8px;
                        overflow: hidden;
                        margin-bottom: 12px;
                    }
                    
                    .camera-video {
                        width: 100%;
                        height: 240px;
                        object-fit: cover;
                        display: block;
                    }
                    
                    .camera-overlay {
                        position: absolute;
                        bottom: 12px;
                        left: 50%;
                        transform: translateX(-50%);
                        display: flex;
                        gap: 8px;
                    }
                    
                    .camera-btn {
                        background: rgba(74, 124, 89, 0.9);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        font-size: 18px;
                    }
                    
                    .camera-btn:hover {
                        background: rgba(61, 107, 74, 0.9);
                        transform: scale(1.1);
                    }
                    
                    .capture-btn {
                        width: 60px;
                        height: 60px;
                        background: rgba(255, 255, 255, 0.9);
                        color: #4a7c59;
                    }
                    
                    .file-input {
                        display: none;
                    }
                    
                    .drop-zone {
                        border: 2px dashed #4a7c59;
                        border-radius: 8px;
                        padding: 24px;
                        text-align: center;
                        color: #2d5a3d;
                        background: rgba(238, 247, 240, 0.5);
                        margin: 12px 0;
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }
                    
                    .drop-zone:hover, .drop-zone.drag-over {
                        background: rgba(238, 247, 240, 0.8);
                        border-color: #2d5a3d;
                    }
                    
                    .image-previews {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                        gap: 12px;
                        margin-top: 16px;
                    }
                    
                    .image-preview {
                        position: relative;
                        border-radius: 8px;
                        overflow: hidden;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(74, 124, 89, 0.15);
                        transition: transform 0.2s ease;
                    }
                    
                    .image-preview:hover {
                        transform: scale(1.05);
                    }
                    
                    .preview-img {
                        width: 100%;
                        height: 100px;
                        object-fit: cover;
                        display: block;
                    }
                    
                    .preview-controls {
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        display: flex;
                        gap: 4px;
                    }
                    
                    .preview-btn {
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        width: 24px;
                        height: 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        transition: background 0.2s ease;
                    }
                    
                    .preview-btn:hover {
                        background: rgba(0, 0, 0, 0.9);
                    }
                    
                    .upload-info {
                        font-size: 12px;
                        color: #2d5a3d;
                        text-align: center;
                        margin-top: 8px;
                        opacity: 0.8;
                    }
                    
                    .error-message {
                        color: #d63384;
                        font-size: 12px;
                        margin-top: 8px;
                        padding: 8px;
                        background: rgba(214, 51, 132, 0.1);
                        border-radius: 4px;
                        display: none;
                    }
                    
                    .success-message {
                        color: #198754;
                        font-size: 12px;
                        margin-top: 8px;
                        padding: 8px;
                        background: rgba(25, 135, 84, 0.1);
                        border-radius: 4px;
                        display: none;
                    }
                    
                    /* Mobile optimizations */
                    @media (max-width: 480px) {
                        .upload-buttons {
                            flex-direction: column;
                        }
                        
                        .upload-btn {
                            min-width: auto;
                        }
                        
                        .camera-video {
                            height: 200px;
                        }
                        
                        .image-previews {
                            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                        }
                        
                        .preview-img {
                            height: 80px;
                        }
                    }
                    
                    /* Accessibility */
                    .upload-btn:focus,
                    .camera-btn:focus,
                    .preview-btn:focus {
                        outline: 2px solid #4a7c59;
                        outline-offset: 2px;
                    }
                    
                    .sr-only {
                        position: absolute;
                        width: 1px;
                        height: 1px;
                        padding: 0;
                        margin: -1px;
                        overflow: hidden;
                        clip: rect(0, 0, 0, 0);
                        white-space: nowrap;
                        border: 0;
                    }
                </style>
                
                <div class="upload-controls">
                    <div class="upload-buttons">
                        ${this.options.enableCamera ? `
                            <button type="button" class="upload-btn camera-toggle-btn" aria-label="Open Camera">
                                📷 Camera
                            </button>
                        ` : ''}
                        <button type="button" class="upload-btn file-select-btn" aria-label="Select Files">
                            📁 Files
                        </button>
                    </div>
                    
                    ${this.options.enableDragDrop ? `
                        <div class="drop-zone" role="button" tabindex="0" aria-label="Drag and drop images here or click to select">
                            📎 Drag & drop images here or click to browse
                        </div>
                    ` : ''}
                </div>
                
                ${this.options.enableCamera ? `
                    <div class="camera-section" aria-hidden="true">
                        <div class="camera-container">
                            <video class="camera-video" autoplay playsinline muted aria-label="Camera preview"></video>
                            <div class="camera-overlay">
                                <button type="button" class="camera-btn flip-camera-btn" aria-label="Switch Camera" title="Flip Camera">
                                    🔄
                                </button>
                                <button type="button" class="camera-btn capture-btn" aria-label="Take Photo" title="Capture Photo">
                                    📸
                                </button>
                                <button type="button" class="camera-btn close-camera-btn" aria-label="Close Camera" title="Close Camera">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <input type="file" class="file-input" multiple accept="${this.options.acceptedTypes.join(',')}" aria-label="Select image files">
                <canvas style="display: none;" aria-hidden="true"></canvas>
                
                ${this.options.showPreview ? `
                    <div class="image-previews" role="grid" aria-label="Image previews"></div>
                ` : ''}
                
                <div class="upload-info">
                    Max ${this.options.maxFiles} files, ${Math.round(this.options.maxFileSize / 1024 / 1024)}MB each
                </div>
                
                <div class="error-message" role="alert" aria-live="polite"></div>
                <div class="success-message" role="status" aria-live="polite"></div>
            </div>
        `;
    }

    render(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container) {
            console.error('[ImageUpload] Container not found');
            return;
        }

        container.innerHTML = this.htmlTemplate;
        this.container = container.querySelector('.image-upload-utility');
        
        // Get references to elements
        this.video = this.container.querySelector('.camera-video');
        this.canvas = this.container.querySelector('canvas');
        this.fileInput = this.container.querySelector('.file-input');
        
        this.setupEventListeners();
        console.log('[ImageUpload] Rendered successfully');
    }

    setupEventListeners() {
        if (!this.container) return;

        // Camera controls
        const cameraToggleBtn = this.container.querySelector('.camera-toggle-btn');
        const flipCameraBtn = this.container.querySelector('.flip-camera-btn');
        const captureBtn = this.container.querySelector('.capture-btn');
        const closeCameraBtn = this.container.querySelector('.close-camera-btn');

        // File controls
        const fileSelectBtn = this.container.querySelector('.file-select-btn');
        const dropZone = this.container.querySelector('.drop-zone');

        // Camera events
        if (cameraToggleBtn) {
            cameraToggleBtn.addEventListener('click', () => this.toggleCamera());
        }
        
        if (flipCameraBtn) {
            flipCameraBtn.addEventListener('click', () => this.flipCamera());
        }
        
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        if (closeCameraBtn) {
            closeCameraBtn.addEventListener('click', () => this.closeCamera());
        }

        // File events
        if (fileSelectBtn) {
            fileSelectBtn.addEventListener('click', () => this.openFileDialog());
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag & drop events
        if (dropZone) {
            dropZone.addEventListener('click', () => this.openFileDialog());
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
            
            // Keyboard accessibility
            dropZone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openFileDialog();
                }
            });
        }
    }

    // Camera Methods
    async toggleCamera() {
        const cameraSection = this.container.querySelector('.camera-section');
        
        if (cameraSection.classList.contains('active')) {
            this.closeCamera();
        } else {
            await this.openCamera();
        }
    }

    async openCamera() {
        try {
            const cameraSection = this.container.querySelector('.camera-section');
            const cameraToggleBtn = this.container.querySelector('.camera-toggle-btn');
            
            cameraToggleBtn.disabled = true;
            cameraToggleBtn.textContent = '⏳ Starting...';

            // Check if we're on a mobile device to determine default facing mode
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: this.options.maxWidth },
                    height: { ideal: this.options.maxHeight }
                },
                audio: false
            };

            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.currentStream;
            
            cameraSection.classList.add('active');
            cameraSection.setAttribute('aria-hidden', 'false');
            
            cameraToggleBtn.textContent = '📷 Camera';
            cameraToggleBtn.disabled = false;
            
            this.showSuccess('Camera opened successfully');
            console.log('[ImageUpload] Camera opened with facing mode:', this.currentFacingMode);
            
        } catch (error) {
            console.error('[ImageUpload] Camera access failed:', error);
            this.showError('Camera access failed. Please check permissions.');
            
            const cameraToggleBtn = this.container.querySelector('.camera-toggle-btn');
            cameraToggleBtn.textContent = '📷 Camera';
            cameraToggleBtn.disabled = false;
        }
    }

    closeCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        const cameraSection = this.container.querySelector('.camera-section');
        cameraSection.classList.remove('active');
        cameraSection.setAttribute('aria-hidden', 'true');
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        console.log('[ImageUpload] Camera closed');
    }

    async flipCamera() {
        if (!this.currentStream) return;
        
        // Toggle between front and back camera
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        
        // Close current stream and open new one
        this.closeCamera();
        await this.openCamera();
    }

    capturePhoto() {
        if (!this.video || !this.canvas) {
            this.showError('Camera not available');
            return;
        }

        const context = this.canvas.getContext('2d');
        
        // Set canvas dimensions to video dimensions
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(this.video, 0, 0);
        
        // Convert to blob
        this.canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                
                this.processFile(file, 'camera');
                this.showSuccess('Photo captured successfully');
            } else {
                this.showError('Failed to capture photo');
            }
        }, 'image/jpeg', this.options.quality);
    }

    // File Methods
    openFileDialog() {
        if (this.fileInput) {
            this.fileInput.click();
        }
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files, 'file');
        
        // Reset input so same file can be selected again
        event.target.value = '';
    }

    // Drag & Drop Methods
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropZone = event.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropZone = event.currentTarget;
        
        // Only remove drag-over if we're really leaving the drop zone
        if (!dropZone.contains(event.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        this.processFiles(files, 'drop');
    }

    // File Processing Methods
    processFiles(files, source = 'unknown') {
        if (!files || files.length === 0) return;
        
        const fileArray = Array.from(files);
        console.log(`[ImageUpload] Processing ${fileArray.length} files from ${source}`);
        
        // Check total files limit
        if (this.images.length + fileArray.length > this.options.maxFiles) {
            this.showError(`Maximum ${this.options.maxFiles} files allowed`);
            return;
        }
        
        fileArray.forEach(file => this.processFile(file, source));
    }

    async processFile(file, source = 'unknown') {
        // Validate file type
        if (!this.options.acceptedTypes.includes(file.type)) {
            this.showError(`File type ${file.type} not supported`);
            return;
        }
        
        // Validate file size
        if (file.size > this.options.maxFileSize) {
            this.showError(`File ${file.name} is too large (max ${Math.round(this.options.maxFileSize / 1024 / 1024)}MB)`);
            return;
        }
        
        try {
            const imageData = await this.compressImage(file);
            const imageObj = {
                id: this.generateId(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                source: source,
                dataUrl: imageData.dataUrl,
                base64: imageData.base64,
                width: imageData.width,
                height: imageData.height,
                timestamp: Date.now()
            };
            
            this.images.push(imageObj);
            this.updatePreview();
            this.triggerChangeEvent();
            
            console.log(`[ImageUpload] Added image:`, imageObj.name);
            
        } catch (error) {
            console.error('[ImageUpload] Failed to process file:', error);
            this.showError(`Failed to process ${file.name}`);
        }
    }

    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > this.options.maxWidth || height > this.options.maxHeight) {
                    const ratio = Math.min(this.options.maxWidth / width, this.options.maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', this.options.quality);
                const base64 = dataUrl.split(',')[1];
                
                resolve({
                    dataUrl,
                    base64,
                    width,
                    height
                });
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    // Preview Methods
    updatePreview() {
        if (!this.options.showPreview) return;
        
        const previewContainer = this.container.querySelector('.image-previews');
        if (!previewContainer) return;
        
        previewContainer.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const previewElement = this.createPreviewElement(image, index);
            previewContainer.appendChild(previewElement);
        });
    }

    createPreviewElement(image, index) {
        const div = document.createElement('div');
        div.className = 'image-preview';
        div.setAttribute('role', 'gridcell');
        div.setAttribute('aria-label', `Image ${index + 1}: ${image.name}`);
        
        div.innerHTML = `
            <img src="${image.dataUrl}" alt="${image.name}" class="preview-img" loading="lazy">
            <div class="preview-controls">
                <button type="button" class="preview-btn remove-btn" aria-label="Remove image" title="Remove">
                    ✕
                </button>
            </div>
        `;
        
        // Add remove functionality
        const removeBtn = div.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => this.removeImage(image.id));
        
        return div;
    }

    removeImage(imageId) {
        const index = this.images.findIndex(img => img.id === imageId);
        if (index !== -1) {
            const removedImage = this.images.splice(index, 1)[0];
            this.updatePreview();
            this.triggerChangeEvent();
            
            console.log(`[ImageUpload] Removed image:`, removedImage.name);
            this.showSuccess(`Removed ${removedImage.name}`);
        }
    }

    // Utility Methods
    generateId() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    showError(message) {
        const errorElement = this.container.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        console.error('[ImageUpload]', message);
    }

    showSuccess(message) {
        const successElement = this.container.querySelector('.success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
        }
        console.log('[ImageUpload]', message);
    }

    triggerChangeEvent() {
        const event = new CustomEvent('imagesChanged', {
            detail: {
                images: this.images,
                count: this.images.length
            }
        });
        
        if (this.container) {
            this.container.dispatchEvent(event);
        }
        
        // Also trigger global event for backward compatibility
        document.dispatchEvent(new CustomEvent('imageUploadChanged', {
            detail: {
                images: this.images,
                count: this.images.length
            }
        }));
    }

    // Public API Methods
    getImages() {
        return this.images.map(img => ({
            id: img.id,
            name: img.name,
            size: img.size,
            type: img.type,
            source: img.source,
            dataUrl: img.dataUrl,
            base64: img.base64,
            width: img.width,
            height: img.height,
            timestamp: img.timestamp
        }));
    }

    getBase64Images() {
        return this.images.map(img => img.base64);
    }

    clear() {
        this.images = [];
        this.closeCamera();
        this.updatePreview();
        this.triggerChangeEvent();
        console.log('[ImageUpload] Cleared all images');
    }

    addImage(file) {
        if (file instanceof File) {
            this.processFile(file, 'api');
        } else {
            console.error('[ImageUpload] addImage expects a File object');
        }
    }

    destroy() {
        this.closeCamera();
        
        if (this.container) {
            this.container.remove();
        }
        
        this.images = [];
        this.isInitialized = false;
        console.log('[ImageUpload] Destroyed');
    }

    // Static methods for global access
    static getInstance(containerId) {
        if (!window.imageUploadInstances) {
            window.imageUploadInstances = new Map();
        }
        
        return window.imageUploadInstances.get(containerId);
    }

    static createInstance(containerId, options = {}) {
        if (!window.imageUploadInstances) {
            window.imageUploadInstances = new Map();
        }
        
        const instance = new ImageUploadUtility({
            ...options,
            containerId
        });
        
        window.imageUploadInstances.set(containerId, instance);
        return instance;
    }
}

// Auto-initialization function
function initializeImageUploadContainers() {
    console.log('[ImageUpload] Looking for containers to initialize...');
    
    // Look for containers that need image upload functionality
    const containers = document.querySelectorAll('[data-image-upload], #fashion-upload-container, .image-upload-container');
    console.log('[ImageUpload] Found containers:', containers.length);
    
    containers.forEach((container, index) => {
        console.log(`[ImageUpload] Processing container ${index + 1}:`, container.id || container.className);
        
        // Skip if already initialized
        if (container.hasAttribute('data-imageupload-initialized')) {
            console.log(`[ImageUpload] Container already initialized:`, container.id);
            return;
        }
        
        const options = {};
        
        // Read options from data attributes
        if (container.dataset.maxFiles) options.maxFiles = parseInt(container.dataset.maxFiles);
        if (container.dataset.maxFileSize) options.maxFileSize = parseInt(container.dataset.maxFileSize);
        if (container.dataset.enableCamera !== undefined) options.enableCamera = container.dataset.enableCamera !== 'false';
        if (container.dataset.enableDragDrop !== undefined) options.enableDragDrop = container.dataset.enableDragDrop !== 'false';
        
        console.log(`[ImageUpload] Creating instance for container:`, container.id, 'with options:', options);
        
        const instance = new ImageUploadUtility(options);
        instance.render(container);
        
        // Mark as initialized
        container.setAttribute('data-imageupload-initialized', 'true');
        
        // Store instance globally for access
        if (!window.imageUploadInstances) {
            window.imageUploadInstances = new Map();
        }
        window.imageUploadInstances.set(container.id || container.className, instance);
        
        console.log(`[ImageUpload] Successfully initialized container:`, container.id);
    });
    
    if (containers.length === 0) {
        console.log('[ImageUpload] No containers found for auto-initialization');
    }
}

// Auto-initialization for specific containers
document.addEventListener('DOMContentLoaded', initializeImageUploadContainers);

// Also try to initialize when datain.js loads content
document.addEventListener('data-in-loaded', () => {
    console.log('[ImageUpload] Detected data-in-loaded event, reinitializing...');
    setTimeout(initializeImageUploadContainers, 100);
});

// Additional initialization attempts for dynamic content
setTimeout(() => {
    console.log('[ImageUpload] Running delayed initialization check...');
    initializeImageUploadContainers();
}, 1000);

// Make initialization function globally available
window.initializeImageUpload = initializeImageUploadContainers;

// Global functions for backward compatibility
window.getImageUploadImages = function() {
    const instances = window.imageUploadInstances;
    if (!instances || instances.size === 0) return [];
    
    // Return images from the first instance (most common use case)
    const firstInstance = Array.from(instances.values())[0];
    return firstInstance ? firstInstance.getImages() : [];
};

window.clearImageUpload = function() {
    const instances = window.imageUploadInstances;
    if (instances) {
        instances.forEach(instance => instance.clear());
    }
};

window.addImageToUpload = function(file) {
    const instances = window.imageUploadInstances;
    if (instances && instances.size > 0) {
        const firstInstance = Array.from(instances.values())[0];
        if (firstInstance) {
            firstInstance.addImage(file);
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageUploadUtility;
}

console.log('[ImageUpload] Utility loaded successfully');

