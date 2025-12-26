const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "provider"],
      default: "user",
    },
    // Dashboard stats
profileViews: {
  type: Number,
  default: 0,
},
leads: {
  type: Number,
  default: 0,
},
whatsappClicks: {
  type: Number,
  default: 0,
},
reviews: [
  {
    rating: { type: Number, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
],
averageRating: { type: Number, default: 0 },



    // 👇 Provider profile fields
    businessName: String,
    category: String,
    location: String,
    about: String,
  },
  { timestamps: true }
  
);

module.exports = mongoose.model("User", userSchema);
