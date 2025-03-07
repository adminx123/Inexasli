function getCookie(name) {
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



export { getCookie }; // Export the function
