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
            try {
                const decodedValue = decodeURIComponent(cookieValue);
                console.log(`getCookie called for ${name}, stored value: ${cookieValue}`);
                console.log(`Decoded value for ${name}: ${decodedValue}`);
                
                // Parse the JSON stored by setCookie
                const parsedData = JSON.parse(decodedValue);
                const value = parsedData.value;
                const timestamp = parsedData.timestamp;

                // Apply your existing logic to the value
                if (value === '' || value === '0') {
                    if (name.includes('_frequency')) return { value: 'annually', timestamp };
                    return { value: '', timestamp };
                }

                if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(value)) {
                    console.log(`Invalid RegionDropdown value '${value}', returning 'NONE'`);
                    return { value: 'NONE', timestamp };
                }

                return { value, timestamp };
            } catch (e) {
                console.error(`Error parsing cookie ${name}: ${e.message}`);
                return null; // Invalid JSON
            }
        }
    }
    
    console.log(`No cookie found for ${name}`);
    if (name.includes('_frequency')) return { value: 'annually', timestamp: 0 };
    if (name === 'RegionDropdown') return { value: 'NONE', timestamp: 0 };
    if (name === 'SubregionDropdown') return { value: '', timestamp: 0 };
    return { value: '', timestamp: 0 };
}

export { getCookie };