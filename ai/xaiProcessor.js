/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

// xaiProcessor.js - Handles sending data to the Cloudflare Worker

// URL of your deployed Cloudflare Worker
const XAI_WORKER_URL = "https://xaiapi.4hm7q4q75z.workers.dev/";

/**
 * Collects selected data from grid items and sends it to the Cloudflare Worker
 * @param {string} gridItem - The type of grid item (e.g., 'symptomiq', 'calorieiq')
 * @returns {Promise<Object>} - The response from the xAI API
 */
export async function processSelectedData(gridItem) {
  try {
    // Collect selected data from the grid
    const selectedData = collectSelectedData();
    
    // Send data to Cloudflare Worker
    const response = await fetch(XAI_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        gridItem: gridItem,
        selectedData: selectedData
      }),
      mode: "cors"
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse and return the response
    const data = await response.json();
    
    // Save response to local storage
    saveResponseToLocalStorage(gridItem, data);
    
    return data;
  } catch (error) {
    console.error("Error processing data:", error);
    throw error;
  }
}

/**
 * Collects selected data from all grid items in the UI
 * @returns {Object} - Object containing all selected grid items
 */
function collectSelectedData() {
  const selectedData = {};
  
  // Get all grid containers
  const gridContainers = document.querySelectorAll('.grid-container');
  
  // For each grid container, get selected items
  gridContainers.forEach(container => {
    const containerId = container.id;
    selectedData[containerId] = [];
    
    // Get all selected items in this container
    const selectedItems = container.querySelectorAll('.grid-item.selected');
    selectedItems.forEach(item => {
      if (item.dataset.value) {
        selectedData[containerId].push(item.dataset.value);
      }
    });
  });
  
  return selectedData;
}

/**
 * Saves the response to local storage for future reference
 * @param {string} gridItem - The type of grid item
 * @param {Object} data - The response data
 */
function saveResponseToLocalStorage(gridItem, data) {
  const key = `xai_response_${gridItem}`;
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(`${key}_timestamp`, Date.now().toString());
}