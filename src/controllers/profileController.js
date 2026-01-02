const User = require("../models/user");

// GET provider profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "businessName category location about"
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// UPDATE provider profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { businessName, category, location, about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { businessName, category, location, about },
      { new: true }
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};
