const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");

// =========================
// Public Routes
// =========================

router.post("/login", authController.login);

// =========================
// Protected Routes
// =========================

router.get(
  "/profile",
  auth,
  authController.profile
);

// =========================
// HR Only
// =========================

router.post(
  "/register",
  auth,
  rbac("HR"),
  authController.register
);

module.exports = router;