const express = require("express");
const router = express.Router();
const { getDashboardStats, getDashboardActivity } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// All dashboard routes require authentication
router.use(protect);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get dashboard activity feed
router.get("/activity", getDashboardActivity);

// Legacy provider dashboard route
router.get("/provider", (req, res) => {
  res.json({
    message: "Welcome to Provider Dashboard",
    user: req.user,
  });
});

module.exports = router;
