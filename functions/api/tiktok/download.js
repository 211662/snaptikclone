// Cloudflare Pages Function - TikTok Download API
export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await context.request.json();
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

    // Use TikWM API - tested and working
    try {
      const apiEndpoint = 'https://www.tikwm.com/api/';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.tikwm.com',
          'Referer': 'https://www.tikwm.com/'
        },
        body: `url=${encodeURIComponent(tiktokUrl)}&hd=1`
      });

      const data = await response.json();

      if (data.code !== 0 || !data.data) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'TikWM API failed',
          details: {
            code: data.code,
            message: data.msg || 'Unknown error'
          }
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const baseUrl = 'https://www.tikwm.com';
      const getAbsoluteUrl = (relativeUrl) => {
        if (!relativeUrl) return '';
        if (relativeUrl.startsWith('http')) return relativeUrl;
        return baseUrl + relativeUrl;
      };

      // Return DIRECT URLs (no proxy) - let browser handle download
      const hdUrl = getAbsoluteUrl(data.data.hdplay || data.data.play);
      const wmUrl = getAbsoluteUrl(data.data.wmplay || data.data.play);
      const audioUrl = getAbsoluteUrl(data.data.music);

      return new Response(JSON.stringify({
        success: true,
        data: {
          videoId: data.data.id || '',
          title: data.data.title || 'TikTok Video',
          author: data.data.author?.nickname || 'Unknown',
          authorUsername: data.data.author?.unique_id || 'unknown',
          thumbnail: getAbsoluteUrl(data.data.cover || data.data.origin_cover),
          duration: data.data.duration || 0,
          videoNoWatermark: hdUrl,
          videoWithWatermark: wmUrl,
          audioUrl: audioUrl,
          views: data.data.play_count || 0,
          likes: data.data.digg_count || 0,
          shares: data.data.share_count || 0,
          comments: data.data.comment_count || 0
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (apiError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API request failed',
        details: apiError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
