const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

/* ---------- ROUTES ---------- */
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const statsRoutes = require("./src/routes/statsRoutes");


const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- API ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("Findzy API running");
});

/* ---------- SERVER + DB ---------- */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
