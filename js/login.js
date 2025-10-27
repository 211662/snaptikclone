// Login Page JavaScript

class LoginManager {
    constructor() {
        this.maxAttempts = 3;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
        this.validPasswords = ['admin123', 'snaptik2025']; // Multiple valid passwords
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
        this.checkLockoutStatus();
        this.setupPasswordToggle();
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        const securityBtn = document.getElementById('securityBtn');
        const modal = document.getElementById('securityModal');
        const modalClose = document.querySelector('.modal-close');
        const modalBtn = document.querySelector('.btn-primary');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (securityBtn) {
            securityBtn.addEventListener('click', () => this.showSecurityModal());
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideSecurityModal());
        }

        if (modalBtn) {
            modalBtn.addEventListener('click', () => this.hideSecurityModal());
        }

        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideSecurityModal();
                }
            });
        }

        // Handle Enter key in password field
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }

    setupPasswordToggle() {
        const toggleBtn = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                toggleBtn.innerHTML = type === 'password' ? '👁️' : '🙈';
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.querySelector('.login-btn');
        const errorDiv = document.querySelector('.login-error');

        // Check if user is locked out
        if (this.isLockedOut()) {
            this.showError('Account temporarily locked due to too many failed attempts. Please try again later.');
            return;
        }

        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password.');
            return;
        }

        // Show loading state
        this.setLoadingState(loginBtn, true);
        this.hideError();

        // Simulate authentication delay
        await this.delay(1000);

        // Check credentials
        if (this.validateCredentials(username, password)) {
            this.handleSuccessfulLogin(rememberMe);
        } else {
            this.handleFailedLogin();
            this.setLoadingState(loginBtn, false);
        }
    }

    validateCredentials(username, password) {
        // In production, this should make an API call to verify credentials
        const validUsernames = ['admin', 'administrator', 'blogger'];
        
        const usernameValid = validUsernames.includes(username.toLowerCase());
        const passwordValid = this.validPasswords.includes(password);
        
        return usernameValid && passwordValid;
    }

    handleSuccessfulLogin(rememberMe) {
        // Clear failed attempts
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        // Create session
        const sessionData = {
            user: document.getElementById('username').value.trim(),
            loginTime: Date.now(),
            remember: rememberMe
        };

        if (rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        }

        // Show success message
        this.showSuccessMessage();

        // Redirect to admin panel
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    }

    handleFailedLogin() {
        const attempts = this.getFailedAttempts() + 1;
        localStorage.setItem('loginAttempts', attempts.toString());
        localStorage.setItem('lastAttempt', Date.now().toString());

        if (attempts >= this.maxAttempts) {
            localStorage.setItem('lockoutTime', Date.now().toString());
            this.showError(`Too many failed attempts. Account locked for ${this.lockoutTime / 60000} minutes.`);
        } else {
            const remaining = this.maxAttempts - attempts;
            this.showError(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        }
    }

    isLockedOut() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        if (!lockoutTime) return false;

        const lockoutEnd = parseInt(lockoutTime) + this.lockoutTime;
        if (Date.now() < lockoutEnd) {
            return true;
        } else {
            // Lockout expired, clear the data
            localStorage.removeItem('lockoutTime');
            localStorage.removeItem('loginAttempts');
            return false;
        }
    }

    getFailedAttempts() {
        return parseInt(localStorage.getItem('loginAttempts') || '0');
    }

    checkExistingSession() {
        const sessionData = this.getSessionData();
        if (sessionData && this.isSessionValid(sessionData)) {
            // User is already logged in, redirect to admin
            window.location.href = 'admin.html';
        }
    }

    getSessionData() {
        const localSession = localStorage.getItem('adminSession');
        const sessionSession = sessionStorage.getItem('adminSession');
        
        if (localSession) {
            return JSON.parse(localSession);
        } else if (sessionSession) {
            return JSON.parse(sessionSession);
        }
        
        return null;
    }

    isSessionValid(sessionData) {
        if (!sessionData || !sessionData.loginTime) return false;
        
        const sessionAge = Date.now() - sessionData.loginTime;
        return sessionAge < this.sessionTimeout;
    }

    checkLockoutStatus() {
        if (this.isLockedOut()) {
            const lockoutTime = parseInt(localStorage.getItem('lockoutTime'));
            const remaining = Math.ceil((lockoutTime + this.lockoutTime - Date.now()) / 60000);
            this.showError(`Account is locked. Please try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`);
            
            // Disable form
            this.disableForm(true);
            
            // Set timer to re-enable form
            setTimeout(() => {
                this.disableForm(false);
                this.hideError();
                localStorage.removeItem('lockoutTime');
                localStorage.removeItem('loginAttempts');
            }, lockoutTime + this.lockoutTime - Date.now());
        }
    }

    disableForm(disabled) {
        const inputs = document.querySelectorAll('#loginForm input, #loginForm button');
        inputs.forEach(input => {
            input.disabled = disabled;
        });
    }

    setLoadingState(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');
        
        if (loading) {
            button.disabled = true;
            if (btnText) btnText.textContent = 'Authenticating...';
            if (btnSpinner) {
                btnSpinner.classList.remove('hidden');
                btnSpinner.classList.add('btn-spinner');
            }
        } else {
            button.disabled = false;
            if (btnText) btnText.textContent = 'Sign In';
            if (btnSpinner) {
                btnSpinner.classList.add('hidden');
                btnSpinner.classList.remove('btn-spinner');
            }
        }
    }

    showError(message) {
        const errorDiv = document.querySelector('.login-error');
        const errorText = document.querySelector('.error-text');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorDiv = document.querySelector('.login-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    showSuccessMessage() {
        const errorDiv = document.querySelector('.login-error');
        const errorText = document.querySelector('.error-text');
        const errorIcon = document.querySelector('.error-icon');
        
        if (errorDiv && errorText && errorIcon) {
            errorDiv.style.background = '#e6ffe6';
            errorDiv.style.borderColor = '#99ff99';
            errorIcon.style.color = '#28a745';
            errorIcon.textContent = '✓';
            errorText.style.color = '#28a745';
            errorText.textContent = 'Login successful! Redirecting to admin panel...';
            errorDiv.classList.remove('hidden');
        }
    }

    showSecurityModal() {
        const modal = document.getElementById('securityModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideSecurityModal() {
        const modal = document.getElementById('securityModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Static method to check authentication for other pages
    static isAuthenticated() {
        const manager = new LoginManager();
        const sessionData = manager.getSessionData();
        return sessionData && manager.isSessionValid(sessionData);
    }

    // Static method to logout
    static logout() {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }

    // Static method to get current user
    static getCurrentUser() {
        const manager = new LoginManager();
        const sessionData = manager.getSessionData();
        return sessionData && manager.isSessionValid(sessionData) ? sessionData.user : null;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Add some security features
document.addEventListener('DOMContentLoaded', () => {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u')
        ) {
            e.preventDefault();
        }
    });

    // Clear clipboard when leaving page
    window.addEventListener('beforeunload', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
        }
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginManager;
}