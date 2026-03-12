const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createRequest,
  getMyRequests,
  getProviderRequests,
  updateRequestStatus,
  addMessage,
  getRequestById,
  addReview,
  getRequestStats,
} = require("../controllers/requestController");

// All routes require authentication
router.use(protect);

router.post("/", createRequest);
router.get("/my-requests", getMyRequests);
router.get("/provider-requests", getProviderRequests);
router.get("/stats", getRequestStats);
router.get("/:id", getRequestById);
router.put("/:id/status", updateRequestStatus);
router.post("/:id/message", addMessage);
router.post("/:id/review", addReview);

module.exports = router;