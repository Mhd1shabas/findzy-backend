const User = require("../models/user");

// GET provider profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phone university college major yearOfStudy skills interests bio availability businessName category city location about photos averageRating"
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// UPDATE provider profile
exports.updateMyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.email;
    delete updateData.password; // Never update password via simple profile PUT

    // Keep about/bio in sync for compatibility
    if (updateData.about) updateData.bio = updateData.about;
    if (updateData.bio && !updateData.about) updateData.about = updateData.bio;
    const unsetData = {};

    // Prevent Mongoose ENUM validation errors gracefully
    if (updateData.yearOfStudy === "") {
      unsetData.yearOfStudy = 1;
      delete updateData.yearOfStudy;
    }
    if (updateData.availability === "") {
      unsetData.availability = 1;
      delete updateData.availability;
    }

    const updatePayload = Object.keys(unsetData).length > 0
      ? { $set: updateData, $unset: unsetData }
      : updateData;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updatePayload,
      { new: true }
    ).select(
      "name email phone university college major yearOfStudy skills interests bio availability businessName category city location about photos averageRating"
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};
