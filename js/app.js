// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const loadingSection = document.getElementById('loading');
const resultSection = document.getElementById('result');
const errorSection = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

// Result elements
const videoThumbnail = document.getElementById('videoThumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const downloadNoWatermark = document.getElementById('downloadNoWatermark');
const downloadWithWatermark = document.getElementById('downloadWithWatermark');
const downloadAudio = document.getElementById('downloadAudio');

// State
let currentVideoData = null;

// Event Listeners
downloadBtn.addEventListener('click', handleDownload);
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleDownload();
    }
});

// Auto-paste from clipboard on focus (if supported)
videoUrlInput.addEventListener('focus', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('tiktok.com') || text.includes('douyin.com'))) {
            if (!videoUrlInput.value) {
                videoUrlInput.value = text;
            }
        }
    } catch (err) {
        // Clipboard access not available or denied
        console.log('Clipboard access not available');
    }
});

// Main download handler
async function handleDownload() {
    const url = videoUrlInput.value.trim();
    
    // Validate URL
    if (!url) {
        showError('Please enter a TikTok video URL');
        return;
    }
    
    if (!isValidTikTokUrl(url)) {
        showError('Invalid TikTok URL. Please enter a valid TikTok video link.');
        return;
    }
    
    // Hide previous results/errors
    hideAllSections();
    
    // Show loading
    loadingSection.classList.remove('hidden');
    
    try {
        // Simulate API call (replace with actual API endpoint)
        const videoData = await fetchVideoData(url);
        
        // Store data
        currentVideoData = videoData;
        
        // Display results
        displayResults(videoData);
        
    } catch (error) {
        showError(error.message || 'Failed to fetch video. Please try again.');
    } finally {
        loadingSection.classList.add('hidden');
    }
}

// Validate TikTok URL
function isValidTikTokUrl(url) {
    const tiktokPatterns = [
        /tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /tiktok\.com\/v\/\d+/,
        /vm\.tiktok\.com\/[\w]+/,
        /vt\.tiktok\.com\/[\w]+/,
        /douyin\.com\/video\/\d+/,
        /v\.douyin\.com\/[\w]+/,
        /m\.tiktok\.com\/v\/\d+/
    ];
    
    return tiktokPatterns.some(pattern => pattern.test(url));
}

// Fetch video data from backend API
async function fetchVideoData(url) {
    try {
        // For Cloudflare Workers, API is on the same domain
        const apiURL = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
        const response = await fetch(`${apiURL}/api/tiktok/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch video data');
        }

        if (!result.success) {
            throw new Error(result.error || 'Failed to process video');
        }

        // Transform API response to match our format
        return {
            success: true,
            thumbnail: result.data.thumbnail,
            title: result.data.title,
            author: `@${result.data.authorUsername}`,
            authorName: result.data.author,
            videoNoWatermark: result.data.videoNoWatermark,
            videoWithWatermark: result.data.videoWithWatermark,
            audioUrl: result.data.audioUrl,
            views: result.data.views,
            likes: result.data.likes,
            duration: result.data.duration
        };

    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(error.message || 'Failed to fetch video data');
    }
}

// Display results
function displayResults(data) {
    videoThumbnail.src = data.thumbnail || 'https://via.placeholder.com/400x400?text=TikTok+Video';
    videoThumbnail.alt = data.title;
    videoTitle.textContent = data.title;
    videoAuthor.textContent = data.author;
    
    // Add video stats if available
    if (data.views || data.likes) {
        const statsText = [];
        if (data.views) statsText.push(`👁 ${formatNumber(data.views)} views`);
        if (data.likes) statsText.push(`❤ ${formatNumber(data.likes)} likes`);
        if (data.duration) statsText.push(`⏱ ${formatDuration(data.duration)}s`);
        
        if (statsText.length > 0) {
            videoAuthor.textContent += ` • ${statsText.join(' • ')}`;
        }
    }
    
    // Set up download buttons
    downloadNoWatermark.onclick = () => downloadFile(data.videoNoWatermark, 'tiktok_video_no_watermark.mp4');
    downloadWithWatermark.onclick = () => downloadFile(data.videoWithWatermark, 'tiktok_video.mp4');
    downloadAudio.onclick = () => downloadFile(data.audioUrl, 'tiktok_audio.mp3');
    
    resultSection.classList.remove('hidden');
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format duration
function formatDuration(seconds) {
    if (seconds < 60) return seconds + 's';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Download file
function downloadFile(url, filename) {
    if (!url || url === '#' || url === '') {
        showError('Download URL not available. The video may not support this download option.');
        return;
    }
    
    // Build full URL with backend
    const apiURL = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
    const fullUrl = url.startsWith('http') ? url : apiURL + url;
    
    // Open download in new window
    window.open(fullUrl, '_blank');
    
    // Show success message
    showSuccessMessage('Download started! If download doesn\'t start automatically, please allow pop-ups for this site.');
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <p>✓ ${message}</p>
    `;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorSection.classList.add('hidden');
    }, 5000);
}

// Hide all sections
function hideAllSections() {
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Console welcome message
console.log('%c SnapTik Clone ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px;');
console.log('%c✓ Backend API Connected!', 'color: #4caf50; font-size: 14px; font-weight: bold;');
console.log('%cServer running on: http://localhost:3000', 'color: #667eea; font-size: 12px;');
console.log('%cAPI Endpoint: /api/tiktok/download', 'color: #667eea; font-size: 12px;');
