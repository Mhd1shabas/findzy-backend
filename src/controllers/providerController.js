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
