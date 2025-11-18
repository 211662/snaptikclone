#!/bin/bash
# Test domain configuration and redirects

echo "🔍 Testing snaptikks.com redirect setup..."
echo ""

echo "1. Testing main domain (snaptikks.com):"
curl -I -s https://snaptikks.com | head -n 5
echo ""

echo "2. Testing www redirect (www.snaptikks.com → snaptikks.com):"
response=$(curl -I -s https://www.snaptikks.com)
status=$(echo "$response" | head -n1)
location=$(echo "$response" | grep -i "location:" | head -n1)
echo "Status: $status"
echo "$location"
echo ""

echo "3. Testing redirect follows the path:"
echo "Testing: https://www.snaptikks.com/test-path"
curl -I -s "https://www.snaptikks.com/test-path" | grep -E "(HTTP|Location)" | head -n2
echo ""

echo "4. DNS Records check:"
echo "A record for snaptikks.com:"
dig +short snaptikks.com A
echo "CNAME for www.snaptikks.com:"
dig +short www.snaptikks.com CNAME
echo ""

echo "5. SSL Certificate verification:"
echo "Main domain SSL:"
echo | timeout 5 openssl s_client -servername snaptikks.com -connect snaptikks.com:443 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null || echo "SSL check timeout"
echo ""

echo "✅ Redirect test completed!"
echo ""
echo "Expected behavior:"
echo "- snaptikks.com → 200 OK"
echo "- www.snaptikks.com → 301 redirect → snaptikks.com"