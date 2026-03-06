const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getChat, postMessage } = require("../controllers/chatController");
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// any authenticated user may initiate a chat with a provider
router.route("/:id").get(protect, getChat).post(protect, upload.single('image'), postMessage);

module.exports = router;