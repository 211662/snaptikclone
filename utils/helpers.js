const axios = require('axios');

/**
 * Validate if URL is a valid TikTok URL
 */
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

/**
 * Extract video ID from TikTok URL
 */
async function extractVideoId(url) {
    try {
        // Direct video ID extraction
        const directMatch = url.match(/\/video\/(\d+)/);
        if (directMatch && directMatch[1]) {
            return directMatch[1];
        }

        // Handle shortened URLs (vm.tiktok.com, vt.tiktok.com)
        if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
            const expandedUrl = await expandShortUrl(url);
            const expandedMatch = expandedUrl.match(/\/video\/(\d+)/);
            if (expandedMatch && expandedMatch[1]) {
                return expandedMatch[1];
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting video ID:', error);
        return null;
    }
}

/**
 * Expand shortened TikTok URLs
 */
async function expandShortUrl(shortUrl) {
    try {
        const response = await axios.get(shortUrl, {
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        return response.request.res.responseUrl || shortUrl;
    } catch (error) {
        if (error.response && error.response.request.res.responseUrl) {
            return error.response.request.res.responseUrl;
        }
        return shortUrl;
    }
}

/**
 * Format number with K, M suffixes
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

module.exports = {
    isValidTikTokUrl,
    extractVideoId,
    expandShortUrl,
    formatNumber,
    formatDuration
};
