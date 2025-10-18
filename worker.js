// Cloudflare Workers - Serverless Backend
// This replaces the Express server for Cloudflare deployment

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
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'OK', message: 'Server is running' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/tiktok/download' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { url: tiktokUrl } = body;

        if (!tiktokUrl) {
          return new Response(JSON.stringify({ success: false, error: 'URL is required' }), {
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
          return new Response(JSON.stringify({ success: false, error: 'Invalid TikTok URL' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Fetch video data
        const videoData = await getVideoFromPublicAPI(tiktokUrl);

        if (!videoData.success) {
          return new Response(JSON.stringify({ success: false, error: 'Failed to fetch video' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          data: videoData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/tiktok/proxy') {
      try {
        const videoUrl = url.searchParams.get('url');
        if (!videoUrl) {
          return new Response(JSON.stringify({ success: false, error: 'URL required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Proxy the video
        const response = await fetch(decodeURIComponent(videoUrl), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.tikwm.com/',
          }
        });

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');

        return new Response(response.body, {
          headers: newHeaders
        });

      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static files (frontend)
    return env.ASSETS.fetch(request);
  }
};

// Fetch video from public API
async function getVideoFromPublicAPI(url) {
  try {
    const apiEndpoint = 'https://www.tikwm.com/api/';
    
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('count', '12');
    formData.append('cursor', '0');
    formData.append('web', '1');
    formData.append('hd', '1');

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData
    });

    const data = await response.json();

    if (data.code === 0) {
      const baseUrl = 'https://www.tikwm.com';
      const getAbsoluteUrl = (relativeUrl) => {
        if (!relativeUrl) return '';
        if (relativeUrl.startsWith('http')) return relativeUrl;
        return baseUrl + relativeUrl;
      };

      return {
        success: true,
        videoId: data.data.id || '',
        title: data.data.title || 'TikTok Video',
        author: data.data.author?.nickname || 'Unknown',
        authorUsername: data.data.author?.unique_id || 'unknown',
        thumbnail: getAbsoluteUrl(data.data.cover || data.data.origin_cover),
        duration: data.data.duration || 0,
        videoNoWatermark: getAbsoluteUrl(data.data.hdplay || data.data.play),
        videoWithWatermark: getAbsoluteUrl(data.data.wmplay || data.data.play),
        audioUrl: getAbsoluteUrl(data.data.music),
        views: data.data.play_count || 0,
        likes: data.data.digg_count || 0,
        shares: data.data.share_count || 0,
        comments: data.data.comment_count || 0
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Public API error:', error.message);
    return { success: false };
  }
}
