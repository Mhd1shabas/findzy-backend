const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getMyBookings, getProviderBookings, updateBookingStatus, getMessages, sendMessage } = require("../controllers/bookingController");

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/provider", protect, getProviderBookings);
router.put("/:id/status", protect, updateBookingStatus);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);

module.exports = router;
