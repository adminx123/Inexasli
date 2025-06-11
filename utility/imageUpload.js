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
 * ImageUpload Utility
 * Handles camera and gallery image uploads with mobile device support
 */
class ImageUpload {
  constructor(options = {}) {
    this.maxFiles = options.maxFiles || 5;
    this.acceptedTypes = options.acceptedTypes || 'image/*';
    this.onFilesSelected = options.onFilesSelected || null;
    this.onError = options.onError || null;
    this.uploadedImages = [];
    
    console.log('ImageUpload: Initialized with options:', options);
  }

  /**
   * Initialize the upload functionality for a container
   * @param {string} containerId - ID of the container element
   * @param {Object} config - Configuration object
   */
  initialize(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('ImageUpload: Container not found:', containerId);
      return false;
    }

    console.log('ImageUpload: Initializing for container:', containerId);

    // Create the upload interface
    this.createUploadInterface(container, config);
    this.setupEventListeners(container);
    
    return true;
  }

  /**
   * Create the upload interface HTML
   */
  createUploadInterface(container, config) {
    const cameraText = config.cameraText || 'Take Photo';
    const galleryText = config.galleryText || 'Choose from Gallery';
    const dragText = config.dragText || 'Or drag and drop photos here';
    const hintText = config.hintText || `Upload 1-${this.maxFiles} photos`;

    container.innerHTML = `
      <div class="image-upload-container">
        <div class="upload-options">
          <button class="upload-btn camera-btn" data-action="camera">
            <i class="fas fa-camera"></i>
            <span>${cameraText}</span>
          </button>
          <button class="upload-btn gallery-btn" data-action="gallery">
            <i class="fas fa-images"></i>
            <span>${galleryText}</span>
          </button>
        </div>
        <div class="upload-area" data-action="drag">
          <i class="fas fa-cloud-upload-alt upload-icon"></i>
          <p>${dragText}</p>
          <p class="upload-hint">${hintText}</p>
        </div>
        <input type="file" class="camera-input" accept="${this.acceptedTypes}" capture="environment" style="display: none;">
        <input type="file" class="gallery-input" multiple accept="${this.acceptedTypes}" style="display: none;">
        <div class="uploaded-images"></div>
      </div>
    `;

    // Add CSS if not already present
    this.injectCSS();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(container) {
    const cameraBtn = container.querySelector('.camera-btn');
    const galleryBtn = container.querySelector('.gallery-btn');
    const uploadArea = container.querySelector('.upload-area');
    const cameraInput = container.querySelector('.camera-input');
    const galleryInput = container.querySelector('.gallery-input');

    if (!cameraBtn || !galleryBtn || !uploadArea || !cameraInput || !galleryInput) {
      console.error('ImageUpload: Required elements not found in container');
      return;
    }

    // Camera button events
    cameraBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('ImageUpload: Camera button clicked');
      this.triggerInput(cameraInput);
    });

    cameraBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log('ImageUpload: Camera button touched');
      // Use setTimeout to ensure iOS processes the touch properly
      setTimeout(() => this.triggerInput(cameraInput), 100);
    });

    // Gallery button events
    galleryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('ImageUpload: Gallery button clicked');
      this.triggerInput(galleryInput);
    });

    galleryBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log('ImageUpload: Gallery button touched');
      setTimeout(() => this.triggerInput(galleryInput), 100);
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files, container);
    });

    // File input change events
    cameraInput.addEventListener('change', (e) => {
      console.log('ImageUpload: Camera input changed');
      this.handleFiles(e.target.files, container);
      e.target.value = ''; // Reset for repeated use
    });

    galleryInput.addEventListener('change', (e) => {
      console.log('ImageUpload: Gallery input changed');
      this.handleFiles(e.target.files, container);
      e.target.value = ''; // Reset for repeated use
    });
  }

  /**
   * Trigger file input click with proper iOS handling
   */
  triggerInput(input) {
    try {
      // Create a new event to ensure iOS compatibility
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      
      console.log('ImageUpload: Triggering input click');
      input.dispatchEvent(event);
      
      // Fallback for older browsers/devices
      if (input.click) {
        input.click();
      }
    } catch (error) {
      console.error('ImageUpload: Error triggering input:', error);
      if (this.onError) {
        this.onError('Failed to open file selector');
      }
    }
  }

  /**
   * Handle selected files
   */
  handleFiles(files, container) {
    console.log('ImageUpload: Handling files:', files.length);
    
    const remainingSlots = this.maxFiles - this.uploadedImages.length;
    
    if (remainingSlots <= 0) {
      const message = `Maximum ${this.maxFiles} images allowed. Please remove some images first.`;
      console.warn('ImageUpload:', message);
      if (this.onError) {
        this.onError(message);
      } else {
        alert(message);
      }
      return;
    }

    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.warn('ImageUpload: Skipping non-image file:', file.name);
        continue;
      }

      this.processFile(file, container);
    }
  }

  /**
   * Process individual file
   */
  processFile(file, container) {
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
      
      if (this.onFilesSelected) {
        this.onFilesSelected(this.uploadedImages);
      }
    };
    
    reader.onerror = () => {
      const message = `Failed to read file: ${file.name}`;
      console.error('ImageUpload:', message);
      if (this.onError) {
        this.onError(message);
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
    
    if (this.onFilesSelected) {
      this.onFilesSelected(this.uploadedImages);
    }
  }

  /**
   * Get all uploaded images
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
      }

      .upload-btn:hover {
        background-color: #2d5d3d;
        border-color: #2d5d3d;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
      }

      .upload-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(74, 124, 89, 0.3);
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
      }

      .upload-area.drag-over {
        border-color: #2d5d3d;
        background-color: #f0f8f0;
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

      @media (max-width: 480px) {
        .upload-options {
          flex-direction: column;
          align-items: center;
        }
        
        .upload-btn {
          width: 100%;
          max-width: 250px;
        }
      }
    `;

    document.head.appendChild(style);
    console.log('ImageUpload: CSS styles injected');
  }
}

// Make it available globally
window.ImageUpload = ImageUpload;
