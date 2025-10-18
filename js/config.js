// API Configuration
// For Cloudflare Workers deployment, API is on the same domain

const API_CONFIG = {
    // Local development
    development: 'http://localhost:3000',
    
    // Production - For Cloudflare Workers, use empty string (same domain)
    production: '',
    
    // Get current environment
    get baseURL() {
        // Check if running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.development;
        }
        // On Cloudflare Workers, API is on same domain
        return this.production;
    }
};

// Export for use in app.js
window.API_CONFIG = API_CONFIG;
