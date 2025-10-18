const axios = require('axios');
const { extractVideoId, isValidTikTokUrl } = require('../utils/helpers');
const { getTikTokVideoData } = require('./tiktokApi');

/**
 * Get TikTok video information and download links
 */
exports.getVideoInfo = async (req, res) => {
    try {
        const { url } = req.body;

        // Validate URL
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        if (!isValidTikTokUrl(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TikTok URL'
            });
        }

        // Fetch video data using multiple methods
        const videoData = await getTikTokVideoData(url);

        if (!videoData.success) {
            return res.status(404).json({
                success: false,
                error: videoData.error || 'Video not found'
            });
        }

        // Return video information with proxied download URLs
        res.json({
            success: true,
            data: {
                videoId: videoData.videoId,
                title: videoData.title,
                author: videoData.author,
                authorUsername: videoData.authorUsername,
                thumbnail: videoData.thumbnail,
                duration: videoData.duration,
                // Use our proxy endpoint for downloads if URLs exist
                videoNoWatermark: videoData.videoNoWatermark ? 
                    `/api/tiktok/proxy?url=${encodeURIComponent(videoData.videoNoWatermark)}` : '',
                videoWithWatermark: videoData.videoWithWatermark ? 
                    `/api/tiktok/proxy?url=${encodeURIComponent(videoData.videoWithWatermark)}` : '',
                audioUrl: videoData.audioUrl ? 
                    `/api/tiktok/proxy?url=${encodeURIComponent(videoData.audioUrl)}` : '',
                views: videoData.views,
                likes: videoData.likes,
                shares: videoData.shares,
                comments: videoData.comments
            }
        });

    } catch (error) {
        console.error('Error in getVideoInfo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video information',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all videos from a TikTok profile
 */
exports.getProfileVideos = async (req, res) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit) || 30; // Default 30 videos

        // Validate username
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Username is required'
            });
        }

        // Clean username (remove @ if present)
        const cleanUsername = username.replace('@', '');

        console.log(`Fetching videos for profile: @${cleanUsername}`);

        // Try to fetch profile videos using TikWM API
        const tikwmResponse = await axios.post('https://www.tikwm.com/api/user/posts', {
            unique_id: cleanUsername,
            count: limit,
            cursor: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 15000
        });

        if (tikwmResponse.data && tikwmResponse.data.code === 0 && tikwmResponse.data.data) {
            const videos = tikwmResponse.data.data.videos || [];
            
            // Format videos for frontend
            const formattedVideos = videos.map(video => ({
                id: video.video_id || video.aweme_id,
                url: `https://www.tiktok.com/@${cleanUsername}/video/${video.video_id || video.aweme_id}`,
                title: video.title || video.desc || 'TikTok Video',
                thumbnail: video.cover || video.origin_cover,
                cover: video.dynamic_cover || video.cover,
                duration: video.duration || 0,
                views: video.play_count || 0,
                likes: video.digg_count || 0,
                comments: video.comment_count || 0,
                shares: video.share_count || 0,
                createTime: video.create_time || 0,
                author: {
                    username: cleanUsername,
                    nickname: video.author?.nickname || cleanUsername,
                    avatar: video.author?.avatar || ''
                }
            }));

            return res.json({
                success: true,
                username: cleanUsername,
                count: formattedVideos.length,
                videos: formattedVideos
            });
        }

        // If TikWM fails, return error
        return res.status(404).json({
            success: false,
            error: 'Profile not found or videos could not be fetched',
            message: 'The profile may be private or does not exist'
        });

    } catch (error) {
        console.error('Error in getProfileVideos:', error.message);
        
        // Handle specific errors
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                error: 'Failed to fetch profile videos',
                message: error.response.data?.msg || error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile videos',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Download video directly
 */
exports.downloadVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { quality, watermark } = req.query;

        // This would proxy the download
        // Implementation depends on your video storage/CDN
        res.json({
            success: true,
            message: 'Direct download endpoint',
            videoId,
            quality,
            watermark
        });

    } catch (error) {
        console.error('Error in downloadVideo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download video'
        });
    }
};

/**
 * Proxy video download to bypass CORS and access restrictions
 */
exports.proxyDownload = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
        }

        const decodedUrl = decodeURIComponent(url);
        console.log('Proxying download from:', decodedUrl);

        // Validate URL
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL',
                message: 'URL must start with http:// or https://'
            });
        }

        // Stream the video through our server
        const response = await axios({
            method: 'GET',
            url: decodedUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tikwm.com/',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            timeout: 60000,
            maxRedirects: 10
        });

        // Determine file type and name
        const contentType = response.headers['content-type'] || 'video/mp4';
        const isAudio = contentType.includes('audio') || decodedUrl.includes('music');
        const extension = isAudio ? 'mp3' : 'mp4';
        const filename = `tiktok_${Date.now()}.${extension}`;

        // Set appropriate headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        // Pipe the video stream to response
        response.data.pipe(res);

        // Handle errors during streaming
        response.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Stream error',
                    message: err.message
                });
            }
        });

    } catch (error) {
        console.error('Error in proxyDownload:', error.message);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Failed to download video',
                message: error.message
            });
        }
    }
};

/**
 * Fetch TikTok video data
 * This uses multiple methods to extract video information
 */
async function fetchTikTokVideo(url) {
    try {
        // Method 1: Try TikTok OEmbed API (limited info)
        const oembedData = await fetchOEmbedData(url);
        
        // Method 2: Try web scraping approach
        const scrapedData = await scrapeVideoData(url);
        
        // Combine data from different sources
        const videoData = {
            success: true,
            videoId: scrapedData.videoId || oembedData.videoId,
            title: scrapedData.title || oembedData.title || 'TikTok Video',
            author: scrapedData.author || oembedData.author_name || 'Unknown',
            authorUsername: scrapedData.authorUsername || oembedData.author_url?.split('@')[1] || 'unknown',
            thumbnail: scrapedData.thumbnail || oembedData.thumbnail_url || '',
            duration: scrapedData.duration || 0,
            videoNoWatermark: scrapedData.videoNoWatermark || '',
            videoWithWatermark: scrapedData.videoWithWatermark || '',
            audioUrl: scrapedData.audioUrl || '',
            views: scrapedData.views || 0,
            likes: scrapedData.likes || 0,
            shares: scrapedData.shares || 0,
            comments: scrapedData.comments || 0
        };

        return videoData;

    } catch (error) {
        console.error('Error fetching TikTok video:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Fetch data from TikTok oEmbed API
 */
async function fetchOEmbedData(url) {
    try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const response = await axios.get(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        return response.data;
    } catch (error) {
        console.error('OEmbed fetch error:', error.message);
        return {};
    }
}

/**
 * Scrape video data from TikTok page
 * This method extracts data from the HTML page
 */
async function scrapeVideoData(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.tiktok.com/',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'cache-control': 'max-age=0',
            },
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        const html = response.data;
        
        // Extract JSON data from script tag
        const jsonDataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
        
        if (jsonDataMatch && jsonDataMatch[1]) {
            const jsonData = JSON.parse(jsonDataMatch[1]);
            const videoDetail = jsonData.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;
            
            if (videoDetail) {
                return {
                    videoId: videoDetail.id,
                    title: videoDetail.desc || 'TikTok Video',
                    author: videoDetail.author?.nickname || 'Unknown',
                    authorUsername: videoDetail.author?.uniqueId || 'unknown',
                    thumbnail: videoDetail.video?.cover || videoDetail.video?.dynamicCover || '',
                    duration: videoDetail.video?.duration || 0,
                    videoNoWatermark: videoDetail.video?.downloadAddr || videoDetail.video?.playAddr || '',
                    videoWithWatermark: videoDetail.video?.playAddr || '',
                    audioUrl: videoDetail.music?.playUrl || '',
                    views: videoDetail.stats?.playCount || 0,
                    likes: videoDetail.stats?.diggCount || 0,
                    shares: videoDetail.stats?.shareCount || 0,
                    comments: videoDetail.stats?.commentCount || 0
                };
            }
        }

        // Fallback: Try alternative JSON extraction
        const alternativeMatch = html.match(/window\['SIGI_STATE'\]\s*=\s*({.*?});/);
        if (alternativeMatch && alternativeMatch[1]) {
            const sigiState = JSON.parse(alternativeMatch[1]);
            const itemModule = sigiState.ItemModule;
            
            if (itemModule) {
                const videoId = Object.keys(itemModule)[0];
                const videoData = itemModule[videoId];
                
                if (videoData) {
                    return {
                        videoId: videoData.id,
                        title: videoData.desc || 'TikTok Video',
                        author: videoData.author || 'Unknown',
                        authorUsername: videoData.authorId || 'unknown',
                        thumbnail: videoData.video?.cover || '',
                        duration: videoData.video?.duration || 0,
                        videoNoWatermark: videoData.video?.downloadAddr || '',
                        videoWithWatermark: videoData.video?.playAddr || '',
                        audioUrl: videoData.music?.playUrl || '',
                        views: videoData.stats?.playCount || 0,
                        likes: videoData.stats?.diggCount || 0,
                        shares: videoData.stats?.shareCount || 0,
                        comments: videoData.stats?.commentCount || 0
                    };
                }
            }
        }

        return {};

    } catch (error) {
        console.error('Scraping error:', error.message);
        return {};
    }
}
