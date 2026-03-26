const axios = require('axios');
const { extractVideoBrowserStyle } = require('./browserExtractor');

/**
 * TikTok Video Download API
 * Methods ordered by reliability:
 *   1. Tikwm API (most reliable, full metadata + HD)
 *   2. TikTok Internal Mobile API (direct, sometimes rate-limited)
 *   3. Browser-style extraction (fallback for edge cases)
 */

/**
 * Method 1: Tikwm API — most reliable, returns HD video + full metadata
 */
async function getVideoFromTikwmAPI(url) {
    try {
        const response = await axios.post('https://www.tikwm.com/api/', {
            url: url,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tikwm.com/',
                'Origin': 'https://www.tikwm.com'
            },
            timeout: 15000
        });

        if (response.data && response.data.code === 0 && response.data.data) {
            const data = response.data.data;

            const abs = (u) => {
                if (!u) return '';
                return u.startsWith('http') ? u : 'https://www.tikwm.com' + u;
            };

            const noWatermarkUrl = data.hdplay || data.play || data.wmplay;
            const withWatermarkUrl = data.wmplay || data.play;

            if (!noWatermarkUrl) return { success: false };

            return {
                success: true,
                videoId: data.id || '',
                title: data.title || 'TikTok Video',
                author: data.author?.nickname || 'Unknown',
                authorUsername: data.author?.unique_id || 'unknown',
                thumbnail: abs(data.cover || data.origin_cover),
                duration: data.duration || 0,
                videoNoWatermark: abs(noWatermarkUrl),
                videoWithWatermark: abs(withWatermarkUrl),
                audioUrl: abs(data.music),
                views: data.play_count || 0,
                likes: data.digg_count || 0,
                shares: data.share_count || 0,
                comments: data.comment_count || 0
            };
        }

        return { success: false };
    } catch (error) {
        console.error('Tikwm API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 2: TikTok Internal Mobile API
 */
async function getTikTokVideoInfoAPI(videoId) {
    const endpoints = [
        `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
        `https://api19-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
    ];

    const userAgents = [
        'com.zhiliaoapp.musically/2022600040 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
        'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
    ];

    for (let i = 0; i < endpoints.length; i++) {
        try {
            const response = await axios.get(endpoints[i], {
                headers: {
                    'User-Agent': userAgents[i],
                    'Accept': 'application/json',
                },
                timeout: 8000
            });

            const video = response.data?.aweme_list?.[0];
            if (video) {
                const playAddr = video.video?.play_addr?.url_list?.[0];
                const downloadAddr = video.video?.download_addr?.url_list?.[0];

                if (playAddr || downloadAddr) {
                    return {
                        success: true,
                        videoId: video.aweme_id || videoId,
                        title: video.desc || 'TikTok Video',
                        author: video.author?.nickname || 'Unknown',
                        authorUsername: video.author?.unique_id || 'unknown',
                        thumbnail: video.video?.cover?.url_list?.[0] || '',
                        duration: video.video?.duration || 0,
                        videoNoWatermark: downloadAddr || playAddr,
                        videoWithWatermark: playAddr || downloadAddr,
                        audioUrl: video.music?.play_url?.url_list?.[0] || '',
                        views: video.statistics?.play_count || 0,
                        likes: video.statistics?.digg_count || 0,
                        shares: video.statistics?.share_count || 0,
                        comments: video.statistics?.comment_count || 0
                    };
                }
            }
        } catch (error) {
            console.log(`Internal API endpoint ${i + 1} failed:`, error.message);
            continue;
        }
    }

    return { success: false };
}

/**
 * Main function — tries methods in order of reliability
 */
async function getTikTokVideoData(url) {
    console.log('📥 Fetching TikTok video:', url);

    const cleanUrl = url.replace(/[?&].*$/, '');
    const videoId = cleanUrl.match(/\/video\/(\d+)/)?.[1];

    // Method 1: Tikwm API (fastest + most reliable)
    console.log('  → Method 1: Tikwm API...');
    const result1 = await getVideoFromTikwmAPI(url);
    if (result1.success && result1.videoNoWatermark) {
        console.log('  ✓ Tikwm API successful');
        return result1;
    }

    // Method 2: TikTok Internal Mobile API
    if (videoId) {
        console.log('  → Method 2: TikTok Internal API...');
        const result2 = await getTikTokVideoInfoAPI(videoId);
        if (result2.success && result2.videoNoWatermark) {
            console.log('  ✓ Internal API successful');
            return result2;
        }
    }

    // Method 3: Browser-style extraction (fallback)
    console.log('  → Method 3: Browser extraction...');
    const result3 = await extractVideoBrowserStyle(url);
    if (result3.success && result3.videoNoWatermark) {
        console.log('  ✓ Browser extraction successful');
        return result3;
    }

    console.log('  ✗ All methods failed');
    return {
        success: false,
        error: 'Unable to fetch video data from all available sources'
    };
}

module.exports = {
    getTikTokVideoData,
    getVideoFromTikwmAPI,
    getTikTokVideoInfoAPI,
};
