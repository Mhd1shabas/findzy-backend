const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByProvider,
  getCategories,
  searchServices,
  getMyServices,
} = require("../controllers/serviceController");

// Public routes
router.get("/", getAllServices);
router.get("/search", searchServices);
router.get("/categories", getCategories);
router.get("/my-services", protect, getMyServices);
router.get("/:id", getServiceById);
router.get("/provider/:providerId", getServicesByProvider);

// Protected routes (require authentication)
router.post("/", protect, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;