const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");

const goalController = require("../controllers/goal.controller");

// ==========================================
// Employee & Manager
// ==========================================

// Create Goal
router.post(
  "/",
  auth,
  rbac("EMPLOYEE", "MANAGER"),
  goalController.createGoal
);

// Get My Goals
router.get(
  "/",
  auth,
  goalController.getMyGoals
);

// Get Single Goal
router.get(
  "/:id",
  auth,
  goalController.getGoal
);

// Update Goal
router.put(
  "/:id",
  auth,
  goalController.updateGoal
);

// Delete Goal
router.delete(
  "/:id",
  auth,
  goalController.deleteGoal
);

// Update Progress
router.patch(
  "/:id/progress",
  auth,
  rbac("EMPLOYEE"),
  goalController.updateProgress
);

// ==========================================
// Manager
// ==========================================

// Team Goals
router.get(
  "/team/list",
  auth,
  rbac("MANAGER"),
  goalController.getTeamGoals
);

// Approve Goal
router.patch(
  "/:id/approve",
  auth,
  rbac("MANAGER"),
  goalController.approveGoal
);

// Reject Goal
router.patch(
  "/:id/reject",
  auth,
  rbac("MANAGER"),
  goalController.rejectGoal
);

// Add Feedback
router.post(
  "/:id/feedback",
  auth,
  rbac("MANAGER"),
  goalController.addFeedback
);

module.exports = router;