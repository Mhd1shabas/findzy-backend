const User = require("../models/user");

// Update provider profile
exports.updateProfile = async (req, res) => {
  try {
    const { businessName, category, location, about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { businessName, category, location, about },
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      profile: {
        businessName: user.businessName,
        category: user.category,
        location: user.location,
        about: user.about,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};
