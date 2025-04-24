/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be prosecuted to the fullest extent 
 * of the law in British Columbia, Canada, and applicable jurisdictions worldwide.
 */

import { setCookie } from '/utility/setcookie.js';
import { getCookie } from '/utility/getcookie.js';

document.addEventListener('DOMContentLoaded', function () {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    const personalBtn = document.getElementById('personal-btn');
    const termsCheckbox = document.getElementById('termscheckbox');

    // Debugging: Log cookie and element status
    console.log('Cookie check:', { promptCookie, isCookieExpired, currentTime });
    console.log('Initial DOM check:', { personalBtn, termsCheckbox });

    if (!isCookieExpired) {
        // Cookie is less than 10 minutes old: redirect to landing page
        window.location.href = '/ai/landing/landing.html';
        return; // Exit early
    }

    if (personalBtn) {
        personalBtn.addEventListener('click', (e) => {
            console.log('Personal button clicked, checkbox state:', termsCheckbox?.checked);

            if (!termsCheckbox) {
                console.error('Terms checkbox not found');
                alert("Error: Terms checkbox not found. Please refresh the page.");
                return;
            }

            if (!termsCheckbox.checked) {
                e.preventDefault();
                alert("Please agree to the Terms of Service before accessing the Promptemplates™");
                return;
            }

            // Set new cookie when terms are accepted
            setCookie("prompt", Date.now(), 32);

            // Redirect to landing page
            window.location.href = '/ai/landing/landing.html';
        });
    } else {
        console.error('Personal button not found');
    }
});