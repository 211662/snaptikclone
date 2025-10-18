const axios = require('axios');

/**
 * Alternative TikTok API methods using third-party services
 */

/**
 * Method 1: Using TikTok's internal API endpoint
 */
async function getTikTokVideoInfoAPI(videoId) {
    try {
        const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'com.zhiliaoapp.musically/2022600040 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
            },
            timeout: 10000
        });

        if (response.data && response.data.aweme_list && response.data.aweme_list.length > 0) {
            const video = response.data.aweme_list[0];
            return {
                success: true,
                videoId: video.aweme_id,
                title: video.desc || 'TikTok Video',
                author: video.author?.nickname || 'Unknown',
                authorUsername: video.author?.unique_id || 'unknown',
                thumbnail: video.video?.cover?.url_list?.[0] || '',
                duration: video.video?.duration || 0,
                videoNoWatermark: video.video?.play_addr?.url_list?.[0] || video.video?.download_addr?.url_list?.[0] || '',
                videoWithWatermark: video.video?.play_addr?.url_list?.[0] || '',
                audioUrl: video.music?.play_url?.url_list?.[0] || '',
                views: video.statistics?.play_count || 0,
                likes: video.statistics?.digg_count || 0,
                shares: video.statistics?.share_count || 0,
                comments: video.statistics?.comment_count || 0
            };
        }

        return { success: false };
    } catch (error) {
        console.error('TikTok API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 2: Using TikTok Web API (newer method)
 */
async function getTikTokVideoWebAPI(url) {
    try {
        // First, get the video page to extract aweme_id
        const pageResponse = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 10000
        });

        // Extract video ID from different possible locations
        let videoId = null;
        
        // Try to get from URL
        const urlMatch = url.match(/\/video\/(\d+)/);
        if (urlMatch) videoId = urlMatch[1];

        if (!videoId) {
            // Try to extract from page
            const idMatch = pageResponse.data.match(/"aweme_id":"(\d+)"/);
            if (idMatch) videoId = idMatch[1];
        }

        if (videoId) {
            return await getTikTokVideoInfoAPI(videoId);
        }

        return { success: false };
    } catch (error) {
        console.error('Web API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 3: Using public TikTok downloader API (fallback)
 */
async function getVideoFromPublicAPI(url) {
    try {
        // Use a public API endpoint (replace with actual working endpoint)
        const apiEndpoint = 'https://www.tikwm.com/api/';
        
        const response = await axios.post(apiEndpoint, {
            url: url,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        if (response.data && response.data.code === 0) {
            const data = response.data.data;
            
            // Ensure URLs are absolute
            const baseUrl = 'https://www.tikwm.com';
            const getAbsoluteUrl = (url) => {
                if (!url) return '';
                if (url.startsWith('http')) return url;
                return baseUrl + url;
            };
            
            // Priority: hdplay (HD no watermark) > play (may be no watermark) > wmplay (with watermark)
            const noWatermarkUrl = data.hdplay || data.play || data.wmplay;
            const withWatermarkUrl = data.wmplay || data.play;
            
            return {
                success: true,
                videoId: data.id || '',
                title: data.title || 'TikTok Video',
                author: data.author?.nickname || 'Unknown',
                authorUsername: data.author?.unique_id || 'unknown',
                thumbnail: getAbsoluteUrl(data.cover || data.origin_cover),
                duration: data.duration || 0,
                videoNoWatermark: getAbsoluteUrl(noWatermarkUrl),
                videoWithWatermark: getAbsoluteUrl(withWatermarkUrl),
                audioUrl: getAbsoluteUrl(data.music),
                views: data.play_count || 0,
                likes: data.digg_count || 0,
                shares: data.share_count || 0,
                comments: data.comment_count || 0
            };
        }

        return { success: false };
    } catch (error) {
        console.error('Public API error:', error.message);
        return { success: false };
    }
}

/**
 * Main function - tries all methods in sequence
 */
async function getTikTokVideoData(url) {
    console.log('Attempting to fetch TikTok video from:', url);

    // Extract video ID from URL
    const videoId = url.match(/\/video\/(\d+)/)?.[1];

    // Method 1: Try direct API with video ID
    if (videoId) {
        console.log('Trying Method 1: Direct API...');
        const result1 = await getTikTokVideoInfoAPI(videoId);
        if (result1.success && result1.videoNoWatermark) {
            console.log('✓ Method 1 successful');
            return result1;
        }
    }

    // Method 2: Try web API
    console.log('Trying Method 2: Web API...');
    const result2 = await getTikTokVideoWebAPI(url);
    if (result2.success && result2.videoNoWatermark) {
        console.log('✓ Method 2 successful');
        return result2;
    }

    // Method 3: Try public API
    console.log('Trying Method 3: Public API...');
    const result3 = await getVideoFromPublicAPI(url);
    if (result3.success && result3.videoNoWatermark) {
        console.log('✓ Method 3 successful');
        return result3;
    }

    console.log('✗ All methods failed');
    return {
        success: false,
        error: 'Unable to fetch video data from all available sources'
    };
}

module.exports = {
    getTikTokVideoData,
    getTikTokVideoInfoAPI,
    getTikTokVideoWebAPI,
    getVideoFromPublicAPI
};
