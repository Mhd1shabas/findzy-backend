const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    college: {
      type: String,
    },

    subcategory: {
      type: String,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceType: {
      type: String,
      default: "hour",
    },

    duration: {
      type: String, // e.g., "1 hour", "2 hours", "30 minutes"
    },

    level: {
      type: String,
      default: "All Levels",
    },

    tags: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    images: {
      type: [String],
      default: [],
    },

    serviceImages: {
      type: [String],
      default: [],
    },

    // Availability
    availability: {
      type: [String],
      default: ["Flexible"],
    },

    location: {
      type: String,
      default: "Online",
    },

    // Stats
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for search
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1, subcategory: 1 });
serviceSchema.index({ provider: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ college: 1 });

module.exports = mongoose.model("Service", serviceSchema);