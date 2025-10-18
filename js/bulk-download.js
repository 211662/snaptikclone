// Bulk Download functionality for TikTok videos
let allVideos = [];
let selectedVideos = new Set();

// Get API base URL from config
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? API_CONFIG.development
    : API_CONFIG.production;

// Extract username from input
function extractUsername(input) {
    input = input.trim();
    
    // If starts with @, remove it
    if (input.startsWith('@')) {
        return input.substring(1);
    }
    
    // If it's a URL, extract username
    const urlPattern = /tiktok\.com\/@([^/?]+)/;
    const match = input.match(urlPattern);
    if (match) {
        return match[1];
    }
    
    // Otherwise, assume it's just the username
    return input;
}

// Fetch videos from a TikTok profile
async function fetchProfileVideos() {
    const input = document.getElementById('profileInput').value.trim();
    
    if (!input) {
        alert('Please enter a TikTok profile URL or username');
        return;
    }
    
    const username = extractUsername(input);
    
    if (!username) {
        alert('Invalid TikTok profile URL or username');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.add('active');
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('fetchBtn').disabled = true;
    
    try {
        // Call API to fetch profile videos
        const response = await fetch(`${API_BASE_URL}/api/tiktok/profile/${username}`);
        const data = await response.json();
        
        if (data.success && data.videos && data.videos.length > 0) {
            allVideos = data.videos;
            displayVideos(allVideos);
            document.getElementById('totalCount').textContent = allVideos.length;
            document.getElementById('resultsSection').style.display = 'block';
        } else {
            alert(data.error || 'No videos found or profile is private');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to fetch profile videos. Please try again.');
    } finally {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('fetchBtn').disabled = false;
    }
}

// Display videos in grid
function displayVideos(videos) {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = '';
    
    videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <input 
                type="checkbox" 
                class="video-checkbox" 
                data-index="${index}"
                onchange="updateSelection()"
            >
            <img src="${video.thumbnail || video.cover}" alt="${video.title}">
            <div class="video-info">
                <h3>${video.title || 'Untitled'}</h3>
                <div class="video-stats">
                    <span>👁️ ${formatNumber(video.views || 0)}</span>
                    <span>❤️ ${formatNumber(video.likes || 0)}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    selectedVideos.clear();
    updateSelectionUI();
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

// Toggle select all
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.video-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateSelection();
}

// Update selection when individual checkbox changes
function updateSelection() {
    selectedVideos.clear();
    const checkboxes = document.querySelectorAll('.video-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        selectedVideos.add(parseInt(checkbox.dataset.index));
    });
    
    updateSelectionUI();
}

// Update selection UI
function updateSelectionUI() {
    const count = selectedVideos.size;
    document.getElementById('selectedCount').textContent = count;
    
    const bulkActions = document.getElementById('bulkActions');
    if (count > 0) {
        bulkActions.classList.remove('hidden');
    } else {
        bulkActions.classList.add('hidden');
    }
    
    // Update select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    const totalCheckboxes = document.querySelectorAll('.video-checkbox').length;
    selectAllCheckbox.checked = count === totalCheckboxes && count > 0;
}

// Download selected videos
async function downloadSelected() {
    if (selectedVideos.size === 0) {
        alert('Please select at least one video');
        return;
    }
    
    const downloadBtn = document.querySelector('.bulk-download-btn');
    const originalText = downloadBtn.textContent;
    downloadBtn.disabled = true;
    
    let downloaded = 0;
    const total = selectedVideos.size;
    
    downloadBtn.textContent = `Downloading ${downloaded}/${total}...`;
    
    for (const index of selectedVideos) {
        const video = allVideos[index];
        
        try {
            // Fetch video data from API
            const response = await fetch(`${API_BASE_URL}/api/tiktok/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: video.url })
            });
            
            const data = await response.json();
            
            if (data.success && data.data.videoNoWatermark) {
                // Download video
                await downloadVideo(data.data.videoNoWatermark, `tiktok_${video.id || Date.now()}.mp4`);
                downloaded++;
                downloadBtn.textContent = `Downloading ${downloaded}/${total}...`;
                
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Error downloading video:', error);
        }
    }
    
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
    
    alert(`Successfully downloaded ${downloaded} out of ${total} videos!`);
}

// Download individual video
async function downloadVideo(url, filename) {
    try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Download error:', error);
    }
}

// Handle Enter key on input
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('profileInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchProfileVideos();
            }
        });
    }
});
