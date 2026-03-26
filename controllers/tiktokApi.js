const axios = require('axios');
const { extractVideoBrowserStyle } = require('./browserExtractor');

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
 * Method 3: Using tikwm.com API (improved bypass)
 */
async function getVideoFromTikwmAPI(url) {
    try {
        // Use tikwm.com API with better headers
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tikwm.com/',
                'Origin': 'https://www.tikwm.com'
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
        console.error('Tikwm API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 4: Enhanced Direct TikTok API (bypass blocked content)
 */
async function getVideoFromEnhancedAPI(url) {
    try {
        const cleanUrl = url.replace(/[?&].*$/, '');
        const videoId = cleanUrl.match(/\/video\/(\d+)/)?.[1];
        
        if (!videoId) return { success: false };

        // Multiple API endpoints to try
        const apiEndpoints = [
            `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
            `https://api19-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
            `https://api21-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
            `https://www.tiktok.com/api/item/detail/?itemId=${videoId}`
        ];

        const userAgents = [
            'com.zhiliaoapp.musically/2022600040 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
            'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'TikTok/1.0 (com.ss.android.ugc.trill; build:1; iOS 14.2.0) Alamofire/1.0'
        ];

        // Try different combinations
        for (let i = 0; i < apiEndpoints.length; i++) {
            try {
                const response = await axios.get(apiEndpoints[i], {
                    headers: {
                        'User-Agent': userAgents[i % userAgents.length],
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9'
                    },
                    timeout: 8000
                });

                if (response.data) {
                    const video = response.data.aweme_list?.[0] || response.data.itemInfo?.itemStruct;
                    
                    if (video) {
                        const playAddr = video.video?.play_addr?.url_list?.[0] || video.video?.playAddr?.urlList?.[0];
                        const downloadAddr = video.video?.download_addr?.url_list?.[0] || video.video?.downloadAddr?.urlList?.[0];
                        
                        if (playAddr || downloadAddr) {
                            return {
                                success: true,
                                videoId: videoId,
                                title: video.desc || video.description || 'TikTok Video',
                                author: video.author?.nickname || video.author?.uniqueId || 'Unknown',
                                authorUsername: video.author?.unique_id || video.author?.uniqueId || 'unknown',
                                thumbnail: video.video?.cover?.url_list?.[0] || video.video?.originCover?.urlList?.[0] || '',
                                duration: video.video?.duration || 0,
                                videoNoWatermark: downloadAddr || playAddr,
                                videoWithWatermark: playAddr || downloadAddr,
                                audioUrl: video.music?.play_url?.url_list?.[0] || video.music?.playUrl?.urlList?.[0] || '',
                                views: video.statistics?.play_count || video.stats?.playCount || 0,
                                likes: video.statistics?.digg_count || video.stats?.diggCount || 0,
                                shares: video.statistics?.share_count || video.stats?.shareCount || 0,
                                comments: video.statistics?.comment_count || video.stats?.commentCount || 0
                            };
                        }
                    }
                }
            } catch (apiError) {
                console.log(`API endpoint ${i + 1} failed:`, apiError.message);
                continue; // Try next endpoint
            }
        }

        return { success: false };
    } catch (error) {
        console.error('Enhanced API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 5: Using Y2mate API (another reliable bypass)
 */
async function getVideoFromY2mateAPI(url) {
    try {
        const cleanUrl = url.replace(/[?&].*$/, '');
        
        // Try Y2mate TikTok downloader
        const apiEndpoint = 'https://www.y2mate.com/mates/analyzeV2/ajax';
        
        const formData = new URLSearchParams();
        formData.append('k_query', cleanUrl);
        formData.append('k_page', 'home');
        formData.append('hl', 'en');
        formData.append('q_auto', '1');

        const response = await axios.post(apiEndpoint, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.y2mate.com/',
                'Origin': 'https://www.y2mate.com'
            },
            timeout: 15000
        });

        if (response.data && response.data.status === 'ok') {
            const data = response.data;
            
            // Extract video link from response
            if (data.links && data.links.mp4) {
                const videoLink = Object.values(data.links.mp4)[0];
                if (videoLink && videoLink.url) {
                    return {
                        success: true,
                        videoId: cleanUrl.match(/\/video\/(\d+)/)?.[1] || '',
                        title: data.title || 'TikTok Video',
                        author: 'Unknown',
                        authorUsername: 'unknown',
                        thumbnail: '',
                        duration: 0,
                        videoNoWatermark: videoLink.url,
                        videoWithWatermark: videoLink.url,
                        audioUrl: '',
                        views: 0,
                        likes: 0,
                        shares: 0,
                        comments: 0
                    };
                }
            }
        }

        return { success: false };
    } catch (error) {
        console.error('Y2mate API error:', error.message);
        return { success: false };
    }
}

/**
 * Method 6: Using TikTok Downloader via RapidAPI (backup method)
 */
async function getVideoFromRapidAPI(url) {
    try {
        const cleanUrl = url.replace(/[?&].*$/, '');
        
        // Alternative approach: extract video using different technique
        const videoId = cleanUrl.match(/\/video\/(\d+)/)?.[1];
        if (!videoId) return { success: false };

        // Try direct video extraction from TikTok mobile API
        const mobileApiUrl = `https://api.tiktokv.com/aweme/v1/aweme/detail/?aweme_id=${videoId}`;
        
        const response = await axios.get(mobileApiUrl, {
            headers: {
                'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet',
            },
            timeout: 10000
        });

        if (response.data && response.data.aweme_detail) {
            const video = response.data.aweme_detail;
            const playAddr = video.video?.play_addr?.url_list?.[0];
            const downloadAddr = video.video?.download_addr?.url_list?.[0];
            
            if (playAddr || downloadAddr) {
                return {
                    success: true,
                    videoId: videoId,
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

        return { success: false };
    } catch (error) {
        console.error('RapidAPI error:', error.message);
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

    // Method 3: Try Tikwm API
    console.log('Trying Method 3: Tikwm API...');
    const result3 = await getVideoFromTikwmAPI(url);
    if (result3.success && result3.videoNoWatermark) {
        console.log('✓ Method 3 successful');
        return result3;
    }

    // Method 4: Try Enhanced Direct API (multiple endpoints)
    console.log('Trying Method 4: Enhanced Direct API...');
    const result4 = await getVideoFromEnhancedAPI(url);
    if (result4.success && result4.videoNoWatermark) {
        console.log('✓ Method 4 successful');
        return result4;
    }

    // Method 5: Try Browser-style extraction (like CocCoc)
    console.log('Trying Method 5: Browser-style extraction...');
    const resultBrowser = await extractVideoBrowserStyle(url);
    if (resultBrowser.success && resultBrowser.videoNoWatermark) {
        console.log('✓ Method 5 (Browser-style) successful');
        return resultBrowser;
    }

    // Method 6: Try Y2mate API (another reliable bypass)
    console.log('Trying Method 6: Y2mate API...');
    const resultY2mate = await getVideoFromY2mateAPI(url);
    if (resultY2mate.success && resultY2mate.videoNoWatermark) {
        console.log('✓ Method 6 successful');
        return resultY2mate;
    }

    // Method 7: Try RapidAPI (backup method)
    console.log('Trying Method 7: RapidAPI...');
    const resultRapid = await getVideoFromRapidAPI(url);
    if (resultRapid.success && resultRapid.videoNoWatermark) {
        console.log('✓ Method 7 successful');
        return resultRapid;
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
    getVideoFromTikwmAPI,
    getVideoFromEnhancedAPI,
    getVideoFromY2mateAPI,
    getVideoFromRapidAPI
};
