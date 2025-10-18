# 🚀 SnapTik Clone - Installation & Setup Guide

Complete guide to set up and run the TikTok video downloader with Node.js backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)
- A web browser (Chrome, Firefox, Edge, etc.)

## 🔧 Installation Steps

### Step 1: Navigate to Project Directory

```powershell
cd c:\Users\Administrator\Documents\GitHub\snaptikclone
```

### Step 2: Install Dependencies

```powershell
npm install
```

This will install all required packages:
- express (web framework)
- cors (Cross-Origin Resource Sharing)
- axios (HTTP client)
- helmet (security headers)
- express-rate-limit (rate limiting)
- dotenv (environment variables)
- nodemon (auto-restart during development)

### Step 3: Create Environment File

```powershell
Copy-Item .env.example .env
```

Or manually create a `.env` file with:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Step 4: Start the Server

**Development Mode (with auto-restart):**
```powershell
npm run dev
```

**Production Mode:**
```powershell
npm start
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 Quick Start

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Copy environment file:**
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Start server:**
   ```powershell
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
snaptikclone/
├── controllers/
│   └── tiktokController.js    # Video processing logic
├── routes/
│   └── tiktok.js              # API routes
├── utils/
│   └── helpers.js             # Helper functions
├── css/
│   └── style.css              # Styles
├── js/
│   └── app.js                 # Frontend JavaScript
├── index.html                 # Main page
├── server.js                  # Express server
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # Documentation
```

## 🔌 API Endpoints

### POST `/api/tiktok/download`

Download TikTok video information.

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
    "duration": 30
  }
}
```

### GET `/api/health`

Check server health.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## ⚙️ Configuration

### Environment Variables

Edit `.env` file to customize:

```env
# Server port
PORT=3000

# Environment (development/production)
NODE_ENV=development

# Allowed CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Rate Limiting

By default, the API limits:
- **100 requests per 15 minutes** per IP address

To modify, edit `server.js`:

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // change this number
});
```

## 🧪 Testing

### Test API with PowerShell:

```powershell
$body = @{
    url = "https://www.tiktok.com/@username/video/1234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/tiktok/download" -Method Post -Body $body -ContentType "application/json"
```

### Test API with curl:

```bash
curl -X POST http://localhost:3000/api/tiktok/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@username/video/1234567890"}'
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

### Dependencies Installation Failed

Try clearing npm cache:
```powershell
npm cache clean --force
npm install
```

### CORS Errors

Make sure your `.env` file has the correct origins:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

### Cannot Find Module Error

Reinstall dependencies:
```powershell
Remove-Item node_modules -Recurse -Force
npm install
```

## 📊 Performance Tips

1. **Enable production mode:**
   ```env
   NODE_ENV=production
   ```

2. **Use PM2 for production:**
   ```powershell
   npm install -g pm2
   pm2 start server.js --name snaptik
   pm2 save
   ```

3. **Enable compression:**
   Install compression middleware:
   ```powershell
   npm install compression
   ```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use HTTPS in production** - Set up SSL/TLS
3. **Rate limiting enabled** - Prevents abuse
4. **Helmet.js enabled** - Security headers
5. **Input validation** - URL validation implemented

## 🌐 Deployment

### Deploy to Heroku:

```powershell
# Install Heroku CLI
# Create Heroku app
heroku create snaptik-clone

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy to Vercel:

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Railway:

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

## 📝 Available Scripts

```powershell
# Start server (production)
npm start

# Start server with auto-restart (development)
npm run dev

# Install dependencies
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## ⚠️ Important Notes

1. **TikTok API Changes**: TikTok may change their HTML structure, requiring updates to scraping logic.

2. **Rate Limits**: TikTok may block excessive requests. Implement caching if needed.

3. **Legal Compliance**: Ensure compliance with TikTok's Terms of Service and local laws.

4. **Content Rights**: Users should only download content they have rights to use.

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Check `.env` configuration
4. Review API endpoint responses
5. Check TikTok URL format

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation
- Review error logs in console

## 🎉 Success!

If everything is working, you should see:

```
╔═══════════════════════════════════════╗
║   SnapTik Clone Server Started! 🚀   ║
╠═══════════════════════════════════════╣
║  Port: 3000                        
║  Environment: development
║  URL: http://localhost:3000
╚═══════════════════════════════════════╝
```

Visit `http://localhost:3000` and start downloading TikTok videos! 🎥
