// Cloudflare Workers - Simplified Version for SnapTik Clone
// Copy toàn bộ file này và paste vào Cloudflare Workers Dashboard

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // Health check endpoint
    if (url.pathname === '/api/health' || url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'OK', 
        message: 'Worker is running',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // TikTok download endpoint
    if (url.pathname === '/api/tiktok/download' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { url: tiktokUrl } = body;

        if (!tiktokUrl) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'URL is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Validate TikTok URL
        const tiktokPatterns = [
          /tiktok\.com\/@[\w.-]+\/video\/\d+/,
          /tiktok\.com\/v\/\d+/,
          /vm\.tiktok\.com\/[\w]+/,
          /vt\.tiktok\.com\/[\w]+/,
          /m\.tiktok\.com\/v\/\d+/
        ];

        const isValid = tiktokPatterns.some(pattern => pattern.test(tiktokUrl));
        if (!isValid) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid TikTok URL' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Fetch video data from TikWM API
        const videoData = await fetchTikTokVideo(tiktokUrl);

        if (!videoData.success) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch video data' 
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get Worker base URL for proxy
        const workerBaseUrl = `${url.protocol}//${url.host}`;
        
        // Return video data with proxied URLs (absolute URLs for production)
        return new Response(JSON.stringify({
          success: true,
          data: {
            videoId: videoData.videoId,
            title: videoData.title,
            author: videoData.author,
            authorUsername: videoData.authorUsername,
            thumbnail: videoData.thumbnail,
            duration: videoData.duration,
            videoNoWatermark: `${workerBaseUrl}/api/tiktok/proxy?url=${encodeURIComponent(videoData.videoNoWatermark)}`,
            videoWithWatermark: `${workerBaseUrl}/api/tiktok/proxy?url=${encodeURIComponent(videoData.videoWithWatermark)}`,
            audioUrl: `${workerBaseUrl}/api/tiktok/proxy?url=${encodeURIComponent(videoData.audioUrl)}`,
            views: videoData.views,
            likes: videoData.likes,
            shares: videoData.shares,
            comments: videoData.comments
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message || 'Internal server error' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Proxy endpoint for video downloads
    if (url.pathname === '/api/tiktok/proxy' && request.method === 'GET') {
      try {
        const videoUrl = url.searchParams.get('url');
        
        if (!videoUrl) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'URL parameter required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const decodedUrl = decodeURIComponent(videoUrl);

        // Validate URL format
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid URL format' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Fetch and proxy the video
        const response = await fetch(decodedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.tikwm.com/',
          }
        });

        if (!response.ok) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch video' 
          }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create new headers with CORS
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');

        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });

      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message || 'Proxy error' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Root endpoint - show available routes
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({
        success: true,
        message: 'SnapTik Clone API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          download: 'POST /api/tiktok/download',
          proxy: 'GET /api/tiktok/proxy?url=...'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Route not found',
      path: url.pathname,
      availableRoutes: ['/api/health', '/api/tiktok/download', '/api/tiktok/proxy']
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

// Helper function to fetch TikTok video data
async function fetchTikTokVideo(tiktokUrl) {
  try {
    const apiEndpoint = 'https://www.tikwm.com/api/';
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('url', tiktokUrl);
    formData.append('count', '12');
    formData.append('cursor', '0');
    formData.append('web', '1');
    formData.append('hd', '1');

    // Fetch from TikWM API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData
    });

    const data = await response.json();

    if (data.code === 0 && data.data) {
      const baseUrl = 'https://www.tikwm.com';
      
      // Helper to convert relative URLs to absolute
      const getAbsoluteUrl = (relativeUrl) => {
        if (!relativeUrl) return '';
        if (relativeUrl.startsWith('http')) return relativeUrl;
        return baseUrl + relativeUrl;
      };

      // Priority: hdplay (HD no watermark) > play (may be no watermark) > wmplay (with watermark)
      const noWatermarkUrl = data.data.hdplay || data.data.play || data.data.wmplay;
      const withWatermarkUrl = data.data.wmplay || data.data.play;

      return {
        success: true,
        videoId: data.data.id || '',
        title: data.data.title || 'TikTok Video',
        author: data.data.author?.nickname || 'Unknown',
        authorUsername: data.data.author?.unique_id || 'unknown',
        thumbnail: getAbsoluteUrl(data.data.cover || data.data.origin_cover),
        duration: data.data.duration || 0,
        videoNoWatermark: getAbsoluteUrl(noWatermarkUrl),
        videoWithWatermark: getAbsoluteUrl(withWatermarkUrl),
        audioUrl: getAbsoluteUrl(data.data.music),
        views: data.data.play_count || 0,
        likes: data.data.digg_count || 0,
        shares: data.data.share_count || 0,
        comments: data.data.comment_count || 0
      };
    }

    return { success: false };
    
  } catch (error) {
    console.error('TikTok API error:', error);
    return { success: false, error: error.message };
  }
}
