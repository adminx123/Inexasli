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
 * Cache Buster Utility - Centralized cache busting for all assets
 * Prevents browser caching issues by appending version parameters to URLs
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        version: '1.0.0',           // Update this to force cache refresh
        useTimestamp: false,        // Set to true to use timestamp instead of version
        paramName: 'v',             // Query parameter name for cache busting
        enabled: true               // Global enable/disable toggle
    };
    
    /**
     * Main cache busting function
     * @param {string} url - The URL to add cache busting to
     * @param {Object} options - Optional configuration overrides
     * @returns {string} - The cache busted URL
     */
    function cacheBust(url, options = {}) {
        // Check if cache busting is enabled
        if (!config.enabled && !options.force) {
            return url;
        }
        
        // Skip if URL is already cache busted
        if (url.includes(config.paramName + '=')) {
            return url;
        }
        
        // Determine cache busting value
        const bustValue = options.useTimestamp || (config.useTimestamp && !options.version) 
            ? Date.now() 
            : options.version || config.version;
        
        const paramName = options.paramName || config.paramName;
        const separator = url.includes('?') ? '&' : '?';
        
        return `${url}${separator}${paramName}=${bustValue}`;
    }
    
    /**
     * Cache bust multiple URLs at once
     * @param {Array} urls - Array of URLs to cache bust
     * @param {Object} options - Optional configuration overrides
     * @returns {Array} - Array of cache busted URLs
     */
    function cacheBustMultiple(urls, options = {}) {
        return urls.map(url => cacheBust(url, options));
    }
    
    /**
     * Cache bust and preload a resource
     * @param {string} url - The URL to preload
     * @param {string} type - Resource type (script, style, image, etc.)
     * @param {Object} options - Optional configuration overrides
     */
    function preloadWithCacheBust(url, type = 'script', options = {}) {
        const bustedUrl = cacheBust(url, options);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = bustedUrl;
        link.as = type;
        document.head.appendChild(link);
        return bustedUrl;
    }
    
    /**
     * Load a script with cache busting
     * @param {string} url - Script URL
     * @param {Object} options - Loading options
     * @returns {Promise} - Promise that resolves when script loads
     */
    function loadScript(url, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const bustedUrl = cacheBust(url, options.cacheBust || {});
            
            script.src = bustedUrl;
            script.async = options.async !== false;
            script.defer = options.defer || false;
            
            if (options.type) {
                script.type = options.type;
            }
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${bustedUrl}`));
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load a stylesheet with cache busting
     * @param {string} url - Stylesheet URL
     * @param {Object} options - Loading options
     * @returns {Promise} - Promise that resolves when stylesheet loads
     */
    function loadStylesheet(url, options = {}) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            const bustedUrl = cacheBust(url, options.cacheBust || {});
            
            link.rel = 'stylesheet';
            link.href = bustedUrl;
            
            if (options.media) {
                link.media = options.media;
            }
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load stylesheet: ${bustedUrl}`));
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * Update the global configuration
     * @param {Object} newConfig - New configuration values
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
        console.log('[CacheBuster] Configuration updated:', config);
    }
    
    /**
     * Get current configuration
     * @returns {Object} - Current configuration
     */
    function getConfig() {
        return { ...config };
    }
    
    /**
     * Enable cache busting
     */
    function enable() {
        config.enabled = true;
        console.log('[CacheBuster] Cache busting enabled');
    }
    
    /**
     * Disable cache busting
     */
    function disable() {
        config.enabled = false;
        console.log('[CacheBuster] Cache busting disabled');
    }
    
    /**
     * Force refresh by updating version to current timestamp
     */
    function forceRefresh() {
        config.version = Date.now().toString();
        console.log('[CacheBuster] Forced refresh - new version:', config.version);
    }
    
    // Create the global cache buster object
    const CacheBuster = {
        cacheBust,
        cacheBustMultiple,
        preloadWithCacheBust,
        loadScript,
        loadStylesheet,
        updateConfig,
        getConfig,
        enable,
        disable,
        forceRefresh,
        version: config.version
    };
    
    // Expose to global scope
    window.cacheBuster = CacheBuster;
    
    // Also expose individual functions for convenience
    window.cacheBust = cacheBust;
    
    // Log successful initialization
    console.log('[CacheBuster] Utility loaded with config:', config);
    
})();
