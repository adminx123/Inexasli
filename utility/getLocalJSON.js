/**
 * Retrieve and parse JSON data from localStorage
 * 
 * @param {string} name - The localStorage key
 * @param {any} defaultValue - Optional default value to return if key doesn't exist
 * @returns {any} - The parsed JSON data or the defaultValue if not found or parsing fails
 */
export function getLocalJSON(name, defaultValue = null) {
    try {
        if (name === undefined || name === null || name === '') {
            console.error('Invalid key name provided to getLocalJSON');
            return defaultValue;
        }
        
        // Get the raw value from localStorage
        const jsonString = localStorage.getItem(name);
        
        // If value doesn't exist, return the default value
        if (jsonString === null) {
            return defaultValue;
        }
        
        // Parse JSON string back to JavaScript object/array/value
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error retrieving or parsing JSON from localStorage (${name}):`, error);
        return defaultValue;
    }
}

// Set default export
export default getLocalJSON;