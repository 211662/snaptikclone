// Cloudflare Pages Function - Video Proxy
export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const url = new URL(context.request.url);
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

    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid URL format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
