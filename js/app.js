// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const downloadBtn = document.getElementById('downloadBtn');
const loadingSection = document.getElementById('loading');
const resultSection = document.getElementById('result');
const errorSection = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const pasteBtn = document.getElementById('pasteBtn');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const toastContainer = document.getElementById('toastContainer');

// Result elements
const videoThumbnail = document.getElementById('videoThumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const videoStats = document.getElementById('videoStats');
const downloadNoWatermark = document.getElementById('downloadNoWatermark');
const downloadWithWatermark = document.getElementById('downloadWithWatermark');
const downloadAudio = document.getElementById('downloadAudio');

// State
let currentVideoData = null;

// ===== Mobile Menu =====
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// ===== Paste Button =====
if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                videoUrlInput.value = text;
                videoUrlInput.focus();
                showToast('Pasted from clipboard!', 'success');
            }
        } catch {
            showToast('Cannot access clipboard. Please paste manually.', 'error');
        }
    });
}

// ===== Event Listeners =====
downloadBtn.addEventListener('click', handleDownload);
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleDownload();
});

// Auto-paste on focus
videoUrlInput.addEventListener('focus', async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text && !videoUrlInput.value && (text.includes('tiktok.com') || text.includes('douyin.com'))) {
            videoUrlInput.value = text;
            showToast('TikTok link detected & pasted!', 'success');
        }
    } catch { /* Clipboard not available */ }
});

// ===== Toast Notification System =====
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== Main Download Handler =====
async function handleDownload() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showToast('Please enter a TikTok video URL', 'warning');
        videoUrlInput.focus();
        return;
    }
    
    if (!isValidTikTokUrl(url)) {
        showToast('Invalid TikTok URL. Please enter a valid link.', 'error');
        return;
    }
    
    hideAllSections();
    loadingSection.classList.remove('hidden');
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing...';
    
    try {
        const videoData = await fetchVideoData(url);
        currentVideoData = videoData;
        displayResults(videoData);
        showToast('Video ready to download!', 'success');
    } catch (error) {
        showError(error.message || 'Failed to fetch video. Please try again.');
        showToast(error.message || 'Download failed', 'error');
    } finally {
        loadingSection.classList.add('hidden');
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download';
    }
}

// ===== URL Validation =====
function isValidTikTokUrl(url) {
    const patterns = [
        /tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /tiktok\.com\/v\/\d+/,
        /vm\.tiktok\.com\/[\w]+/,
        /vt\.tiktok\.com\/[\w]+/,
        /douyin\.com\/video\/\d+/,
        /v\.douyin\.com\/[\w]+/,
        /m\.tiktok\.com\/v\/\d+/
    ];
    return patterns.some(p => p.test(url));
}

// ===== Fetch Video Data =====
async function fetchVideoData(url) {
    const apiURL = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
    const response = await fetch(`${apiURL}/api/tiktok/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process video');
    }

    return {
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
}

// ===== Display Results =====
function displayResults(data) {
    videoThumbnail.src = data.thumbnail || '';
    videoThumbnail.alt = data.title || 'TikTok Video';
    videoTitle.textContent = data.title || 'TikTok Video';
    videoAuthor.textContent = `${data.authorName || ''} ${data.author || ''}`.trim();
    
    // Stats badges
    if (videoStats) {
        videoStats.innerHTML = '';
        if (data.views) videoStats.innerHTML += `<span class="stat-badge">👁 ${formatNumber(data.views)}</span>`;
        if (data.likes) videoStats.innerHTML += `<span class="stat-badge">❤️ ${formatNumber(data.likes)}</span>`;
        if (data.duration) videoStats.innerHTML += `<span class="stat-badge">⏱ ${formatDuration(data.duration)}</span>`;
    }
    
    // Download buttons with proxy for direct save
    downloadNoWatermark.onclick = () => startDownload(data.videoNoWatermark, 'tiktok-no-watermark.mp4');
    downloadWithWatermark.onclick = () => startDownload(data.videoWithWatermark, 'tiktok-watermark.mp4');
    downloadAudio.onclick = () => {
        if (data.audioUrl) {
            startDownload(data.audioUrl, 'tiktok-audio.mp3');
        } else {
            showToast('Audio not available for this video', 'warning');
        }
    };
    
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Direct Download via Proxy =====
function startDownload(url, filename) {
    if (!url) {
        showToast('Download URL not available', 'error');
        return;
    }
    
    showToast('Starting download...', 'info');
    
    // Use proxy endpoint for direct download (triggers browser save dialog)
    const apiURL = window.API_CONFIG ? window.API_CONFIG.baseURL : '';
    const proxyUrl = `${apiURL}/api/tiktok/proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    
    // Create hidden link to trigger download
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => showToast('Download started! Check your downloads folder.', 'success'), 1000);
}

// ===== Utility Functions =====
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatDuration(seconds) {
    if (!seconds) return '0s';
    if (seconds < 60) return Math.floor(seconds) + 's';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    setTimeout(() => errorSection.classList.add('hidden'), 5000);
}

function hideAllSections() {
    loadingSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const id = this.getAttribute('href');
        if (id === '#') return;
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.feature-card, .step, .faq-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
});

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-item h3').forEach(title => {
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => {
        const item = title.parentElement;
        const isOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        // Toggle clicked
        if (!isOpen) item.classList.add('open');
    });
});

// Console branding
console.log('%c SnapTik ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px; border-radius: 8px;');
console.log('%c✓ Ready', 'color: #4caf50; font-size: 14px; font-weight: bold;');
