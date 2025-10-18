# 🚀 Deploy Cloudflare Workers - Hướng dẫn qua Dashboard

## Phương pháp: Copy/Paste code vào Cloudflare Dashboard (Dễ nhất!)

### **Bước 1: Đăng nhập Cloudflare**

1. Truy cập: **https://dash.cloudflare.com**
2. Đăng nhập hoặc tạo tài khoản mới (miễn phí)

---

### **Bước 2: Tạo Worker mới**

1. Sidebar bên trái → Click **"Workers & Pages"**
2. Click nút **"Create application"**
3. Click tab **"Workers"**
4. Click **"Create Worker"**

---

### **Bước 3: Copy code Worker**

1. Mở file `worker.js` trong project
2. **Copy TOÀN BỘ code** trong file đó (Ctrl+A → Ctrl+C)
3. Quay lại Cloudflare Dashboard
4. Xóa code mẫu có sẵn
5. **Paste code** từ `worker.js` vào editor
6. Click **"Save and Deploy"**

---

### **Bước 4: Test Worker**

1. Sau khi deploy xong, bạn sẽ có URL:
   ```
   https://snaptikclone.YOUR-SUBDOMAIN.workers.dev
   ```

2. Click **"Send request"** để test

3. Nếu thấy:
   ```json
   {"status":"OK","message":"Server is running"}
   ```
   → **✅ Backend đã hoạt động!**

---

### **Bước 5: Deploy Frontend lên Cloudflare Pages**

1. Quay lại Dashboard → **"Workers & Pages"**
2. Click **"Create application"** → Tab **"Pages"**
3. Click **"Connect to Git"**
4. Chọn repository `snaptikclone`
5. Build settings:
   - **Build command:** (để trống)
   - **Build output directory:** `/`
   - **Root directory:** (để trống)
6. Click **"Save and Deploy"**

---

### **Bước 6: Kết nối Frontend với Worker Backend**

Sau khi có cả 2 URLs:
- **Worker Backend:** `https://snaptikclone.YOUR-SUBDOMAIN.workers.dev`
- **Pages Frontend:** `https://snaptikclone.pages.dev`

**Cập nhật file `js/config.js`:**

```javascript
const API_CONFIG = {
    development: 'http://localhost:3000',
    production: 'https://snaptikclone.YOUR-SUBDOMAIN.workers.dev',
    get baseURL() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.development;
        }
        return this.production;
    }
};
```

**Commit và push:**

```powershell
git add js/config.js
git commit -m "Update API endpoint"
git push origin main
```

Cloudflare Pages sẽ tự động redeploy!

---

## 🎯 **Bước tóm tắt:**

1. ✅ Tạo Worker → Paste code từ `worker.js` → Deploy
2. ✅ Tạo Pages → Connect GitHub → Deploy
3. ✅ Lấy Worker URL → Update `config.js` → Push
4. ✅ Test website → Tải video TikTok

---

## 📝 **Code Worker đầy đủ**

Nếu bạn cần copy, đây là code worker đầy đủ:

```javascript
// Copy toàn bộ nội dung file worker.js trong project
```

Hoặc mở file `worker.js` và copy tất cả!

---

## 🐛 **Troubleshooting**

### **Lỗi: "Module not found"**

→ Đảm bảo bạn copy **TOÀN BỘ** code từ `worker.js`, không bỏ sót dòng nào.

### **Lỗi: "fetch is not defined"**

→ Cloudflare Workers đã có sẵn `fetch`, không cần import.

### **Frontend không kết nối được Backend**

1. Kiểm tra Worker URL trong `config.js`
2. Mở Developer Console (F12) xem lỗi
3. Test Worker trực tiếp: `https://your-worker.workers.dev/api/health`

### **CORS errors**

→ Code trong `worker.js` đã có CORS headers, nên không lỗi.

---

## 💡 **Lưu ý quan trọng:**

### **Cloudflare Workers Limits (Free Plan):**

- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ 128MB memory

**Đủ cho website cá nhân và testing!**

### **Nếu vượt giới hạn:**

- Upgrade lên Workers Paid ($5/month)
- Hoặc dùng Railway (miễn phí 500h/tháng)

---

## 🎉 **Hoàn tất!**

Sau khi làm xong các bước trên:

1. ✅ Worker Backend chạy trên: `https://xxx.workers.dev`
2. ✅ Frontend chạy trên: `https://xxx.pages.dev`
3. ✅ Website hoạt động full tính năng!

---

## 📞 **Cần giúp đỡ?**

Nếu gặp vấn đề:
1. Check Worker logs trong Cloudflare Dashboard
2. Check Browser Console (F12)
3. Verify Worker URL trong config.js
4. Test API endpoint: `/api/health`

**Chúc bạn deploy thành công! 🚀**
