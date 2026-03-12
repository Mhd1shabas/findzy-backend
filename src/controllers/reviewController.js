const Review = require("../models/review");
const Service = require("../models/service");
const Request = require("../models/request");

// ✅ Add review to a service after a completed booking
exports.addReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { serviceId, rating, comment } = req.body;

    // Verify user has a completed request for this service
    const completedRequest = await Request.findOne({
      service: serviceId,
      requester: req.user._id,
      status: "completed"
    });

    if (!completedRequest) {
      return res.status(403).json({ message: "You can only review services you have completed a booking for." });
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      serviceId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this service." });
    }

    const review = new Review({
      serviceId,
      userId: req.user._id,
      rating,
      comment
    });

    await review.save();

    // Update service's average rating
    const allReviews = await Review.find({ serviceId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Service.findByIdAndUpdate(serviceId, { rating: averageRating });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// ✅ Get reviews for a service
exports.getReviewsByService = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('userId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
