const express = require('express');
const router = express.Router();
const tiktokController = require('../controllers/tiktokController');

// Get video info and download links
router.post('/download', tiktokController.getVideoInfo);

// Get profile videos for bulk download
router.get('/profile/:username', tiktokController.getProfileVideos);

// Proxy download endpoint
router.get('/proxy', tiktokController.proxyDownload);

// Direct download endpoint
router.get('/video/:videoId', tiktokController.downloadVideo);

module.exports = router;
