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

    // STUDENT PROFILE DETAILS
    university: {
      type: String,
    },

    major: {
      type: String,
    },

    yearOfStudy: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Other"],
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
    },

    availability: {
      type: String,
      enum: ["Weekdays", "Weekends", "Flexible", "Part-time", "Full-time"],
      default: "Flexible",
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

    services: [{
      name: { type: String, required: true },
      description: String,
      price: Number,
      duration: String, // e.g., "1 hour", "2 hours"
      category: String,
    }],

    // gallery and feedback
    photos: {
      type: [String],
      default: [],
    },

    reviews: [
      {
        rating: { type: Number, required: true },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    averageRating: { type: Number, default: 0 },

    // STATS
    profileViews: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
    completedServices: { type: Number, default: 0 },
    favorites: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
