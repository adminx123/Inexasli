/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

// Import utilities for localStorage operations and module detection
import { setJSON } from './setJSON.js';
import { getLocal } from './getlocal.js';

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
      
      // Load previously saved images (try module storage first, then FormPersistence)
      this.loadImagesFromModuleStorage(container);
      
      // Show appropriate warnings if needed
      this.showCameraWarnings(container, capabilities);
    });
    
    return true;
  }

  /**
   * Check camera capabilities and constraints (without requesting permission)
   */
  async checkCameraCapabilities() {
    const capabilities = {
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      canAccessCamera: null, // null = unknown, don't test until user action
      error: null
    };

    // Check if permissions API is available to query existing permissions
    if ('permissions' in navigator && capabilities.hasGetUserMedia) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        capabilities.permissionState = permissionStatus.state;
        
        // Only set canAccessCamera to true if already granted
        if (permissionStatus.state === 'granted') {
          capabilities.canAccessCamera = true;
        } else if (permissionStatus.state === 'denied') {
          capabilities.canAccessCamera = false;
          capabilities.error = 'NotAllowedError';
        }
        // If 'prompt', leave canAccessCamera as null
        
      } catch (error) {
        console.log('ImageUpload: Permissions API not available:', error.message);
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
    } else if (capabilities.permissionState === 'denied') {
      warningMessage = '⚠️ Camera permission denied. You can grant permission in your browser settings, or use "Choose from Gallery".';
    } else if (capabilities.permissionState === 'granted') {
      // Camera is available and permission already granted - no warning needed
      return;
    }
    // For 'prompt' or unknown states, don't show a warning - let the user try

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
   * Auto-detect module context using lastGridItemUrl and connect to FormPersistence
   */
  detectModuleAndConnectFormPersistence() {
    // Primary method: detect module from lastGridItemUrl
    const lastGridItemUrl = getLocal('lastGridItemUrl');
    if (lastGridItemUrl) {
      const modulePatterns = {
        '/ai/fashion/': 'fashion',
        '/ai/calorie/': 'calorie',
        '/ai/fitness/': 'fitness',
        '/ai/income/': 'income',
        '/ai/social/': 'social',
        '/ai/research/': 'research',
        '/ai/event/': 'event',
        '/ai/decision/': 'decision',
        '/ai/enneagram/': 'enneagram',
        '/ai/philosophy/': 'philosophy',
        '/ai/quiz/': 'quiz'
      };

      for (const [pattern, module] of Object.entries(modulePatterns)) {
        if (lastGridItemUrl.includes(pattern)) {
          this.moduleType = module;
          console.log('ImageUpload: Detected module from lastGridItemUrl:', module);
          break;
        }
      }
    }

    // Fallback: detect module from current URL
    if (!this.moduleType) {
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
          console.log('ImageUpload: Detected module from URL fallback:', module);
          break;
        }
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
   * Save images directly to module's localStorage (primary method)
   */
  saveToModuleStorage() {
    if (!this.moduleType) {
      console.warn('ImageUpload: No module type detected, cannot save to module storage');
      return;
    }

    try {
      const storageKey = `${this.moduleType}IqInput`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // Add images to the data
      existingData.images = this.uploadedImages.map(img => ({
        id: img.id,
        data: img.data,
        name: img.name,
        size: img.size,
        type: img.type
      }));

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(existingData));
      console.log(`ImageUpload: Saved ${this.uploadedImages.length} images to ${storageKey}`);
    } catch (error) {
      console.error('ImageUpload: Error saving to module storage:', error);
    }
  }

  /**
   * Save images to FormPersistence localStorage (fallback method)
   */
  saveImagesToFormPersistence() {
    if (!this.formPersistenceInstance) {
      return; // No warning since this is fallback
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
   * Load images from module localStorage (primary method)
   */
  loadImagesFromModuleStorage(container) {
    if (!this.moduleType) {
      console.warn('ImageUpload: No module type detected, cannot load from module storage');
      return;
    }

    try {
      const storageKey = `${this.moduleType}IqInput`;
      const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      if (savedData.images && Array.isArray(savedData.images)) {
        this.uploadedImages = savedData.images;
        
        // Display loaded images
        savedData.images.forEach(imageData => {
          this.displayUploadedImage(imageData, container);
        });
        
        console.log(`ImageUpload: Loaded ${savedData.images.length} images from ${storageKey}`);
        
        if (this.onFilesSelected) {
          this.onFilesSelected(this.uploadedImages);
        }
      }
    } catch (error) {
      console.error('ImageUpload: Error loading from module storage:', error);
    }
  }

  /**
   * Load images from FormPersistence localStorage (fallback method)
   */
  loadImagesFromFormPersistence(container) {
    if (!this.formPersistenceInstance) {
      return; // No warning since this is fallback
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
      console.log('ImageUpload: Event type:', e.type);
      console.log('ImageUpload: Event target:', e.target.tagName, e.target.className);
      console.log('ImageUpload: Camera input element:', cameraInput);
      console.log('ImageUpload: Camera input attributes:', cameraInput.outerHTML);
      
      // Always trigger the input manually for better cross-platform compatibility
      // Prevent default to avoid potential double-firing
      e.preventDefault();
      
      console.log('ImageUpload: Triggering camera input');
      
      try {
        // Try focusing first (sometimes helps on iOS)
        cameraInput.focus();
        
        // Then click
        cameraInput.click();
        
        console.log('ImageUpload: Camera input click executed successfully');
      } catch (error) {
        console.error('ImageUpload: Error clicking camera input:', error);
      }
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
      
      // Always trigger the input manually for better cross-platform compatibility
      e.preventDefault();
      
      console.log('ImageUpload: Triggering gallery input');
      galleryInput.click();
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
      
      // Save to both storage systems
      this.saveToModuleStorage();
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

// Global instance for centralized image management
let globalImageUploader = null;
let autoInitialized = false;

/**
 * Module-specific configurations
 */
const MODULE_CONFIGS = {
  fashion: {
    containerId: 'fashion-upload-container',
    generateBtnId: 'generate-fashion-btn',
    maxFiles: 5,
    cameraText: 'Take Photo',
    galleryText: 'Choose from Gallery',
    dragText: 'Or drag and drop photos here',
    hintText: 'Upload 1-5 photos of yourself in different outfits',
    requiredForGenerate: true
  },
  calorie: {
    containerId: 'calorie-upload-container',
    generateBtnId: 'generate-calorie-btn',
    maxFiles: 3,
    cameraText: 'Take Photo',
    galleryText: 'Choose from Gallery',
    dragText: 'Or drag and drop photos here',
    hintText: 'Upload 1-3 photos of your food',
    requiredForGenerate: true
  },
  fitness: {
    containerId: 'fitness-upload-container',
    generateBtnId: 'generate-fitness-btn',
    maxFiles: 5,
    cameraText: 'Take Photo',
    galleryText: 'Choose from Gallery',
    dragText: 'Or drag and drop photos here',
    hintText: 'Upload photos for fitness analysis',
    requiredForGenerate: false
  },
  // Add more modules as needed
  income: {
    containerId: 'income-upload-container',
    generateBtnId: 'generate-income-btn',
    maxFiles: 10,
    cameraText: 'Take Photo',
    galleryText: 'Choose from Gallery',
    dragText: 'Or drag and drop photos here',
    hintText: 'Upload financial documents or receipts',
    requiredForGenerate: false
  }
};

/**
 * Auto-detect and initialize image upload for the current module
 * This function runs automatically and handles everything
 */
function autoInitializeImageUpload() {
  if (autoInitialized) {
    console.log('ImageUpload: Already auto-initialized, skipping');
    return; // Already initialized
  }

  console.log('ImageUpload: Starting auto-initialization...');

  // Detect module type
  let moduleType = null;
  const lastGridItemUrl = getLocal('lastGridItemUrl');
  
  console.log('ImageUpload: lastGridItemUrl:', lastGridItemUrl);
  
  if (lastGridItemUrl) {
    const modulePatterns = {
      '/ai/fashion/': 'fashion',
      '/ai/calorie/': 'calorie',
      '/ai/fitness/': 'fitness',
      '/ai/income/': 'income',
      '/ai/social/': 'social',
      '/ai/research/': 'research',
      '/ai/event/': 'event',
      '/ai/decision/': 'decision'
    };
    
    for (const [pattern, module] of Object.entries(modulePatterns)) {
      if (lastGridItemUrl.includes(pattern)) {
        moduleType = module;
        console.log('ImageUpload: Detected module from lastGridItemUrl:', moduleType);
        break;
      }
    }
  }

  // Fallback: detect from current URL
  if (!moduleType) {
    const url = window.location.href;
    console.log('ImageUpload: Trying URL fallback:', url);
    
    if (url.includes('/fashion/')) moduleType = 'fashion';
    else if (url.includes('/calorie/')) moduleType = 'calorie';
    else if (url.includes('/fitness/')) moduleType = 'fitness';
    else if (url.includes('/income/')) moduleType = 'income';
    
    if (moduleType) {
      console.log('ImageUpload: Detected module from URL fallback:', moduleType);
    }
  }

  // Extra fallback: check for specific container IDs in the DOM
  if (!moduleType) {
    console.log('ImageUpload: Trying container ID detection...');
    
    if (document.getElementById('fashion-upload-container')) moduleType = 'fashion';
    else if (document.getElementById('calorie-upload-container')) moduleType = 'calorie';
    else if (document.getElementById('fitness-upload-container')) moduleType = 'fitness';
    else if (document.getElementById('income-upload-container')) moduleType = 'income';
    
    if (moduleType) {
      console.log('ImageUpload: Detected module from container ID:', moduleType);
    }
  }

  if (!moduleType || !MODULE_CONFIGS[moduleType]) {
    console.log('ImageUpload: No supported module detected, available modules:', Object.keys(MODULE_CONFIGS));
    console.log('ImageUpload: Current URL:', window.location.href);
    console.log('ImageUpload: Available containers in DOM:', 
      Object.keys(MODULE_CONFIGS).map(m => MODULE_CONFIGS[m].containerId).filter(id => document.getElementById(id))
    );
    return;
  }

  console.log('ImageUpload: Auto-detected module:', moduleType);

  const config = MODULE_CONFIGS[moduleType];
  console.log('ImageUpload: Using config:', config);
  
  // Wait for DOM elements to be available
  const waitForElements = () => {
    const container = document.getElementById(config.containerId);
    const generateBtn = document.getElementById(config.generateBtnId);
    
    console.log('ImageUpload: Looking for container:', config.containerId, 'Found:', !!container);
    console.log('ImageUpload: Looking for generate button:', config.generateBtnId, 'Found:', !!generateBtn);
    
    if (!container) {
      console.log('ImageUpload: Container not found yet, retrying in 100ms...');
      setTimeout(waitForElements, 100);
      return;
    }

    console.log('ImageUpload: Found container, proceeding with initialization...');

    // Create global instance
    if (!globalImageUploader) {
      console.log('ImageUpload: Creating new global instance...');
      globalImageUploader = new ImageUpload({
        maxFiles: config.maxFiles,
        acceptedTypes: 'image/*',
        onFilesSelected: (images) => {
          console.log(`ImageUpload: ${moduleType} - Files selected:`, images.length);
          updateGenerateButtonState(moduleType);
          updateGlobalImageState();
        },
        onError: (message) => {
          console.error(`ImageUpload: ${moduleType} - Error:`, message);
          alert(message);
        }
      });
    }

    // Initialize the upload interface
    console.log('ImageUpload: Initializing upload interface...');
    const success = globalImageUploader.initialize(config.containerId, {
      cameraText: config.cameraText,
      galleryText: config.galleryText,
      dragText: config.dragText,
      hintText: config.hintText
    });

    if (success) {
      console.log(`ImageUpload: ${moduleType} - Auto-initialized successfully`);
      autoInitialized = true;
      
      // Set initial generate button state
      updateGenerateButtonState(moduleType);
      
      console.log('ImageUpload: Auto-initialization complete!');
    } else {
      console.error(`ImageUpload: ${moduleType} - Auto-initialization failed`);
    }
  };

  // Start waiting for elements
  waitForElements();
}

/**
 * Update generate button state for a specific module
 */
function updateGenerateButtonState(moduleType) {
  const config = MODULE_CONFIGS[moduleType];
  if (!config) return;

  const generateBtn = document.getElementById(config.generateBtnId);
  if (!generateBtn) return;

  const images = getImageUploadImages();
  const hasImages = images.length > 0;

  // If images are required for this module, disable button when no images
  if (config.requiredForGenerate) {
    generateBtn.disabled = !hasImages;
  }

  console.log(`ImageUpload: ${moduleType} - Generate button state updated (${hasImages ? 'enabled' : 'disabled'})`);
}

/**
 * Manual initialization function (for custom cases)
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options
 * @returns {boolean} - Success status
 */
function initImageUpload(containerId, options = {}) {
  console.log('ImageUpload: Manual initialization for container:', containerId);
  
  try {
    // Create global instance if it doesn't exist
    if (!globalImageUploader) {
      globalImageUploader = new ImageUpload({
        maxFiles: options.maxFiles || 5,
        acceptedTypes: options.acceptedTypes || 'image/*',
        onFilesSelected: (images) => {
          console.log('ImageUpload: Manual - Files selected:', images.length);
          if (options.onFilesSelected) {
            options.onFilesSelected(images);
          }
          updateGlobalImageState();
        },
        onError: (message) => {
          console.error('ImageUpload: Manual - Error:', message);
          if (options.onError) {
            options.onError(message);
          } else {
            alert(message);
          }
        }
      });
    }

    // Initialize the upload interface
    const success = globalImageUploader.initialize(containerId, {
      cameraText: options.cameraText || 'Take Photo',
      galleryText: options.galleryText || 'Choose from Gallery',
      dragText: options.dragText || 'Or drag and drop photos here',
      hintText: options.hintText || 'Upload photos for analysis'
    });

    if (success) {
      console.log('ImageUpload: Manual initialization successful');
      return true;
    } else {
      console.error('ImageUpload: Manual initialization failed');
      return false;
    }
  } catch (error) {
    console.error('ImageUpload: Manual initialization error:', error);
    return false;
  }
}

/**
 * Get images from the global uploader instance
 * @returns {Array} - Array of uploaded images
 */
function getImageUploadImages() {
  if (globalImageUploader) {
    return globalImageUploader.getImages();
  }
  return [];
}

/**
 * Update global state when images change
 */
function updateGlobalImageState() {
  // Notify any listening components about image state changes
  const event = new CustomEvent('global-images-changed', {
    detail: {
      count: globalImageUploader ? globalImageUploader.getImages().length : 0,
      images: globalImageUploader ? globalImageUploader.getImages() : []
    }
  });
  document.dispatchEvent(event);
}

/**
 * Clear all uploaded images
 */
function clearImageUpload() {
  if (globalImageUploader) {
    // Note: clearImages expects a container parameter, but we don't have access to it here
    // So we'll clear the internal array and update state
    globalImageUploader.uploadedImages = [];
    
    // Save the cleared state to both storage systems
    globalImageUploader.saveToModuleStorage();
    globalImageUploader.saveImagesToFormPersistence();
    
    // Trigger callbacks
    if (globalImageUploader.onFilesSelected) {
      globalImageUploader.onFilesSelected([]);
    }
    
    updateGlobalImageState();
    
    // Manually clear any existing uploaded images containers in the DOM
    const uploadedContainers = document.querySelectorAll('.uploaded-images');
    uploadedContainers.forEach(container => {
      container.innerHTML = '';
    });
  }
}

// Make everything available globally and auto-initialize
window.ImageUpload = ImageUpload;
window.initImageUpload = initImageUpload;
window.getImageUploadImages = getImageUploadImages;
window.clearImageUpload = clearImageUpload;
window.autoInitializeImageUpload = autoInitializeImageUpload; // Expose for manual triggering

// Auto-initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('ImageUpload: DOMContentLoaded triggered, auto-initializing...');
    autoInitializeImageUpload();
  });
} else {
  // DOM is already ready
  console.log('ImageUpload: DOM already ready, auto-initializing...');
  setTimeout(autoInitializeImageUpload, 50);
}

// Also auto-initialize when loaded through datain.js
document.addEventListener('data-in-loaded', function(e) {
  console.log('ImageUpload: Detected load through datain.js, auto-initializing');
  setTimeout(autoInitializeImageUpload, 100);
});

// Export for ES modules
export { ImageUpload, initImageUpload, getImageUploadImages, clearImageUpload };
