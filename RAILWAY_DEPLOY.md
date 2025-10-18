# Railway Deployment Configuration

This file helps deploy the backend to Railway.app

## Quick Deploy to Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Railway will auto-detect Node.js
6. Set environment variables (optional)
7. Deploy!

## Environment Variables

Add these in Railway dashboard:

```
NODE_ENV=production
PORT=3000
```

Railway will provide a public URL like: `https://your-app.railway.app`

## After Deployment

Update frontend to use Railway backend URL in `js/app.js`
