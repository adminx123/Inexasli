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
    


// i hope this is what you meant by the below

// Create a show hide script or take the one for USA or CANADA that is located in the income.js file and and do the same thing so I can call the script to any page in the future. 

// hide show for id

export function hideShow(id, task)  {
    const element = document.getElementById(id);
    if (element) {
        if (task === 'hide') {
            element.style.display = 'none';
        } else if (task ==='show') {
            element.style.display = 'block';
        }
    } else {
        alert(`No element with id '${id}' found.`);
        console.error(`No element with id '${id}' found.`);
    }


}

// hide show for class

export function hideShowClass(className, task) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        if (element) {
            if (task === 'hide') {
                element.style.display = 'none';
            } else if (task ==='show') {
                element.style.display = 'block';
            }
        } else {
            alert(`No element with class '${className}' found.`);
            console.error(`No element with class '${className}' found.`);
        }
    });
}


// example usage 

//  hideShow('spousecheckbox', 'hide')
//  hideShowClass('spousecheckboxclass', 'show')

// you can call it from any script by importing it like in example then calling like normal

// import {hideShow} from './utils.js'





