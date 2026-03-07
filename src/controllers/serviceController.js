const Service = require("../models/service");
const User = require("../models/user");

// ✅ Create a new service
exports.createService = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to create services" });
    }

    const { title, description, category, subcategory, price, priceType, duration, level, tags, availability, location } = req.body;

    let processedTags = [];
    if (tags) {
      processedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    const service = new Service({
      title,
      description,
      category,
      subcategory,
      provider: req.user._id,
      price,
      priceType,
      duration,
      level,
      tags: processedTags,
      availability,
      location,
    });

    await service.save();

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to create service" });
  }
};

// ✅ Get all services with filtering and search
exports.getAllServices = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      location,
      level,
      search,
      college, // Add college filter
      provider,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    let matchQuery = { isActive: true };

    // Apply filters
    if (category) matchQuery.category = category;
    if (subcategory) matchQuery.subcategory = subcategory;
    if (location) matchQuery.location = location;
    if (level) matchQuery.level = level;
    if (provider) matchQuery.provider = provider;

    if (minPrice || maxPrice) {
      matchQuery.price = {};
      if (minPrice) matchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) matchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      matchQuery.$text = { $search: search };
    }

    // For college, use aggregation to filter by provider.university
    let pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: '$provider' }
    ];

    if (college) {
      pipeline.push({ $match: { 'provider.university': college } });
    }

    // Add back the lookup for populate-like
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: '$provider' }
    );

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortOptions });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    const services = await Service.aggregate(pipeline);

    // Count total
    let countPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: '$provider' }
    ];
    if (college) {
      countPipeline.push({ $match: { 'provider.university': college } });
    }
    countPipeline.push({ $count: "total" });

    const countResult = await Service.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    res.json({
      services,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalServices: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

// ✅ Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name businessName university major email phone whatsapp about averageRating profileViews skills services')
      .populate({
        path: 'provider',
        populate: {
          path: 'reviews',
          model: 'User',
          select: 'rating comment createdAt',
          populate: {
            path: 'reviewer',
            model: 'User',
            select: 'name'
          }
        }
      });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Increment view count
    await Service.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch service" });
  }
};

// ✅ Update service
exports.updateService = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to update services" });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own services" });
    }

    const updates = req.body;
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('provider', 'name businessName');

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update service" });
  }
};

// ✅ Delete service
exports.deleteService = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to delete services" });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own services" });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete service" });
  }
};

// ✅ Get services by provider
exports.getServicesByProvider = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.params.providerId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch provider services" });
  }
};

// ✅ Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// ✅ Search services with advanced matching
exports.searchServices = async (req, res) => {
  try {
    const { q, category, location, minPrice, maxPrice, level } = req.query;

    let query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (category) query.category = category;
    if (location) query.location = location;
    if (level) query.level = level;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const services = await Service.find(query)
      .populate('provider', 'name businessName averageRating university major')
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(50);

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};

// ✅ Get my services (logged in user)
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id })
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your services" });
  }
};