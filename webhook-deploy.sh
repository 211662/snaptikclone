#!/bin/bash
# Auto-deploy webhook script for OVH server
# Place this file on your OVH server at: /home/ubuntu/webhook-deploy.sh

set -e

# Configuration
PROJECT_PATH="/home/ubuntu/snaptikclone"
LOG_FILE="/home/ubuntu/deploy.log"
LOCK_FILE="/tmp/deploy.lock"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if another deployment is running
if [ -f "$LOCK_FILE" ]; then
    log "ERROR: Another deployment is already running"
    exit 1
fi

# Create lock file
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log "🚀 Starting auto-deployment..."

# Change to project directory
cd "$PROJECT_PATH" || {
    log "ERROR: Cannot access project directory: $PROJECT_PATH"
    exit 1
}

# Pull latest changes
log "📥 Pulling latest changes from GitHub..."
if git pull origin main; then
    log "✅ Git pull successful"
else
    log "❌ Git pull failed"
    exit 1
fi

# Install/update dependencies
log "📦 Installing dependencies..."
if npm install --production; then
    log "✅ Dependencies installed"
else
    log "❌ Dependency installation failed"
    exit 1
fi

# Restart application with PM2
log "🔄 Restarting application..."
if pm2 restart snaptik-clone; then
    log "✅ Application restarted successfully"
else
    log "❌ Application restart failed"
    exit 1
fi

# Check if application is running
sleep 5
if pm2 list | grep -q "snaptik-clone.*online"; then
    log "✅ Application is running"
else
    log "❌ Application is not running after restart"
    exit 1
fi

# Test API endpoint
if curl -s http://localhost:3000/api/health | grep -q "OK"; then
    log "✅ API health check passed"
else
    log "⚠️  API health check failed"
fi

log "🎉 Deployment completed successfully!"
log "📊 Application status: $(pm2 jlist | jq -r '.[] | select(.name=="snaptik-clone") | .pm2_env.status')"