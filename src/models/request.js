const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending",
    },

    // Request details
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    preferredDate: {
      type: Date,
    },

    preferredTime: {
      type: String,
    },

    duration: {
      type: String,
    },

    location: {
      type: String,
      enum: ["Online", "In-person"],
      default: "Online",
    },

    meetingLink: {
      type: String, // For online meetings
    },

    meetingAddress: {
      type: String, // For in-person meetings
    },

    // Pricing
    agreedPrice: {
      type: Number,
    },

    priceType: {
      type: String,
      enum: ["per hour", "per session", "per project", "fixed"],
    },

    // Communication
    contactMethod: {
      type: String,
      enum: ["WhatsApp", "Email", "Phone", "Platform"],
      default: "Platform",
    },

    // Messages between requester and provider
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Review after completion
    review: {
      rating: Number,
      comment: String,
      createdAt: Date,
    },

    // Timestamps
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ provider: 1, status: 1 });
requestSchema.index({ service: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);