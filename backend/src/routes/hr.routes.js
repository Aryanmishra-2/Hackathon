const express = require("express");

const router = express.Router();

const hrController = require("../controllers/hr.controller");

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");

// ==========================================
// Authentication + HR Role
// ==========================================

router.use(auth);

router.use(rbac("HR"));

// ==========================================
// Dashboard
// ==========================================

router.get(
  "/dashboard",
  hrController.dashboard
);

// ==========================================
// User Management
// ==========================================

router.get(
  "/users",
  hrController.getUsers
);

router.get(
  "/users/archived/all",
  hrController.getArchivedUsers
);

router.get(
  "/users/:id",
  hrController.getUserById
);

router.post(
  "/users",
  hrController.createUser
);

router.put(
  "/users/:id",
  hrController.updateUser
);

router.delete(
  "/users/:id",
  hrController.deleteUser
);

router.patch(
  "/users/:id/restore",
  hrController.restoreUser
);

// ==========================================
// Managers
// ==========================================

router.get(
  "/managers",
  hrController.getManagers
);

// ==========================================
// Goals (HR Monitoring)
// ==========================================

router.get(
  "/goals",
  hrController.getGoals
);

// ==========================================
// Reviews (HR Monitoring)
// ==========================================

router.get(
  "/reviews",
  hrController.getReviews
);

// ==========================================
// Reports (HR Access)
// ==========================================

// Download Employee Performance Report (PDF)
router.get(
  "/report/:employeeId/download",
  hrController.downloadEmployeeReport
);

module.exports = router;