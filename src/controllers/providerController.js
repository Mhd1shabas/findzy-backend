const User = require("../models/user");

// ✅ Get all providers (list page)
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select(
      "_id businessName category location photos averageRating services city"
    );

    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch providers" });
  }
};

// handle photo uploads from provider dashboard
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can upload photos" });
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

//searching funtion
exports.searchProviders = async (req, res) => {
  try {
    const { category, city } = req.query;

    let query = {
      role: "provider",
    };

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    const providers = await User.find(query).select(
      "name category city location rating services"
    );

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

// ✅ Get single provider by ID (profile page)
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select(
      "businessName category location about phone whatsapp email photos reviews averageRating profileViews leads whatsappClicks"
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch provider" });
  }
};
