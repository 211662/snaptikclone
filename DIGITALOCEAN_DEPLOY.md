# 🚀 Deploy to DigitalOcean Droplet

## ⚡ Your VPS Information

**IP Address**: `68.183.239.168`  
**SSH Command**: `ssh root@68.183.239.168`

---

## Tổng quan

Deploy SnapTik Clone lên DigitalOcean VPS (Droplet) để có backend mạnh mẽ, không bị block bởi TikTok API.

## 📋 Yêu cầu

- ✅ Tài khoản DigitalOcean
- ✅ Domain (tùy chọn, có thể dùng IP)
- ✅ SSH client (Git Bash, PuTTY, hoặc terminal)

## 🎯 Chi phí ước tính

- **Basic Droplet**: $6/tháng (1GB RAM, 1 vCPU, 25GB SSD)
- **Recommended**: $12/tháng (2GB RAM, 1 vCPU, 50GB SSD)

---

## 📦 Bước 1: Tạo Droplet

### 1.1 Vào DigitalOcean Dashboard

1. Đăng nhập: https://cloud.digitalocean.com
2. Click **Create** → **Droplets**

### 1.2 Chọn Configuration

**Choose an image:**
- Distribution: **Ubuntu 22.04 LTS x64**

**Choose Size:**
- Basic plan
- CPU options: **Regular**
- RAM: **2GB** ($12/month) - khuyến nghị
  - Hoặc 1GB ($6/month) nếu ít traffic

**Choose a datacenter region:**
- Singapore (gần Việt Nam nhất)
- Hoặc San Francisco

**Authentication:**
- Chọn **SSH keys** (bảo mật hơn)
- Hoặc **Password** (đơn giản hơn)

**Finalize Details:**
- Hostname: `snaptik-server`
- Tags: `production`, `nodejs`

### 1.3 Create Droplet

Click **Create Droplet** → Chờ 1-2 phút

---

## 🔐 Bước 2: Kết nối SSH

### Windows (PowerShell/Git Bash):
```bash
ssh root@YOUR_DROPLET_IP
```

### Nhập password nếu không dùng SSH key

---

## ⚙️ Bước 3: Setup Server

### 3.1 Update system
```bash
apt update && apt upgrade -y
```

### 3.2 Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v  # Verify: v18.x.x
npm -v
```

### 3.3 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 3.4 Install Nginx (Reverse Proxy)
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 3.5 Setup Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 📁 Bước 4: Deploy Application

### 4.1 Clone Repository
```bash
cd /var/www
git clone https://github.com/211662/snaptikclone.git
cd snaptikclone
```

### 4.2 Install Dependencies
```bash
npm install --production
```

### 4.3 Create Environment File
```bash
nano .env
```

Thêm nội dung:
```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=*
```

Save: `Ctrl + O` → Enter → `Ctrl + X`

### 4.4 Test Application
```bash
npm start
```

Nếu chạy OK, nhấn `Ctrl + C` để stop.

---

## 🔄 Bước 5: Setup PM2 (Auto-restart)

### 5.1 Start with PM2
```bash
pm2 start server.js --name snaptik
pm2 save
pm2 startup
```

### 5.2 Verify
```bash
pm2 status
pm2 logs snaptik
```

---

## 🌐 Bước 6: Configure Nginx

### 6.1 Create Nginx Config
```bash
nano /etc/nginx/sites-available/snaptik
```

### 6.2 Paste Configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static files
    location / {
        root /var/www/snaptikclone;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

Replace `YOUR_DOMAIN_OR_IP` với domain hoặc IP của bạn.

### 6.3 Enable Site
```bash
ln -s /etc/nginx/sites-available/snaptik /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🔒 Bước 7: Setup SSL (HTTPS) - Tùy chọn

### Nếu có domain:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

Certbot sẽ tự động config SSL.

---

## 🧪 Bước 8: Test Website

### 8.1 Test từ browser
```
http://YOUR_IP
http://YOUR_IP/api/health
```

### 8.2 Test download
Paste TikTok URL và test download

---

## 📊 Bước 9: Monitoring

### Check PM2 status
```bash
pm2 status
pm2 logs snaptik --lines 100
```

### Check Nginx logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Server resources
```bash
htop  # Install: apt install htop
df -h
free -m
```

---

## 🔄 Bước 10: Update Code

Khi có code mới:

```bash
cd /var/www/snaptikclone
git pull origin main
npm install
pm2 restart snaptik
```

---

## 🛠️ Troubleshooting

### PM2 not starting
```bash
pm2 delete snaptik
pm2 start server.js --name snaptik
pm2 save
```

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart snaptik
```

### Nginx 502 Bad Gateway
```bash
pm2 status  # Check if app is running
systemctl status nginx
```

### Out of memory
```bash
# Add swap space
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 🎯 Kết quả

✅ Website chạy 24/7
✅ Auto-restart khi crash
✅ Nginx reverse proxy
✅ SSL/HTTPS (nếu có domain)
✅ Download TikTok video KHÔNG BỊ BLOCK
✅ Full control server

---

## 📝 Maintenance Commands

```bash
# Restart app
pm2 restart snaptik

# View logs
pm2 logs snaptik

# Stop app
pm2 stop snaptik

# Restart Nginx
systemctl restart nginx

# Update system
apt update && apt upgrade -y
```

---

## 💰 Cost Optimization

### Giảm chi phí:
- Dùng 1GB Droplet ($6/month) nếu ít traffic
- Tắt Droplet khi không dùng (không tính phí khi tắt)
- Dùng DigitalOcean credit (thường có $200 free cho user mới)

### Scale up khi cần:
```bash
# Resize Droplet từ dashboard
# Hoặc dùng Load Balancer nếu traffic cao
```

---

## 🚀 Next Steps

1. ✅ Create Droplet
2. ✅ SSH vào server
3. ✅ Setup Node.js + PM2 + Nginx
4. ✅ Deploy code
5. ✅ Test website
6. ✅ Setup SSL (nếu có domain)
7. ✅ Monitor và maintain

**Bạn đã sẵn sàng? Làm theo từng bước nhé!** 🎉
