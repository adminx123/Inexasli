/*
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setCookie } from '/utility/setcookie.js';
import { getCookie } from '/utility/getcookie.js';

document.addEventListener('DOMContentLoaded', function () {
    // Check if the "prompt" cookie is more than 10 minutes old
    const promptCookie = getCookie("prompt");
    const currentTime = Date.now();
    const cookieDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const isCookieExpired = !promptCookie || parseInt(promptCookie) + cookieDuration < currentTime;

    const introDiv = document.getElementById('intro');
    const personalBtn = document.getElementById('personal-btn');
    const termsCheckbox = document.getElementById('termscheckbox');
    const gridContainer = document.querySelector('.containerround:not(#intro .containerround)');

    // Debugging: Log cookie and element status
    console.log('Cookie check:', { promptCookie, isCookieExpired, currentTime });
    console.log('Initial DOM check:', { introDiv, personalBtn, termsCheckbox, gridContainer });

    if (!isCookieExpired) {
        // Cookie is less than 10 minutes old: skip sales page, show grid container
        if (introDiv && gridContainer) {
            introDiv.classList.add('hidden');
            gridContainer.classList.remove('hidden');
            if (personalBtn) personalBtn.classList.add('selected');

            // Scroll to grid container
            if (gridContainer) {
                const sectionHeight = gridContainer.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollPosition = gridContainer.getBoundingClientRect().top + window.scrollY - (windowHeight - sectionHeight) / 2;
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        } else {
            console.error('Missing elements for non-expired cookie:', { introDiv, gridContainer });
        }
        return; // Exit early
    }

    // Cookie is expired or missing: show sales page
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function () {
            console.log('Checkbox state changed:', { checked: this.checked, introDiv, gridContainer });

            if (!introDiv || !gridContainer) {
                console.error('Missing elements:', { introDiv, gridContainer });
                return;
            }

            if (!this.checked) {
                // When unchecked, show intro, hide grid, remove selected state
                introDiv.classList.remove('hidden');
                gridContainer.classList.add('hidden');
                if (personalBtn) personalBtn.classList.remove('selected');
            }
        });
    } else {
        console.error('Terms checkbox not found');
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

            if (!introDiv || !gridContainer) {
                console.error('Missing elements:', { introDiv, gridContainer });
                return;
            }

            // Set new cookie when terms are accepted
            setCookie("prompt", Date.now(), 32);

            // Hide intro and show grid container
            introDiv.classList.add('hidden');
            gridContainer.classList.remove('hidden');
            personalBtn.classList.add('selected');

            // Scroll to grid container
            if (gridContainer) {
                const sectionHeight = gridContainer.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollPosition = gridContainer.getBoundingClientRect().top + window.scrollY - (windowHeight - sectionHeight) / 2;
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        });
    } else {
        console.error('Personal button not found');
    }
});