const express = require("express");
const router = express.Router();
const { addReview } = require("../controllers/reviewController");

router.post("/:id", addReview);

module.exports = router;
