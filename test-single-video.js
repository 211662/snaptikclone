const axios = require('axios');

async function testVideo() {
    const videoUrl = 'https://www.tiktok.com/@catsden2024/video/7561503932820835592';
    
    console.log('Testing video:', videoUrl);
    console.log('='.repeat(70));
    
    try {
        const response = await axios.post('https://www.tikwm.com/api/',
            `url=${encodeURIComponent(videoUrl)}&hd=1`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        console.log('\n📦 Response Code:', response.data.code);
        console.log('📝 Message:', response.data.msg || 'No message');
        
        if (response.data.code === 0 && response.data.data) {
            const data = response.data.data;
            console.log('\n✅ SUCCESS! Video data retrieved:\n');
            console.log('Title:', data.title);
            console.log('Author:', data.author?.nickname);
            console.log('Duration:', data.duration + 's');
            console.log('\n📹 Video URLs:');
            console.log('  - hdplay (HD no watermark):', data.hdplay || '❌ NOT AVAILABLE');
            console.log('  - play (normal):', data.play || '❌ NOT AVAILABLE');
            console.log('  - wmplay (with watermark):', data.wmplay || '❌ NOT AVAILABLE');
            
            // Check which one we'll use
            const noWatermark = data.hdplay || data.play || data.wmplay;
            console.log('\n🎯 Will use for "No Watermark":', noWatermark ? '✅ ' + noWatermark.substring(0, 60) + '...' : '❌ NONE');
            
        } else {
            console.log('\n❌ FAILED!');
            console.log('Full response:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
}

testVideo();
