# 🔧 OVH Server Maintenance - Quick Reference

## ⚡ Các lệnh thường dùng

### **1. Kiểm tra trạng thái:**
```bash
# Check tất cả services
./manage.sh status

# Check specific
pm2 status
sudo systemctl status nginx
curl http://localhost:3000/api/health
```

### **2. Restart services:**
```bash
# Restart tất cả
./manage.sh restart

# Restart riêng lẻ
pm2 restart snaptik-clone
sudo systemctl restart nginx
```

### **3. Xem logs:**
```bash
# App logs
./manage.sh logs
pm2 logs snaptik-clone --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### **4. Monitor tài nguyên:**
```bash
# CPU/Memory real-time
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit
```

---

## 🚨 Troubleshooting

### **Website không load được:**
```bash
# 1. Check nginx
sudo nginx -t
sudo systemctl status nginx

# 2. Check app
pm2 status
curl http://localhost:3000/api/health

# 3. Check firewall
sudo ufw status

# 4. Check domain DNS
nslookup yourdomain.com
```

### **App crash liên tục:**
```bash
# Check memory
free -h

# Check logs lỗi
pm2 logs snaptik-clone --err

# Restart with fresh process
pm2 delete snaptik-clone
pm2 start ecosystem.config.js
```

### **SSL certificate issues:**
```bash
# Check cert status
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run

# Fix nginx after cert renewal
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 Performance Monitoring

### **Traffic monitoring:**
```bash
# Real-time connections
sudo netstat -an | grep :80 | wc -l
sudo netstat -an | grep :443 | wc -l

# Top IPs accessing site
sudo tail -1000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -10
```

### **Resource usage:**
```bash
# Memory usage by process
ps aux --sort=-%mem | head -20

# CPU usage
top -o %CPU

# Disk I/O
sudo iotop
```

---

## 🔄 Update & Backup

### **Update app:**
```bash
cd /home/ubuntu/snaptikclone
./manage.sh update
```

### **Manual backup:**
```bash
./manage.sh backup

# Or full system backup
sudo rsync -av --exclude=/proc --exclude=/sys --exclude=/dev /home/ubuntu/snaptikclone/ /backup/
```

### **Database backup (if using):**
```bash
# If you add database later
# mysqldump -u user -p database > backup.sql
```

---

## ⚙️ Configuration Files

### **Important file locations:**
```
/home/ubuntu/snaptikclone/          # App directory
/home/ubuntu/snaptikclone/.env      # Environment config
/etc/nginx/sites-available/snaptik # Nginx config
/etc/letsencrypt/live/domain.com/   # SSL certificates
~/.pm2/logs/                        # PM2 logs
```

### **Edit configs:**
```bash
# App environment
nano .env

# Nginx config
sudo nano /etc/nginx/sites-available/snaptik
sudo nginx -t && sudo systemctl reload nginx

# PM2 config
nano ecosystem.config.js
pm2 restart snaptik-clone
```

---

## 🛡️ Security Maintenance

### **Update system:**
```bash
sudo apt update && sudo apt upgrade -y
sudo reboot  # if kernel updated
```

### **Check failed login attempts:**
```bash
sudo tail -f /var/log/auth.log | grep "Failed password"
```

### **Firewall management:**
```bash
# Check rules
sudo ufw status numbered

# Block IP (if needed)
sudo ufw deny from 192.168.1.100

# Allow specific service
sudo ufw allow from 192.168.1.0/24 to any port 22
```

---

## 📈 Scaling Tips

### **If traffic increases:**

1. **Increase PM2 instances:**
```bash
# Edit ecosystem.config.js
instances: 'max'  # Use all CPU cores

# Or specific number
instances: 4

pm2 restart snaptik-clone
```

2. **Add caching:**
```bash
# Install Redis for caching
sudo apt install redis-server
```

3. **Optimize Nginx:**
```bash
# Add to nginx config
worker_processes auto;
worker_connections 1024;
```

---

## 📞 Emergency Contacts

### **Quick fixes:**
```bash
# Site completely down
sudo systemctl restart nginx
pm2 restart all

# High CPU usage
pm2 restart snaptik-clone

# Disk full
sudo apt autoremove
sudo apt autoclean
./manage.sh backup  # then move backups to external storage
```

### **Health check endpoints:**
- **App**: `http://yourdomain.com/api/health`
- **Nginx**: Check if site loads
- **SSL**: Check browser lock icon

---

**💡 Pro tip: Bookmark this file và check thường xuyên!**