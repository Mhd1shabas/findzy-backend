const express = require("express");
const router = express.Router();
const { protect, providerOnly } = require("../middleware/authMiddleware");

router.get("/provider", protect, providerOnly, (req, res) => {
  res.json({
    message: "Welcome to Provider Dashboard",
    user: req.user, // { id, role }
  });
});

module.exports = router;
