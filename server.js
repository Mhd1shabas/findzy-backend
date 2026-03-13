const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

/* ---------- ROUTES ---------- */
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const providerRoutes = require("./src/routes/providerRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const statsRoutes = require("./src/routes/statsRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const matchingRoutes = require("./src/routes/matchingRoutes");
const userRoutes = require("./src/routes/userRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const chatRoutes = require("./src/routes/chatRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[${new Date().toLocaleString()}] 🔍 ${req.method} ${req.url}`);
  console.log(`- Origin: ${origin || 'None'}`);
  console.log(`- Host: ${req.headers.host}`);
  console.log(`- User-Agent: ${req.headers['user-agent']}`);
  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://findzy-frontend.vercel.app"
    ].filter(Boolean);

    console.log(`[CORS Check] Request from Origin: ${origin || 'None'}`);

    if (!origin) return callback(null, true);

    const isLocalNetwork = origin.startsWith('http://192.168.') ||
      origin.startsWith('http://172.') ||
      origin.startsWith('http://10.') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (allowedOrigins.includes(origin) || isLocalNetwork || process.env.NODE_ENV === 'development') {
      console.log(`[CORS Allowed] ${origin}`);
      callback(null, true);
    } else {
      console.log(`[CORS Blocked] ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------- ROOT & HEALTH ROUTES ---------- */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Findzy API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

/* ---------- API ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);


/* ---------- GLOBAL ERROR HANDLER ---------- */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* ---------- DB CONNECTION ---------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    // Potentially exit if connection is critical
    // process.exit(1); 
  });

/* ---------- SERVER STARTUP ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
