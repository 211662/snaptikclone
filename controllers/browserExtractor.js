const axios = require('axios');

/**
 * Browser-style TikTok Video Extractor
 * Fallback method: fetches TikTok page HTML and parses embedded JSON data
 */

/**
 * Extract video data from TikTok page HTML
 */
async function extractFromPageHTML(url) {
    try {
        // Use mobile UA — bypasses TikTok WAF challenge that blocks desktop UA on servers
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
            },
            timeout: 15000,
            maxRedirects: 5,
        });

        const html = response.data;
        if (!html || html.length < 5000) {
            console.log('  ⚠ Page too small, likely WAF challenge');
            return { success: false };
        }

        // Try to extract __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON
        const rehydrationMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/);
        if (rehydrationMatch && rehydrationMatch[1]) {
            try {
                const data = JSON.parse(rehydrationMatch[1]);
                const videoDetail = data?.__DEFAULT_SCOPE__?.['webapp.video-detail'];

                if (videoDetail?.itemInfo?.itemStruct) {
                    const item = videoDetail.itemInfo.itemStruct;
                    const video = item.video || {};
                    const author = item.author || {};
                    const stats = item.stats || {};
                    const shareMeta = videoDetail.shareMeta || {};

                    // Extract video URLs from multiple possible paths
                    const videoUrl = video.playAddr?.urlList?.[0]
                        || video.downloadAddr?.urlList?.[0]
                        || video.playAddr
                        || video.downloadAddr
                        || video.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0]
                        || '';

                    if (videoUrl) {
                        return {
                            success: true,
                            videoId: item.id || url.match(/\/video\/(\d+)/)?.[1] || '',
                            title: item.desc || shareMeta.title || 'TikTok Video',
                            author: author.nickname || shareMeta.title?.split(' on TikTok')?.[0] || 'Unknown',
                            authorUsername: author.uniqueId || 'unknown',
                            thumbnail: video.cover || video.originCover || video.dynamicCover || '',
                            duration: video.duration || 0,
                            videoNoWatermark: videoUrl,
                            videoWithWatermark: videoUrl,
                            audioUrl: item.music?.playUrl || '',
                            views: stats.playCount || 0,
                            likes: stats.diggCount || 0,
                            shares: stats.shareCount || 0,
                            comments: stats.commentCount || 0
                        };
                    }

                    // Video is classified/blocked — no video URL available
                    if (item.isContentClassified) {
                        console.log('  ⚠ Content is classified by TikTok (reason:', item.ContentClassificationReason, ')');
                    }
                }
            } catch (parseError) {
                console.error('  JSON parse error:', parseError.message);
            }
        }

        // Fallback: try SIGI_STATE (older TikTok pages)
        const sigiMatch = html.match(/window\['SIGI_STATE'\]\s*=\s*({.+?});\s*window\['SIGI_RETRY'\]/);
        if (sigiMatch && sigiMatch[1]) {
            try {
                const sigiData = JSON.parse(sigiMatch[1]);
                const itemModule = sigiData.ItemModule;
                if (itemModule) {
                    const videoId = Object.keys(itemModule)[0];
                    const item = itemModule[videoId];
                    if (item?.video) {
                        const videoUrl = item.video.playAddr || item.video.downloadAddr || '';
                        if (videoUrl) {
                            return {
                                success: true,
                                videoId: item.id || videoId,
                                title: item.desc || 'TikTok Video',
                                author: item.author || 'Unknown',
                                authorUsername: item.authorId || 'unknown',
                                thumbnail: item.video.cover || '',
                                duration: item.video.duration || 0,
                                videoNoWatermark: videoUrl,
                                videoWithWatermark: videoUrl,
                                audioUrl: item.music?.playUrl || '',
                                views: item.stats?.playCount || 0,
                                likes: item.stats?.diggCount || 0,
                                shares: item.stats?.shareCount || 0,
                                comments: item.stats?.commentCount || 0
                            };
                        }
                    }
                }
            } catch (parseError) {
                console.error('  SIGI parse error:', parseError.message);
            }
        }

        // Last resort: find direct .mp4 URLs in HTML
        const mp4Matches = html.match(/https:\/\/[^"'\s]*\.mp4[^"'\s]*/g);
        if (mp4Matches && mp4Matches.length > 0) {
            // Filter out obviously wrong URLs (ads, tracking, etc.)
            const videoUrl = mp4Matches.find(u => u.includes('tiktok') || u.includes('video')) || mp4Matches[0];
            return {
                success: true,
                videoId: url.match(/\/video\/(\d+)/)?.[1] || '',
                title: 'TikTok Video',
                author: 'Unknown',
                authorUsername: url.match(/@([a-zA-Z0-9_.]+)/)?.[1] || 'unknown',
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

        return { success: false };
    } catch (error) {
        console.error('Browser extractor error:', error.message);
        return { success: false };
    }
}

/**
 * Main entry point
 */
async function extractVideoBrowserStyle(url) {
    console.log('  🔍 Browser-style extraction for:', url);
    const result = await extractFromPageHTML(url);
    if (result.success && result.videoNoWatermark) {
        console.log('  ✓ Browser extraction successful');
        return result;
    }
    console.log('  ✗ Browser extraction failed');
    return { success: false, error: 'Unable to extract video using browser-style methods' };
}

module.exports = {
    extractVideoBrowserStyle,
    extractFromPageHTML,
};