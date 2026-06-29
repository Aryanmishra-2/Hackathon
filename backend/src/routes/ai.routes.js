const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");
const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// Manager - Generate AI Performance Review
// ==========================================

router.post(
  "/generate-review",
  auth,
  authorize("MANAGER"),
  aiController.generateAIReview
);

module.exports = router;
