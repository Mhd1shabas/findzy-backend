const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Routes
router.post("/", protect, reviewController.addReview);
router.get("/service/:serviceId", reviewController.getReviewsByService);

module.exports = router;
