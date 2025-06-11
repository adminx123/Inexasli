/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// Import setJSON utility for localStorage operations
import { setJSON } from './setJSON.js';

/**
 * ImageUpload Utility - Safari Compatible Version
 * Uses HTML labels for file inputs to ensure cross-platform compatibility
 */
class ImageUpload {
  constructor(options = {}) {
    this.maxFiles = options.maxFiles || 5;
    this.acceptedTypes = options.acceptedTypes || 'image/*';
    this.onFilesSelected = options.onFilesSelected || null;
    this.onError = options.onError || null;
    this.uploadedImages = [];
    this.formPersistenceInstance = null;
    this.moduleType = null;
    
    console.log('ImageUpload: Initialized with options:', options);
  }

  /**
   * Initialize the upload functionality for a container
   */
  initialize(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('ImageUpload: Container not found:', containerId);
      return false;
    }

    console.log('ImageUpload: Initializing for container:', containerId);

    // Auto-detect module and connect to FormPersistence
    this.detectModuleAndConnectFormPersistence();

    // Check camera capabilities
    this.checkCameraCapabilities().then(capabilities => {
      console.log('ImageUpload: Camera capabilities:', capabilities);
      
      // Create the upload interface
      this.createUploadInterface(container, config);
      this.setupEventListeners(container);
      
      // Load previously saved images
      this.loadImagesFromFormPersistence(container);
      
      // Show appropriate warnings if needed
      this.showCameraWarnings(container, capabilities);
    });
    
    return true;
  }

  /**
   * Check camera capabilities and constraints
   */
  async checkCameraCapabilities() {
    const capabilities = {
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      canAccessCamera: false,
      error: null
    };

    // Only test actual camera access if we're in a secure context and on mobile
    if (capabilities.hasGetUserMedia && capabilities.isSecureContext && capabilities.isMobile) {
      try {
        // Quick test to see if camera permission is available
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1, height: 1 } 
        });
        
        // If we get here, camera access is possible
        capabilities.canAccessCamera = true;
        
        // Stop the stream immediately
        stream.getTracks().forEach(track => track.stop());
        
      } catch (error) {
        console.log('ImageUpload: Camera access test failed:', error.name, error.message);
        capabilities.error = error.name;
      }
    }

    return capabilities;
  }

  /**
   * Show warnings or tips based on camera capabilities
   */
  showCameraWarnings(container, capabilities) {
    if (!capabilities.isMobile) {
      return; // No warnings needed for desktop
    }

    let warningMessage = '';

    if (!capabilities.isSecureContext) {
      warningMessage = '⚠️ Camera access requires HTTPS. The "Take Photo" button may open your gallery instead.';
    } else if (!capabilities.hasGetUserMedia) {
      warningMessage = '⚠️ Your browser doesn\'t support camera access. The "Take Photo" button will open your gallery.';
    } else if (capabilities.error === 'NotAllowedError') {
      warningMessage = '⚠️ Camera permission denied. You can grant permission in your browser settings, or use "Choose from Gallery".';
    } else if (capabilities.error && capabilities.error !== 'NotFoundError') {
      warningMessage = '⚠️ Camera may not be available. The "Take Photo" button will open your gallery if camera fails.';
    }

    if (warningMessage) {
      // Add the warning message to the container
      setTimeout(() => {
        const warningDiv = container.querySelector('.camera-warning');
        if (warningDiv) {
          warningDiv.innerHTML = `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 13px; color: #856404;">
              ${warningMessage}
            </div>
          `;
        }
      }, 1000);
    }
  }

  /**
   * Auto-detect module context and connect to FormPersistence
   */
  detectModuleAndConnectFormPersistence() {
    // Try to detect module from URL
    const url = window.location.href;
    const modulePatterns = {
      '/fashion/': 'fashion',
      '/calorie/': 'calorie',
      '/fitness/': 'fitness',
      '/income/': 'income',
      '/social/': 'social',
      '/research/': 'research'
    };

    for (const [pattern, module] of Object.entries(modulePatterns)) {
      if (url.includes(pattern)) {
        this.moduleType = module;
        break;
      }
    }

    // Try to get FormPersistence instance
    if (this.moduleType) {
      const instanceName = `${this.moduleType}FormPersistence`;
      this.formPersistenceInstance = window[instanceName];
      
      if (this.formPersistenceInstance) {
        console.log(`ImageUpload: Connected to ${instanceName}`);
      } else {
        console.warn(`ImageUpload: ${instanceName} not found on window`);
      }
    }
    
    console.log('ImageUpload: Auto-detected module:', this.moduleType);
  }

  /**
   * Save images to FormPersistence localStorage
   */
  saveImagesToFormPersistence() {
    if (!this.formPersistenceInstance) {
      console.warn('ImageUpload: No FormPersistence instance available');
      return;
    }

    try {
      // Get current form data
      const currentData = this.formPersistenceInstance.getSavedFormData() || {};
      
      // Add images to the data
      currentData.images = this.uploadedImages.map(img => ({
        id: img.id,
        data: img.data,
        name: img.name,
        size: img.size,
        type: img.type
      }));

      // Save back to FormPersistence
      const storageKey = this.formPersistenceInstance.getCurrentGridItemKey();
      if (storageKey) {
        // Use imported setJSON function
        setJSON(storageKey, currentData);
        console.log('ImageUpload: Images saved to FormPersistence:', storageKey);
      }
    } catch (error) {
      console.error('ImageUpload: Error saving to FormPersistence:', error);
    }
  }

  /**
   * Load images from FormPersistence localStorage
   */
  loadImagesFromFormPersistence(container) {
    if (!this.formPersistenceInstance) {
      console.warn('ImageUpload: No FormPersistence instance available for loading');
      return;
    }

    try {
      const savedData = this.formPersistenceInstance.getSavedFormData();
      if (savedData && savedData.images && Array.isArray(savedData.images)) {
        this.uploadedImages = savedData.images;
        
        // Display loaded images
        savedData.images.forEach(imageData => {
          this.displayUploadedImage(imageData, container);
        });
        
        console.log('ImageUpload: Loaded', savedData.images.length, 'images from FormPersistence');
        
        if (this.onFilesSelected) {
          this.onFilesSelected(this.uploadedImages);
        }
      }
    } catch (error) {
      console.error('ImageUpload: Error loading from FormPersistence:', error);
    }
  }

  /**
   * Create the upload interface HTML - Safari Compatible
   */
  createUploadInterface(container, config) {
    const cameraText = config.cameraText || 'Take Photo';
    const galleryText = config.galleryText || 'Choose from Gallery';
    const dragText = config.dragText || 'Or drag and drop photos here';
    const hintText = config.hintText || `Upload 1-${this.maxFiles} photos`;

    // Detect device and browser specifics
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

    console.log('ImageUpload: Device detection:', { isMobile, isIOS, isAndroid, isSafari, isSecure });

    // Set capture attribute based on device and browser
    let captureAttr = '';
    if (isMobile) {
      if (isIOS) {
        // iOS Safari: Different approaches based on version
        // Newer iOS prefers 'capture' alone or 'capture="camera"'
        captureAttr = 'capture';
      } else if (isAndroid) {
        // Android: 'environment' for back camera usually works best
        captureAttr = 'capture="environment"';
      } else {
        // Other mobile devices
        captureAttr = 'capture="camera"';
      }
    }

    // Add security warning if not HTTPS
    let securityWarning = '';
    if (isMobile && !isSecure) {
      securityWarning = `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size: 14px; color: #856404;">
          <strong>⚠️ Camera Access Limited:</strong> For full camera functionality, this site should be accessed via HTTPS.
        </div>
      `;
    }

    container.innerHTML = `
      <div class="image-upload-container">
        <div class="camera-warning"></div>
        ${securityWarning}
        <div class="upload-options">
          <label class="upload-btn camera-btn" role="button" tabindex="0">
            <input type="file" accept="${this.acceptedTypes}" ${captureAttr} style="display: none;" aria-describedby="camera-hint">
            <i class="fas fa-camera"></i>
            <span>${cameraText}</span>
          </label>
          <label class="upload-btn gallery-btn" role="button" tabindex="0">
            <input type="file" accept="${this.acceptedTypes}" multiple style="display: none;" aria-describedby="gallery-hint">
            <i class="fas fa-images"></i>
            <span>${galleryText}</span>
          </label>
        </div>
        <div class="upload-area" role="button" tabindex="0">
          <i class="fas fa-cloud-upload-alt upload-icon"></i>
          <p>${dragText}</p>
          <p class="upload-hint">${hintText}</p>
        </div>
        <div class="uploaded-images" aria-live="polite"></div>
        <div style="display: none;">
          <span id="camera-hint">Opens camera to take a new photo</span>
          <span id="gallery-hint">Choose existing photos from your device</span>
        </div>
      </div>
    `;

    // Add CSS if not already present
    this.injectCSS();
    
    console.log('ImageUpload: HTML structure created with capture attribute:', captureAttr);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    const cameraInput = container.querySelector('.camera-btn input');
    const galleryInput = container.querySelector('.gallery-btn input');
    const uploadArea = container.querySelector('.upload-area');
    const cameraLabel = container.querySelector('.camera-btn');
    const galleryLabel = container.querySelector('.gallery-btn');

    if (!cameraInput || !galleryInput || !uploadArea) {
      console.error('ImageUpload: Required elements not found in container');
      return;
    }

    console.log('ImageUpload: Setting up event listeners');
    console.log('ImageUpload: Camera input element:', cameraInput);
    console.log('ImageUpload: Camera input attributes:', cameraInput.outerHTML);

    // Enhanced camera input handling
    const handleCameraClick = (e) => {
      console.log('ImageUpload: Camera button clicked');
      
      // Don't prevent default - let the browser handle the label-to-input connection naturally
      // Only prevent default for touch events to avoid double-firing
      if (e.type === 'touchend') {
        e.preventDefault();
      }
      
      // For most cases, the browser will automatically trigger the input
      // Only manually click if we detect the input didn't trigger
      setTimeout(() => {
        if (!cameraInput.value) {
          console.log('ImageUpload: Manually triggering camera input');
          cameraInput.click();
        }
      }, 100);
    };

    // Multiple event types for better compatibility
    cameraLabel.addEventListener('click', handleCameraClick);
    cameraLabel.addEventListener('touchend', handleCameraClick);

    // Keyboard accessibility
    cameraLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cameraInput.click();
      }
    });

    // Gallery input handling
    const handleGalleryClick = (e) => {
      console.log('ImageUpload: Gallery button clicked');
      
      // Only prevent default for touch events to avoid double-firing
      if (e.type === 'touchend') {
        e.preventDefault();
      }
      
      // Let the browser handle the label-to-input connection naturally
      // Only manually click if needed
      if (e.type === 'touchend') {
        galleryInput.click();
      }
    };

    galleryLabel.addEventListener('click', handleGalleryClick);
    galleryLabel.addEventListener('touchend', handleGalleryClick);

    galleryLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        galleryInput.click();
      }
    });

    // File input change events
    cameraInput.addEventListener('change', (e) => {
      console.log('ImageUpload: Camera input changed');
      console.log('ImageUpload: Files selected:', e.target.files.length);
      
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files, container);
      } else {
        console.log('ImageUpload: No files selected from camera input');
      }
      
      e.target.value = ''; // Reset for reuse
    });

    galleryInput.addEventListener('change', (e) => {
      console.log('ImageUpload: Gallery input changed');
      console.log('ImageUpload: Files selected:', e.target.files.length);
      
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files, container);
      }
      
      e.target.value = ''; // Reset for reuse
    });

    // Enhanced drag and drop with better visual feedback
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only remove if we're leaving the upload area itself
      if (!uploadArea.contains(e.relatedTarget)) {
        uploadArea.classList.remove('drag-over');
      }
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove('drag-over');
      
      if (e.dataTransfer.files.length > 0) {
        console.log('ImageUpload: Files dropped:', e.dataTransfer.files.length);
        this.handleFiles(e.dataTransfer.files, container);
      }
    });

    // Click on upload area to trigger gallery selection
    uploadArea.addEventListener('click', (e) => {
      if (e.target === uploadArea || uploadArea.contains(e.target)) {
        console.log('ImageUpload: Upload area clicked, opening gallery');
        galleryInput.click();
      }
    });

    // Keyboard accessibility for upload area
    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        galleryInput.click();
      }
    });

    console.log('ImageUpload: Event listeners setup complete');
  }

  /**
   * Handle selected files
   */
  handleFiles(files, container) {
    console.log('ImageUpload: Handling files:', files.length);
    
    if (!files || files.length === 0) {
      console.log('ImageUpload: No files to process');
      return;
    }
    
    const remainingSlots = this.maxFiles - this.uploadedImages.length;
    
    if (remainingSlots <= 0) {
      const message = `Maximum ${this.maxFiles} images allowed. Please remove some images first.`;
      console.warn('ImageUpload:', message);
      this.showUserMessage(container, message, 'warning');
      if (this.onError) {
        this.onError(message);
      }
      return;
    }

    const filesToProcess = Math.min(files.length, remainingSlots);
    let processedCount = 0;
    let validImageCount = 0;

    // Show processing message for multiple files
    if (filesToProcess > 1) {
      this.showUserMessage(container, `Processing ${filesToProcess} files...`, 'info');
    }

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.warn('ImageUpload: Skipping non-image file:', file.name);
        processedCount++;
        
        // Show warning for non-image files
        if (processedCount === filesToProcess) {
          this.showUserMessage(container, 'Some files were skipped because they are not images.', 'warning');
        }
        continue;
      }

      validImageCount++;
      this.processFile(file, container, () => {
        processedCount++;
        
        // Clear processing message when all files are done
        if (processedCount === filesToProcess && validImageCount > 1) {
          this.showUserMessage(container, `Successfully processed ${validImageCount} images!`, 'success');
        }
      });
    }

    if (validImageCount === 0) {
      this.showUserMessage(container, 'No valid image files found.', 'warning');
    }
  }

  /**
   * Show user feedback messages
   */
  showUserMessage(container, message, type = 'info') {
    const messageContainer = container.querySelector('.user-messages') || this.createMessageContainer(container);
    
    // Clear existing messages
    messageContainer.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `user-message user-message-${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove success/info messages after 3 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 3000);
    }
  }

  /**
   * Create message container if it doesn't exist
   */
  createMessageContainer(container) {
    let messageContainer = container.querySelector('.user-messages');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'user-messages';
      
      // Insert after upload options
      const uploadOptions = container.querySelector('.upload-options');
      if (uploadOptions) {
        uploadOptions.insertAdjacentElement('afterend', messageContainer);
      } else {
        container.appendChild(messageContainer);
      }
    }
    return messageContainer;
  }

  /**
   * Process individual file
   */
  processFile(file, container, callback) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageData = {
        id: Date.now() + Math.random(),
        data: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      this.uploadedImages.push(imageData);
      this.displayUploadedImage(imageData, container);
      
      console.log('ImageUpload: Image processed:', imageData.name);
      
      // Automatically save to FormPersistence
      this.saveImagesToFormPersistence();
      
      if (this.onFilesSelected) {
        this.onFilesSelected(this.uploadedImages);
      }
      
      // Call callback if provided
      if (callback) {
        callback();
      }
    };
    
    reader.onerror = () => {
      const message = `Failed to read file: ${file.name}`;
      console.error('ImageUpload:', message);
      this.showUserMessage(container, message, 'error');
      
      if (this.onError) {
        this.onError(message);
      }
      
      // Call callback even on error
      if (callback) {
        callback();
      }
    };
    
    reader.readAsDataURL(file);
  }

  /**
   * Display uploaded image
   */
  displayUploadedImage(imageData, container) {
    const uploadedImagesContainer = container.querySelector('.uploaded-images');
    
    const imageElement = document.createElement('div');
    imageElement.className = 'uploaded-image';
    imageElement.innerHTML = `
      <img src="${imageData.data}" alt="${imageData.name}">
      <button class="remove-image" data-id="${imageData.id}">×</button>
    `;

    uploadedImagesContainer.appendChild(imageElement);

    // Add remove functionality
    const removeBtn = imageElement.querySelector('.remove-image');
    removeBtn.addEventListener('click', () => {
      this.removeImage(imageData.id, container);
    });
  }

  /**
   * Remove uploaded image
   */
  removeImage(imageId, container) {
    this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
    
    const imageElement = container.querySelector(`[data-id="${imageId}"]`).closest('.uploaded-image');
    if (imageElement) {
      imageElement.remove();
    }
    
    console.log('ImageUpload: Image removed:', imageId);
    
    // Automatically save to FormPersistence after removal
    this.saveImagesToFormPersistence();
    
    if (this.onFilesSelected) {
      this.onFilesSelected(this.uploadedImages);
    }
  }

  /**
   * Get all uploaded images as base64 strings
   */
  getImages() {
    return this.uploadedImages.map(img => img.data);
  }

  /**
   * Get all uploaded image objects
   */
  getImageObjects() {
    return this.uploadedImages;
  }

  /**
   * Clear all uploaded images
   */
  clearImages(container) {
    this.uploadedImages = [];
    if (container) {
      const uploadedImagesContainer = container.querySelector('.uploaded-images');
      if (uploadedImagesContainer) {
        uploadedImagesContainer.innerHTML = '';
      }
    }
    
    // Automatically save to FormPersistence after clearing
    this.saveImagesToFormPersistence();
    
    if (this.onFilesSelected) {
      this.onFilesSelected(this.uploadedImages);
    }
  }

  /**
   * Inject CSS styles
   */
  injectCSS() {
    const styleId = 'image-upload-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .image-upload-container {
        width: 100%;
        margin-bottom: 20px;
      }

      .upload-options {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        justify-content: center;
      }

      .upload-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px 30px;
        border: 2px solid #4a7c59;
        border-radius: 12px;
        background-color: #4a7c59;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: inherit;
        font-size: 16px;
        min-width: 120px;
        -webkit-tap-highlight-color: rgba(74, 124, 89, 0.2);
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
        overflow: hidden;
      }

      .upload-btn:hover,
      .upload-btn:focus {
        background-color: #2d5d3d;
        border-color: #2d5d3d;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
        outline: none;
      }

      .upload-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(74, 124, 89, 0.3);
      }

      .upload-btn:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: 2px;
      }

      .upload-btn i {
        font-size: 2em;
        margin-bottom: 8px;
      }

      .upload-btn span {
        font-weight: 500;
      }

      .upload-area {
        border: 2px dashed #4a7c59;
        border-radius: 10px;
        padding: 30px 20px;
        text-align: center;
        transition: all 0.3s ease;
        background-color: #f9f9f9;
        margin-bottom: 20px;
        min-height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(74, 124, 89, 0.1);
        touch-action: manipulation;
      }

      .upload-area.drag-over,
      .upload-area:hover,
      .upload-area:focus {
        border-color: #2d5d3d;
        background-color: #f0f8f0;
        outline: none;
      }

      .upload-area:focus-visible {
        outline: 2px solid #4a7c59;
        outline-offset: 2px;
      }

      .upload-icon {
        font-size: 2em;
        color: #4a7c59;
        margin-bottom: 10px;
      }

      .upload-hint {
        font-size: 0.9em;
        color: #666;
        margin-top: 5px;
      }

      .uploaded-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .uploaded-image {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .uploaded-image img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        display: block;
      }

      .remove-image {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .remove-image:hover {
        background: rgba(255, 0, 0, 1);
      }

      .user-messages {
        margin: 10px 0;
      }

      .user-message {
        padding: 10px 15px;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 14px;
        font-family: inherit;
        border-left: 4px solid;
      }

      .user-message-info {
        background-color: #e7f3ff;
        border-left-color: #2196f3;
        color: #1565c0;
      }

      .user-message-success {
        background-color: #e8f5e8;
        border-left-color: #4caf50;
        color: #2e7d32;
      }

      .user-message-warning {
        background-color: #fff8e1;
        border-left-color: #ff9800;
        color: #ef6c00;
      }

      .user-message-error {
        background-color: #ffebee;
        border-left-color: #f44336;
        color: #c62828;
      }

      @media (max-width: 480px) {
        .upload-options {
          flex-direction: column;
          align-items: center;
        }
        
        .upload-btn {
          width: 100%;
          max-width: 250px;
        }

        .user-message {
          font-size: 13px;
          padding: 8px 12px;
        }
      }
    `;

    document.head.appendChild(style);
    console.log('ImageUpload: CSS styles injected');
  }
}

// Make it available globally and export for ES modules
window.ImageUpload = ImageUpload;
export { ImageUpload };
