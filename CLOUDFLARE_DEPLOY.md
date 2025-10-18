# 🚀 Deploy lên Cloudflare Pages với Workers

## Phương pháp 1: Deploy qua Cloudflare Dashboard (Dễ nhất - Khuyên dùng)

### Bước 1: Kết nối GitHub với Cloudflare Pages

1. Truy cập: **https://dash.cloudflare.com**
2. Đăng nhập hoặc tạo tài khoản
3. Sidebar bên trái → Click **"Workers & Pages"**
4. Click **"Create application"** → Tab **"Pages"**
5. Click **"Connect to Git"**

### Bước 2: Chọn Repository

1. Authorize Cloudflare truy cập GitHub
2. Chọn repository **snaptikclone**
3. Click **"Begin setup"**

### Bước 3: Cấu hình Build

```
Project name: snaptikclone
Production branch: main
Build command: (để trống)
Build output directory: /
Root directory: (để trống)
```

### Bước 4: Environment Variables (Optional)

Không cần thiết lập gì thêm.

### Bước 5: Deploy

1. Click **"Save and Deploy"**
2. Đợi vài phút để Cloudflare build
3. Xong! Cloudflare sẽ cho bạn URL: `https://snaptikclone.pages.dev`

---

## ⚠️ LƯU Ý QUAN TRỌNG

**Cloudflare Pages CHỈ host static files (HTML/CSS/JS)**

Backend Node.js của bạn **KHÔNG thể chạy** trên Cloudflare Pages!

### Giải pháp:

**Option A: Dùng Cloudflare Workers (Serverless - Phức tạp)**
- Cần viết lại backend thành Cloudflare Workers
- File `worker.js` đã được tạo sẵn
- Cần setup Wrangler CLI và deploy riêng

**Option B: Tách Frontend/Backend (Đơn giản hơn)**
- **Frontend**: Cloudflare Pages (static files)
- **Backend**: Railway.app (Node.js server)

---

## 🎯 Khuyến nghị: Deploy toàn bộ lên Railway

**CÁCH ĐƠN GIẢN NHẤT:**

1. Truy cập: https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub → Chọn `snaptikclone`
4. Xong! Railway tự động:
   - Cài dependencies
   - Chạy Node.js server
   - Cho bạn URL: `https://snaptikclone.up.railway.app`

**Frontend + Backend đều chạy được!** ✅

---

## 📊 So sánh

| Platform | Frontend | Backend Node.js | Độ khó | Miễn phí |
|----------|----------|----------------|---------|----------|
| **Railway** | ✅ | ✅ | ⭐ Dễ | 500h/tháng |
| **Render** | ✅ | ✅ | ⭐⭐ TB | Có (sleep sau 15min) |
| **Cloudflare Pages** | ✅ | ❌ | ⭐⭐⭐ Khó | Unlimited |
| **Cloudflare Workers** | ✅ | ✅ | ⭐⭐⭐⭐ Rất khó | 100k req/day |

---

## 🚀 Deploy ngay trên Railway (1 phút)

```bash
# Không cần command gì cả!
# Chỉ cần:
```

1. Vào https://railway.app
2. Login GitHub
3. New Project → Chọn repo
4. Deploy!

**URL sẽ có dạng:** `https://snaptikclone-production.up.railway.app`

---

## ❓ Câu hỏi thường gặp

**Q: Cloudflare Pages có chạy được Node.js không?**  
A: KHÔNG. Chỉ chạy static files (HTML/CSS/JS).

**Q: Vậy làm sao để backend hoạt động?**  
A: Dùng Railway/Render để host backend, hoặc viết lại bằng Cloudflare Workers.

**Q: Railway có miễn phí không?**  
A: CÓ. 500 giờ/tháng miễn phí (đủ chạy cả tháng).

**Q: Cách nào đơn giản nhất?**  
A: Deploy toàn bộ lên **Railway** - 1 click là xong!

---

**Bạn muốn deploy theo cách nào?**
- ✅ **Railway** (đơn giản, khuyên dùng)
- ⚠️ **Cloudflare Pages + Railway Backend** (hơi phức tạp)
- ⚠️ **Cloudflare Workers** (rất phức tạp, cần viết lại code)
