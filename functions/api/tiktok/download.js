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

    // Fetch from TikWM API
    const apiEndpoint = 'https://www.tikwm.com/api/';
    const formData = new URLSearchParams();
    formData.append('url', tiktokUrl);
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

    if (data.code !== 0 || !data.data) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch video data' 
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

    // Get current host for proxy URLs
    const requestUrl = new URL(context.request.url);
    const hostUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    // Priority: hdplay (HD no watermark) > play (may be no watermark) > wmplay (with watermark)
    const noWatermarkUrl = data.data.hdplay || data.data.play || data.data.wmplay;
    const withWatermarkUrl = data.data.wmplay || data.data.play;

    return new Response(JSON.stringify({
      success: true,
      data: {
        videoId: data.data.id || '',
        title: data.data.title || 'TikTok Video',
        author: data.data.author?.nickname || 'Unknown',
        authorUsername: data.data.author?.unique_id || 'unknown',
        thumbnail: getAbsoluteUrl(data.data.cover || data.data.origin_cover),
        duration: data.data.duration || 0,
        videoNoWatermark: `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(getAbsoluteUrl(noWatermarkUrl))}`,
        videoWithWatermark: `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(getAbsoluteUrl(withWatermarkUrl))}`,
        audioUrl: `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(getAbsoluteUrl(data.data.music))}`,
        views: data.data.play_count || 0,
        likes: data.data.digg_count || 0,
        shares: data.data.share_count || 0,
        comments: data.data.comment_count || 0
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
