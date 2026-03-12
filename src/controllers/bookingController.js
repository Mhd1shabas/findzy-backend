const Booking = require("../models/booking");
const Service = require("../models/service");
const Notification = require("../models/notification");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, price } = req.body;

    if (!serviceId || !providerId || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user is booking their own service
    if (req.user.id === providerId) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    const booking = await Booking.create({
      serviceId,
      providerId,
      userId: req.user.id,
      price,
      bookingStatus: "pending",
    });

    // Create a notification for the provider
    const service = await Service.findById(serviceId);
    const serviceName = service ? service.title : "a service";
    await Notification.create({
      userId: providerId,
      serviceId: serviceId,
      message: `${req.user.name || "Someone"} booked your ${serviceName} service.`,
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
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("serviceId", "title category serviceImages")
      .populate("providerId", "name businessName photos avatar whatsapp phone")
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// @desc    Get provider bookings
// @route   GET /api/bookings/provider
// @access  Private
exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user.id })
      .populate("serviceId", "title category price priceType")
      .populate("userId", "name photos university phone whatsapp")
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    console.error("Get provider bookings error:", err);
    res.status(500).json({ message: "Failed to fetch provider bookings" });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('serviceId', 'title');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Determine permissions (only provider can accept/reject/progress, mostly client/provider can cancel)
    // For simplicity, let's just make sure req.user.id is either provider or client
    if (booking.providerId.toString() !== req.user.id && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    booking.bookingStatus = status;
    await booking.save();

    // Create notification based on status
    const notifyId = req.user.id === booking.providerId.toString() ? booking.userId : booking.providerId;
    const serviceName = booking.serviceId ? booking.serviceId.title : 'Service';

    let msg = `Your booking for ${serviceName} was updated to ${status}.`;
    if (status === 'accepted') msg = `Great news! Your booking for ${serviceName} was accepted.`;
    if (status === 'rejected') msg = `Sorry! Your booking for ${serviceName} was rejected.`;
    if (status === 'completed') msg = `Your booking for ${serviceName} is marked complete!`;

    await Notification.create({
      userId: notifyId,
      serviceId: booking.serviceId ? booking.serviceId._id : null,
      message: msg,
    });

    res.json(booking);
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

const Message = require("../models/message");

// @desc    Get messages for a booking
// @route   GET /api/bookings/:id/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure authorized
    if (booking.providerId.toString() !== req.user.id && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ bookingId: req.params.id })
      .populate("senderId", "name photos")
      .sort("createdAt");

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// @desc    Send a message for a booking
// @route   POST /api/bookings/:id/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Message text is required" });

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure authorized
    if (booking.providerId.toString() !== req.user.id && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to send messages here" });
    }

    // Must be accepted or in progress to chat (or completed)
    if (booking.bookingStatus === "pending" || booking.bookingStatus === "rejected" || booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Chat is not available for this booking status" });
    }

    const message = await Message.create({
      bookingId: booking._id,
      senderId: req.user.id,
      text,
    });

    const populatedMessage = await Message.findById(message._id).populate("senderId", "name photos");

    // Create notification for the other user
    const notifyId = req.user.id === booking.providerId.toString() ? booking.userId : booking.providerId;
    await Notification.create({
      userId: notifyId,
      serviceId: booking.serviceId,
      message: `You have a new message from ${req.user.name} regarding your booking.`,
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
