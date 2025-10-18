# SnapTik Clone 🎵

A full-featured clone of the popular SnapTik website for downloading TikTok videos without watermarks. **Now with working Node.js backend!**

![TikTok Downloader](https://img.shields.io/badge/TikTok-Downloader-FF0050?style=for-the-badge&logo=tiktok)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express)

## 🌟 Features

- ✅ **Working Backend API** - Full Node.js Express server
- 🚫 **No Watermark** - Download TikTok videos without watermarks
- 🎵 **Audio Extraction** - Download MP3 audio from TikTok videos
- ⚡ **Fast Processing** - Quick video processing and download
- 📱 **Responsive Design** - Works on all devices (mobile, tablet, desktop)
- 🔒 **Secure** - Helmet.js security, rate limiting, input validation
- 🌐 **No Installation** - Works directly in the browser
- 💯 **Free & Open Source** - 100% free to use and modify

## 📋 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client for API requests
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Client-side functionality
- **Google Fonts (Poppins)** - Typography

## 🚀 Quick Start

### Prerequisites

- Node.js v14 or higher ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Installation

1. **Clone or navigate to the repository:**
   ```powershell
   cd c:\Users\Administrator\Documents\GitHub\snaptikclone
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Create environment file:**
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Start the server:**
   ```powershell
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

That's it! 🎉

## 📖 Detailed Setup Guide

For detailed installation instructions, troubleshooting, and deployment guides, see [SETUP.md](SETUP.md).

## 📁 Project Structure

```
snaptikclone/
├── controllers/
│   └── tiktokController.js    # Video processing & API logic
├── routes/
│   └── tiktok.js              # API route definitions
├── utils/
│   └── helpers.js             # Utility functions
├── css/
│   └── style.css              # Stylesheet
├── js/
│   └── app.js                 # Frontend JavaScript
├── index.html                 # Main HTML page
├── server.js                  # Express server setup
├── package.json               # Dependencies & scripts
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # This file
└── SETUP.md                   # Detailed setup guide
```

## ⚙️ How to Use

1. **Copy TikTok Link**: 
   - Open TikTok app or website
   - Find a video you want to download
   - Click "Share" → "Copy Link"

2. **Paste URL**: 
   - Paste the TikTok video URL into the input field
   - The app supports various TikTok URL formats

3. **Download**: 
   - Click the "Download" button
   - Wait for processing (usually 2-5 seconds)

4. **Choose Format**: 
   - Download without watermark (recommended)
   - Download with watermark
   - Download as MP3 audio only

## � API Documentation

### POST `/api/tiktok/download`

Download TikTok video information and get download links.

**Request:**
```json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "1234567890",
    "title": "Video title",
    "author": "Author name",
    "authorUsername": "username",
    "thumbnail": "https://...",
    "videoNoWatermark": "https://...",
    "videoWithWatermark": "https://...",
    "audioUrl": "https://...",
    "views": 1000000,
    "likes": 50000,
    "shares": 2000,
    "comments": 500,
    "duration": 30
  }
}
```

### GET `/api/health`

Check server health status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Supported TikTok URL Formats

- `https://www.tiktok.com/@username/video/1234567890`
- `https://vm.tiktok.com/ABC123/` (short URL)
- `https://vt.tiktok.com/ABC123/` (short URL)
- `https://m.tiktok.com/v/1234567890.html`
- `https://www.douyin.com/video/1234567890`

## 📊 Available Scripts

```powershell
# Install dependencies
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

## � Troubleshooting

### Common Issues

**Port already in use:**
```powershell
# Change port in .env file
PORT=3001
```

**Module not found:**
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install
```

**CORS errors:**
```env
# Add your domain to .env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**TikTok video not loading:**
- Check if the URL is valid
- TikTok may have changed their API/structure
- Try with a different video
- Check server logs for errors

For more troubleshooting tips, see [SETUP.md](SETUP.md).

## 🔒 Security Features

- ✅ **Helmet.js** - Security HTTP headers
- ✅ **Rate Limiting** - Prevents API abuse (100 req/15min)
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - URL validation and sanitization
- ✅ **Error Handling** - Proper error messages without exposing internals
- ✅ **Environment Variables** - Sensitive data in .env file

## 📱 Responsive Design

The website is fully responsive and optimized for:
- 📱 **Mobile** (< 768px)
- 📱 **Tablet** (768px - 1199px)
- 💻 **Desktop** (1200px+)

## 🌐 Deployment

### Heroku

```powershell
heroku create snaptik-clone
heroku config:set NODE_ENV=production
git push heroku main
```

### Vercel

```powershell
npm install -g vercel
vercel
```

### Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables
4. Deploy automatically

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## ⚠️ Important Legal Notes

1. **Educational Purpose**: This project is for educational purposes only.

2. **TikTok Terms of Service**: Ensure compliance with TikTok's ToS and local laws.

3. **Content Rights**: Only download content you have rights to use.

4. **No Affiliation**: This tool is not affiliated with TikTok or ByteDance Ltd.

5. **API Changes**: TikTok may change their API/HTML structure without notice.

6. **Rate Limits**: Respect TikTok's rate limits to avoid being blocked.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use consistent code formatting
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [SnapTik.app](https://snaptik.app/)
- Built with Express.js and modern web technologies
- Icons from inline SVG
- Fonts from Google Fonts (Poppins)

## 📧 Contact & Support

- 📝 **Issues**: [GitHub Issues](https://github.com/yourusername/snaptikclone/issues)
- 📖 **Documentation**: [SETUP.md](SETUP.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/snaptikclone/discussions)

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ for the community**

*Disclaimer: This tool is not affiliated with TikTok or ByteDance Ltd. Use responsibly and respect content creators' rights.*
