/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */ 

// getLocal.js
function getCookie(name) {
    const value = localStorage.getItem(name);
    console.log(`getLocal called for ${name}, stored value: ${value}`);
    
    if (value !== null) {
        const decodedValue = decodeURIComponent(value);
        console.log(`Decoded value for ${name}: ${decodedValue}`);
        
        if (decodedValue === '' || decodedValue === '0') {
            if (name.includes('_frequency')) return 'annually';
            return '';
        }
        
        if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(decodedValue)) {
            console.log(`Invalid RegionDropdown value '${decodedValue}', returning 'NONE'`);
            return 'NONE';
        }
        
        return decodedValue;
    } else {
        console.log(`No value found for ${name}`);
        if (name.includes('_frequency')) return 'annually';
        if (name === 'RegionDropdown') return 'NONE';
        if (name === 'SubregionDropdown') return '';
        return '';
    }
}

export { getCookie };