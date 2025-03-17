// getcookie.js
function getCookie(name) {
    const value = localStorage.getItem(name);
    console.log(`getCookie called for ${name}, stored value: ${value}`);
    
    if (value !== null) {
        const decodedValue = decodeURIComponent(value);
        console.log(`Decoded value for ${name}: ${decodedValue}`);
        
        if (decodedValue === '' || decodedValue === '0') {
            if (name.includes('_frequency')) return 'annually';
            return '';
        }
        
        if (name === 'RegionDropdown' && !['CAN', 'USA'].includes(decodedValue)) {
            console.log(`Invalid RegionDropdown value '${decodedValue}', returning 'NONE'`);
            return 'NONE';
        }
        
        return decodedValue;
    } else {
        console.log(`No value found for ${name}`);
        if (name.includes('_frequency')) return 'annually';
        if (name === 'RegionDropdown') return 'NONE';
        if (name === 'SubregionDropdown') return '';
        return '';
    }
}

export { getCookie };