const express = require("express");

const router = express.Router();

const employeeController = require("../controllers/employee.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// Authentication
// ==========================================

router.use(auth);

router.use(authorize("EMPLOYEE"));

// ==========================================
// Dashboard
// ==========================================

router.get(
  "/dashboard",
  employeeController.dashboard
);

// ==========================================
// Profile
// ==========================================

router.get(
  "/profile",
  employeeController.profile
);

// ==========================================
// Goals
// ==========================================

// My Goals
router.get(
  "/goals",
  employeeController.getGoals
);

// Create Goal
router.post(
  "/goals",
  employeeController.createGoal
);

// Goal Details
router.get(
  "/goals/:id",
  employeeController.getGoal
);

// Update Goal
router.put(
  "/goals/:id",
  employeeController.updateGoal
);

// Delete Goal
router.delete(
  "/goals/:id",
  employeeController.deleteGoal
);

// Update Progress
router.patch(
  "/goals/:id/progress",
  employeeController.updateProgress
);

// ==========================================
// Reviews
// ==========================================

router.get(
  "/reviews",
  employeeController.getReviews
);

// ==========================================
// Timeline
// ==========================================

router.get(
  "/timeline",
  employeeController.getTimeline
);

// ==========================================
// Notifications
// ==========================================

router.get(
  "/notifications",
  employeeController.getNotifications
);

// Mark single notification as read
router.patch(
  "/notifications/:id/read",
  employeeController.markNotification
);

// Mark all notifications as read
router.put(
  "/notifications/read-all",
  employeeController.markAllNotifications
);

// ==========================================
// Reports
// ==========================================

// Download My Performance Report (PDF)
router.get(
  "/report/download",
  employeeController.downloadMyReport
);

module.exports = router;