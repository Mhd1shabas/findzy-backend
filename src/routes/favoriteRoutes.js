const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  addFavorite, 
  removeFavorite, 
  getFavorites 
} = require("../controllers/favoriteController");

router.get("/", protect, getFavorites);
router.post("/add", protect, addFavorite);
router.delete("/remove/:serviceId", protect, removeFavorite);

module.exports = router;
