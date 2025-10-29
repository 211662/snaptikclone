#!/bin/bash

# SnapTik Clone - Quick Deploy Script for OVH
echo "🚀 Deploying SnapTik Clone to 15.235.200.228"

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone project
git clone https://github.com/211662/snaptikclone.git
cd snaptikclone

# Install dependencies
npm install

# Create .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://15.235.200.228:3000,https://15.235.200.228:3000
EOF

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "snaptik-clone",
    script: "server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | sudo bash

# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo tee /etc/nginx/sites-available/snaptik << EOF
server {
    listen 80;
    server_name 15.235.200.228;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/snaptik /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Configure firewall
sudo ufw allow ssh
sudo ufw allow "Nginx Full"
echo "y" | sudo ufw enable

# Create management script
cat > manage.sh << EOF
#!/bin/bash
case "\$1" in
    start) pm2 start snaptik-clone && sudo systemctl start nginx ;;
    stop) pm2 stop snaptik-clone && sudo systemctl stop nginx ;;
    restart) pm2 restart snaptik-clone && sudo systemctl restart nginx ;;
    status) pm2 status && sudo systemctl status nginx --no-pager ;;
    logs) pm2 logs snaptik-clone ;;
    *) echo "Usage: \$0 {start|stop|restart|status|logs}" ;;
esac
EOF
chmod +x manage.sh

echo "✅ Deploy completed!"
echo "🌐 Website: http://15.235.200.228"
echo "📊 Admin: http://15.235.200.228/admin.html"
echo "🔧 Management: ./manage.sh {start|stop|restart|status|logs}"

# Final check
curl -s http://localhost:3000/api/health || echo "❌ API not responding"
pm2 status

