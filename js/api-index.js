/**
 * API Index
 * Combines all API modules into window.api
 */

// Ensure dependencies are loaded first
if (!window.coreApi || !window.testsApi || !window.apiUtils) {
    console.error('Missing API dependencies. Please ensure api-core.js, tests-api.js, and api-utils.js are loaded before api-index.js');
} else {
    // Combine all APIs into a single object
    const combinedApi = {
        ...window.coreApi,
        ...window.testsApi,
        ...window.apiUtils
    };
    
    // Make API available globally
    window.api = combinedApi;
    
    // Export for compatibility if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = combinedApi;
    }
}