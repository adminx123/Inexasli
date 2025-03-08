// getcookie.js
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    console.log(`getCookie called for ${name}, cookie string: ${value}`);
    
    if (parts.length === 2) {
        const decodedValue = decodeURIComponent(parts.pop().split(';').shift());
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
        console.log(`No cookie found for ${name}`);
        if (name.includes('_frequency')) return 'annually';
        if (name === 'RegionDropdown') return 'NONE';
        if (name === 'SubregionDropdown') return '';
        return '';
    }
}

export { getCookie };

