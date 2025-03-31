window.closeWarning = function () {
    const warningElement = document.querySelector('.warning-parent');
    if (warningElement) {
        warningElement.remove();
    }
};


export function displayWarning(content = 'No changes made.') {
    

    const warning = `
    <div class="warning-parent" >
        <div class="warning-content">
            <h2>WARNING</h2>
            <p>${content}</p>
            <button class="warning-close-btn" onclick="closeWarning()">Got it</button>
        </div>
    </div>`;




    document.body.insertAdjacentHTML('beforeend', warning);
}
    







