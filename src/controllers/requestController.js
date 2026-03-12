const Request = require("../models/request");
const Service = require("../models/service");
const User = require("../models/user");

// ✅ Create a service request
exports.createRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { serviceId, title, description, preferredDate, preferredTime, duration, location, contactMethod } = req.body;

    // Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not found or unavailable" });
    }

    // Prevent requesting own service
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot request your own service" });
    }

    const request = new Request({
      service: serviceId,
      requester: req.user._id,
      provider: service.provider,
      title,
      description,
      preferredDate,
      preferredTime,
      duration,
      location,
      contactMethod,
    });

    await request.save();

    // Populate the response
    await request.populate([
      { path: 'service', select: 'title category price priceType' },
      { path: 'requester', select: 'name email' },
      { path: 'provider', select: 'name businessName email' }
    ]);

    res.status(201).json({
      message: "Service request created successfully",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create request" });
  }
};

// ✅ Get requests for current user (as requester)
exports.getMyRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const requests = await Request.find({ requester: req.user._id })
      .populate('service', 'title category price priceType images')
      .populate('provider', 'name businessName email phone whatsapp')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// ✅ Get requests for current provider
exports.getProviderRequests = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const requests = await Request.find({ provider: req.user._id })
      .populate('service', 'title category price priceType')
      .populate('requester', 'name email phone whatsapp university major')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch provider requests" });
  }
};

// ✅ Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { status, agreedPrice, priceType, meetingLink, meetingAddress } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only provider can update status
    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update requests for your services" });
    }

    // Update request
    const updates = { status };
    if (agreedPrice) updates.agreedPrice = agreedPrice;
    if (priceType) updates.priceType = priceType;
    if (meetingLink) updates.meetingLink = meetingLink;
    if (meetingAddress) updates.meetingAddress = meetingAddress;

    if (status === "completed") {
      updates.completedAt = new Date();
    } else if (status === "cancelled") {
      updates.cancelledAt = new Date();
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate([
      { path: 'service', select: 'title category' },
      { path: 'requester', select: 'name email' },
      { path: 'provider', select: 'name businessName email' }
    ]);

    res.json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update request" });
  }
};

// ✅ Add message to request
exports.addMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { message } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only requester or provider can add messages
    if (
      request.requester.toString() !== req.user._id.toString() &&
      request.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You can only message on your own requests" });
    }

    request.messages.push({
      sender: req.user._id,
      message,
      timestamp: new Date(),
    });

    await request.save();

    res.json({
      message: "Message added successfully",
      newMessage: request.messages[request.messages.length - 1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add message" });
  }
};

// ✅ Get request by ID
exports.getRequestById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const request = await Request.findById(req.params.id)
      .populate('service', 'title description category price priceType images')
      .populate('requester', 'name email phone whatsapp university major')
      .populate('provider', 'name businessName email phone whatsapp university major')
      .populate('messages.sender', 'name');

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only requester or provider can view
    if (
      request.requester.toString() !== req.user._id.toString() &&
      request.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You can only view your own requests" });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch request" });
  }
};

// ✅ Add review to completed request
exports.addReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { rating, comment } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only requester can add review
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only review your own requests" });
    }

    // Only completed requests can be reviewed
    if (request.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed requests" });
    }

    // Check if already reviewed
    if (request.review) {
      return res.status(400).json({ message: "Request already reviewed" });
    }

    request.review = {
      rating,
      comment,
      createdAt: new Date(),
    };

    await request.save();

    // Update provider's average rating
    const provider = await User.findById(request.provider);
    if (provider) {
      const allReviews = await Request.find({
        provider: request.provider,
        status: "completed",
        "review.rating": { $exists: true }
      }).select('review.rating');

      const totalRating = allReviews.reduce((sum, req) => sum + req.review.rating, 0);
      provider.averageRating = totalRating / allReviews.length;
      await provider.save();
    }

    res.json({
      message: "Review added successfully",
      review: request.review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// ✅ Get request statistics
exports.getRequestStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const stats = {
      totalRequests: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      completedRequests: 0,
      cancelledRequests: 0,
    };

    // Unified stats: Count everything related to the user
    stats.totalRequests = await Request.countDocuments({ $or: [{ provider: req.user._id }, { requester: req.user._id }] });
    stats.pendingRequests = await Request.countDocuments({ $or: [{ provider: req.user._id }, { requester: req.user._id }], status: "pending" });
    stats.acceptedRequests = await Request.countDocuments({ $or: [{ provider: req.user._id }, { requester: req.user._id }], status: "accepted" });
    stats.completedRequests = await Request.countDocuments({ $or: [{ provider: req.user._id }, { requester: req.user._id }], status: "completed" });
    stats.cancelledRequests = await Request.countDocuments({ $or: [{ provider: req.user._id }, { requester: req.user._id }], status: "cancelled" });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};