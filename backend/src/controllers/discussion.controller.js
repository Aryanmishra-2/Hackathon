const discussionService = require("../services/discussion.service");

// ==========================================
// Create Discussion Comment
// ==========================================

exports.createComment = async (req, res) => {
  try {

    const userId = req.user.id;
    const { goalId, message } = req.body;

    const comment = await discussionService.createComment({
      goalId,
      userId,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Comment posted successfully.",
      data: comment,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Goal Comments
// ==========================================

exports.getGoalComments = async (req, res) => {
  try {

    const userId = req.user.id;
    const { goalId } = req.params;

    const comments = await discussionService.getGoalComments(goalId, userId);

    return res.status(200).json({
      success: true,
      total: comments.length,
      data: comments,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Update Comment
// ==========================================

exports.updateComment = async (req, res) => {
  try {

    const userId = req.user.id;
    const { commentId } = req.params;
    const { message } = req.body;

    const comment = await discussionService.updateComment(
      commentId,
      userId,
      message
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: comment,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Delete Comment
// ==========================================

exports.deleteComment = async (req, res) => {
  try {

    const userId = req.user.id;
    const { commentId } = req.params;

    const result = await discussionService.deleteComment(commentId, userId);

    return res.status(200).json(result);

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Get Comment by ID
// ==========================================

exports.getCommentById = async (req, res) => {
  try {

    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await discussionService.getCommentById(commentId, userId);

    return res.status(200).json({
      success: true,
      data: comment,
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
