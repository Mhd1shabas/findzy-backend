const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  matchSkills,
  recommendServices,
  getSkillStats,
} = require("../controllers/matchingController");

// All routes require authentication
router.use(protect);

router.get("/match", matchSkills);
router.get("/recommend", recommendServices);
router.get("/stats", getSkillStats);

module.exports = router;