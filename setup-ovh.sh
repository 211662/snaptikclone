#!/bin/bash

# SnapTik Clone - OVH Server Auto Setup Script
# Chạy với: bash setup-ovh.sh

set -e

echo "🚀 SnapTik Clone - OVH Server Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., snaptik.com): " DOMAIN_NAME
if [[ -z "$DOMAIN_NAME" ]]; then
    print_error "Domain name is required!"
    exit 1
fi

print_status "Setting up SnapTik Clone for domain: $DOMAIN_NAME"

# 1. Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js installed: $node_version"
print_status "npm installed: $npm_version"

# 3. Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# 4. Clone project (if not exists)
if [ ! -d "snaptikclone" ]; then
    print_status "Cloning SnapTik project..."
    git clone https://github.com/211662/snaptikclone.git
fi

cd snaptikclone

# 5. Install dependencies
print_status "Installing project dependencies..."
npm install

# 6. Create .env file
print_status "Creating .env configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://$DOMAIN_NAME,https://www.$DOMAIN_NAME
EOF

# 7. Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'snaptik-clone',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# 8. Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
pm2 startup | tail -1 | sudo bash

# 9. Install and configure Nginx
print_status "Installing and configuring Nginx..."
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/snaptik << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=download:10m rate=5r/s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Download endpoint rate limiting
    location /api/tiktok/download {
        limit_req zone=download burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/snaptik /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
    sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# 10. Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable

# 11. Install SSL certificate
print_status "Installing SSL certificate..."
sudo apt install certbot python3-certbot-nginx -y

print_warning "Setting up SSL certificate for $DOMAIN_NAME"
print_warning "Make sure your domain is pointing to this server's IP address!"
read -p "Press Enter to continue with SSL setup (or Ctrl+C to skip)..."

if sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME; then
    print_status "SSL certificate installed successfully!"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_status "SSL auto-renewal configured"
else
    print_warning "SSL certificate installation failed. You can run it manually later:"
    print_warning "sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
fi

# 12. Final checks
print_status "Running final checks..."

# Check if app is running
if pm2 list | grep -q "snaptik-clone.*online"; then
    print_status "✅ PM2 application is running"
else
    print_error "❌ PM2 application is not running"
fi

# Check if Nginx is running
if sudo systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
fi

# Test API endpoint
if curl -s http://localhost:3000/api/health | grep -q "OK"; then
    print_status "✅ API is responding"
else
    print_error "❌ API is not responding"
fi

# Create management script
cat > manage.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        pm2 start ecosystem.config.js
        sudo systemctl start nginx
        echo "✅ Services started"
        ;;
    stop)
        pm2 stop snaptik-clone
        sudo systemctl stop nginx
        echo "🛑 Services stopped"
        ;;
    restart)
        pm2 restart snaptik-clone
        sudo systemctl restart nginx
        echo "🔄 Services restarted"
        ;;
    status)
        echo "PM2 Status:"
        pm2 status
        echo ""
        echo "Nginx Status:"
        sudo systemctl status nginx --no-pager -l
        ;;
    logs)
        pm2 logs snaptik-clone
        ;;
    update)
        git pull origin main
        npm install
        pm2 restart snaptik-clone
        echo "🔄 Application updated"
        ;;
    backup)
        backup_name="snaptik-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$backup_name" --exclude=node_modules --exclude=logs .
        echo "📦 Backup created: $backup_name"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|update|backup}"
        exit 1
        ;;
esac
EOF

chmod +x manage.sh

print_status "🎉 Setup completed successfully!"
echo ""
echo "=================================="
echo "📋 SETUP SUMMARY"
echo "=================================="
echo "🌐 Domain: $DOMAIN_NAME"
echo "🚀 Application: Running on PM2"
echo "🔒 SSL: $(if [ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]; then echo "Enabled"; else echo "Manual setup required"; fi)"
echo "🛡️  Firewall: Enabled"
echo "📊 Monitoring: pm2 monit"
echo ""
echo "🔧 Management commands:"
echo "  ./manage.sh start    - Start services"
echo "  ./manage.sh stop     - Stop services"
echo "  ./manage.sh restart  - Restart services"
echo "  ./manage.sh status   - Check status"
echo "  ./manage.sh logs     - View logs"
echo "  ./manage.sh update   - Update application"
echo "  ./manage.sh backup   - Create backup"
echo ""
echo "🌐 Your website should be available at:"
echo "  http://$DOMAIN_NAME"
if [ -f /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ]; then
    echo "  https://$DOMAIN_NAME"
fi
echo ""
print_status "Happy downloading! 🎬"