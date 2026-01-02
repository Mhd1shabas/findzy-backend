const express = require("express");
const router = express.Router();
const  protect = require("../middleware/authMiddleware");
const providerOnly = require("../middleware/providerOnly");
const {
  getProviderStats,
  incrementProfileViews,
  incrementWhatsappClicks,
} = require("../controllers/statsController");

router.get("/provider", protect, providerOnly, getProviderStats);

// public (no auth needed)
router.post("/view/:id", incrementProfileViews);
router.post("/whatsapp/:id", incrementWhatsappClicks);

module.exports = router;
