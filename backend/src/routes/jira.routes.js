const express = require("express");
const router = express.Router();
const jiraController = require("../controllers/jira.controller");
const auth = require("../middleware/auth.middleware");

// ==========================================
// Public Webhook Endpoint (No Auth)
// ==========================================

// Jira webhook endpoint - must be publicly accessible
router.post(
  "/webhook",
  jiraController.handleWebhook
);

// ==========================================
// Protected Endpoints (Require Auth)
// ==========================================

router.use(auth);

// Manual sync - HR/Manager only
router.post(
  "/sync",
  jiraController.manualSync
);

// Get task details
router.get(
  "/task/:issueKey",
  jiraController.getTaskDetails
);

module.exports = router;
