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
function getLocal(name) {
    const value = localStorage.getItem(name);
    console.log(`getLocal called for ${name}, stored value: ${value}`);
    return value !== null ? decodeURIComponent(value) : '';
}

export { getLocal };