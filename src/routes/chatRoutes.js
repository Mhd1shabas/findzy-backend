const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getChat, postMessage } = require("../controllers/chatController");

// any authenticated user may initiate a chat with a provider
router.route("/:id").get(protect, getChat).post(protect, postMessage);

module.exports = router;