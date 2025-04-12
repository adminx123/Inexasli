/* 
 * Copyright (c) 2025 INEXASLI. All rights reserved.
 * This code is protected under Canadian and international copyright laws.
 * Unauthorized use, reproduction, distribution, or modification of this code 
 * without explicit written permission via email from info@inexasli.com 
 * is strictly prohibited. Violators will be pursued and prosecuted to the 
 * fullest extent of the law in British Columbia, Canada, and applicable 
 * jurisdictions worldwide.
 */

import { setLocal } from '/server/scripts/setlocal.js';
import { getLocal } from '/server/scripts/getlocal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Handle solo/partner as exclusive selection
    const soloItem = document.getElementById('solo');
    const partnerItem = document.getElementById('partner');
    const fillingStatus = getLocal('fillingStatus');

    if (fillingStatus) {
        soloItem.classList.toggle('selected', fillingStatus === 'solo');
        partnerItem.classList.toggle('selected', fillingStatus === 'partner');
    }

    [soloItem, partnerItem].forEach(item => {
        item.addEventListener('click', () => {
            soloItem.classList.remove('selected');
            partnerItem.classList.remove('selected');
            item.classList.add('selected');
            setLocal('fillingStatus', item.id, 365);
        });
    });

    // Handle checkboxes
    ['dependants', 'debt'].forEach(id => {
        const item = document.getElementById(id);
        const value = getLocal(id);
        item.classList.toggle('selected', value === 'checked');
        if (value !== 'checked') {
            setLocal(id, 'unChecked', 365);
        }

        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            setLocal(id, item.classList.contains('selected') ? 'checked' : 'unChecked', 365);
        });
    });
});

window.nextPage = function() {
    window.location.href = './income.html';
};