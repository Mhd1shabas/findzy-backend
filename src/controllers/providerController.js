const User = require("../models/user");

// ✅ Get all providers (list page)
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select(
      "businessName category location"
    );

    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch providers" });
  }
};

// ✅ Get single provider by ID (profile page)
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select(
      "businessName category location about profileViews leads whatsappClicks"
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch provider" });
  }
};
