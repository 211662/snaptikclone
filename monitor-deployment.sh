#!/bin/bash
# Monitor deployment status

echo "🚀 Monitoring deployment status for snaptikks.com..."
echo "Checking for Google AdSense meta tag: ca-pub-3333877427723579"
echo ""

max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "📡 Attempt $attempt/$max_attempts ($(date))"
    
    # Check if AdSense tag is present
    if curl -s https://snaptikks.com | grep -q "ca-pub-3333877427723579"; then
        echo "✅ SUCCESS! Google AdSense meta tag found on production!"
        echo ""
        echo "🔍 Meta tag details:"
        curl -s https://snaptikks.com | grep -A 1 -B 1 "google-adsense"
        echo ""
        echo "✅ Deployment completed successfully!"
        exit 0
    else
        echo "⏳ AdSense tag not found yet... waiting..."
        sleep 30
    fi
    
    attempt=$((attempt + 1))
done

echo "❌ Deployment timeout after $max_attempts attempts"
echo "💡 You may need to:"
echo "   1. Check your hosting platform dashboard"
echo "   2. Manually trigger a rebuild"
echo "   3. Clear CDN cache"
exit 1