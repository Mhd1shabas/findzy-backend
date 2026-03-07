const User = require("../models/user");
const Service = require("../models/service");

// ✅ Advanced skill matching for users
exports.matchSkills = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { userSkills, userInterests, location, maxPrice } = req.query;

    // Get user's skills and interests
    const searchSkills = userSkills ? userSkills.split(',') : user.skills || [];
    const searchInterests = userInterests ? userInterests.split(',') : user.interests || [];

    // Find users with matching skills
    let providers = await User.find({
      skills: { $in: searchSkills }
    }).select("name businessName university major skills services averageRating profileViews");

    // Also find services that match user's interests
    let services = await Service.find({
      isActive: true,
      $or: [
        { tags: { $in: searchInterests } },
        { category: { $in: searchInterests } },
        { title: { $regex: searchInterests.join('|'), $options: 'i' } }
      ]
    }).populate('provider', 'name businessName university major skills averageRating');

    // Filter by location if specified
    if (location) {
      providers = providers.filter(p => p.city === location || p.location === location);
      services = services.filter(s => s.location === location || s.location === "Both");
    }

    // Filter by price if specified
    if (maxPrice) {
      services = services.filter(s => s.price <= parseFloat(maxPrice));
    }

    // Calculate match scores
    const providerMatches = providers.map(provider => {
      const skillMatches = provider.skills.filter(skill => searchSkills.includes(skill)).length;
      const matchScore = (skillMatches / searchSkills.length) * 100;

      return {
        ...provider.toObject(),
        matchScore: Math.round(matchScore),
        matchedSkills: provider.skills.filter(skill => searchSkills.includes(skill))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    const serviceMatches = services.map(service => {
      let matchScore = 0;
      const matchedTags = service.tags.filter(tag => searchInterests.includes(tag));

      if (matchedTags.length > 0) {
        matchScore = (matchedTags.length / searchInterests.length) * 100;
      }

      return {
        ...service.toObject(),
        matchScore: Math.round(matchScore),
        matchedTags
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      userProfile: {
        skills: user.skills,
        interests: user.interests,
        university: user.university,
        major: user.major
      },
      matches: {
        providers: providerMatches.slice(0, 10), // Top 10 matches
        services: serviceMatches.slice(0, 20)     // Top 20 service matches
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Skill matching failed" });
  }
};

// ✅ Recommend services based on user profile
exports.recommendServices = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's interests and past interactions
    const userInterests = user.interests || [];
    const userSkills = user.skills || [];

    // Find services that match user's interests
    const recommendedServices = await Service.find({
      isActive: true,
      $or: [
        { tags: { $in: userInterests } },
        { category: { $in: userInterests } }
      ]
    })
    .populate('provider', 'name businessName averageRating university major')
    .sort({ rating: -1, views: -1 })
    .limit(15);

    // Find other users with complementary skills
    const complementaryProviders = await User.find({
      _id: { $ne: user._id },
      skills: { $nin: userSkills }, // Skills user doesn't have
      $or: [
        { skills: { $in: userInterests } },
        { businessName: { $exists: true, $ne: "" } }
      ]
    })
    .select("name businessName university major skills services averageRating")
    .sort({ averageRating: -1 })
    .limit(10);

    res.json({
      recommendedServices,
      complementaryProviders,
      basedOn: {
        interests: userInterests,
        skills: userSkills
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Recommendation failed" });
  }
};

// ✅ Get skill statistics
exports.getSkillStats = async (req, res) => {
  try {
    const skillStats = await User.aggregate([
      { $match: { skills: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
          avgRating: { $avg: "$averageRating" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const categoryStats = await Service.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      popularSkills: skillStats,
      categoryStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch skill stats" });
  }
};