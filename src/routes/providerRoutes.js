const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
  uploadPhotos,
  updateProvider,
} = require("../controllers/providerController");
const { searchProviders } = require("../controllers/providerController");
const { protect } = require("../middleware/authMiddleware");

// 🔍 Search providers
router.get("/search", searchProviders);

router.get("/", getAllProviders);
router.get("/:id", getProviderById);

// Update provider profile
router.put("/:id", protect, updateProvider);

// upload gallery photos (body should be form-data with field "photos")
router.post(
  "/photos",
  protect,
  upload.array("photos", 10),
  uploadPhotos
);

module.exports = router;
