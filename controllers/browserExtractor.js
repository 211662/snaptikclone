const axios = require('axios');
const { JSDOM } = require('jsdom');

/**
 * Browser-like TikTok Video Extractor
 * Simulates how browsers like CocCoc intercept and extract video URLs
 */

/**
 * Method 1: Extract from page HTML (like browser extension)
 */
async function extractFromPageHTML(url) {
    try {
        // Simulate real browser request
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            timeout: 15000
        });

        const html = response.data;
        
        // Extract JSON data from script tags (like browser does)
        const videoDataMatches = [
            // Method 1: Extract from __UNIVERSAL_DATA_FOR_REHYDRATION__
            html.match(/window\.__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*({.+?})\s*<\/script>/),
            // Method 2: Extract from SIGI_STATE
            html.match(/window\['SIGI_STATE'\]\s*=\s*({.+?});\s*window\['SIGI_RETRY'\]/),
            // Method 3: Extract from webapp.video-detail
            html.match(/"webapp\.video-detail":\s*({.+?})(?=,"[^"]+":|\}$)/),
            // Method 4: Extract from itemStruct
            html.match(/"itemStruct":\s*({.+?})(?=,"[^"]+":|\}$)/),
            // Method 5: Extract from __DEFAULT_SCOPE__
            html.match(/__DEFAULT_SCOPE__\s*=\s*({.+?});/),
            // Method 6: Extract any large JSON object that might contain video data
            html.match(/\{"props":\s*{.+?"videoDetail".+?}\s*<\/script>/),
        ];

        for (const match of videoDataMatches) {
            if (match && match[1]) {
                try {
                    const data = JSON.parse(match[1]);
                    const videoInfo = extractVideoFromData(data, url);
                    if (videoInfo.success) {
                        // Try to enhance with meta tag data if missing info
                        if (videoInfo.title === 'TikTok Video' || videoInfo.author === 'Unknown') {
                            const enhanced = extractMetaTagInfo(html, videoInfo);
                            return enhanced;
                        }
                        return videoInfo;
                    }
                } catch (parseError) {
                    continue;
                }
            }
        }

        // Method 5: Extract direct video URLs from HTML
        const directVideoMatches = [
            html.match(/https:\/\/[^"]*\.mp4[^"]*/g),
            html.match(/https:\/\/v\d+[^"]*\.tiktokcdn[^"]*/g),
            html.match(/https:\/\/[^"]*\.tiktokv[^"]*/g)
        ].flat().filter(Boolean);

        if (directVideoMatches.length > 0) {
            const basicVideoInfo = {
                success: true,
                videoId: url.match(/\/video\/(\d+)/)?.[1] || '',
                title: 'TikTok Video',
                author: 'Unknown',
                authorUsername: 'unknown',
                thumbnail: '',
                duration: 0,
                videoNoWatermark: directVideoMatches[0],
                videoWithWatermark: directVideoMatches[0],
                audioUrl: '',
                views: 0,
                likes: 0,
                shares: 0,
                comments: 0
            };
            
            // Always enhance with meta tag data for direct URL extraction
            const enhanced = extractMetaTagInfo(html, basicVideoInfo);
            return enhanced;
        }

        return { success: false };
    } catch (error) {
        console.error('Browser extractor error:', error.message);
        return { success: false };
    }
}

/**
 * Extract additional info from meta tags and page content
 */
function extractMetaTagInfo(html, existingVideoInfo) {
    try {
        // Extract title from various sources with better patterns
        const titleSources = [
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
            html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1],
            html.match(/name="twitter:title"\s+content="([^"]+)"/i)?.[1],
            html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1],
            // Extract from JSON-LD structured data
            html.match(/"name"\s*:\s*"([^"]+)"/)?.[1],
            html.match(/"headline"\s*:\s*"([^"]+)"/)?.[1]
        ].filter(Boolean);

        // Extract author from various sources with improved patterns
        const authorSources = [
            // From URL pattern
            html.match(/@([a-zA-Z0-9_.]+)/)?.[1],
            // From JSON data
            html.match(/"uniqueId"\s*:\s*"([^"]+)"/)?.[1],
            html.match(/"nickname"\s*:\s*"([^"]+)"/)?.[1],
            html.match(/"username"\s*:\s*"([^"]+)"/)?.[1],
            // From meta tags
            html.match(/property="og:title"\s+content="[^"]*@([a-zA-Z0-9_.]+)/i)?.[1],
            html.match(/"author"\s*:\s*"@?([^"]+)"/i)?.[1],
            // From structured data
            html.match(/"creator"\s*:\s*{\s*"name"\s*:\s*"@?([^"]+)"/)?.[1]
        ].filter(Boolean);

        // Extract thumbnail with multiple sources
        const thumbnailSources = [
            html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1],
            html.match(/name="twitter:image"\s+content="([^"]+)"/i)?.[1],
            html.match(/"cover"\s*:\s*"([^"]+)"/)?.[1],
            html.match(/"thumbnail"\s*:\s*"([^"]+)"/)?.[1],
            html.match(/"image"\s*:\s*"([^"]+\.jpg[^"]*)"/)?.[1],
            html.match(/https:\/\/[^"]*\.jpg[^"]*/)?.[0]
        ].filter(Boolean);

        // Clean and format the extracted data
        const cleanTitle = titleSources[0]
            ?.replace(/\s*\|\s*TikTok$/i, '')
            ?.replace(/^\s*TikTok\s*[-|]\s*/i, '')
            ?.trim() || existingVideoInfo.title;
            
        const cleanAuthor = authorSources[0]
            ?.replace(/^@/, '')
            ?.trim() || existingVideoInfo.authorUsername;

        console.log('📝 Extracted metadata:');
        console.log('Title sources found:', titleSources.slice(0, 3));
        console.log('Author sources found:', authorSources.slice(0, 3));
        console.log('Thumbnail sources found:', thumbnailSources.slice(0, 2));

        return {
            ...existingVideoInfo,
            title: cleanTitle && cleanTitle !== 'TikTok Video' ? cleanTitle : existingVideoInfo.title,
            author: cleanAuthor && cleanAuthor !== 'unknown' ? cleanAuthor : existingVideoInfo.author,
            authorUsername: cleanAuthor && cleanAuthor !== 'unknown' ? cleanAuthor : existingVideoInfo.authorUsername,
            thumbnail: thumbnailSources[0] || existingVideoInfo.thumbnail
        };
    } catch (error) {
        console.error('Meta tag extraction error:', error.message);
        return existingVideoInfo;
    }
}

/**
 * Extract video info from parsed JSON data
 */
function extractVideoFromData(data, originalUrl) {
    try {
        // Try different data structures
        const possiblePaths = [
            // Path 1: Standard structure
            data?.['webapp.video-detail']?.itemInfo?.itemStruct,
            // Path 2: SIGI_STATE structure  
            data?.VideoDetailPage?.itemInfo?.itemStruct,
            // Path 3: Direct itemStruct
            data?.itemStruct,
            // Path 4: Universal data structure
            data?.default?.['webapp.video-detail']?.itemInfo?.itemStruct,
            // Path 5: Search in ItemModule dynamically
            ...Object.values(data?.ItemModule || {}).map(item => item?.itemStruct).filter(Boolean),
        ];

        for (const videoData of possiblePaths) {
            if (videoData && videoData.video) {
                const video = videoData.video;
                const author = videoData.author || {};
                const stats = videoData.stats || videoData.statsV2 || {};
                
                // Extract video URLs with priority - try multiple paths
                const videoSources = [
                    // High priority - direct download/play URLs
                    video.playAddr?.urlList?.[0],
                    video.downloadAddr?.urlList?.[0], 
                    video.playApi,
                    // Medium priority - alternative URL structures
                    video.playAddr?.url_list?.[0],
                    video.download_addr?.url_list?.[0],
                    video.play_addr?.url_list?.[0],
                    // Low priority - backup URLs
                    video.url,
                    video.src,
                    video.playURL
                ].filter(Boolean);

                const playAddr = videoSources[0];
                const downloadAddr = videoSources[1] || videoSources[0];
                
                if (playAddr || downloadAddr) {
                    return {
                        success: true,
                        videoId: videoData.id || originalUrl.match(/\/video\/(\d+)/)?.[1] || '',
                        title: videoData.desc || videoData.description || videoData.title || 'TikTok Video',
                        author: author.nickname || author.uniqueId || author.username || 'Unknown',
                        authorUsername: author.uniqueId || author.id || author.username || 'unknown',
                        thumbnail: video.cover?.urlList?.[0] || video.originCover?.urlList?.[0] || video.cover?.url_list?.[0] || video.dynamicCover?.urlList?.[0] || '',
                        duration: video.duration || 0,
                        videoNoWatermark: downloadAddr || playAddr,
                        videoWithWatermark: playAddr || downloadAddr,
                        audioUrl: videoData.music?.playUrl?.urlList?.[0] || videoData.music?.play_url?.url_list?.[0] || '',
                        views: stats.playCount || stats.play_count || 0,
                        likes: stats.diggCount || stats.digg_count || 0,
                        shares: stats.shareCount || stats.share_count || 0,
                        comments: stats.commentCount || stats.comment_count || 0
                    };
                }
            }
        }

        return { success: false };
    } catch (error) {
        console.error('Data extraction error:', error.message);
        return { success: false };
    }
}

/**
 * Method 2: Simulate browser network interception
 */
async function interceptNetworkRequests(url) {
    try {
        const videoId = url.match(/\/video\/(\d+)/)?.[1];
        if (!videoId) return { success: false };

        // Simulate requests that browsers make when loading TikTok page
        const networkRequests = [
            // API calls that TikTok web makes
            `https://www.tiktok.com/api/item/detail/?itemId=${videoId}`,
            `https://www.tiktok.com/api/recommend/item_list/?itemID=${videoId}`,
            `https://www.tiktok.com/node/share/video/@unknown/${videoId}`,
            // Mobile API endpoints
            `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
            `https://api19-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
        ];

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': url,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        // Try each network request
        for (const apiUrl of networkRequests) {
            try {
                const response = await axios.get(apiUrl, { 
                    headers, 
                    timeout: 8000,
                    validateStatus: () => true // Accept all status codes
                });

                if (response.data) {
                    const videoInfo = extractVideoFromData(response.data, url);
                    if (videoInfo.success) {
                        console.log('✓ Network interception successful:', apiUrl);
                        return videoInfo;
                    }
                }
            } catch (apiError) {
                continue; // Try next endpoint
            }
        }

        return { success: false };
    } catch (error) {
        console.error('Network interception error:', error.message);
        return { success: false };
    }
}

/**
 * Method 3: Extract using browser-like DOM parsing
 */
async function extractUsingDOMParser(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        // Parse HTML like a browser would
        const dom = new JSDOM(response.data, {
            url: url,
            resources: 'usable',
            runScripts: 'outside-only'
        });

        const document = dom.window.document;

        // Look for video elements and data attributes
        const videoElements = [
            ...document.querySelectorAll('video[src]'),
            ...document.querySelectorAll('[data-video-url]'),
            ...document.querySelectorAll('[data-download-url]')
        ];

        for (const element of videoElements) {
            const videoUrl = element.src || element.getAttribute('data-video-url') || element.getAttribute('data-download-url');
            if (videoUrl && videoUrl.includes('.mp4')) {
                return {
                    success: true,
                    videoId: url.match(/\/video\/(\d+)/)?.[1] || '',
                    title: document.title || 'TikTok Video',
                    author: 'Unknown',
                    authorUsername: 'unknown',
                    thumbnail: '',
                    duration: 0,
                    videoNoWatermark: videoUrl,
                    videoWithWatermark: videoUrl,
                    audioUrl: '',
                    views: 0,
                    likes: 0,
                    shares: 0,
                    comments: 0
                };
            }
        }

        return { success: false };
    } catch (error) {
        console.error('DOM parser error:', error.message);
        return { success: false };
    }
}

/**
 * Main browser extraction function - combines all methods
 */
async function extractVideoBrowserStyle(url) {
    console.log('🔍 Browser-style extraction for:', url);

    // Method 1: Extract from page HTML (most reliable)
    console.log('Trying Method 1: Page HTML extraction...');
    const result1 = await extractFromPageHTML(url);
    if (result1.success && result1.videoNoWatermark) {
        console.log('✓ Page HTML extraction successful');
        return result1;
    }

    // Method 2: Intercept network requests
    console.log('Trying Method 2: Network interception...');
    const result2 = await interceptNetworkRequests(url);
    if (result2.success && result2.videoNoWatermark) {
        console.log('✓ Network interception successful');
        return result2;
    }

    // Method 3: DOM parsing
    console.log('Trying Method 3: DOM parsing...');
    const result3 = await extractUsingDOMParser(url);
    if (result3.success && result3.videoNoWatermark) {
        console.log('✓ DOM parsing successful');
        return result3;
    }

    console.log('✗ All browser-style methods failed');
    return {
        success: false,
        error: 'Unable to extract video using browser-style methods'
    };
}

module.exports = {
    extractVideoBrowserStyle,
    extractFromPageHTML,
    interceptNetworkRequests,
    extractUsingDOMParser
};