# FormPersistence + ImageUpload Integration Guide

## Overview

The **FormPersistence** system and **ImageUpload** utility now work seamlessly together to store **ALL form data including images** in a single localStorage object. This creates a unified data structure that combines traditional form inputs, grid selections, AND uploaded images.

## How It Works

### 1. **Unified localStorage Structure**

All module data is stored under a single localStorage key using the pattern: `{moduleName}IqInput`

**Example for Fashion IQ:**
```javascript
// localStorage key: "fashionIqInput"
{
  "personalStyle": "Casual",
  "climate": "Temperate Climate", 
  "occasion": "Work",
  "age": "25",
  "height": "5'6",
  "gender": "woman",
  "additionalContext": "Looking for professional but comfortable outfits",
  "images": [
    {
      "id": 1703123456789.123,
      "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "name": "outfit1.jpg",
      "size": 245760,
      "type": "image/jpeg"
    },
    {
      "id": 1703123456790.456,
      "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "name": "outfit2.jpg", 
      "size": 389120,
      "type": "image/jpeg"
    }
  ]
}
```

### 2. **Auto-Detection and Integration**

The **ImageUpload** utility automatically:

1. **Detects the module context** from the URL path (e.g., `/fashion/` → `fashion`)
2. **Connects to the existing FormPersistence instance** (e.g., `window.fashionFormPersistence`)
3. **Automatically saves images** to the same localStorage object whenever images are added/removed
4. **Loads previously saved images** when the utility initializes

### 3. **Real-Time Synchronization**

- When a user **uploads an image**: ImageUpload automatically adds it to the FormPersistence data
- When a user **removes an image**: ImageUpload automatically updates the FormPersistence data  
- When a user **changes form fields**: FormPersistence includes any existing images in the save
- **No manual coordination required** - everything stays in sync automatically

## Implementation for New Modules

### Step 1: Include the ImageUpload Utility

```html
<script type="module">
import { ImageUpload } from '../../utility/imageUpload.js';

// Your module code here
</script>
```

### Step 2: Create Upload Container

```html
<div class="row1" data-step-label="Upload Photos">
    <div id="your-module-upload-container"></div>
</div>
```

### Step 3: Initialize ImageUpload

```javascript
function initializeImageUpload() {
  const imageUploader = new ImageUpload({
    maxFiles: 5,
    acceptedTypes: 'image/*',
    onFilesSelected: (images) => {
      console.log('Files selected:', images.length);
      // Images are automatically saved to FormPersistence
    },
    onError: (message) => {
      console.error('Upload error:', message);
      alert(message);
    }
  });

  // Initialize with your container ID
  imageUploader.initialize('your-module-upload-container', {
    cameraText: 'Take Photo',
    galleryText: 'Choose Photos', 
    dragText: 'Or drag and drop photos here',
    hintText: 'Upload photos for analysis'
  });
}
```

### Step 4: Collect Form Data

```javascript
function collectFormData() {
  if (window.yourModuleFormPersistence) {
    // This automatically includes images now!
    return window.yourModuleFormPersistence.collectFormData();
  }
}
```

## Data Flow Example

Here's what happens when a user interacts with a form that has both traditional inputs and image upload:

### User Actions → localStorage Updates

1. **User selects "Casual" style**
   ```javascript
   // localStorage["fashionIqInput"] 
   { "personalStyle": "Casual" }
   ```

2. **User enters age "25"**
   ```javascript
   // localStorage["fashionIqInput"]  
   { "personalStyle": "Casual", "age": "25" }
   ```

3. **User uploads first image**
   ```javascript
   // localStorage["fashionIqInput"]
   {
     "personalStyle": "Casual",
     "age": "25", 
     "images": [
       {
         "id": 1703123456789,
         "data": "data:image/jpeg;base64,...",
         "name": "outfit1.jpg",
         "size": 245760,
         "type": "image/jpeg"
       }
     ]
   }
   ```

4. **User uploads second image**
   ```javascript
   // localStorage["fashionIqInput"]
   {
     "personalStyle": "Casual",
     "age": "25",
     "images": [
       { /* first image */ },
       { /* second image */ }
     ]
   }
   ```

5. **User changes style to "Business"**
   ```javascript
   // localStorage["fashionIqInput"] 
   {
     "personalStyle": "Business", // Updated
     "age": "25",
     "images": [
       { /* first image */ },
       { /* second image */ } // Images preserved
     ]
   }
   ```

## Key Benefits

### ✅ **Unified Data Structure**
- Everything stored in one localStorage object
- No separate image storage keys to manage
- Consistent data access patterns

### ✅ **Automatic Synchronization** 
- Form changes include existing images
- Image changes preserve existing form data
- No manual coordination needed

### ✅ **Cross-Platform Compatibility**
- Uses HTML labels for Safari iOS compatibility
- Works on mobile (camera) and desktop (file picker)
- Drag-and-drop support

### ✅ **Persistent State**
- Images persist across page reloads
- Form data includes images on submission
- Consistent user experience

### ✅ **Easy Integration**
- Minimal code changes required
- Auto-detects module context
- Works with existing FormPersistence setup

## Technical Details

### Module Detection
The ImageUpload utility automatically detects the module from URL patterns:
```javascript
const modulePatterns = {
  '/fashion/': 'fashion',
  '/calorie/': 'calorie', 
  '/fitness/': 'fitness',
  '/income/': 'income',
  '/social/': 'social',
  '/research/': 'research'
};
```

### FormPersistence Connection
It looks for the FormPersistence instance on the window object:
```javascript
const instanceName = `${moduleType}FormPersistence`;
this.formPersistenceInstance = window[instanceName];
```

### Data Merging Strategy
When saving images, it:
1. Gets current FormPersistence data
2. Adds/updates the `images` array  
3. Saves the complete merged object back

### Image Data Format
Each image is stored as:
```javascript
{
  id: 1703123456789.123,        // Unique timestamp-based ID
  data: "data:image/jpeg;base64,/9j/...", // Base64 encoded image
  name: "filename.jpg",          // Original filename
  size: 245760,                  // File size in bytes
  type: "image/jpeg"             // MIME type
}
```

This integration ensures that images are treated as first-class form data, stored alongside all other user inputs in a unified, persistent data structure.
