# 🚀 Deploy SnapTik Clone lên OVH Server - Hướng dẫn tối thiểu

## 📋 Yêu cầu tối thiểu

### Server Requirements:
- **RAM**: 512MB (tối thiểu), 1GB (khuyến nghị)
- **Storage**: 5GB (tối thiểu)
- **OS**: Ubuntu 20.04/22.04 LTS hoặc CentOS 7/8
- **Network**: Public IP với port 80, 443 mở

### Software cần cài:
- Node.js 18+ 
- npm/yarn
- PM2 (để chạy app liên tục)
- Nginx (reverse proxy)
- Certbot (SSL certificate)

---

## ⚡ Setup nhanh (5 phút)

### 1. **Cập nhật server & cài Node.js**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### 2. **Clone & Setup project**
```bash
# Clone project
git clone https://github.com/211662/snaptikclone.git
cd snaptikclone

# Cài dependencies
npm install

# Tạo file .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF
```

### 3. **Cài PM2 để chạy app**
```bash
# Cài PM2 globally
sudo npm install -g pm2

# Tạo ecosystem file
cat > ecosystem.config.js << EOF
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
    }
  }]
}
EOF

# Start app với PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. **Cài Nginx (reverse proxy)**
```bash
# Cài Nginx
sudo apt install nginx -y

# Tạo config cho site
sudo tee /etc/nginx/sites-available/snaptik << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /home/ubuntu/snaptikclone;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/snaptik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. **Setup SSL với Let's Encrypt**
```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Tạo SSL certificate (thay yourdomain.com)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo crontab -e
# Thêm dòng này:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Cấu hình tối thiểu

### **File .env cần thiết:**
```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### **Firewall (UFW):**
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### **Auto-start services:**
```bash
sudo systemctl enable nginx
sudo systemctl enable pm2-ubuntu  # user tùy theo tên user
```

---

## 📊 Kiểm tra hoạt động

### **1. Test API:**
```bash
curl http://localhost:3000/api/health
# Response: {"status":"OK","message":"Server is running"}
```

### **2. Test website:**
```bash
curl -I http://yourdomain.com
# Should return 200 OK
```

### **3. Monitor PM2:**
```bash
pm2 status
pm2 logs snaptik-clone
pm2 monit
```

---

## 🚨 Troubleshooting

### **App không chạy:**
```bash
# Check logs
pm2 logs snaptik-clone

# Restart app
pm2 restart snaptik-clone

# Check port
sudo netstat -tlnp | grep 3000
```

### **Nginx error:**
```bash
# Check config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### **SSL issues:**
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run
```

---

## ⚡ Quick Commands

```bash
# Deploy new version
cd /home/ubuntu/snaptikclone
git pull origin main
npm install
pm2 restart snaptik-clone

# Backup
tar -czf snaptik-backup-$(date +%Y%m%d).tar.gz snaptikclone/

# Monitor
pm2 monit
htop
df -h
```

---

## 📝 Notes

- **Domain**: Nhớ point domain A record về IP server
- **Memory**: Monitor memory usage với `free -h`
- **Logs**: Check logs thường xuyên với `pm2 logs`
- **Updates**: Update dependencies định kỳ
- **Backup**: Backup code và config định kỳ

**🎯 Với setup này, website sẽ chạy ổn định với traffic vừa phải!**