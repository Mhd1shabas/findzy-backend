const express = require("express");
const reviewRoutes = require("./routes/reviewRoutes");
const providerRoutes = require("./routes/providerRoutes");
const statsRoutes = require("./routes/statsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();


const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use("/api/stats", statsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);



/* ---------- ROUTES ---------- */
app.get("/", (req, res) => {
  res.send("Findzy API running");
});

app.use("/api/auth", authRoutes);

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
