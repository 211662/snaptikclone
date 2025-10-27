// Article JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize article functionality
    initTableOfContents();
    initShareButtons();
    initQuickDownload();
    initSmoothScrolling();
});

// Table of Contents functionality
function initTableOfContents() {
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    const headings = document.querySelectorAll('.article-body h2, .article-body h3');
    
    // Create IDs for headings if they don't exist
    headings.forEach((heading, index) => {
        if (!heading.id) {
            const text = heading.textContent;
            const id = convertToSlug(text);
            heading.id = id;
        }
    });
    
    // Update TOC links
    tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetHeading = document.getElementById(targetId);
            if (targetHeading) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    targetHeading.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
            }
        }
    });
    
    // Highlight current section in TOC
    if (tocLinks.length > 0) {
        initTOCHighlight(tocLinks, headings);
    }
}

function initTOCHighlight(tocLinks, headings) {
    function updateTOC() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        let currentSection = null;
        
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            const offsetTop = rect.top + scrollTop;
            
            if (scrollTop >= offsetTop - 100) {
                currentSection = heading;
            }
        });
        
        // Update active TOC link
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (currentSection) {
                const href = `#${currentSection.id}`;
                if (link.getAttribute('href') === href) {
                    link.classList.add('active');
                }
            }
        });
    }
    
    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateTOC();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial update
    updateTOC();
}

// Share buttons functionality
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = window.location.href;
            const title = document.title;
            const text = document.querySelector('.article-excerpt')?.textContent || title;
            
            if (this.classList.contains('facebook')) {
                shareOnFacebook(url, title);
            } else if (this.classList.contains('twitter')) {
                shareOnTwitter(url, text);
            } else if (this.classList.contains('linkedin')) {
                shareOnLinkedIn(url, title, text);
            } else if (this.classList.contains('copy')) {
                copyToClipboard(url);
            }
        });
    });
}

function shareOnFacebook(url, title) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    openShareWindow(shareUrl, 'Facebook');
}

function shareOnTwitter(url, text) {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    openShareWindow(shareUrl, 'Twitter');
}

function shareOnLinkedIn(url, title, text) {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    openShareWindow(shareUrl, 'LinkedIn');
}

function openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
        url,
        `share-${platform}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Đã sao chép liên kết!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('Đã sao chép liên kết!', 'success');
        } else {
            showNotification('Không thể sao chép liên kết', 'error');
        }
    } catch (err) {
        showNotification('Không thể sao chép liên kết', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Quick download functionality
function initQuickDownload() {
    const quickDownloadBtn = document.getElementById('quickDownload');
    const quickUrlInput = document.getElementById('quickUrl');
    
    if (quickDownloadBtn && quickUrlInput) {
        quickDownloadBtn.addEventListener('click', function() {
            const url = quickUrlInput.value.trim();
            
            if (!url) {
                showNotification('Vui lòng nhập link TikTok', 'error');
                return;
            }
            
            if (!isValidTikTokUrl(url)) {
                showNotification('Link TikTok không hợp lệ', 'error');
                return;
            }
            
            // Redirect to main page with the URL
            window.location.href = `/?url=${encodeURIComponent(url)}`;
        });
        
        quickUrlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                quickDownloadBtn.click();
            }
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility functions
function convertToSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
}

function isValidTikTokUrl(url) {
    const tikTokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)/i;
    return tikTokRegex.test(url);
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
    
    // Add animation keyframes if not exists
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
            .table-of-contents a.active {
                color: #667eea;
                font-weight: 600;
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

// Reading progress indicator
function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: #667eea;
        z-index: 1000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset;
        const scrollPercent = (scrollTop / documentHeight) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }
    
    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial update
}

// Initialize reading progress
initReadingProgress();

// Auto-fill quick download if URL parameter exists
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    const quickUrlInput = document.getElementById('quickUrl');
    
    if (url && quickUrlInput) {
        quickUrlInput.value = url;
    }
});