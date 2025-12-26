const express = require("express");
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
} = require("../controllers/providerController");

router.get("/", getAllProviders);
router.get("/:id", getProviderById);

module.exports = router;
