const User = require("../models/user");

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const provider = await User.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.reviews.push({ rating, comment });

    provider.averageRating =
      provider.reviews.reduce((a, b) => a + b.rating, 0) /
      provider.reviews.length;

    await provider.save();

    res.json({ message: "Review added", provider });
  } catch (err) {
    res.status(500).json({ message: "Failed to add review" });
  }
};

