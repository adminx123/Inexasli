import { getLocal } from '/server/scripts/getlocal.js';

function closeWarning() {
    const warningElement = document.querySelector('.warning-parent');
    if (warningElement) {
        warningElement.remove();
    }
}

function displayWarning(content) {
    const warning = `
    <div class="warning-parent">
        <style>
            .warning-parent {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .warning-content {
                background-color: white;
                width: 92%;
                max-width: 600px;
                padding: 10px;
                min-height: 200px;
                height: auto;
                max-height: 550px;
                border-radius: 20px;
                border: 54px solid rgb(0, 0, 0);
                box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.05);
            }

            .warning-content h2 {
                font-size: 2rem;
            }

            .warning-close-btn {
                padding: 10px 20px;
                border-radius: 0;
                font-weight: bold;
                float: right;
            }

            .warning-close-btn:hover {
                filter: opacity(90%);
            }
        </style>
        <div class="warning-content">
            <h2>WARNING</h2>
            <p>${content}</p>
            <button class="warning-close-btn">Got it</button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', warning);
    const closeBtn = document.querySelector('.warning-close-btn:last-of-type');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWarning);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const romanticliabilityCookie = getLocal('romanticliability');
    const romanticincomeCookie = getLocal('romanticincome');
    const romanticexpenseCookie = getLocal('romanticexpense');
    const romanticassetCookie = getLocal('romanticasset');

    if (romanticliabilityCookie === 'checked' && pathname.includes('liability')) {
        displayWarning("You've indicated that you have joint liabilities with your romantic partner. Please enter the current value of the liabilities and your corresponding percentage of responsibility.");
    }

    if (romanticincomeCookie === 'checked' && pathname.includes('income')) {
        displayWarning("You have indicated that you share one or more sources of income. Include only your portion of personal income here.");
    }

    if (romanticexpenseCookie === 'checked' && pathname.includes('expense')) {
        displayWarning("You've indicated that you share expenses with your romantic partner. Include only your portion of the expenditures here.");
    }

    if (romanticassetCookie === 'checked' && pathname.includes('asset')) {
        displayWarning("You have indicated that you own one or more assets jointly with your romantic partner. Please enter the market value of the assets and your corresponding percentage of ownership.");
    }
});