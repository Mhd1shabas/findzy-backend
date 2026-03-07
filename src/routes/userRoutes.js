const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserMe, updateUser } = require("../controllers/userController");

router.get("/me", protect, getUserMe);
router.put("/update", protect, updateUser);

module.exports = router;
