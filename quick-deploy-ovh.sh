#!/bin/bash
# Quick deploy script for OVH server

echo "🚀 Quick Deploy to OVH Server"
echo "=============================="

# Configuration
SERVER_USER="ubuntu"  # Change this to your server username
SERVER_IP="YOUR_SERVER_IP"  # Change this to your OVH server IP
PROJECT_PATH="/home/ubuntu/snaptikclone"  # Change this to your project path

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SERVER_IP is set
if [[ "$SERVER_IP" == "YOUR_SERVER_IP" ]]; then
    print_error "Please edit this script and set your SERVER_IP!"
    echo "Edit: nano quick-deploy-ovh.sh"
    echo "Change: SERVER_IP=\"YOUR_ACTUAL_SERVER_IP\""
    exit 1
fi

print_status "Deploying to server: $SERVER_USER@$SERVER_IP"

# Deploy commands
print_status "1. Pulling latest code from GitHub..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /home/ubuntu/snaptikclone
echo "📡 Current directory: $(pwd)"
echo "🔍 Current commit: $(git log --oneline -1)"
echo ""
echo "📥 Pulling latest changes..."
git pull origin main
echo ""
echo "📦 Installing dependencies..."
npm install --production
echo ""
echo "🔄 Restarting application..."
pm2 restart snaptik-clone
echo ""
echo "✅ Deployment completed!"
EOF

if [ $? -eq 0 ]; then
    print_status "2. Clearing Cloudflare cache..."
    print_warning "Don't forget to clear Cloudflare cache!"
    print_warning "Go to: Cloudflare Dashboard > Caching > Configuration > Purge Everything"
    echo ""
    print_status "🎉 Deployment successful!"
    echo ""
    echo "🔍 Test your changes:"
    echo "curl -s https://snaptikks.com | grep 'ca-pub-3333877427723579'"
else
    print_error "❌ Deployment failed!"
    exit 1
fi