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

    // Method: Direct fetch from TikTok - get video info from page HTML
    try {
      // Fetch the TikTok video page
      const pageResponse = await fetch(tiktokUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.tiktok.com/'
        }
      });

      const html = await pageResponse.text();
      
      // Extract video data from HTML (it's in a script tag)
      const videoDataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);
      
      if (!videoDataMatch) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Could not extract video data from page',
          details: 'Video may be private or URL is invalid'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const videoData = JSON.parse(videoDataMatch[1]);
      const videoDetail = videoData?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;
      
      if (!videoDetail) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Video data structure not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get current host for proxy URLs
      const requestUrl = new URL(context.request.url);
      const hostUrl = `${requestUrl.protocol}//${requestUrl.host}`;

      // Extract video URLs - TikTok provides playAddr (no watermark) and downloadAddr (with watermark)
      const playAddr = videoDetail.video?.playAddr || videoDetail.video?.downloadAddr;
      const downloadAddr = videoDetail.video?.downloadAddr || videoDetail.video?.playAddr;
      const musicUrl = videoDetail.music?.playUrl;

      return new Response(JSON.stringify({
        success: true,
        data: {
          videoId: videoDetail.id || '',
          title: videoDetail.desc || 'TikTok Video',
          author: videoDetail.author?.nickname || 'Unknown',
          authorUsername: videoDetail.author?.uniqueId || 'unknown',
          thumbnail: videoDetail.video?.cover || videoDetail.video?.dynamicCover || '',
          duration: videoDetail.video?.duration || 0,
          videoNoWatermark: playAddr ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(playAddr)}` : '',
          videoWithWatermark: downloadAddr ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(downloadAddr)}` : '',
          audioUrl: musicUrl ? `${hostUrl}/api/tiktok/proxy?url=${encodeURIComponent(musicUrl)}` : '',
          views: videoDetail.stats?.playCount || 0,
          likes: videoDetail.stats?.diggCount || 0,
          shares: videoDetail.stats?.shareCount || 0,
          comments: videoDetail.stats?.commentCount || 0
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (parseError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to parse video data',
        details: parseError.message
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
