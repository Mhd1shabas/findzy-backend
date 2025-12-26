const express = require("express");
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
} = require("../controllers/providerController");

router.get("/", getAllProviders);
router.get("/:id", getProviderById);
router.get("/test", (req, res) => {
  res.json({ ok: true });
});


module.exports = router;
