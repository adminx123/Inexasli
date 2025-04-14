function setLocal(name, value, days) {
    // Handle undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
        if (name.includes('_frequency')) {
            value = 'annually';
        } else if (name === 'RegionDropdown') {
            value = 'NONE';
        } else if (name === 'SubregionDropdown') {
            value = '';
        } else {
            value = '0'; // General default
        }
    } else {
        // Specific validation for RegionDropdown
        if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(value)) {
            value = 'NONE';
        }
    }
    
    // Store in localStorage (days ignored as localStorage doesn't expire)
    localStorage.setItem(name, encodeURIComponent(value));
}

export { setLocal };