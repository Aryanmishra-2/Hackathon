const goalService = require("../services/goal.service.js");

// ==========================================
// Create Goal
// ==========================================

exports.createGoal = async (req, res) => {

  try {

    let {
      title,
      description,
      ownerId,
      startDate,
      endDate,
    } = req.body;

    console.log("BODY :", req.body);
    console.log("USER :", req.user);

    // Common validation
    if (!title || !description || !startDate || !endDate) {

      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });

    }

    // Employee creates goal for himself
    if (req.user.role === "EMPLOYEE") {

      ownerId = req.user.id;

    }

    // Manager assigns goal to employee
    if (req.user.role === "MANAGER" && !ownerId) {

      return res.status(400).json({
        success: false,
        message: "Employee is required.",
      });

    }

    const goal = await goalService.createGoal({

      title,
      description,
      ownerId,
      createdById: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),

    });

    return res.status(201).json({

      success: true,
      message: "Goal created successfully.",
      data: goal,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};

// ==========================================
// Get Employee Goals
// ==========================================

exports.getMyGoals = async (req, res) => {

  try {

    const goals = await goalService.getEmployeeGoals(req.user.id);

    return res.status(200).json({
      success: true,
      total: goals.length,
      data: goals,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Get Team Goals
// ==========================================

exports.getTeamGoals = async (req, res) => {

  try {

    const goals = await goalService.getManagerGoals(req.user.id);

    return res.status(200).json({
      success: true,
      total: goals.length,
      data: goals,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Get Goal By Id
// ==========================================

exports.getGoal = async (req, res) => {

  try {

    const goal = await goalService.getGoalById(req.params.id);

    if (!goal) {

      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });

    }

    return res.status(200).json({
      success: true,
      data: goal,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==========================================
// Update Goal
// ==========================================

exports.updateGoal = async (req, res) => {

  try {

    const goal = await goalService.updateGoal(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully.",
      data: goal,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ==========================================
// Delete Goal
// ==========================================

exports.deleteGoal = async (req, res) => {
  try {

    await goalService.deleteGoal(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully.",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ==========================================
// Update Progress
// ==========================================

exports.updateProgress = async (req, res) => {

  try {

    const { progress } = req.body;

    if (progress === undefined) {

      return res.status(400).json({
        success: false,
        message: "Progress is required.",
      });

    }

    if (progress < 0 || progress > 100) {

      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100.",
      });

    }

    const goal = await goalService.updateProgress(
      req.params.id,
      Number(progress)
    );

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      data: goal,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ==========================================
// Approve Goal
// ==========================================

exports.approveGoal = async (req, res) => {

  try {

    const { comment } = req.body;

    const goal = await goalService.approveGoal(
      req.params.id,
      req.user.id,
      comment || ""
    );

    return res.status(200).json({
      success: true,
      message: "Goal approved successfully.",
      data: goal,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ==========================================
// Reject Goal
// ==========================================

exports.rejectGoal = async (req, res) => {

  try {

    const { comment } = req.body;

    const goal = await goalService.rejectGoal(
      req.params.id,
      req.user.id,
      comment || ""
    );

    return res.status(200).json({
      success: true,
      message: "Goal rejected successfully.",
      data: goal,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// ==========================================
// Add Feedback
// ==========================================

exports.addFeedback = async (req, res) => {

  try {

    const { comment } = req.body;

    if (!comment) {

      return res.status(400).json({
        success: false,
        message: "Feedback is required.",
      });

    }

    const feedback = await goalService.addFeedback(
      req.params.id,
      req.user.id,
      comment
    );

    return res.status(201).json({
      success: true,
      message: "Feedback added successfully.",
      data: feedback,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};