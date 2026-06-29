const express = require("express");

const router = express.Router();

const reviewController = require("../controllers/review.controller");

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/rbac.middleware");

// ==========================================
// Employee
// ==========================================

// My Reviews
router.get(
  "/employee",
  auth,
  authorize("EMPLOYEE"),
  reviewController.getEmployeeReviews
);

// Create Self Review
router.post(
  "/employee",
  auth,
  authorize("EMPLOYEE"),
  reviewController.createReview
);

// ==========================================
// Manager
// ==========================================

// Team Reviews
router.get(
  "/manager",
  auth,
  authorize("MANAGER"),
  reviewController.getManagerReviews
);

// Create Review (Manager)
router.post(
  "/manager",
  auth,
  authorize("MANAGER"),
  reviewController.createReview
);

// Review Details
router.get(
  "/manager/:id",
  auth,
  authorize("MANAGER"),
  reviewController.getReviewById
);

// Submit Review
router.put(
  "/manager/:id",
  auth,
  authorize("MANAGER"),
  reviewController.submitReview
);

// ==========================================
// HR
// ==========================================

// All Reviews
router.get(
  "/hr",
  auth,
  authorize("HR"),
  reviewController.getAllReviews
);

// Review Statistics
router.get(
  "/hr/stats",
  auth,
  authorize("HR"),
  reviewController.getReviewStats
);

module.exports = router;