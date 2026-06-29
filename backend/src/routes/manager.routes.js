const express = require("express");

const router = express.Router();

const managerController = require("../controllers/manager.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// All Manager APIs
// ==========================================

router.use(auth);
router.use(authorize("MANAGER"));

// ==========================================
// Dashboard
// ==========================================

router.get(
  "/dashboard",
  managerController.dashboard
);

// ==========================================
// Team Members
// ==========================================

router.get(
  "/team",
  managerController.getTeam
);

// Give rating to team member
router.post(
  "/team/:employeeId/rating",
  managerController.giveRating
);

// Remove employee from team
router.delete(
  "/team/:employeeId",
  managerController.removeFromTeam
);

// ==========================================
// Goals
// ==========================================

// Create Goal (Manager assigns goal to team member)
router.post(
  "/goals",
  managerController.createGoal
);

// All Team Goals
router.get(
  "/goals",
  managerController.getGoals
);

// Pending Goals
router.get(
  "/goals/pending",
  managerController.getPendingGoals
);

// Goal Details
router.get(
  "/goals/:id",
  managerController.getGoal
);

// ==========================================
// Approval
// ==========================================

router.put(
  "/goals/:id/approve",
  managerController.approveGoal
);

router.put(
  "/goals/:id/reject",
  managerController.rejectGoal
);

router.post(
  "/goals/:id/feedback",
  managerController.addFeedback
);

// Delete Goal (Manager can delete team goals)
router.delete(
  "/goals/:id",
  managerController.deleteGoal
);

// ==========================================
// Reviews
// ==========================================

router.get(
  "/reviews",
  managerController.getReviews
);

router.put(
  "/reviews/:id",
  managerController.submitReview
);

// ==========================================
// Notifications
// ==========================================

router.get(
  "/notifications",
  managerController.getNotifications
);

// Mark single notification as read
router.patch(
  "/notifications/:id/read",
  managerController.markNotification
);

// Mark all notifications as read
router.put(
  "/notifications/read-all",
  managerController.markAllNotifications
);

// ==========================================
// Timeline
// ==========================================

router.get(
  "/timeline",
  managerController.getTimeline
);

module.exports = router;