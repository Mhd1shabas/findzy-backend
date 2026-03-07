const User = require("../models/user");
const Service = require("../models/service");
const Request = require("../models/request");
const Booking = require("../models/booking");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's profile to check completion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count user's services
    const myServices = await Service.countDocuments({ provider: userId });

    // Count bookings (new system)
    const totalBookings = await Booking.countDocuments({ userId: userId });
    
    // Total requests (legacy/extra)
    const totalRequests = await Request.countDocuments({
      $or: [{ requester: userId }, { provider: userId }]
    });

    const completedBookings = await Booking.countDocuments({
      userId: userId,
      bookingStatus: "completed"
    });

    // Check if profile is complete (basic check)
    const profileComplete = !!(
      user.name &&
      user.university &&
      user.bio &&
      user.skills?.length > 0
    );

    res.json({
      totalRequests: totalBookings, // User dashboard expects "totalBookings" but let's use the field they expect
      pendingRequests: totalBookings - completedBookings, 
      completedRequests: completedBookings,
      totalBookings: totalBookings,
      myServices,
      profileComplete,
      totalEarnings: user.totalEarnings || 0,
      avgRating: user.averageRating || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = [];

    // Get recent bookings (new system)
    const recentBookings = await Booking.find({ userId: userId })
      .populate("serviceId", "title")
      .populate("providerId", "name businessName")
      .sort({ createdAt: -1 })
      .limit(5);

    for (const booking of recentBookings) {
      activities.push({
        _id: booking._id,
        type: "booking_created",
        title: `Service booked: "${booking.serviceId?.title || "Deleted Service"}"`,
        description: `You booked this service from ${booking.providerId?.businessName || booking.providerId?.name || "Unknown"}`,
        createdAt: booking.createdAt,
        link: `/dashboard/bookings`,
      });
    }

    // Get recent requests (legacy)
    const recentRequests = await Request.find({
      $or: [{ requester: userId }, { provider: userId }]
    })
    .populate("service", "title")
    .populate("requester", "name university")
    .populate("provider", "name businessName")
    .sort({ createdAt: -1 })
    .limit(5);

    // Convert requests to activities
    for (const request of recentRequests) {
      const isRequester = request.requester._id.toString() === userId;

      if (isRequester) {
        // User sent this request
        activities.push({
          _id: request._id,
          type: "request_sent",
          title: `Request sent for "${request.service.title}"`,
          description: `You requested this service from ${request.provider.businessName || request.provider.name}`,
          createdAt: request.createdAt,
          link: `/requests/${request._id}`,
        });
      } else {
        // User received this request
        activities.push({
          _id: request._id,
          type: "request_received",
          title: `New request for "${request.service.title}"`,
          description: `${request.requester.name} from ${request.requester.university || "your university"} sent you a request`,
          createdAt: request.createdAt,
          link: `/requests/${request._id}`,
        });
      }

      // Add status update activities
      if (request.status !== "pending") {
        const statusText = request.status.charAt(0).toUpperCase() + request.status.slice(1);
        activities.push({
          _id: `${request._id}_status`,
          type: "request_updated",
          title: `Request ${statusText.toLowerCase()}`,
          description: `Your request for "${request.service.title}" was ${request.status}`,
          createdAt: request.updatedAt,
          link: `/requests/${request._id}`,
        });
      }
    }

    // Get recent services created by user
    const recentServices = await Service.find({ provider: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    for (const service of recentServices) {
      activities.push({
        _id: service._id,
        type: "service_created",
        title: `Service created: "${service.title}"`,
        description: `You created a new service offering in ${service.category}`,
        createdAt: service.createdAt,
        link: `/services/${service._id}`,
      });
    }

    // Sort all activities by date and limit to 10
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = activities.slice(0, 10);

    res.json(limitedActivities);
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardActivity,
};