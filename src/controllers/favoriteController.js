const User = require("../models/user");
const Service = require("../models/service");

// @desc    Add service to favorites
// @route   POST /api/favorites/add
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites.addToSet(serviceId);
    await user.save();

    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ message: "Failed to add to favorites" });
  }
};

// @desc    Remove service from favorites
// @route   DELETE /api/favorites/remove
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const user = await User.findById(req.user.id);
    
    user.favorites = user.favorites.filter(id => id.toString() !== serviceId);
    await user.save();

    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ message: "Failed to remove from favorites" });
  }
};

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favorites",
      populate: {
        path: "provider",
        select: "name businessName photos"
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites);
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
};
