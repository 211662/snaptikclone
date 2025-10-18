// API Configuration
// For Cloudflare Pages Functions deployment

const API_CONFIG = {
    // Local development
    development: 'http://localhost:3000',
    
    // Production - DigitalOcean VPS with custom domain
    production: 'https://snaptikks.com',
    
    // Get current environment
    get baseURL() {
        // Check if running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.development;
        }
        // On production, use same domain (Pages Functions)
        return this.production;
    }
};

// Export for use in app.js
window.API_CONFIG = API_CONFIG;
