const User = require("../models/user");

exports.getProviderStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      profileViews: user.profileViews,
      leads: user.leads,
      whatsappClicks: user.whatsappClicks,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
// Increase profile views
exports.incrementProfileViews = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { profileViews: 1 },
    });
    res.json({ message: "Profile view counted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update views" });
  }
};

// Increase WhatsApp clicks
exports.incrementWhatsappClicks = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { whatsappClicks: 1 },
    });
    res.json({ message: "WhatsApp click counted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update clicks" });
  }
};
