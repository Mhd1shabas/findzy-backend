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

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "provider"],
      default: "user",
    },

    profileViews: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },

    businessName: String,
    category: String,
    location: String,
    about: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
