// API Configuration
// Update this with your deployed backend URL

const API_CONFIG = {
    // Local development
    development: 'http://localhost:3000',
    
    // Production - UPDATE THIS after deploying backend
    production: 'https://your-app-name.railway.app',
    
    // Get current environment
    get baseURL() {
        // Check if running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.development;
        }
        return this.production;
    }
};

// Export for use in app.js
window.API_CONFIG = API_CONFIG;
