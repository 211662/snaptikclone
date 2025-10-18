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

    // Final solution: Return TikTok oembed URL for frontend to handle
    try {
      // Use TikTok's official oembed API
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
      
      const response = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('TikTok oembed failed');
      }

      const data = await response.json();
      
      // Extract video ID from URL
      const videoIdMatch = tiktokUrl.match(/video\/(\d+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';

      // Return basic info - frontend will handle download via iframe
      return new Response(JSON.stringify({
        success: true,
        data: {
          videoId: videoId,
          title: data.title || 'TikTok Video',
          author: data.author_name || 'Unknown',
          authorUsername: data.author_unique_id || 'unknown',
          thumbnail: data.thumbnail_url || '',
          duration: 0,
          // Return TikTok URLs directly - let user download from TikTok site
          videoNoWatermark: tiktokUrl,
          videoWithWatermark: tiktokUrl,
          audioUrl: '',
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          embed_url: `https://www.tiktok.com/embed/${videoId}`,
          warning: 'Click to open video on TikTok, then right-click video and choose "Save video as..."'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (apiError) {
      // Last resort - return basic info for manual download
      const videoIdMatch = tiktokUrl.match(/video\/(\d+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          videoId: videoId,
          title: 'TikTok Video',
          author: 'TikTok User',
          authorUsername: 'user',
          thumbnail: '',
          duration: 0,
          videoNoWatermark: tiktokUrl,
          videoWithWatermark: tiktokUrl,
          audioUrl: '',
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          warning: 'Open video on TikTok to download'
        }
      }), {
        status: 200,
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
