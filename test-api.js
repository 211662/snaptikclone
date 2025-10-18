// Test multiple TikTok downloader APIs
const axios = require('axios');

async function testAPI1_TikWM() {
    console.log('\n📍 Testing API 1: TikWM.com');
    console.log('='.repeat(60));
    
    const testUrl = 'https://www.tiktok.com/@catsden2024/video/7561595753368694049';
    
    try {
        const response = await axios.post('https://www.tikwm.com/api/', 
            `url=${encodeURIComponent(testUrl)}&count=12&cursor=0&web=1&hd=1`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        console.log('Response code:', response.data.code);
        console.log('Message:', response.data.msg);
        if (response.data.data) {
            console.log('✅ hdplay:', response.data.data.hdplay ? 'AVAILABLE' : 'NOT AVAILABLE');
            console.log('✅ play:', response.data.data.play ? 'AVAILABLE' : 'NOT AVAILABLE');
            console.log('✅ wmplay:', response.data.data.wmplay ? 'AVAILABLE' : 'NOT AVAILABLE');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testAPI2_Snaptik() {
    console.log('\n📍 Testing API 2: SnapTik (tikok.io)');
    console.log('='.repeat(60));
    
    const testUrl = 'https://www.tiktok.com/@catsden2024/video/7561595753368694049';
    
    try {
        const response = await axios.post('https://tikok.io/api/tiktok/download', 
            { url: testUrl },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function testAPI3_TikMate() {
    console.log('\n📍 Testing API 3: TikMate (api.tikmate.app)');
    console.log('='.repeat(60));
    
    const testUrl = 'https://www.tiktok.com/@catsden2024/video/7561595753368694049';
    
    try {
        const response = await axios.post('https://api.tikmate.app/api/lookup',
            { url: testUrl },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function runAllTests() {
    console.log('\n🧪 TESTING TIKTOK DOWNLOADER APIs\n');
    
    await testAPI1_TikWM();
    await testAPI2_Snaptik();
    await testAPI3_TikMate();
    
    console.log('\n✅ All tests completed!\n');
}

runAllTests();
