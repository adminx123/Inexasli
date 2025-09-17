/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// piexifjs library for EXIF metadata removal
// ✅ AUTOMATICALLY LOADED by datain.js for all modules
// Library location: /utility/piexif.js (included in repository)
// Manual loading (if needed): <script src="utility/piexif.js"></script>

/**
 * Strip EXIF and other metadata from image data URL
 * @param {string} dataUrl - Base64 data URL of the image
 * @returns {string} - Clean data URL with metadata removed
 */
function stripImageMetadata(dataUrl) {
    try {
        // Check if piexif is available
        if (typeof piexif === 'undefined') {
            console.warn('[ImageUpload] piexif library not loaded, metadata stripping disabled');
            return dataUrl;
        }
        
        // Remove EXIF data
        const cleanDataUrl = piexif.remove(dataUrl);
        console.log('[ImageUpload] EXIF metadata stripped successfully');
        return cleanDataUrl;
    } catch (error) {
        console.warn('[ImageUpload] Failed to strip metadata:', error.message);
        // Return original data URL if stripping fails
        return dataUrl;
    }
}

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
 * - EXIF/metadata stripping for privacy
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
                        object-fit: contain;
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
                    
                    /* Fashion-specific preview styles */
                    .fashion-preview {
                        min-height: 200px;
                    }
                    
                    .fashion-frame {
                        position: relative;
                        aspect-ratio: 3/4; /* Portrait fashion ratio */
                        overflow: hidden;
                        border: 2px solid #4a7c59;
                        border-radius: 8px;
                        background: #f8f9fa;
                    }
                    
                    .fashion-frame .preview-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center;
                    }
                    
                    .fashion-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        pointer-events: none;
                        opacity: 0.7;
                    }
                    
                    .crop-indicator {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        right: 10px;
                        bottom: 10px;
                        border: 1px dashed rgba(255, 255, 255, 0.8);
                        border-radius: 4px;
                    }
                    
                    .center-guide {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(255, 255, 255, 0.9);
                        border-radius: 50%;
                        background: rgba(74, 124, 89, 0.7);
                    }
                    
                    .preview-info {
                        font-size: 11px;
                        color: #2d5a3d;
                        margin-top: 4px;
                        line-height: 1.3;
                    }
                    
                    .image-dimensions {
                        font-weight: 500;
                    }
                    
                    .file-size {
                        margin-top: 2px;
                    }
                    
                    .file-size.good {
                        color: #198754;
                    }
                    
                    .file-size.warning {
                        color: #fd7e14;
                        font-weight: 500;
                    }
                    
                    .compression-info {
                        margin-top: 2px;
                        opacity: 0.8;
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
        
        // For single image mode (like fashion), clear existing images first
        if (this.options.maxFiles === 1 && this.images.length > 0) {
            console.log('[ImageUpload] Single image mode - clearing existing images');
            this.images = [];
        }
        
        // Check total files limit
        if (this.images.length + fileArray.length > this.options.maxFiles) {
            this.showError(`Maximum ${this.options.maxFiles} ${this.options.maxFiles === 1 ? 'image' : 'files'} allowed`);
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
        // Check if this is for fashion module (can be set via options or detected)
        const isFashionMode = this.options.fashionMode || 
                             window.location.pathname.includes('fashion') ||
                             document.querySelector('[data-module="fashion"]');
        
        if (isFashionMode) {
            return this.compressFashionImage(file);
        }
         // Original compression logic for other modules
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
                
                // Strip EXIF metadata from the compressed image
                const cleanDataUrl = stripImageMetadata(dataUrl);
                const base64 = cleanDataUrl.split(',')[1];
                
                resolve({
                    dataUrl: cleanDataUrl,
                    base64,
                    width,
                    height,
                    fileSize: this.getBase64Size(cleanDataUrl)
                });
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            
            // Strip metadata from source before loading into image element
            const cleanSource = stripImageMetadata(URL.createObjectURL(file));
            img.src = cleanSource;
        });
    }

    // Fashion-specific image processing methods
    async compressFashionImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Fashion-specific settings for aggressive compression
                const maxHeight = 800; // Tall/narrow format
                const maxWidth = 600;  // Narrower width for portrait
                const quality = 0.6;   // More aggressive compression
                const maxFileSize = 300 * 1024; // 300KB target
                
                // Calculate crop dimensions for 3:4 aspect ratio (portrait fashion)
                const targetAspectRatio = 3 / 4; // width/height
                let cropData = this.calculateFashionCrop(img.width, img.height, targetAspectRatio);
                
                // Set canvas to final dimensions
                let finalWidth = Math.min(cropData.width, maxWidth);
                let finalHeight = Math.min(cropData.height, maxHeight);
                
                // Maintain aspect ratio during final resize
                const finalRatio = Math.min(maxWidth / cropData.width, maxHeight / cropData.height);
                finalWidth = cropData.width * finalRatio;
                finalHeight = cropData.height * finalRatio;
                
                canvas.width = finalWidth;
                canvas.height = finalHeight;
                
                // Draw cropped and resized image
                ctx.drawImage(img, 
                    cropData.x, cropData.y, cropData.width, cropData.height, // source
                    0, 0, finalWidth, finalHeight // destination
                );
                
                // Try different quality levels to meet file size target
                let currentQuality = quality;
                let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                let iterations = 0;
                
                // Reduce quality until under target size (max 5 iterations)
                while (this.getBase64Size(dataUrl) > maxFileSize && currentQuality > 0.3 && iterations < 5) {
                    currentQuality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                    iterations++;
                }
                
                // Strip EXIF metadata from the fashion-optimized image
                const cleanDataUrl = stripImageMetadata(dataUrl);
                const base64 = cleanDataUrl.split(',')[1];
                const finalSize = this.getBase64Size(cleanDataUrl);
                
                resolve({
                    dataUrl: cleanDataUrl,
                    base64,
                    width: Math.round(finalWidth),
                    height: Math.round(finalHeight),
                    originalWidth: img.width,
                    originalHeight: img.height,
                    cropData,
                    quality: currentQuality,
                    fileSize: finalSize,
                    isFashionOptimized: true
                });
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            
            // Strip metadata from source before loading into image element
            const cleanSource = stripImageMetadata(URL.createObjectURL(file));
            img.src = cleanSource;
        });
    }
    
    calculateFashionCrop(imgWidth, imgHeight, targetAspectRatio) {
        // Simple center crop to target aspect ratio
        let cropWidth, cropHeight, x, y;
        
        const currentAspectRatio = imgWidth / imgHeight;
        
        if (currentAspectRatio > targetAspectRatio) {
            // Image is too wide, crop horizontally
            cropHeight = imgHeight;
            cropWidth = imgHeight * targetAspectRatio;
            x = (imgWidth - cropWidth) / 2;
            y = 0;
        } else {
            // Image is too tall, crop vertically
            cropWidth = imgWidth;
            cropHeight = imgWidth / targetAspectRatio;
            x = 0;
            y = (imgHeight - cropHeight) / 2;
        }
        
        return {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(cropWidth),
            height: Math.round(cropHeight)
        };
    }
    
    getBase64Size(dataUrl) {
        // Calculate approximate file size from base64 data URL
        const base64 = dataUrl.split(',')[1];
        return Math.round((base64.length * 3) / 4);
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / (1024 * 1024)) + ' MB';
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
        const isFashionOptimized = image.isFashionOptimized;
        
        div.className = `image-preview ${isFashionOptimized ? 'fashion-preview' : ''}`;
        div.setAttribute('role', 'gridcell');
        div.setAttribute('aria-label', `Image ${index + 1}: ${image.name}`);
        
        // Calculate file size info
        const currentSize = image.fileSize || this.getBase64Size(image.dataUrl);
        const maxSize = 300 * 1024; // 300KB target for fashion
        const sizeStatus = currentSize > maxSize ? 'warning' : 'good';
        
        div.innerHTML = `
            <div class="preview-container ${isFashionOptimized ? 'fashion-frame' : ''}">
                <img src="${image.dataUrl}" alt="${image.name}" class="preview-img" loading="lazy">
                ${isFashionOptimized ? `
                    <div class="fashion-overlay">
                        <div class="crop-indicator"></div>
                        <div class="center-guide"></div>
                    </div>
                ` : ''}
            </div>
            <div class="preview-info">
                <div class="image-dimensions">
                    ${image.width} × ${image.height}px
                </div>
                <div class="file-size ${sizeStatus}">
                    ${this.formatFileSize(currentSize)}${isFashionOptimized ? ` / ${this.formatFileSize(maxSize)}` : ''}
                </div>
                ${isFashionOptimized && image.quality ? `
                    <div class="compression-info">
                        Quality: ${Math.round(image.quality * 100)}%
                    </div>
                ` : ''}
            </div>
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

    // NEW: Get images as FormData for efficient backend upload
    getImagesAsFormData() {
        const formData = new FormData();
        
        this.images.forEach((img, index) => {
            // Convert base64/dataUrl back to File object
            if (img.dataUrl && img.dataUrl.startsWith('data:')) {
                // Extract base64 data and convert to blob
                const base64Data = img.dataUrl.split(',')[1];
                const mimeType = img.type || 'image/jpeg';
                
                // Convert base64 to blob
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                
                // Create File object
                const file = new File([blob], img.name || `image-${index}.jpg`, { type: mimeType });
                formData.append(`image_${index}`, file);
            }
        });
        
        return formData;
    }

    // NEW: Get first image as FormData (for single image uploads)
    getFirstImageAsFormData() {
        if (this.images.length === 0) return null;
        
        const formData = new FormData();
        const img = this.images[0];
        
        if (img.dataUrl && img.dataUrl.startsWith('data:')) {
            const base64Data = img.dataUrl.split(',')[1];
            const mimeType = img.type || 'image/jpeg';
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            const file = new File([blob], img.name || 'image.jpg', { type: mimeType });
            formData.append('image', file);
        }
        
        return formData;
    }

    getBase64Images() {
        return this.images.map(img => img.base64);
    }

    // New method: Get images formatted for backend submission
    getImagesForBackend() {
        return this.images.map((img, index) => {
            let dataUrl;
            
            if (img.dataUrl && img.dataUrl.startsWith('data:')) {
                // Already a full data URL
                dataUrl = img.dataUrl;
            } else if (img.base64) {
                // Create data URL from base64 (use detected type or default to JPEG)
                const mimeType = img.type || 'image/jpeg';
                dataUrl = `data:${mimeType};base64,${img.base64}`;
            } else if (img.dataUrl && img.dataUrl.includes(',')) {
                // Extract and recreate data URL with proper type
                const base64Part = img.dataUrl.split(',')[1];
                const mimeType = img.type || 'image/jpeg';
                dataUrl = `data:${mimeType};base64,${base64Part}`;
            } else {
                console.error(`[ImageUpload] Image ${index} - no valid data found!`, img);
                dataUrl = '';
            }
            
            return dataUrl;
        }).filter(img => img.length > 0); // Remove empty images
    }

    // New method: Get validated data URLs
    getValidatedDataUrls() {
        const dataUrls = this.getImagesForBackend();
        
        // Validate each data URL
        const validatedUrls = dataUrls.filter(dataUrl => {
            if (!dataUrl.startsWith('data:image/')) {
                console.warn('[ImageUpload] Invalid data URL format:', dataUrl.substring(0, 50));
                return false;
            }
            if (!dataUrl.includes('base64,')) {
                console.warn('[ImageUpload] Data URL missing base64 encoding:', dataUrl.substring(0, 50));
                return false;
            }
            return true;
        });
        
        return validatedUrls;
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

    /**
     * Restore images from an array of data URLs (for FormPersistence integration)
     * @param {Array} dataUrls - Array of data URL strings
     */
    restoreFromDataUrls(dataUrls) {
        if (!Array.isArray(dataUrls)) {
            console.error('[ImageUpload] restoreFromDataUrls expects an array');
            return;
        }

        console.log(`[ImageUpload] Restoring ${dataUrls.length} images from data URLs`);

        // Clear existing images first
        this.images = [];

        // Convert each data URL back to image object
        dataUrls.forEach((dataUrl, index) => {
            try {
                if (!dataUrl || !dataUrl.startsWith('data:image/')) {
                    console.warn(`[ImageUpload] Invalid data URL at index ${index}:`, dataUrl?.substring(0, 50));
                    return;
                }

                // Extract MIME type and base64 data
                const [header, base64Data] = dataUrl.split(',');
                const mimeMatch = header.match(/data:([^;]+)/);
                const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

                // Create image object in expected format
                const imageObj = {
                    dataUrl: dataUrl,
                    base64: base64Data,
                    type: mimeType,
                    name: `restored_image_${index + 1}.${mimeType.split('/')[1]}`,
                    size: Math.round(base64Data.length * 0.75), // Approximate file size
                    timestamp: Date.now(),
                    width: null, // Will be determined when displayed
                    height: null
                };

                this.images.push(imageObj);
                console.log(`[ImageUpload] Restored image ${index + 1}:`, imageObj.name);
            } catch (error) {
                console.error(`[ImageUpload] Error restoring image at index ${index}:`, error);
            }
        });

        // Update preview to show restored images
        this.updatePreview();
        this.triggerChangeEvent();

        console.log(`[ImageUpload] Successfully restored ${this.images.length} images`);
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

// Image restoration configuration and utilities
class ImageRestoration {
    static config = {
        // Modules where image restoration should be disabled on input pages
        disableRestorationForInput: ['fashion'],
        // Pages where restoration should be enabled regardless of module
        enableRestorationForPages: ['output', 'result'],
        // Default restoration behavior
        defaultRestoration: true
    };

    static shouldRestoreImages(moduleName, pageType = 'input') {
        // Check if this is an output/result page
        if (pageType === 'output' || window.location.pathname.includes('output') || window.location.pathname.includes('result')) {
            return true; // Always restore for output pages
        }

        // Check if restoration is disabled for this module on input pages
        if (this.config.disableRestorationForInput.includes(moduleName)) {
            console.log(`[ImageRestoration] Restoration disabled for ${moduleName} input pages`);
            return false;
        }

        return this.config.defaultRestoration;
    }

    static getStorageKey(moduleName) {
        return `${moduleName}IqInput`;
    }

    static getSavedImages(moduleName) {
        try {
            const storageKey = this.getStorageKey(moduleName);
            const formData = JSON.parse(localStorage.getItem(storageKey) || 'null');
            return formData && formData.images ? formData.images : [];
        } catch (error) {
            console.error('[ImageRestoration] Error getting saved images:', error);
            return [];
        }
    }

    static async restoreImagesIfNeeded(containerId, moduleName) {
        const pageType = window.location.pathname.includes('output') ? 'output' : 'input';
        
        if (!this.shouldRestoreImages(moduleName, pageType)) {
            console.log(`[ImageRestoration] Skipping restoration for ${moduleName} on ${pageType} page`);
            return;
        }

        const savedImages = this.getSavedImages(moduleName);
        if (savedImages.length === 0) {
            console.log(`[ImageRestoration] No saved images found for ${moduleName}`);
            return;
        }

        console.log(`[ImageRestoration] Restoring ${savedImages.length} images for ${moduleName}`);
        
        // Wait for instances to be available
        setTimeout(() => {
            const instances = window.imageUploadInstances;
            if (instances && instances.size > 0) {
                const instance = Array.from(instances.values()).find(inst => 
                    inst.container && (inst.container.id === containerId || inst.container.closest(`#${containerId}`))
                );
                
                if (instance) {
                    instance.restoreFromDataUrls(savedImages);
                    console.log(`[ImageRestoration] Successfully restored images to ${containerId}`);
                } else {
                    console.warn(`[ImageRestoration] No matching instance found for container ${containerId}`);
                }
            } else {
                console.warn('[ImageRestoration] No image upload instances available');
            }
        }, 100);
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
        
        // Detect fashion mode
        const isFashionMode = container.id?.includes('fashion') || 
                             container.className?.includes('fashion') ||
                             window.location.pathname.includes('fashion') ||
                             document.querySelector('[data-module="fashion"]') ||
                             container.dataset.fashionMode === 'true';
        
        if (isFashionMode) {
            options.fashionMode = true;
            options.maxFiles = 1; // Single image for fashion analysis
            options.quality = 0.6; // More aggressive compression
            options.maxWidth = 600;
            options.maxHeight = 800;
            console.log('[ImageUpload] Fashion mode detected - using single image mode');
        }
        
        // Read options from data attributes (can override fashion defaults)
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

// New global functions for backend integration
window.getImagesForBackend = function() {
    const instances = window.imageUploadInstances;
    if (!instances || instances.size === 0) return [];
    
    const firstInstance = Array.from(instances.values())[0];
    return firstInstance ? firstInstance.getImagesForBackend() : [];
};

window.getValidatedDataUrls = function() {
    const instances = window.imageUploadInstances;
    if (!instances || instances.size === 0) return [];
    
    const firstInstance = Array.from(instances.values())[0];
    return firstInstance ? firstInstance.getValidatedDataUrls() : [];
};

window.hasValidImages = function() {
    const images = window.getImagesForBackend();
    return images.length > 0;
};

window.restoreImagesFromData = function(dataUrls) {
    const instances = window.imageUploadInstances;
    if (!instances || instances.size === 0) {
        console.warn('[ImageUpload] No instances available for restoration');
        return;
    }
    
    const firstInstance = Array.from(instances.values())[0];
    if (firstInstance) {
        firstInstance.restoreFromDataUrls(dataUrls);
    }
};

// Auto-restore images based on module and page configuration
window.autoRestoreImages = function(containerId, moduleName) {
    if (typeof ImageRestoration !== 'undefined') {
        ImageRestoration.restoreImagesIfNeeded(containerId, moduleName);
    }
};

// Get images for output display (doesn't require restoration)
window.getImagesForDisplay = function(moduleName) {
    if (typeof ImageRestoration !== 'undefined') {
        return ImageRestoration.getSavedImages(moduleName);
    }
    return [];
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageUploadUtility;
}

console.log('[ImageUpload] Utility loaded successfully');

