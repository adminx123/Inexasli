/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

function getCookie(name) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            const decodedValue = decodeURIComponent(cookieValue);
            console.log(`getCookie called for ${name}, stored value: ${cookieValue}`);
            console.log(`Decoded value for ${name}: ${decodedValue}`);
            
            // Assume the value is a timestamp if it’s a number
            const timestamp = parseInt(decodedValue, 10);
            if (isNaN(timestamp)) {
                console.error(`Invalid timestamp for ${name}: ${decodedValue}`);
                return null; // Not a valid number
            }
            return { value: '', timestamp }; // Return timestamp, no custom value needed
        }
    }
    
    console.log(`No cookie found for ${name}`);
    if (name.includes('_frequency')) return { value: 'annually', timestamp: 0 };
    if (name === 'RegionDropdown') return { value: 'NONE', timestamp: 0 };
    if (name === 'SubregionDropdown') return { value: '', timestamp: 0 };
    return { value: '', timestamp: 0 };
}

export { getCookie };