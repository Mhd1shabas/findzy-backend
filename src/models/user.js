const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    whatsapp: {
      type: String,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "provider"],
      default: "user",
    },

    // PROVIDER DETAILS
    businessName: {
      type: String,
    },

    category: {
      type: String,
    },

    city: {
      type: String,
    },

    location: {
      type: String,
    },

    about: {
      type: String,
    },

    rating: {
      type: Number,
      default: 4.5,
    },

    services: {
      type: [String],
      default: [],
    },

    // STATS
    profileViews: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
