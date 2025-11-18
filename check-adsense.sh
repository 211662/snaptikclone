#!/bin/bash
# Check Google AdSense meta tag in HTML files

echo "🔍 Checking Google AdSense meta tag in HTML files..."
echo ""

# Find all HTML files and check for AdSense meta tag
find /Users/linh/Desktop/github/snaptikclone -name "*.html" | while read file; do
    filename=$(basename "$file")
    if grep -q "ca-pub-3333877427723579" "$file"; then
        echo "✅ $filename - AdSense tag found"
    else
        echo "❌ $filename - AdSense tag missing"
    fi
done

echo ""
echo "🎯 Summary:"
echo "Google AdSense Publisher ID: ca-pub-3333877427723579"
echo ""
echo "Meta tag format:"
echo '<meta name="google-adsense-account" content="ca-pub-3333877427723579">'
echo ""
echo "✅ Check completed!"