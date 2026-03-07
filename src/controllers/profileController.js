const User = require("../models/user");

// GET provider profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phone university major yearOfStudy skills interests bio availability businessName category city location about photos averageRating"
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// UPDATE provider profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { 
      name,
      phone,
      university,
      major,
      yearOfStudy,
      skills,
      interests,
      bio,
      availability,
      businessName, 
      category, 
      city,
      location, 
      about, 
      whatsapp, 
      email,
      photos
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name,
        phone,
        university,
        major,
        yearOfStudy,
        skills,
        interests,
        bio,
        availability,
        businessName, 
        category, 
        city,
        location, 
        about, 
        whatsapp, 
        email,
        photos
      },
      { new: true }
    ).select(
      "name email phone university major yearOfStudy skills interests bio availability businessName category city location about photos averageRating"
    );

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};
