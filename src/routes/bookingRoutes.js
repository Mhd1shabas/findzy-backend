const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getMyBookings } = require("../controllers/bookingController");

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);

module.exports = router;
