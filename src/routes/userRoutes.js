const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserMe, updateUser, getUserById } = require("../controllers/userController");

router.get("/me", protect, getUserMe);
router.put("/update", protect, updateUser);
router.get("/:id", getUserById);

module.exports = router;
