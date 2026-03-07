const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getProviderStats,
  incrementProfileViews,
  incrementWhatsappClicks,
} = require("../controllers/statsController");

router.get("/provider", protect, getProviderStats);

// public (no auth needed)
router.post("/view/:id", incrementProfileViews);
router.post("/whatsapp/:id", incrementWhatsappClicks);

module.exports = router;
