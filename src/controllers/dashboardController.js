const User = require("../models/user");
const Service = require("../models/service");
const Request = require("../models/request");

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

    // Count requests where user is either requester or provider
    const totalRequests = await Request.countDocuments({
      $or: [{ requester: userId }, { provider: userId }]
    });

    const pendingRequests = await Request.countDocuments({
      $or: [{ requester: userId }, { provider: userId }],
      status: "pending"
    });

    const acceptedRequests = await Request.countDocuments({
      $or: [{ requester: userId }, { provider: userId }],
      status: "accepted"
    });

    const completedRequests = await Request.countDocuments({
      $or: [{ requester: userId }, { provider: userId }],
      status: "completed"
    });

    // Check if profile is complete (basic check)
    const profileComplete = !!(
      user.name &&
      user.university &&
      user.bio &&
      user.skills?.length > 0
    );

    res.json({
      totalRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
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

    // Get recent requests (both sent and received)
    const recentRequests = await Request.find({
      $or: [{ requester: userId }, { provider: userId }]
    })
    .populate("service", "title")
    .populate("requester", "name university")
    .populate("provider", "name businessName")
    .sort({ createdAt: -1 })
    .limit(10);

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