// API Configuration
// For Cloudflare Workers deployment

const API_CONFIG = {
    // Local development
    development: 'http://localhost:3000',
    
    // Production - Cloudflare Worker URL
    production: 'https://snaptik-prod2.phucdeveloper-it.workers.dev',
    
    // Get current environment
    get baseURL() {
        // Check if running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.development;
        }
        // On production, use Worker URL
        return this.production;
    }
};

// Export for use in app.js
window.API_CONFIG = API_CONFIG;
