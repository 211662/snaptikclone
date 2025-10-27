// Blog JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog functionality
    initBlogSearch();
    initCategoryFilter();
    initNewsletter();
    initPagination();
});

// Blog search functionality
function initBlogSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const blogPosts = document.querySelectorAll('.blog-post');
    
    if (!searchTerm) {
        // Show all posts if search is empty
        blogPosts.forEach(post => {
            post.style.display = 'block';
        });
        return;
    }
    
    blogPosts.forEach(post => {
        const title = post.querySelector('.post-title a').textContent.toLowerCase();
        const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
        const category = post.querySelector('.post-category').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
    
    // Show no results message if needed
    const visiblePosts = document.querySelectorAll('.blog-post[style="display: block"], .blog-post:not([style*="display: none"])');
    if (visiblePosts.length === 0) {
        showNoResultsMessage();
    } else {
        hideNoResultsMessage();
    }
}

// Category filter functionality
function initCategoryFilter() {
    const categoryLinks = document.querySelectorAll('.category-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active category
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
}

function filterByCategory(category) {
    const blogPosts = document.querySelectorAll('.blog-post');
    
    blogPosts.forEach(post => {
        if (category === 'all') {
            post.style.display = 'block';
        } else {
            const postCategory = post.querySelector('.post-category').textContent.toLowerCase();
            const categorySlug = convertToSlug(postCategory);
            
            if (categorySlug === category) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        }
    });
    
    // Clear search when filtering by category
    document.getElementById('searchInput').value = '';
    hideNoResultsMessage();
}

// Newsletter subscription
function initNewsletter() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const emailInput = document.getElementById('newsletterEmail');
    
    if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', function() {
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Invalid email address', 'error');
                return;
            }
            
            // Simulate newsletter subscription
            subscribeToNewsletter(email);
        });
        
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeBtn.click();
            }
        });
    }
}

function subscribeToNewsletter(email) {
    const btn = document.getElementById('subscribeBtn');
    const originalText = btn.textContent;
    
    // Show loading state
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Subscription successful! Thank you for your interest.', 'success');
        document.getElementById('newsletterEmail').value = '';
        
        // Reset button
        btn.textContent = originalText;
        btn.disabled = false;
    }, 1500);
}

// Pagination functionality
function initPagination() {
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent === 'Tiếp') {
                // Handle next page
                const activePage = document.querySelector('.pagination-btn.active');
                const nextPage = activePage.nextElementSibling;
                if (nextPage && nextPage.textContent !== 'Tiếp') {
                    activePage.classList.remove('active');
                    nextPage.classList.add('active');
                    loadPage(parseInt(nextPage.textContent));
                }
            } else if (!isNaN(parseInt(this.textContent))) {
                // Handle specific page
                paginationBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadPage(parseInt(this.textContent));
            }
        });
    });
}

function loadPage(pageNumber) {
    // Simulate page loading
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // In a real implementation, you would load new posts here
    console.log(`Loading page ${pageNumber}`);
}

// Utility functions
function convertToSlug(text) {
    const categoryMap = {
        'Guide': 'guide',
        'Trends': 'trends', 
        'Tips': 'tips',
        'News': 'news',
        'Security': 'security',
        'Hướng dẫn': 'guide',
        'Xu hướng': 'trends',
        'Mẹo hay': 'tips',
        'Tin tức': 'news',
        'Bảo mật': 'security'
    };
    
    return categoryMap[text] || text.toLowerCase().replace(/\s+/g, '-');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showNoResultsMessage() {
    hideNoResultsMessage(); // Remove existing message first
    
    const blogPosts = document.getElementById('blogPosts');
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #666;">
            <h3>No articles found</h3>
            <p>Try searching with different keywords or view all articles.</p>
            <button onclick="clearSearch()" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 15px;
            ">View all articles</button>
        </div>
    `;
    
    blogPosts.appendChild(noResults);
}

function hideNoResultsMessage() {
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    const blogPosts = document.querySelectorAll('.blog-post');
    blogPosts.forEach(post => {
        post.style.display = 'block';
    });
    hideNoResultsMessage();
    
    // Reset category filter to "all"
    const categoryLinks = document.querySelectorAll('.category-list a');
    categoryLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === 'all') {
            link.classList.add('active');
        }
    });
}

// Export functions for global use
window.clearSearch = clearSearch;