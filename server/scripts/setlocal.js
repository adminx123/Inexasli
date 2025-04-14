function setLocal(name, value, days) {
    // Skip setting localStorage if the value is empty
    if (value === undefined || value === null || value === '') {
        console.warn(`Skipping localStorage for ${name} because the value is empty.`);
        return;
    }

    // Specific validation for RegionDropdown
    if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(value)) {
        value = 'NONE';
    }

    // Store in localStorage (days ignored as localStorage doesn't expire)
    localStorage.setItem(name, encodeURIComponent(value));
}

export { setLocal };