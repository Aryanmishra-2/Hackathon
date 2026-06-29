const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// Manager Reports
// ==========================================

router.use(auth);
router.use(authorize("MANAGER"));

// Get team members list
router.get(
  "/team",
  reportController.getTeamForReports
);

// Generate employee performance report (PDF)
router.get(
  "/employee/:employeeId/pdf",
  reportController.generateEmployeeReport
);

module.exports = router;
