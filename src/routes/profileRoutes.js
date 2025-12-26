const express = require("express");
const router = express.Router();
const { protect, providerOnly } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/profileController");

router.put("/provider", protect, providerOnly, updateProfile);

module.exports = router;
