# 🚀 SnapTikks MVP Roadmap — Phát triển tính năng từng giai đoạn

> **Domain:** snaptikks.com  
> **Stack:** Node.js + Express + Vanilla JS  
> **Server:** DigitalOcean (178.128.50.244)  
> **Revenue:** Google AdSense (ca-pub-3333877427723579)  
> **Start date:** March 2025

---

## 📊 Hiện trạng (Đã hoàn thành)

| Tính năng | Trạng thái |
|---|---|
| Download video không watermark (HD) | ✅ |
| Download video có watermark | ✅ |
| Download audio MP3 | ✅ |
| Proxy download (bypass CORS) | ✅ |
| Bulk download từ profile | ⚠️ UI có, API 403 |
| Google AdSense tích hợp | ✅ |
| SSL/HTTPS (Let's Encrypt) | ✅ |
| SEO blog (2 bài viết) | ✅ |
| Admin panel (blog CMS) | ✅ UI có, chưa backend |

---

## 🏗️ PHASE 1: Ổn định & Tối ưu Core (1-2 tuần)
> **Mục tiêu:** Đảm bảo tính năng chính hoạt động 100% ổn định, tăng tốc

### 1.1 Caching layer
- [ ] Thêm in-memory cache (node-cache) cho kết quả download
- [ ] Cache theo video ID, TTL = 1 giờ
- [ ] Tránh gọi Tikwm API lặp lại cho cùng 1 video
- **File:** `controllers/tiktokApi.js`

### 1.2 Error handling & Retry
- [ ] Retry tự động khi Tikwm timeout (max 2 lần)
- [ ] Rate limit thông minh hơn (per IP, sliding window)
- [ ] Trả về lỗi user-friendly (không lộ technical error)
- **File:** `controllers/tiktokApi.js`, `server.js`

### 1.3 Download trực tiếp (không cần right-click)
- [ ] Frontend: click "Download" → tải file thẳng về máy (dùng `<a download>` + blob)
- [ ] Backend: proxy trả header `Content-Disposition: attachment`
- [ ] Thêm nút "Copy Link" cho mỗi video
- **File:** `js/app.js`, `controllers/tiktokController.js`

### 1.4 Mobile UX
- [ ] Fix responsive cho điện thoại (kết quả download bị tràn)
- [ ] Thêm loading skeleton khi chờ API
- [ ] Thêm toast notification thay vì alert()
- **File:** `css/style.css`, `js/app.js`

**Deliverable:** Core download chạy nhanh, ổn định, UX mượt trên mobile

---

## 📱 PHASE 2: Tính năng mới — Video (2-3 tuần)
> **Mục tiêu:** Mở rộng khả năng download, tăng lý do user quay lại

### 2.1 TikTok Slideshow/Photo download
- [ ] Detect video loại slideshow (photo carousel)
- [ ] Download từng ảnh riêng lẻ hoặc ZIP toàn bộ
- [ ] Hiển thị gallery preview
- **API:** Tikwm trả `images` array cho slideshow
- **File mới:** `js/slideshow.js`, cập nhật `app.js`

### 2.2 Chọn chất lượng video
- [ ] UI cho phép chọn: HD (1080p) / SD (720p) / Low (480p)  
- [ ] Tikwm API: `hdplay` (HD), `play` (SD), `wmplay` (watermark)
- [ ] Hiển thị file size ước tính
- **File:** `js/app.js`, `index.html`

### 2.3 Video Preview
- [ ] Nhúng video player (HTML5 `<video>`) trước khi download
- [ ] Thumbnail click-to-play
- [ ] Hiển thị duration, resolution
- **File:** `js/app.js`, `css/style.css`

### 2.4 Download History (localStorage)
- [ ] Lưu lịch sử download vào localStorage
- [ ] UI hiển thị "Recent Downloads" (max 20 items)
- [ ] Nút "Clear History"
- [ ] Không cần backend — 100% client-side
- **File mới:** `js/history.js`, cập nhật `index.html`

**Deliverable:** Người dùng có thể download ảnh slideshow, chọn chất lượng, xem preview

---

## 🔧 PHASE 3: Bulk & Profile Tools (2-3 tuần)
> **Mục tiêu:** Fix bulk download, thêm profile tools — thu hút user cần tải nhiều

### 3.1 Fix Bulk Download
- [ ] Fix API profile 403 — thử endpoint mới hoặc thêm proxy
- [ ] Fallback: cho user paste nhiều URL (1 URL/dòng) thay vì dùng profile API
- [ ] Download queue với progress bar
- **File:** `js/bulk-download.js`, `controllers/tiktokController.js`

### 3.2 Multi-URL Paste Download
- [ ] Textarea cho user paste 10-50 URL cùng lúc
- [ ] Process song song (3 URL cùng lúc)
- [ ] Hiển thị progress: ✅ Done / ⏳ Processing / ❌ Failed cho mỗi URL
- [ ] Download all as ZIP (sử dụng JSZip library)
- **File mới:** hoặc cập nhật `bulk-download.html` + `bulk-download.js`

### 3.3 Profile Avatar Download
- [ ] Input username → download ảnh đại diện HD
- [ ] API: TikTok oEmbed hoặc Tikwm user info
- [ ] Hiển thị preview + nút download
- **File mới:** section mới trong `index.html` hoặc page riêng

**Deliverable:** Bulk download hoạt động, multi-URL paste, profile avatar

---

## 💰 PHASE 4: Monetization & SEO (2-3 tuần)
> **Mục tiêu:** Tăng traffic + revenue từ AdSense

### 4.1 AdSense tối ưu
- [ ] Thêm ad slots vào vị trí strategic:
  - Banner trên kết quả download
  - In-between bulk download results
  - Sidebar trên desktop
- [ ] Đặt ad unit responsive (auto size)
- [ ] A/B test vị trí ad

### 4.2 SEO Content
- [ ] Blog CMS backend (CRUD API cho admin panel)
- [ ] Tự động generate sitemap.xml khi thêm bài
- [ ] Schema markup (JSON-LD) cho mỗi trang
- [ ] Thêm 10+ bài blog nhắm keyword:
  - "tiktok downloader no watermark"
  - "download tiktok video HD"
  - "tiktok to mp3 converter"
  - "tải video tiktok không logo"
  - "snaptik alternative"
- **File:** `controllers/blogController.js` (mới), `data/posts.json`

### 4.3 Social Sharing
- [ ] Nút share kết quả download lên Twitter/Facebook/WhatsApp
- [ ] OG meta tags dynamic cho mỗi video download
- [ ] "Share this tool" CTA sau khi download thành công

### 4.4 PWA (Progressive Web App)
- [ ] Thêm `manifest.json` + Service Worker
- [ ] Cho phép "Add to Home Screen" trên mobile
- [ ] Offline page cơ bản
- **File mới:** `manifest.json`, `sw.js`

**Deliverable:** Revenue tăng, traffic organic tăng, user engagement tăng

---

## 🌍 PHASE 5: Multi-Platform (3-4 tuần)
> **Mục tiêu:** Không chỉ TikTok — hỗ trợ Instagram, YouTube Shorts, Facebook

### 5.1 Instagram Reels/Video Download
- [ ] Detect URL instagram.com
- [ ] API: sử dụng service tương tự Tikwm cho Instagram
- [ ] Cùng UI flow: paste URL → preview → download
- **File mới:** `controllers/instagramApi.js`

### 5.2 YouTube Shorts Download
- [ ] Detect URL youtube.com/shorts/
- [ ] API: ytdl-core hoặc service bên thứ 3
- [ ] Download video + audio
- **File mới:** `controllers/youtubeApi.js`

### 5.3 Facebook Video Download
- [ ] Detect URL facebook.com
- [ ] Download public video
- **File mới:** `controllers/facebookApi.js`

### 5.4 Auto-detect Platform
- [ ] Input nhận bất kỳ URL → tự detect platform
- [ ] Routing đến đúng API handler
- [ ] UI thay đổi icon/branding theo platform
- **File:** `utils/helpers.js`, `js/app.js`

**Deliverable:** SnapTikks trở thành "all-in-one video downloader"

---

## ⚡ PHASE 6: Scale & Performance (ongoing)
> **Mục tiêu:** Phục vụ 10K+ users/ngày

### 6.1 CDN & Caching
- [ ] Cloudflare page rules cache static assets
- [ ] Redis cache cho API results (thay node-cache)
- [ ] Compress responses (gzip/brotli)

### 6.2 Analytics & Monitoring
- [ ] Google Analytics 4 events tracking
- [ ] Server monitoring (PM2 metrics hoặc UptimeRobot)
- [ ] API response time logging
- [ ] Error rate dashboard

### 6.3 API Rate Limiting thông minh
- [ ] Tier-based rate limit (free vs API key)
- [ ] Captcha sau 50 downloads/giờ
- [ ] Block bot/abuse patterns

### 6.4 Database (nếu cần)
- [ ] SQLite hoặc PostgreSQL cho:
  - Download statistics
  - Blog posts (thay `data/posts.json`)
  - User preferences
- [ ] Migration scripts

**Deliverable:** Server chịu tải cao, có monitoring, data-driven decisions

---

## 📅 Timeline Tổng quan

```
March 2025  ████████████  PHASE 1: Core ổn định
April 2025  ████████████████  PHASE 2: Video features
May 2025    ████████████████  PHASE 3: Bulk & Profile
June 2025   ████████████████  PHASE 4: Monetization & SEO
July 2025   ████████████████████  PHASE 5: Multi-Platform
Aug+ 2025   ═══════════════════  PHASE 6: Scale (ongoing)
```

---

## 🎯 KPIs theo Phase

| Phase | Metric | Target |
|---|---|---|
| 1 | Download success rate | > 95% |
| 2 | Avg session duration | > 2 min |
| 3 | Downloads per session | > 3 |
| 4 | AdSense RPM | > $2 |
| 4 | Organic traffic | > 1K/day |
| 5 | Platform diversity | 3+ platforms |
| 6 | Concurrent users | > 500 |

---

## 💡 Quick Wins (có thể làm bất kỳ lúc nào)

- [ ] **Favicon** — thêm favicon.ico (hiện chưa có)
- [ ] **404 page** — trang lỗi custom thay vì mặc định
- [ ] **Loading animation** — spinner đẹp hơn khi đang fetch
- [ ] **Dark mode** — toggle dark/light theme
- [ ] **Language switcher** — EN/VI
- [ ] **Testimonials** — fake reviews section cho social proof
- [ ] **Keyboard shortcut** — Ctrl+V auto paste + submit

---

*Last updated: March 26, 2025*
*Business: NHP STORE LLC — snaptikks.com*
