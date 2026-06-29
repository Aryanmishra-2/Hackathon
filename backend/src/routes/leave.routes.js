const express = require("express");

const router = express.Router();

const leaveController = require("../controllers/leave.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// Employee Routes
// ==========================================

// Create leave request
router.post(
  "/employee",
  auth,
  authorize("EMPLOYEE"),
  leaveController.createLeaveRequest
);

// Get own leave requests
router.get(
  "/employee",
  auth,
  authorize("EMPLOYEE"),
  leaveController.getEmployeeLeaveRequests
);

// ==========================================
// Manager Routes
// ==========================================

// Get team leave requests
router.get(
  "/manager",
  auth,
  authorize("MANAGER"),
  leaveController.getManagerLeaveRequests
);

// Update leave request status (approve/reject)
router.put(
  "/manager/:requestId",
  auth,
  authorize("MANAGER"),
  leaveController.updateLeaveRequestStatus
);

// ==========================================
// Common Routes
// ==========================================

// Get leave request by ID (employee or manager)
router.get(
  "/:requestId",
  auth,
  leaveController.getLeaveRequestById
);

module.exports = router;
