const User = require("../models/user");
const bcrypt = require("bcryptjs");

// @desc    Update user profile (Settings)
// @route   PUT /api/users/update
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, password } = req.body;

    // Update name if provided
    if (name) user.name = name;

    // Update email if provided
    if (email) {
      // Check if another user already has this email
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      message: "Settings updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        businessName: updatedUser.businessName,
        photos: updatedUser.photos,
      },
    });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// @desc    Get current user metadata
// @route   GET /api/users/me
// @access  Private
exports.getUserMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
