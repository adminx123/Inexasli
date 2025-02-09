function hideShowClass(className, task) {
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

 function getCook1(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        // Decode the cookie value
        const decodedValue = decodeURIComponent(parts.pop().split(';').shift());
        // If the value is empty and it's a frequency field, set it to 'annually'
        if (decodedValue === '' && name.includes('_frequency')) {
            return 'annually';
        }
        return decodedValue == 0 || decodedValue == '0'? '': decodedValue;
    } else {
        return 'annually';
    }
}



document.addEventListener('DOMContentLoaded', () => {

    
    const region = getCook1('RegionDropdown')

if (region == 'CAN') {
    hideShowClass('usa-hide', 'hide')
    hideShowClass('can-hide', 'show')

} else if (region == 'USA') {
    hideShowClass('usa-hide', 'show')
    hideShowClass('can-hide', "hide")

}
})