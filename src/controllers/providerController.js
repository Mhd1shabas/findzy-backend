const User = require("../models/user");
const Service = require("../models/service");

// ✅ Get all providers (list page)
exports.getAllProviders = async (req, res) => {
  try {
    // In an OLX-style platform, we show anyone who has a business name or offers services
    const providers = await User.find({ 
      $or: [
        { businessName: { $exists: true, $ne: "" } },
        { category: { $exists: true, $ne: "" } }
      ]
    }).select(
      "_id name businessName category college location university major skills services averageRating profileViews completedServices photos"
    );

    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch providers" });
  }
};

// handle photo uploads from provider dashboard
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Only registered users can upload photos" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = req.files.map((f) => {
      // For demo purposes we'll return the local path; in production you'd
      // upload to S3 or another storage and save the public URL.
      return `/uploads/${f.filename}`;
    });

    const provider = await User.findById(req.user._id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.photos = [...(provider.photos || []), ...urls];
    await provider.save();

    res.json({ message: "Photos uploaded", urls, provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload photos" });
  }
};

// searching function
exports.searchProviders = async (req, res) => {
  try {
    const { category, city, query, college } = req.query;

    let dbQuery = {
      $or: [
        { businessName: { $exists: true, $ne: "" } },
        { category: { $exists: true, $ne: "" } }
      ]
    };

    if (category) {
      dbQuery.category = { $regex: category, $options: "i" };
    }

    if (city) {
      dbQuery.city = { $regex: city, $options: "i" };
    }

    if (college) {
      dbQuery.college = college;
    }

    if (query) {
      dbQuery.$or = [
        { businessName: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { skills: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { "services.name": { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ];
    }

    const providers = await User.find(dbQuery).select(
      "name businessName category college city location university major bio skills averageRating photos services"
    );

    res.json(providers);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// ✅ Get single provider by ID (profile page)
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select(
      "name email phone whatsapp university college major yearOfStudy skills interests bio availability businessName category city location about phone whatsapp email photos reviews averageRating profileViews leads whatsappClicks completedServices"
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Get provider's services
    const Service = require("../models/service");
    const services = await Service.find({
      provider: req.params.id,
      isActive: true
    }).select("title description category price priceType duration level tags images");

    res.json({
      ...provider.toObject(),
      services
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch provider" });
  }
};
// ✅ Update provider profile (owner only)
exports.updateProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Check ownership
    // We check both userId and _id because in the current merged model, they might be the same
    const ownerId = provider.userId ? provider.userId.toString() : provider._id.toString();
    if (ownerId !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to edit this provider profile" });
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.userId;
    delete updateData.email;

    const updatedProvider = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", provider: updatedProvider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
