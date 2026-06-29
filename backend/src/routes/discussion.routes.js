const express = require("express");

const router = express.Router();

const discussionController = require("../controllers/discussion.controller");

const auth = require("../middleware/auth.middleware");

// ==========================================
// All routes require authentication
// ==========================================

router.use(auth);

// ==========================================
// Discussion Routes
// ==========================================

// Create comment
router.post(
  "/",
  discussionController.createComment
);

// Get all comments for a goal
router.get(
  "/goal/:goalId",
  discussionController.getGoalComments
);

// Get comment by ID
router.get(
  "/:commentId",
  discussionController.getCommentById
);

// Update comment
router.put(
  "/:commentId",
  discussionController.updateComment
);

// Delete comment
router.delete(
  "/:commentId",
  discussionController.deleteComment
);

module.exports = router;
