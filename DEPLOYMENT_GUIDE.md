# 🚀 Deployment Guide - SnapTik Clone

Hướng dẫn deploy frontend và backend riêng biệt.

## 📋 Tổng quan

- **Frontend**: Cloudflare Pages (miễn phí, nhanh)
- **Backend**: Railway.app (miễn phí, dễ dùng)

---

## 🔧 Bước 1: Deploy Backend lên Railway

### 1.1. Tạo tài khoản Railway

1. Truy cập: https://railway.app
2. Click **"Login"** → Đăng nhập bằng GitHub
3. Cho phép Railway truy cập GitHub repositories

### 1.2. Deploy Backend

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Tìm và chọn repository `snaptikclone`
4. Railway sẽ tự động:
   - Phát hiện Node.js
   - Chạy `npm install`
   - Khởi động `node server.js`

### 1.3. Lấy URL Backend

1. Sau khi deploy xong, click vào project
2. Click tab **"Settings"**
3. Tìm **"Domains"** → Click **"Generate Domain"**
4. Copy URL (ví dụ: `https://snaptikclone-production.up.railway.app`)
5. **LƯU LẠI URL NÀY!** Sẽ dùng ở bước tiếp theo

### 1.4. Cấu hình Environment Variables (Optional)

1. Click tab **"Variables"**
2. Thêm:
   ```
   NODE_ENV=production
   PORT=3000
   ```

---

## 🌐 Bước 2: Cập nhật Frontend với Backend URL

### 2.1. Mở file `js/config.js`

Tìm dòng:
```javascript
production: 'https://your-app-name.railway.app',
```

Thay bằng URL Railway của bạn:
```javascript
production: 'https://snaptikclone-production.up.railway.app',
```

### 2.2. Commit và Push

```powershell
git add .
git commit -m "Update backend URL"
git push origin main
```

---

## ☁️ Bước 3: Deploy Frontend lên Cloudflare Pages

### 3.1. Tạo tài khoản Cloudflare

1. Truy cập: https://pages.cloudflare.com
2. Đăng nhập hoặc tạo tài khoản
3. Kết nối với GitHub

### 3.2. Tạo Project mới

1. Click **"Create a project"**
2. Chọn **"Connect to Git"**
3. Chọn repository `snaptikclone`
4. Click **"Begin setup"**

### 3.3. Cấu hình Build

```
Build command: (để trống)
Build output directory: /
Root directory: /
```

Click **"Save and Deploy"**

### 3.4. Lấy URL Frontend

Sau khi deploy xong, Cloudflare sẽ cho bạn URL:
```
https://snaptikclone.pages.dev
```

---

## ✅ Bước 4: Test Website

1. Mở URL Cloudflare Pages của bạn
2. Paste link TikTok
3. Click Download
4. Kiểm tra xem có tải được video không

---

## 🔄 Alternative: Deploy Backend lên Render.com

Nếu không dùng Railway, có thể dùng Render:

### Deploy lên Render

1. Truy cập: https://render.com
2. Đăng nhập bằng GitHub
3. Click **"New +"** → **"Web Service"**
4. Chọn repository `snaptikclone`
5. Cấu hình:
   ```
   Name: snaptikclone-backend
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   ```
6. Click **"Create Web Service"**

URL sẽ có dạng: `https://snaptikclone-backend.onrender.com`

---

## 🔄 Alternative: Deploy lên Heroku

### Deploy lên Heroku

1. Cài Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Chạy commands:

```powershell
# Login
heroku login

# Tạo app
heroku create snaptikclone-backend

# Deploy
git push heroku main

# Mở app
heroku open
```

URL sẽ có dạng: `https://snaptikclone-backend.herokuapp.com`

---

## 📝 Checklist Deploy

- [ ] Backend deployed lên Railway/Render/Heroku
- [ ] Lấy được Backend URL
- [ ] Update `js/config.js` với Backend URL
- [ ] Commit và push code
- [ ] Frontend deployed lên Cloudflare Pages
- [ ] Test tải video trên production URL
- [ ] ✅ HOÀN TẤT!

---

## 🐛 Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS, thêm domain Cloudflare vào CORS config trong `server.js`:

```javascript
const cors = require('cors');
app.use(cors({
    origin: ['https://your-app.pages.dev', 'http://localhost:3000']
}));
```

### Backend không khởi động

Check logs trong Railway/Render dashboard

### Frontend không kết nối Backend

1. Kiểm tra `js/config.js` có đúng URL không
2. Mở Developer Console (F12) xem lỗi
3. Verify backend URL còn hoạt động

---

## 💡 Tips

- **Railway**: Miễn phí 500 giờ/tháng
- **Render**: Miễn phí nhưng có thể sleep sau 15 phút không dùng
- **Cloudflare Pages**: Hoàn toàn miễn phí, không giới hạn bandwidth
- **Custom Domain**: Có thể thêm domain riêng trên cả Railway và Cloudflare

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Railway/Render logs
2. Check browser console (F12)
3. Verify backend URL trong config.js
4. Test backend trực tiếp: `https://your-backend.railway.app/api/health`

---

**Made with ❤️ - Happy Deploying!** 🚀
