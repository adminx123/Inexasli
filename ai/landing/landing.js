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

document.addEventListener('DOMContentLoaded', function () {
    // Set the "prompt" cookie on page load
    setCookie("prompt", Date.now(), 32);

    // Monitor terms checkbox state
    const termsCheckbox = document.getElementById('termscheckbox');
    const introDiv = document.getElementById('intro');
    const personalBtn = document.getElementById('personal-btn');
    const getGridContainer = () => document.querySelector('.containerround:not(#intro .containerround)');

    // Debugging: Log element availability
    console.log('Initial DOM check:', { termsCheckbox, introDiv, personalBtn, gridContainer: getGridContainer() });

    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function () {
            const gridContainer = getGridContainer();
            console.log('Checkbox state changed:', { checked: this.checked, introDiv, gridContainer });

            if (!introDiv || !gridContainer) {
                console.error('Missing elements:', { introDiv, gridContainer });
                return;
            }

            if (!this.checked) {
                // When unchecked, show intro, hide grid, and remove selected state
                introDiv.classList.remove('hidden');
                gridContainer.classList.add('hidden');
                if (personalBtn) personalBtn.classList.remove('selected');
            }
            // No action when checked; wait for personal-btn click
        });
    } else {
        console.error('Terms checkbox not found');
    }

    // Personal button event listener
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

            const gridContainer = getGridContainer();
            if (!introDiv || !gridContainer) {
                console.error('Missing elements:', { introDiv, gridContainer });
                return;
            }

            // Hide intro and show grid container
            introDiv.classList.add('hidden');
            gridContainer.classList.remove('hidden');
            personalBtn.classList.add('selected');

            // Scroll to grid container
            const targetSection = gridContainer;
            if (targetSection) {
                const sectionHeight = targetSection.offsetHeight;
                const windowHeight = window.innerHeight;
                const scrollPosition = targetSection.getBoundingClientRect().top + window.scrollY - (windowHeight - sectionHeight) / 2;
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        });
    } else {
        console.error('Personal button not found');
    }
});