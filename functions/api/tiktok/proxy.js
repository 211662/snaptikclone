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

    // Fetch video with proper TikTok headers
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': context.request.headers.get('Range') || 'bytes=0-',
        'Referer': 'https://www.tiktok.com/',
        'Origin': 'https://www.tiktok.com',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'no-cors'
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 3600
      }
    });

    if (!response.ok) {
      // Return more detailed error
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch video',
        status: response.status,
        statusText: response.statusText,
        url: decodedUrl.substring(0, 100) + '...'
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Copy headers from response
    const newHeaders = new Headers();
    
    // Copy important headers
    ['Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges'].forEach(header => {
      const value = response.headers.get(header);
      if (value) newHeaders.set(header, value);
    });
    
    // Add CORS and download headers
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    newHeaders.set('Content-Disposition', 'attachment; filename="tiktok_video.mp4"');
    newHeaders.set('Cache-Control', 'public, max-age=3600');

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
