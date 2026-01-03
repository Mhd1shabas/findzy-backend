const express = require("express");
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
} = require("../controllers/providerController");
const { searchProviders } = require("../controllers/providerController");

// 🔍 Search providers
router.get("/search", searchProviders);

router.get("/", getAllProviders);
router.get("/:id", getProviderById);


module.exports = router;
