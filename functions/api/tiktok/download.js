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

    // Try alternative API - SnapTik API (more reliable)
    const apiEndpoint = 'https://snaptik.app/abc2.php';
    
    // Build form data
    const formBody = `url=${encodeURIComponent(tiktokUrl)}`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Origin': 'https://snaptik.app',
        'Referer': 'https://snaptik.app/'
      },
      body: formBody
    });

    const html = await response.text();
    
    // Parse HTML response to extract video URLs
    const hdMatch = html.match(/href="([^"]+)"[^>]*>Download HD</i);
    const wmMatch = html.match(/href="([^"]+)"[^>]*>Download \(watermark\)/i);
    const audioMatch = html.match(/href="([^"]+)"[^>]*>Download MP3/i);
    
    if (!hdMatch && !wmMatch) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Could not extract video URLs',
        details: {
          message: 'API response parsing failed',
          requestUrl: tiktokUrl
        }
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get current host for proxy URLs
    const requestUrl = new URL(context.request.url);
    const hostUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        videoId: '',
        title: 'TikTok Video',
        author: 'TikTok User',
        authorUsername: 'user',
        thumbnail: '',
        duration: 0,
        videoNoWatermark: hdMatch ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(hdMatch[1])}` : '',
        videoWithWatermark: wmMatch ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(wmMatch[1])}` : '',
        audioUrl: audioMatch ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(audioMatch[1])}` : '',
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
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
