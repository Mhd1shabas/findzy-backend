const express = require("express");
const router = express.Router();
const { protect, providerOnly } = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

router.get("/me", protect, providerOnly, getMyProfile);
router.put("/me", protect, providerOnly, updateMyProfile);

module.exports = router;
