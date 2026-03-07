const Booking = require("../models/booking");
const Service = require("../models/service");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, price } = req.body;

    if (!serviceId || !providerId || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await Booking.create({
      serviceId,
      providerId,
      userId: req.user.id,
      price,
      bookingStatus: "pending",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    // Fetch bookings where the user is the requester (userId)
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("serviceId", "title")
      .populate("providerId", "name businessName")
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
